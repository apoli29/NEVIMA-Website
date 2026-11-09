/* =====================================================================
   NEVIMA — Base de dados dos pedidos de proposta (Azure SQL Database)
   ---------------------------------------------------------------------
   Corre-se ligado à base de dados "Nevima" (não à "master"), por inteiro.
   Pode correr-se as vezes que for preciso: cria o que falta, acrescenta
   colunas novas e atualiza o procedimento e a vista, sem apagar dados.

   Quem escreve aqui: as rotas /api/proposal e /api/partner
   (src/lib/proposal/sql.ts), com o utilizador nevima_site, que só pode
   executar os dois procedimentos de inserção. As respostas chegam como o
   site as guarda: os pedidos de proposta agrupados em "web", "photo" e
   "search" (questions.ts, tipo Answers); os de parceria em partner.ts.

   Para ler os pedidos (no VS Code, numa New Query na base Nevima):
     SELECT * FROM dbo.vw_Pedidos ORDER BY Id DESC;     -- a lista
     EXEC dbo.Ficha 2;                                  -- um pedido inteiro
     SELECT * FROM dbo.vw_Parcerias ORDER BY Id DESC;
     EXEC dbo.FichaParceria 1;

   Decisões e passos: docs/backend-decisions.md, secção "SQL Server".
   ===================================================================== */


/* ---------------------------------------------------------------------
   1. Serviços (tabela de referência)
   --------------------------------------------------------------------- */
