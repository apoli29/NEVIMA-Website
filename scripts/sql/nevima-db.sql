/* =====================================================================
   NEVIMA — Base de dados dos pedidos de proposta (Azure SQL Database)
   ---------------------------------------------------------------------
   Corre-se ligado à base de dados "Nevima" (não à "master"), por inteiro.
   Pode correr-se as vezes que for preciso: cria o que falta, acrescenta
   colunas novas e atualiza o procedimento e a vista, sem apagar dados.

   Quem escreve aqui: a rota /api/proposal (src/lib/proposal/sql.ts),
   com o utilizador nevima_site, que só pode executar
   dbo.usp_InserirPedidoProposta. As respostas chegam como o site as
   guarda (src/lib/proposal/questions.ts, tipo Answers): agrupadas em
   "web", "photo" e "search".

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
        Publico               VARCHAR(20)    NULL,              -- audience: business | personal
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
        CONSTRAINT CK_PedidosProposta_Publico CHECK (Publico IS NULL OR Publico IN ('business', 'personal')),
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
    @NovoId      INT           OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;   -- qualquer erro desfaz a transação inteira

    IF ISJSON(@Respostas) <> 1 OR ISJSON(@Contacto) <> 1
        THROW 50001, N'As respostas ou o contacto não são JSON válido.', 1;
    IF @Estimativa IS NOT NULL AND ISJSON(@Estimativa) <> 1
        SET @Estimativa = NULL;

    BEGIN TRANSACTION;

    INSERT INTO dbo.PedidosProposta (
        Idioma, Origem, TempoPreenchimentoMs,
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
        @Idioma, @Origem, @TempoMs,
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
   6. Utilizador do site (correr só uma vez, à parte, na base de dados Nevima)
   Só consegue executar o procedimento: não lê, não altera, não apaga.
   A palavra-passe vai só para a Vercel (MSSQL_PASSWORD), nunca para o código.
   --------------------------------------------------------------------- */
-- CREATE USER nevima_site WITH PASSWORD = N'...';
-- GRANT EXECUTE ON OBJECT::dbo.usp_InserirPedidoProposta TO nevima_site;
-- Para trocar a palavra-passe:  ALTER USER nevima_site WITH PASSWORD = N'...';
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