IF OBJECT_ID(N'dbo.Servicos', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Servicos (
        Codigo      VARCHAR(20)   NOT NULL CONSTRAINT PK_Servicos PRIMARY KEY,  -- id do serviço no site
        Nome        NVARCHAR(60)  NOT NULL,
        Principal   BIT           NOT NULL CONSTRAINT DF_Servicos_Principal DEFAULT (0)  -- incluído sempre
    );
END
GO

INSERT INTO dbo.Servicos (Codigo, Nome, Principal)
SELECT v.Codigo, v.Nome, v.Principal
FROM (VALUES
        ('web',      N'Web Design',          1),
        ('identity', N'Identidade Visual',   0),
        ('photo',    N'Sessão Fotográfica',  0),
        ('seo',      N'SEO',                 0),
        ('geo',      N'GEO',                 0)
     ) AS v (Codigo, Nome, Principal)
WHERE NOT EXISTS (SELECT 1 FROM dbo.Servicos s WHERE s.Codigo = v.Codigo);
GO


/* ---------------------------------------------------------------------
   2. Pedidos de proposta (uma linha por pedido enviado)
   No comentário de cada coluna: o caminho da resposta no JSON do site.
   RespostasJson guarda as respostas inteiras, tal como chegaram.
   --------------------------------------------------------------------- */
IF OBJECT_ID(N'dbo.PedidosProposta', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.PedidosProposta (
        Id                    INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_PedidosProposta PRIMARY KEY,
        CriadoEm              DATETIME2(0)   NOT NULL CONSTRAINT DF_PedidosProposta_CriadoEm DEFAULT (SYSUTCDATETIME()),  -- UTC
        Estado                VARCHAR(20)    NOT NULL CONSTRAINT DF_PedidosProposta_Estado DEFAULT ('novo'),
        Idioma                CHAR(2)        NOT NULL,          -- língua da resposta (en | pt)
        Origem                VARCHAR(30)    NULL,              -- page | overlay | other
        TempoPreenchimentoMs  INT            NULL,              -- elapsedMs

        -- Contacto
        Nome                  NVARCHAR(150)  NOT NULL,          -- contact.name
        Email                 NVARCHAR(254)  NOT NULL,          -- contact.email
        Telefone              NVARCHAR(40)   NULL,              -- contact.phone
        Empresa               NVARCHAR(150)  NULL,              -- contact.company
        Mensagem              NVARCHAR(4000) NULL,              -- contact.message

        -- Respostas
        Publico               VARCHAR(20)    NULL,              -- audience: business | nonprofit | personal (sem lista fixa: o formulário pode ganhar tipos novos)
        Setor                 NVARCHAR(100)  NULL,              -- sector
        SetorOutro            NVARCHAR(200)  NULL,              -- sectorOther
        Pais                  NVARCHAR(100)  NULL,              -- country
        PaisOutro             NVARCHAR(200)  NULL,              -- countryOther
        Design                NVARCHAR(100)  NULL,              -- web.design
        Paginas               NVARCHAR(50)   NULL,              -- web.pages
        IdiomasOutro          NVARCHAR(200)  NULL,              -- web.languagesOther
        Formularios           NVARCHAR(50)   NULL,              -- web.forms (quantos)
        Emails                NVARCHAR(50)   NULL,              -- (já não usado pelo site)
        Complexo              BIT            NOT NULL CONSTRAINT DF_PedidosProposta_Complexo DEFAULT (0),        -- web.complex
        Textos                NVARCHAR(100)  NULL,              -- web.texts
        Referencia1           NVARCHAR(500)  NULL,              -- web.references[0]
        Referencia2           NVARCHAR(500)  NULL,              -- web.references[1]
        SemReferencias        BIT            NOT NULL CONSTRAINT DF_PedidosProposta_SemReferencias DEFAULT (0),  -- web.noReferences
        Dominio               NVARCHAR(100)  NULL,              -- web.domain
        Urgente               NVARCHAR(50)   NULL,              -- web.urgent
        Plano                 NVARCHAR(100)  NULL,              -- photo.plan
        Regiao                NVARCHAR(100)  NULL,              -- photo.region
        Localidade            NVARCHAR(150)  NULL,              -- photo.town
        SiteAtual             NVARCHAR(200)  NULL,              -- search.site (o site atual, para SEO/GEO)
        PaginasPesquisa       NVARCHAR(50)   NULL,              -- search.pages
        Alcance               NVARCHAR(100)  NULL,              -- search.reach
        PlanoSeo              NVARCHAR(100)  NULL,              -- search.seoPlan
        PlanoGeo              NVARCHAR(100)  NULL,              -- search.geoPlan

        RespostasJson         NVARCHAR(MAX)  NOT NULL,          -- as respostas inteiras
        NotasInternas         NVARCHAR(MAX)  NULL,              -- para o estúdio anotar o pedido

        CONSTRAINT CK_PedidosProposta_Estado  CHECK (Estado IN ('novo', 'em_analise', 'proposta_enviada', 'aceite', 'recusado', 'arquivado')),
        CONSTRAINT CK_PedidosProposta_Idioma  CHECK (Idioma IN ('en', 'pt')),
        CONSTRAINT CK_PedidosProposta_Nome    CHECK (LEN(Nome) > 0),
        CONSTRAINT CK_PedidosProposta_Email   CHECK (Email LIKE N'%_@_%._%'),
        CONSTRAINT CK_PedidosProposta_Json    CHECK (ISJSON(RespostasJson) = 1)
    );

    CREATE INDEX IX_PedidosProposta_CriadoEm ON dbo.PedidosProposta (CriadoEm DESC) INCLUDE (Estado, Nome, Email);
    CREATE INDEX IX_PedidosProposta_Estado   ON dbo.PedidosProposta (Estado, CriadoEm DESC);
    CREATE INDEX IX_PedidosProposta_Email    ON dbo.PedidosProposta (Email);
END
GO

-- Mudanças depois da primeira versão (2026-11-01), para bases de dados já criadas.
-- "LocalFotos" guardava afinal o site atual do cliente (search.site): passa a "SiteAtual".
IF COL_LENGTH(N'dbo.PedidosProposta', N'LocalFotos') IS NOT NULL
   AND COL_LENGTH(N'dbo.PedidosProposta', N'SiteAtual') IS NULL
    EXEC sp_rename N'dbo.PedidosProposta.LocalFotos', N'SiteAtual', N'COLUMN';
-- O tipo de cliente deixou de ter lista fixa (2026-11-05): o formulário ganhou as associações
-- ("nonprofit") e um pedido com um valor fora da lista era recusado pelo SQL.
IF OBJECT_ID(N'dbo.CK_PedidosProposta_Publico', N'C') IS NOT NULL
    ALTER TABLE dbo.PedidosProposta DROP CONSTRAINT CK_PedidosProposta_Publico;
IF COL_LENGTH(N'dbo.PedidosProposta', N'TipoFormularios') IS NULL
    ALTER TABLE dbo.PedidosProposta ADD TipoFormularios NVARCHAR(50) NULL;          -- web.formKind: simple | complex
IF COL_LENGTH(N'dbo.PedidosProposta', N'EstimativaMin') IS NULL
    ALTER TABLE dbo.PedidosProposta ADD EstimativaMin DECIMAL(10,2) NULL;            -- estimate.total.min (€)
IF COL_LENGTH(N'dbo.PedidosProposta', N'EstimativaMax') IS NULL
    ALTER TABLE dbo.PedidosProposta ADD EstimativaMax DECIMAL(10,2) NULL;            -- estimate.total.max (€)
IF COL_LENGTH(N'dbo.PedidosProposta', N'EstimativaMensal') IS NULL
    ALTER TABLE dbo.PedidosProposta ADD EstimativaMensal DECIMAL(10,2) NULL;         -- estimate.monthly (€/mês)
IF COL_LENGTH(N'dbo.PedidosProposta', N'EstimativaJson') IS NULL
    ALTER TABLE dbo.PedidosProposta ADD EstimativaJson NVARCHAR(MAX) NULL;           -- a estimativa inteira, como foi mostrada
GO


/* ---------------------------------------------------------------------
   3. Respostas com várias escolhas (uma linha por opção escolhida)
   --------------------------------------------------------------------- */
IF OBJECT_ID(N'dbo.PedidoServicos', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.PedidoServicos (                                        -- services
        PedidoId       INT          NOT NULL,
        ServicoCodigo  VARCHAR(20)  NOT NULL,
        CONSTRAINT PK_PedidoServicos PRIMARY KEY (PedidoId, ServicoCodigo),
        CONSTRAINT FK_PedidoServicos_Pedido  FOREIGN KEY (PedidoId)      REFERENCES dbo.PedidosProposta (Id) ON DELETE CASCADE,
        CONSTRAINT FK_PedidoServicos_Servico FOREIGN KEY (ServicoCodigo) REFERENCES dbo.Servicos (Codigo)
    );
    CREATE INDEX IX_PedidoServicos_Servico ON dbo.PedidoServicos (ServicoCodigo);
END
GO

IF OBJECT_ID(N'dbo.PedidoIdiomas', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.PedidoIdiomas (                                         -- web.languages
        PedidoId  INT           NOT NULL,
        Idioma    NVARCHAR(50)  NOT NULL,
        CONSTRAINT PK_PedidoIdiomas PRIMARY KEY (PedidoId, Idioma),
        CONSTRAINT FK_PedidoIdiomas_Pedido FOREIGN KEY (PedidoId) REFERENCES dbo.PedidosProposta (Id) ON DELETE CASCADE
    );
END
GO

IF OBJECT_ID(N'dbo.PedidoFuncionalidades', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.PedidoFuncionalidades (                                 -- web.features
        PedidoId        INT            NOT NULL,
        Funcionalidade  NVARCHAR(100)  NOT NULL,
        CONSTRAINT PK_PedidoFuncionalidades PRIMARY KEY (PedidoId, Funcionalidade),
        CONSTRAINT FK_PedidoFuncionalidades_Pedido FOREIGN KEY (PedidoId) REFERENCES dbo.PedidosProposta (Id) ON DELETE CASCADE
    );
END
GO


/* ---------------------------------------------------------------------
   4. O procedimento que o site chama para guardar um pedido
   Tudo numa transação: ou fica o pedido inteiro, ou não fica nada.
   --------------------------------------------------------------------- */
CREATE OR ALTER PROCEDURE dbo.usp_InserirPedidoProposta
    @Respostas   NVARCHAR(MAX),          -- answers (JSON)
    @Contacto    NVARCHAR(MAX),          -- contact (JSON)
    @Idioma      CHAR(2),
    @Origem      VARCHAR(30)   = NULL,
    @TempoMs     INT           = NULL,
    @Estimativa  NVARCHAR(MAX) = NULL,   -- estimate (JSON), opcional
    @NovoId      INT           OUTPUT,
    @CriadoEm    DATETIME2(0)  = NULL,   -- a hora do pedido em UTC (a mesma do Notion); vazio = agora
    @Inserido    BIT           = NULL OUTPUT  -- 1 = gravado agora; 0 = já lá estava
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;   -- qualquer erro desfaz a transação inteira

    IF ISJSON(@Respostas) <> 1 OR ISJSON(@Contacto) <> 1
        THROW 50001, N'As respostas ou o contacto não são JSON válido.', 1;
    IF @Estimativa IS NOT NULL AND ISJSON(@Estimativa) <> 1
        SET @Estimativa = NULL;

    DECLARE @Quando DATETIME2(0)  = COALESCE(@CriadoEm, SYSUTCDATETIME());
    DECLARE @Email  NVARCHAR(254) = LTRIM(RTRIM(JSON_VALUE(@Contacto, '$.email')));
    SET @NovoId = NULL;

    BEGIN TRANSACTION;

    -- O mesmo pedido já guardado? O site e a recuperação noturna podem
    -- tentar gravar o mesmo pedido: é o mesmo se tiver o mesmo email e a
    -- mesma hora (com 2 minutos de folga). Nesse caso não se grava de novo.
    SELECT TOP (1) @NovoId = Id
      FROM dbo.PedidosProposta WITH (UPDLOCK, HOLDLOCK)
     WHERE Email = @Email AND ABS(DATEDIFF(SECOND, CriadoEm, @Quando)) <= 120;
    IF @NovoId IS NOT NULL
    BEGIN
        COMMIT TRANSACTION;
        SET @Inserido = 0;
        RETURN;
    END

    INSERT INTO dbo.PedidosProposta (
        CriadoEm, Idioma, Origem, TempoPreenchimentoMs,
        Nome, Email, Telefone, Empresa, Mensagem,
        Publico, Setor, SetorOutro, Pais, PaisOutro,
        Design, Paginas, IdiomasOutro, TipoFormularios, Formularios, Complexo, Textos,
        Referencia1, Referencia2, SemReferencias, Dominio, Urgente,
        Plano, Regiao, Localidade,
        SiteAtual, PaginasPesquisa, Alcance, PlanoSeo, PlanoGeo,
        EstimativaMin, EstimativaMax, EstimativaMensal, EstimativaJson,
        RespostasJson
    )
    SELECT
        @Quando, @Idioma, @Origem, @TempoMs,
        LTRIM(RTRIM(c.Nome)), LTRIM(RTRIM(c.Email)),
        NULLIF(LTRIM(RTRIM(c.Telefone)), N''), NULLIF(LTRIM(RTRIM(c.Empresa)), N''), NULLIF(LTRIM(RTRIM(c.Mensagem)), N''),
        NULLIF(r.Publico, ''), NULLIF(r.Setor, N''), NULLIF(r.SetorOutro, N''), NULLIF(r.Pais, N''), NULLIF(r.PaisOutro, N''),
        NULLIF(r.Design, N''), NULLIF(r.Paginas, N''), NULLIF(r.IdiomasOutro, N''), NULLIF(r.TipoFormularios, N''),
        NULLIF(r.Formularios, N''), ISNULL(r.Complexo, 0), NULLIF(r.Textos, N''),
        NULLIF(r.Referencia1, N''), NULLIF(r.Referencia2, N''), ISNULL(r.SemReferencias, 0),
        NULLIF(r.Dominio, N''), NULLIF(r.Urgente, N''),
        NULLIF(r.Plano, N''), NULLIF(r.Regiao, N''), NULLIF(r.Localidade, N''),
        NULLIF(r.SiteAtual, N''), NULLIF(r.PaginasPesquisa, N''), NULLIF(r.Alcance, N''), NULLIF(r.PlanoSeo, N''), NULLIF(r.PlanoGeo, N''),
        TRY_CAST(JSON_VALUE(@Estimativa, '$.total.min') AS DECIMAL(10,2)),
        TRY_CAST(JSON_VALUE(@Estimativa, '$.total.max') AS DECIMAL(10,2)),
        TRY_CAST(JSON_VALUE(@Estimativa, '$.monthly')   AS DECIMAL(10,2)),
        @Estimativa,
        @Respostas
    FROM OPENJSON(@Contacto) WITH (
            Nome      NVARCHAR(150)  '$.name',
            Email     NVARCHAR(254)  '$.email',
            Telefone  NVARCHAR(40)   '$.phone',
            Empresa   NVARCHAR(150)  '$.company',
            Mensagem  NVARCHAR(4000) '$.message'
         ) AS c
    CROSS JOIN OPENJSON(@Respostas) WITH (
            Publico          VARCHAR(20)    '$.audience',
            Setor            NVARCHAR(100)  '$.sector',
            SetorOutro       NVARCHAR(200)  '$.sectorOther',
            Pais             NVARCHAR(100)  '$.country',
            PaisOutro        NVARCHAR(200)  '$.countryOther',
            Design           NVARCHAR(100)  '$.web.design',
            Paginas          NVARCHAR(50)   '$.web.pages',
            IdiomasOutro     NVARCHAR(200)  '$.web.languagesOther',
            TipoFormularios  NVARCHAR(50)   '$.web.formKind',
            Formularios      NVARCHAR(50)   '$.web.forms',
            Complexo         BIT            '$.web.complex',
            Textos           NVARCHAR(100)  '$.web.texts',
            Referencia1      NVARCHAR(500)  '$.web.references[0]',
            Referencia2      NVARCHAR(500)  '$.web.references[1]',
            SemReferencias   BIT            '$.web.noReferences',
            Dominio          NVARCHAR(100)  '$.web.domain',
            Urgente          NVARCHAR(50)   '$.web.urgent',
            Plano            NVARCHAR(100)  '$.photo.plan',
            Regiao           NVARCHAR(100)  '$.photo.region',
            Localidade       NVARCHAR(150)  '$.photo.town',
            SiteAtual        NVARCHAR(200)  '$.search.site',
            PaginasPesquisa  NVARCHAR(50)   '$.search.pages',
            Alcance          NVARCHAR(100)  '$.search.reach',
            PlanoSeo         NVARCHAR(100)  '$.search.seoPlan',
            PlanoGeo         NVARCHAR(100)  '$.search.geoPlan'
         ) AS r;

    SET @NovoId = CAST(SCOPE_IDENTITY() AS INT);

    -- Serviços: os escolhidos + os principais (o Web Design vai sempre)
    INSERT INTO dbo.PedidoServicos (PedidoId, ServicoCodigo)
    SELECT @NovoId, s.Codigo
    FROM dbo.Servicos AS s
    WHERE s.Principal = 1
       OR s.Codigo IN (SELECT j.[value] FROM OPENJSON(@Respostas, '$.services') AS j WHERE j.[type] = 1);

    -- Línguas do site
    INSERT INTO dbo.PedidoIdiomas (PedidoId, Idioma)
    SELECT DISTINCT @NovoId, LEFT(LTRIM(RTRIM(j.[value])), 50)
    FROM OPENJSON(@Respostas, '$.web.languages') AS j
    WHERE j.[type] = 1 AND LEN(LTRIM(RTRIM(j.[value]))) > 0;

    -- Funcionalidades pedidas
    INSERT INTO dbo.PedidoFuncionalidades (PedidoId, Funcionalidade)
    SELECT DISTINCT @NovoId, LEFT(LTRIM(RTRIM(j.[value])), 100)
    FROM OPENJSON(@Respostas, '$.web.features') AS j
    WHERE j.[type] = 1 AND LEN(LTRIM(RTRIM(j.[value]))) > 0;

    COMMIT TRANSACTION;
    SET @Inserido = 1;
END
GO


/* ---------------------------------------------------------------------
   4b. Pedidos de parceria (o segundo formulário: empresas de desenvolvimento)
   Respostas em src/lib/proposal/partner.ts (tipo PartnerAnswers).
   --------------------------------------------------------------------- */
IF OBJECT_ID(N'dbo.PedidosParceria', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.PedidosParceria (
        Id                    INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_PedidosParceria PRIMARY KEY,
        CriadoEm              DATETIME2(0)   NOT NULL CONSTRAINT DF_PedidosParceria_CriadoEm DEFAULT (SYSUTCDATETIME()),  -- UTC
        Estado                VARCHAR(20)    NOT NULL CONSTRAINT DF_PedidosParceria_Estado DEFAULT ('novo'),
        Idioma                CHAR(2)        NOT NULL,          -- língua da resposta (en | pt)
        TempoPreenchimentoMs  INT            NULL,              -- elapsedMs

        -- Contacto
        Nome                  NVARCHAR(150)  NOT NULL,          -- contact.name
        Email                 NVARCHAR(254)  NOT NULL,          -- contact.email
        Telefone              NVARCHAR(40)   NULL,              -- contact.phone
        Empresa               NVARCHAR(150)  NULL,              -- contact.company
        Mensagem              NVARCHAR(4000) NULL,              -- contact.message

        -- Respostas
        Projeto               NVARCHAR(50)   NULL,              -- project
        Ecras                 NVARCHAR(50)   NULL,              -- screens
        EcrasEstimativa       NVARCHAR(150)  NULL,              -- screensEstimate
        Inspiracao            NVARCHAR(20)   NULL,              -- inspiration
        LinkInspiracao        NVARCHAR(500)  NULL,              -- inspirationLink
        Inicio                NVARCHAR(50)   NULL,              -- start
        Entrega               NVARCHAR(50)   NULL,              -- delivery
        Modelo                NVARCHAR(50)   NULL,              -- model
        Credito               NVARCHAR(50)   NULL,              -- credit
        NDA                   BIT            NOT NULL CONSTRAINT DF_PedidosParceria_NDA DEFAULT (0),  -- nda

        RespostasJson         NVARCHAR(MAX)  NOT NULL,          -- as respostas inteiras
        NotasInternas         NVARCHAR(MAX)  NULL,

        CONSTRAINT CK_PedidosParceria_Estado CHECK (Estado IN ('novo', 'em_analise', 'proposta_enviada', 'aceite', 'recusado', 'arquivado')),
        CONSTRAINT CK_PedidosParceria_Idioma CHECK (Idioma IN ('en', 'pt')),
        CONSTRAINT CK_PedidosParceria_Nome   CHECK (LEN(Nome) > 0),
        CONSTRAINT CK_PedidosParceria_Email  CHECK (Email LIKE N'%_@_%._%'),
        CONSTRAINT CK_PedidosParceria_Json   CHECK (ISJSON(RespostasJson) = 1)
    );

    CREATE INDEX IX_PedidosParceria_CriadoEm ON dbo.PedidosParceria (CriadoEm DESC) INCLUDE (Estado, Nome, Empresa);
    CREATE INDEX IX_PedidosParceria_Email    ON dbo.PedidosParceria (Email);
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_InserirPedidoParceria
    @Respostas  NVARCHAR(MAX),          -- answers (JSON)
    @Contacto   NVARCHAR(MAX),          -- contact (JSON)
    @Idioma     CHAR(2),
    @TempoMs    INT = NULL,
    @NovoId     INT OUTPUT,
    @CriadoEm   DATETIME2(0) = NULL,        -- a hora do pedido em UTC (a mesma do Notion); vazio = agora
    @Inserido   BIT          = NULL OUTPUT  -- 1 = gravado agora; 0 = já lá estava
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF ISJSON(@Respostas) <> 1 OR ISJSON(@Contacto) <> 1
        THROW 50001, N'As respostas ou o contacto não são JSON válido.', 1;

    DECLARE @Quando DATETIME2(0)  = COALESCE(@CriadoEm, SYSUTCDATETIME());
    DECLARE @Email  NVARCHAR(254) = LTRIM(RTRIM(JSON_VALUE(@Contacto, '$.email')));
    SET @NovoId = NULL;

    BEGIN TRANSACTION;

    -- O mesmo pedido já guardado? (ver usp_InserirPedidoProposta)
    SELECT TOP (1) @NovoId = Id
      FROM dbo.PedidosParceria WITH (UPDLOCK, HOLDLOCK)
     WHERE Email = @Email AND ABS(DATEDIFF(SECOND, CriadoEm, @Quando)) <= 120;
    IF @NovoId IS NOT NULL
    BEGIN
        COMMIT TRANSACTION;
        SET @Inserido = 0;
        RETURN;
    END

    INSERT INTO dbo.PedidosParceria (
        CriadoEm, Idioma, TempoPreenchimentoMs,
        Nome, Email, Telefone, Empresa, Mensagem,
        Projeto, Ecras, EcrasEstimativa, Inspiracao, LinkInspiracao,
        Inicio, Entrega, Modelo, Credito, NDA,
        RespostasJson
    )
    SELECT
        @Quando, @Idioma, @TempoMs,
        LTRIM(RTRIM(c.Nome)), LTRIM(RTRIM(c.Email)),
        NULLIF(LTRIM(RTRIM(c.Telefone)), N''), NULLIF(LTRIM(RTRIM(c.Empresa)), N''), NULLIF(LTRIM(RTRIM(c.Mensagem)), N''),
        NULLIF(r.Projeto, N''), NULLIF(r.Ecras, N''), NULLIF(r.EcrasEstimativa, N''), NULLIF(r.Inspiracao, N''), NULLIF(r.LinkInspiracao, N''),
        NULLIF(r.Inicio, N''), NULLIF(r.Entrega, N''), NULLIF(r.Modelo, N''), NULLIF(r.Credito, N''), ISNULL(r.NDA, 0),
        @Respostas
    FROM OPENJSON(@Contacto) WITH (
            Nome      NVARCHAR(150)  '$.name',
            Email     NVARCHAR(254)  '$.email',
            Telefone  NVARCHAR(40)   '$.phone',
            Empresa   NVARCHAR(150)  '$.company',
            Mensagem  NVARCHAR(4000) '$.message'
         ) AS c
    CROSS JOIN OPENJSON(@Respostas) WITH (
            Projeto          NVARCHAR(50)   '$.project',
            Ecras            NVARCHAR(50)   '$.screens',
            EcrasEstimativa  NVARCHAR(150)  '$.screensEstimate',
            Inspiracao       NVARCHAR(20)   '$.inspiration',
            LinkInspiracao   NVARCHAR(500)  '$.inspirationLink',
            Inicio           NVARCHAR(50)   '$.start',
            Entrega          NVARCHAR(50)   '$.delivery',
            Modelo           NVARCHAR(50)   '$.model',
            Credito          NVARCHAR(50)   '$.credit',
            NDA              BIT            '$.nda'
         ) AS r;

    SET @NovoId = CAST(SCOPE_IDENTITY() AS INT);
    COMMIT TRANSACTION;
    SET @Inserido = 1;
END
GO


/* ---------------------------------------------------------------------
   5. Vista para ler os pedidos de forma legível
   --------------------------------------------------------------------- */
CREATE OR ALTER VIEW dbo.vw_PedidosResumo
AS
SELECT
    p.Id,
    p.CriadoEm,
    p.Estado,
    p.Nome,
    p.Email,
    p.Telefone,
    p.Empresa,
    p.Publico,
    p.Setor,
    p.Pais,
    (SELECT STRING_AGG(s.Nome, N', ') WITHIN GROUP (ORDER BY s.Principal DESC, s.Nome)
       FROM dbo.PedidoServicos ps
       JOIN dbo.Servicos s ON s.Codigo = ps.ServicoCodigo
      WHERE ps.PedidoId = p.Id)                                   AS Servicos,
    (SELECT STRING_AGG(i.Idioma, N', ')
       FROM dbo.PedidoIdiomas i WHERE i.PedidoId = p.Id)          AS Idiomas,
    (SELECT STRING_AGG(f.Funcionalidade, N', ')
       FROM dbo.PedidoFuncionalidades f WHERE f.PedidoId = p.Id)  AS Funcionalidades,
    p.EstimativaMin,
    p.EstimativaMax,
    p.EstimativaMensal,
    p.Mensagem,
    p.Idioma,
    p.Origem
FROM dbo.PedidosProposta p;
GO


/* ---------------------------------------------------------------------
   5b. Rótulos: as respostas nas palavras do formulário, em português
   Os ids que o site guarda ("health", "4-6") e o texto que o formulário
   mostra ("Saúde", "4–6"). Gerados por scripts/sql/rotulos.ts.
   --------------------------------------------------------------------- */
IF OBJECT_ID(N'dbo.Rotulos', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Rotulos (
        Lista   VARCHAR(40)    NOT NULL,   -- o nome da lista no código do site (SECTORS, PAGES...)
        Codigo  NVARCHAR(60)   NOT NULL,   -- o id que o site guarda
        Texto   NVARCHAR(200)  NOT NULL,   -- o que o formulário mostra em português
        CONSTRAINT PK_Rotulos PRIMARY KEY (Lista, Codigo)
    );
END
GO

-- <rotulos> (gerado por scripts/sql/rotulos.ts a partir das listas do formulário: não editar à mão)
DELETE FROM dbo.Rotulos;
INSERT INTO dbo.Rotulos (Lista, Codigo, Texto) VALUES
    (N'SERVICES', N'web', N'Web design'),
    (N'SERVICES', N'identity', N'Identidade visual'),
    (N'SERVICES', N'photo', N'Sessão fotográfica'),
    (N'SERVICES', N'seo', N'SEO e GEO'),
    (N'AUDIENCES', N'business', N'Um negócio'),
    (N'AUDIENCES', N'nonprofit', N'Uma associação sem fins lucrativos'),
    (N'AUDIENCES', N'personal', N'Uso pessoal'),
    (N'SECTORS', N'health', N'Saúde'),
    (N'SECTORS', N'beauty', N'Estética e bem-estar'),
    (N'SECTORS', N'realestate', N'Imobiliário'),
    (N'SECTORS', N'hospitality', N'Restauração'),
    (N'SECTORS', N'lodging', N'Alojamento e turismo'),
    (N'SECTORS', N'retail', N'Loja / comércio'),
    (N'SECTORS', N'professional', N'Serviços profissionais'),
    (N'SECTORS', N'trades', N'Construção e serviços ao domicílio'),
    (N'SECTORS', N'sport', N'Desporto e fitness'),
    (N'SECTORS', N'education', N'Educação e formação'),
    (N'SECTORS', N'events', N'Eventos e casamentos'),
    (N'SECTORS', N'creative', N'Criativos e fotografia'),
    (N'SECTORS', N'tech', N'Tecnologia e B2B'),
    (N'SECTORS', N'other', N'Outro'),
    (N'COUNTRIES', N'PT', N'Portugal'),
    (N'COUNTRIES', N'ES', N'Espanha'),
    (N'COUNTRIES', N'IT', N'Itália'),
    (N'COUNTRIES', N'US', N'EUA'),
    (N'COUNTRIES', N'other', N'Outro'),
    (N'PAGES', N'landing', N'Landing page'),
    (N'PAGES', N'3', N'3'),
    (N'PAGES', N'4-6', N'4–6'),
    (N'PAGES', N'7-10', N'7–10'),
    (N'PAGES', N'10+', N'Mais de 10'),
    (N'PAGES', N'unsure', N'Não sei'),
    (N'PAGE_MODES', N'landing', N'Landing page'),
    (N'PAGE_MODES', N'website', N'Website'),
    (N'PAGE_MODES', N'unsure', N'Não sei'),
    (N'PAGE_TYPES', N'services', N'Serviços, todos numa página ou secção'),
    (N'PAGE_TYPES', N'servicesPages', N'Serviços, com página para cada serviço'),
    (N'PAGE_TYPES', N'items', N'Lista de itens, sem página para cada um (produtos, cursos, menu…)'),
    (N'PAGE_TYPES', N'itemsPages', N'Lista de itens, com página para cada item (imóveis, quartos, tratamentos…)'),
    (N'PAGE_TYPES', N'team', N'Equipa'),
    (N'PAGE_TYPES', N'portfolio', N'Portefólio e casos'),
    (N'PAGE_TYPES', N'gallery', N'Galeria (fotografias e vídeos)'),
    (N'PAGE_TYPES', N'prices', N'Preços'),
    (N'PAGE_TYPES', N'testimonials', N'Testemunhos'),
    (N'PAGE_TYPES', N'faq', N'Perguntas frequentes'),
    (N'PAGE_TYPES', N'events', N'Eventos'),
    (N'PAGE_TYPES', N'process', N'Como funciona'),
    (N'PAGE_TYPES', N'partners', N'Parceiros e marcas'),
    (N'PAGE_TYPES', N'work', N'Trabalhe connosco'),
    (N'PAGE_TYPES', N'resources', N'Recursos e descarregáveis'),
    (N'LANGUAGES', N'pt', N'Português'),
    (N'LANGUAGES', N'en', N'Inglês'),
    (N'LANGUAGES', N'other', N'Outras'),
    (N'LANGUAGES', N'unsure', N'Não sei'),
    (N'FEATURES', N'forms', N'Formulários'),
    (N'FEATURES', N'newsletter', N'Inscrição na newsletter'),
    (N'FEATURES', N'booking', N'Calendarização e reservas'),
    (N'FORM_KINDS', N'simple', N'Manual'),
    (N'FORM_KINDS', N'complex', N'Automatizado'),
    (N'DESIGN', N'essential', N'Essencial+'),
    (N'DESIGN', N'advanced', N'Avançado'),
    (N'DESIGN', N'unsure', N'Não sei'),
    (N'TEXTS', N'yes', N'Sim'),
    (N'TEXTS', N'no', N'Não'),
    (N'TEXTS', N'unsure', N'Não sei'),
    (N'YES_NO', N'yes', N'Sim'),
    (N'YES_NO', N'no', N'Não'),
    (N'PHOTO_PLANS', N'photos', N'Só fotografia'),
    (N'PHOTO_PLANS', N'photos-video', N'Fotografia e vídeo'),
    (N'PHOTO_PLANS', N'unsure', N'Não sei'),
    (N'REGIONS', N'mainland', N'Continente'),
    (N'REGIONS', N'madeira', N'Madeira'),
    (N'REGIONS', N'azores', N'Açores'),
    (N'SEARCH_PLANS', N'once', N'Pontual'),
    (N'SEARCH_PLANS', N'monthly', N'Pontual + mensal'),
    (N'SEARCH_PLANS', N'unsure', N'Não sei'),
    (N'REACH', N'local', N'Local'),
    (N'REACH', N'national', N'Nacional'),
    (N'REACH', N'international', N'Internacional'),
    (N'PROJECT_TYPES', N'website', N'Website'),
    (N'PROJECT_TYPES', N'platform', N'Plataforma'),
    (N'PROJECT_TYPES', N'webapp', N'Aplicação web'),
    (N'SCREENS', N'1-10', N'1–10'),
    (N'SCREENS', N'11-20', N'11–20'),
    (N'SCREENS', N'20+', N'Mais de 20'),
    (N'STARTS', N'week', N'Menos de uma semana'),
    (N'STARTS', N'1-2w', N'1–2 semanas'),
    (N'STARTS', N'3-4w', N'3–4 semanas'),
    (N'STARTS', N'month+', N'Mais de 1 mês'),
    (N'DELIVERIES', N'2w', N'Menos de 2 semanas'),
    (N'DELIVERIES', N'2-4w', N'2–4 semanas'),
    (N'DELIVERIES', N'1-2m', N'1–2 meses'),
    (N'DELIVERIES', N'2m+', N'Mais de 2 meses'),
    (N'MODELS', N'project', N'Um projeto fechado'),
    (N'MODELS', N'ongoing', N'Trabalho contínuo'),
    (N'CREDITS', N'credit', N'Sim, com crédito'),
    (N'CREDITS', N'white', N'Não, sem crédito (white label)'),
    (N'PARTNER_YES_NO', N'yes', N'Sim'),
    (N'PARTNER_YES_NO', N'no', N'Não');
-- </rotulos>
GO


/* ---------------------------------------------------------------------
   5c. Perguntas: o nome e o grupo de cada resposta, para as fichas
   Caminho = onde a resposta está no JSON do site; Lista = de que lista
   de rótulos vêm as palavras (vazia para texto livre ou sim/não).
   --------------------------------------------------------------------- */
IF OBJECT_ID(N'dbo.Perguntas', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Perguntas (
        Formulario  VARCHAR(20)    NOT NULL,   -- proposta | parceria
        Ordem       INT            NOT NULL,
        Grupo       NVARCHAR(40)   NOT NULL,
        Pergunta    NVARCHAR(80)   NOT NULL,
        Caminho     VARCHAR(80)    NOT NULL,
        Lista       VARCHAR(40)    NULL,
        CONSTRAINT PK_Perguntas PRIMARY KEY (Formulario, Ordem)
    );
END
GO

DELETE FROM dbo.Perguntas;
INSERT INTO dbo.Perguntas (Formulario, Ordem, Grupo, Pergunta, Caminho, Lista) VALUES
    ('proposta', 10, N'Negócio', N'País', 'country', 'COUNTRIES'),
    ('proposta', 11, N'Negócio', N'País (outro)', 'countryOther', NULL),
    ('proposta', 12, N'Negócio', N'Serviços', 'services', 'SERVICES'),
    ('proposta', 13, N'Negócio', N'Cliente', 'audience', 'AUDIENCES'),
    ('proposta', 14, N'Negócio', N'Área do negócio', 'sector', 'SECTORS'),
    ('proposta', 15, N'Negócio', N'Área (outra)', 'sectorOther', NULL),
    ('proposta', 20, N'Website', N'Nível de design', 'web.design', 'DESIGN'),
    ('proposta', 21, N'Website', N'O que é preciso', 'web.pageMode', 'PAGE_MODES'),
    ('proposta', 22, N'Website', N'Páginas e secções', 'web.pageTypes', 'PAGE_TYPES'),
    ('proposta', 23, N'Website', N'Outras páginas', 'web.pageOthers', NULL),
    ('proposta', 24, N'Website', N'Outras à escolha do estúdio', 'web.pagesUnsure', NULL),
    ('proposta', 25, N'Website', N'Número de páginas', 'web.pages', 'PAGES'),
    ('proposta', 26, N'Website', N'Línguas', 'web.languages', 'LANGUAGES'),
    ('proposta', 27, N'Website', N'Outras línguas', 'web.languagesOther', NULL),
    ('proposta', 28, N'Website', N'O que faz', 'web.features', 'FEATURES'),
    ('proposta', 29, N'Website', N'Formulários', 'web.formKind', 'FORM_KINDS'),
    ('proposta', 30, N'Website', N'Formulários (quantos)', 'web.forms', NULL),
    ('proposta', 31, N'Website', N'Sistemas complexos', 'web.complex', NULL),
    ('proposta', 32, N'Website', N'Textos prontos', 'web.texts', 'TEXTS'),
    ('proposta', 33, N'Website', N'Websites de referência', 'web.references', NULL),
    ('proposta', 34, N'Website', N'Sem websites de referência', 'web.noReferences', NULL),
    ('proposta', 35, N'Website', N'Já tem domínio', 'web.domain', 'YES_NO'),
    ('proposta', 36, N'Website', N'Prazo urgente', 'web.urgent', 'YES_NO'),
    ('proposta', 40, N'Sessão fotográfica', N'Plano de fotografia', 'photo.plan', 'PHOTO_PLANS'),
    ('proposta', 41, N'Sessão fotográfica', N'Zona', 'photo.region', 'REGIONS'),
    ('proposta', 42, N'Sessão fotográfica', N'Localidade', 'photo.town', NULL),
    ('proposta', 50, N'SEO e GEO', N'Site atual', 'search.site', NULL),
    ('proposta', 51, N'SEO e GEO', N'Páginas do site', 'search.pages', 'PAGES'),
    ('proposta', 52, N'SEO e GEO', N'Alcance', 'search.reach', 'REACH'),
    ('proposta', 53, N'SEO e GEO', N'Plano', 'search.seoPlan', 'SEARCH_PLANS'),
    ('proposta', 54, N'SEO e GEO', N'Plano GEO', 'search.geoPlan', 'SEARCH_PLANS'),
    ('parceria', 10, N'Projeto', N'Projeto', 'project', 'PROJECT_TYPES'),
    ('parceria', 11, N'Projeto', N'Ecrãs ou páginas', 'screens', 'SCREENS'),
    ('parceria', 12, N'Projeto', N'Ecrãs (estimativa)', 'screensEstimate', NULL),
    ('parceria', 13, N'Projeto', N'Design ou guia de marca', 'inspiration', 'PARTNER_YES_NO'),
    ('parceria', 14, N'Projeto', N'Link do design', 'inspirationLink', NULL),
    ('parceria', 15, N'Projeto', N'Tecnologia compatível', 'compatible', 'PARTNER_YES_NO'),
    ('parceria', 20, N'Condições', N'Início', 'start', 'STARTS'),
    ('parceria', 21, N'Condições', N'Entrega', 'delivery', 'DELIVERIES'),
    ('parceria', 22, N'Condições', N'Modelo de trabalho', 'model', 'MODELS'),
    ('parceria', 23, N'Condições', N'No nosso portefólio', 'credit', 'CREDITS'),
    ('parceria', 24, N'Condições', N'NDA', 'nda', NULL);
GO


/* ---------------------------------------------------------------------
   5d. Funções de apoio: a hora de Lisboa, os valores e as respostas
   --------------------------------------------------------------------- */

-- Uma data guardada em UTC, na hora de Lisboa: "05/11/2026 00:14".
CREATE OR ALTER FUNCTION dbo.fn_HoraLisboa (@Utc DATETIME2(0))
RETURNS NVARCHAR(20)
AS
BEGIN
    RETURN FORMAT(@Utc AT TIME ZONE 'UTC' AT TIME ZONE 'GMT Standard Time', 'dd/MM/yyyy HH:mm');
END
GO

-- Um valor ou um intervalo em euros: "1 010–1 275 €"; sem valor, "Sob consulta".
CREATE OR ALTER FUNCTION dbo.fn_Euros (@Min DECIMAL(10,2), @Max DECIMAL(10,2))
RETURNS NVARCHAR(60)
AS
BEGIN
    IF @Min IS NULL RETURN N'Sob consulta';
    IF @Max IS NULL OR @Max = @Min RETURN FORMAT(@Min, N'#,0', 'pt-PT') + N' €';
    RETURN FORMAT(@Min, N'#,0', 'pt-PT') + N'–' + FORMAT(@Max, N'#,0', 'pt-PT') + N' €';
END
GO

-- As respostas de um pedido, uma por linha, já em português.
CREATE OR ALTER FUNCTION dbo.fn_Respostas (@Json NVARCHAR(MAX), @Formulario VARCHAR(20))
RETURNS TABLE
AS
RETURN
    SELECT
        q.Ordem,
        q.Grupo,
        q.Pergunta,
        COALESCE(
            lista.Texto,
            rotulo.Texto,
            CASE v.Valor WHEN N'true' THEN N'Sim' WHEN N'false' THEN N'Não' ELSE v.Valor END
        ) AS Resposta
    FROM dbo.Perguntas AS q
    CROSS APPLY (
        SELECT JSON_VALUE(@Json, '$.' + q.Caminho) COLLATE DATABASE_DEFAULT AS Valor,
               JSON_QUERY(@Json, '$.' + q.Caminho) AS Lista
    ) AS v
    OUTER APPLY (
        SELECT STRING_AGG(COALESCE(r.Texto, a.[value] COLLATE DATABASE_DEFAULT), N', ')
                   WITHIN GROUP (ORDER BY CAST(a.[key] AS INT)) AS Texto
        FROM OPENJSON(v.Lista) AS a
        LEFT JOIN dbo.Rotulos AS r
               ON r.Lista = q.Lista AND r.Codigo = a.[value] COLLATE DATABASE_DEFAULT
    ) AS lista
    LEFT JOIN dbo.Rotulos AS rotulo
           ON rotulo.Lista = q.Lista AND rotulo.Codigo = v.Valor
    WHERE q.Formulario = @Formulario;
GO


/* ---------------------------------------------------------------------
   5e. As listas: um pedido por linha, já legível
   SELECT * FROM dbo.vw_Pedidos ORDER BY Id DESC;
   SELECT * FROM dbo.vw_Parcerias ORDER BY Id DESC;
   --------------------------------------------------------------------- */
CREATE OR ALTER VIEW dbo.vw_Pedidos
AS
SELECT
    p.Id,
    dbo.fn_HoraLisboa(p.CriadoEm)                                        AS Recebido,
    p.Estado,
    p.Nome,
    p.Empresa,
    p.Email,
    p.Telefone,
    (SELECT r.Texto FROM dbo.Rotulos r WHERE r.Lista = 'AUDIENCES' AND r.Codigo = p.Publico)  AS Cliente,
    COALESCE(p.SetorOutro,
             (SELECT r.Texto FROM dbo.Rotulos r WHERE r.Lista = 'SECTORS' AND r.Codigo = p.Setor))   AS [Área],
    COALESCE(p.PaisOutro,
             (SELECT r.Texto FROM dbo.Rotulos r WHERE r.Lista = 'COUNTRIES' AND r.Codigo = p.Pais))  AS [País],
    (SELECT STRING_AGG(COALESCE(r.Texto, s.[value] COLLATE DATABASE_DEFAULT), N', ')
                WITHIN GROUP (ORDER BY CAST(s.[key] AS INT))
       FROM OPENJSON(p.RespostasJson, '$.services') AS s
       LEFT JOIN dbo.Rotulos r ON r.Lista = 'SERVICES' AND r.Codigo = s.[value] COLLATE DATABASE_DEFAULT) AS [Serviços],
    dbo.fn_Euros(p.EstimativaMin, p.EstimativaMax)
        + CASE WHEN p.EstimativaMensal IS NULL THEN N''
               ELSE N' + ' + dbo.fn_Euros(p.EstimativaMensal,
                                          TRY_CAST(JSON_VALUE(p.EstimativaJson, '$.monthlyMax') AS DECIMAL(10,2)))
                    + N'/mês' END                                           AS Estimativa,
    p.Mensagem
FROM dbo.PedidosProposta AS p;
GO

CREATE OR ALTER VIEW dbo.vw_Parcerias
AS
SELECT
    p.Id,
    dbo.fn_HoraLisboa(p.CriadoEm)                                                                   AS Recebido,
    p.Estado,
    p.Nome,
    p.Empresa,
    p.Email,
    p.Telefone,
    (SELECT r.Texto FROM dbo.Rotulos r WHERE r.Lista = 'PROJECT_TYPES' AND r.Codigo = p.Projeto)  AS Projeto,
    (SELECT r.Texto FROM dbo.Rotulos r WHERE r.Lista = 'SCREENS' AND r.Codigo = p.Ecras)
        + COALESCE(N' (' + p.EcrasEstimativa + N')', N'')                                          AS [Ecrãs],
    (SELECT r.Texto FROM dbo.Rotulos r WHERE r.Lista = 'STARTS' AND r.Codigo = p.Inicio)          AS [Início],
    (SELECT r.Texto FROM dbo.Rotulos r WHERE r.Lista = 'DELIVERIES' AND r.Codigo = p.Entrega)     AS Entrega,
    (SELECT r.Texto FROM dbo.Rotulos r WHERE r.Lista = 'MODELS' AND r.Codigo = p.Modelo)          AS Modelo,
    (SELECT r.Texto FROM dbo.Rotulos r WHERE r.Lista = 'CREDITS' AND r.Codigo = p.Credito)        AS [Portefólio],
    CASE p.NDA WHEN 1 THEN N'Sim' ELSE N'Não' END                                                  AS NDA,
    p.Mensagem
FROM dbo.PedidosParceria AS p;
GO


/* ---------------------------------------------------------------------
   5f. As fichas: um pedido inteiro, pergunta a pergunta
   EXEC dbo.Ficha 2;            -- um pedido de proposta
   EXEC dbo.FichaParceria 1;    -- um pedido de parceria
   --------------------------------------------------------------------- */
CREATE OR ALTER PROCEDURE dbo.Ficha
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM dbo.PedidosProposta WHERE Id = @Id)
    BEGIN
        SELECT N'Não há nenhum pedido de proposta com o Id ' + CAST(@Id AS NVARCHAR(12)) + N'.' AS Aviso;
        RETURN;
    END

    SELECT x.Grupo, x.Pergunta, x.Resposta
    FROM (
        SELECT 1 AS Ordem, N'Pedido' AS Grupo, N'Recebido' AS Pergunta, dbo.fn_HoraLisboa(p.CriadoEm) AS Resposta
          FROM dbo.PedidosProposta p WHERE p.Id = @Id
        UNION ALL SELECT 2, N'Pedido', N'Estado', p.Estado FROM dbo.PedidosProposta p WHERE p.Id = @Id
        UNION ALL SELECT 3, N'Pedido', N'Responder em', CASE p.Idioma WHEN 'pt' THEN N'Português' ELSE N'Inglês' END
          FROM dbo.PedidosProposta p WHERE p.Id = @Id
        UNION ALL SELECT 4, N'Contacto', N'Nome', p.Nome FROM dbo.PedidosProposta p WHERE p.Id = @Id
        UNION ALL SELECT 5, N'Contacto', N'Email', p.Email FROM dbo.PedidosProposta p WHERE p.Id = @Id
        UNION ALL SELECT 6, N'Contacto', N'Telefone', p.Telefone FROM dbo.PedidosProposta p WHERE p.Id = @Id
        UNION ALL SELECT 7, N'Contacto', N'Nome do negócio', p.Empresa FROM dbo.PedidosProposta p WHERE p.Id = @Id
        UNION ALL SELECT 8, N'Contacto', N'Mensagem', p.Mensagem FROM dbo.PedidosProposta p WHERE p.Id = @Id
        UNION ALL
        SELECT r.Ordem, r.Grupo, r.Pergunta, r.Resposta
          FROM dbo.PedidosProposta p
          CROSS APPLY dbo.fn_Respostas(p.RespostasJson, 'proposta') AS r
         WHERE p.Id = @Id
        UNION ALL SELECT 900, N'Estimativa', N'Total', dbo.fn_Euros(p.EstimativaMin, p.EstimativaMax)
          FROM dbo.PedidosProposta p WHERE p.Id = @Id
        UNION ALL
        SELECT 901, N'Estimativa', N'Mensal',
               dbo.fn_Euros(p.EstimativaMensal, TRY_CAST(JSON_VALUE(p.EstimativaJson, '$.monthlyMax') AS DECIMAL(10,2))) + N'/mês'
          FROM dbo.PedidosProposta p WHERE p.Id = @Id AND p.EstimativaMensal IS NOT NULL
        UNION ALL
        SELECT 902, N'Estimativa', N'Prazo',
               CASE JSON_VALUE(p.EstimativaJson, '$.timeline.kind')
                    WHEN 'days' THEN JSON_VALUE(p.EstimativaJson, '$.timeline.min') + N'–'
                                   + JSON_VALUE(p.EstimativaJson, '$.timeline.max') + N' dias úteis'
                    ELSE N'A combinar' END
          FROM dbo.PedidosProposta p WHERE p.Id = @Id AND p.EstimativaJson IS NOT NULL
    ) AS x
    WHERE x.Resposta IS NOT NULL AND x.Resposta <> N''
    ORDER BY x.Ordem;
END
GO

CREATE OR ALTER PROCEDURE dbo.FichaParceria
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM dbo.PedidosParceria WHERE Id = @Id)
    BEGIN
        SELECT N'Não há nenhum pedido de parceria com o Id ' + CAST(@Id AS NVARCHAR(12)) + N'.' AS Aviso;
        RETURN;
    END

    SELECT x.Grupo, x.Pergunta, x.Resposta
    FROM (
        SELECT 1 AS Ordem, N'Pedido' AS Grupo, N'Recebido' AS Pergunta, dbo.fn_HoraLisboa(p.CriadoEm) AS Resposta
          FROM dbo.PedidosParceria p WHERE p.Id = @Id
        UNION ALL SELECT 2, N'Pedido', N'Estado', p.Estado FROM dbo.PedidosParceria p WHERE p.Id = @Id
        UNION ALL SELECT 3, N'Pedido', N'Responder em', CASE p.Idioma WHEN 'pt' THEN N'Português' ELSE N'Inglês' END
          FROM dbo.PedidosParceria p WHERE p.Id = @Id
        UNION ALL SELECT 4, N'Contacto', N'Nome', p.Nome FROM dbo.PedidosParceria p WHERE p.Id = @Id
        UNION ALL SELECT 5, N'Contacto', N'Email', p.Email FROM dbo.PedidosParceria p WHERE p.Id = @Id
        UNION ALL SELECT 6, N'Contacto', N'Telefone', p.Telefone FROM dbo.PedidosParceria p WHERE p.Id = @Id
        UNION ALL SELECT 7, N'Contacto', N'Empresa', p.Empresa FROM dbo.PedidosParceria p WHERE p.Id = @Id
        UNION ALL SELECT 8, N'Contacto', N'Notas adicionais', p.Mensagem FROM dbo.PedidosParceria p WHERE p.Id = @Id
        UNION ALL
        SELECT r.Ordem, r.Grupo, r.Pergunta, r.Resposta
          FROM dbo.PedidosParceria p
          CROSS APPLY dbo.fn_Respostas(p.RespostasJson, 'parceria') AS r
         WHERE p.Id = @Id
    ) AS x
    WHERE x.Resposta IS NOT NULL AND x.Resposta <> N''
    ORDER BY x.Ordem;
END
GO


/* ---------------------------------------------------------------------
   6. Utilizador do site (correr só uma vez, à parte, na base de dados Nevima)
   Só consegue executar o procedimento: não lê, não altera, não apaga.
   A palavra-passe vai só para a Vercel (MSSQL_PASSWORD), nunca para o código.
   --------------------------------------------------------------------- */
-- CREATE USER nevima_site WITH PASSWORD = N'...';
-- Para trocar a palavra-passe:  ALTER USER nevima_site WITH PASSWORD = N'...';

-- As permissões: dadas sempre que o script corre, se o utilizador já existir.
IF DATABASE_PRINCIPAL_ID(N'nevima_site') IS NOT NULL
BEGIN
    GRANT EXECUTE ON OBJECT::dbo.usp_InserirPedidoProposta TO nevima_site;
    GRANT EXECUTE ON OBJECT::dbo.usp_InserirPedidoParceria TO nevima_site;
END
GO


/* ---------------------------------------------------------------------
   7. Teste (seleciona e corre só este bloco)
   --------------------------------------------------------------------- */
/*
DECLARE @Id INT;
EXEC dbo.usp_InserirPedidoProposta
    @Respostas  = N'{"services":["web","seo"],"audience":"business","sector":"clinic","country":"pt",
                     "web":{"design":"custom","pages":"4-6","languages":["pt","en"],"features":["forms","booking"],
                            "formKind":"simple","forms":"1","texts":"client","references":["https://exemplo.pt"],
                            "domain":"yes","urgent":"no"},
                     "search":{"reach":"local","seoPlan":"monthly"}}',
    @Contacto   = N'{"name":"Teste","email":"teste@exemplo.pt","phone":"+351 912 345 678",
                     "company":"Clínica Exemplo","message":"Pedido de teste."}',
    @Idioma     = 'pt',
    @Origem     = 'overlay',
    @TempoMs    = 95000,
    @Estimativa = N'{"total":{"min":1200,"max":1500},"monthly":90}',
    @NovoId     = @Id OUTPUT;

SELECT * FROM dbo.vw_PedidosResumo WHERE Id = @Id;
-- Para apagar o teste:  DELETE FROM dbo.PedidosProposta WHERE Id = @Id;
*/
