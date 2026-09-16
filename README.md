# NEVIMA-Website

Site da Nevima, feito com Next.js 15, React 19, Tailwind CSS 4 e TypeScript.

## Requisitos

- **Node.js 20 ou mais recente** (o Next.js 15 exige pelo menos 18.18; o projeto foi desenvolvido com Node 24)
- npm (vem com o Node)

## Correr em localhost

```bash
git clone https://github.com/apoli29/NEVIMA-Website.git
cd NEVIMA-Website
npm ci
npm run dev
```

Depois abre <http://localhost:3000>. Se a porta 3000 estiver ocupada, o Next.js usa a seguinte livre (3001, …) e mostra-a no terminal.

`npm ci` instala exatamente as versões do `package-lock.json`. Para atualizar um projeto já clonado: `git pull` e depois `npm ci`.

## Outros comandos

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento em localhost:3000 |
| `npm run build` | Build de produção |
| `npm run start` | Serve o build de produção (correr `npm run build` antes) |

## Variáveis de ambiente

Nenhuma de momento. Se forem precisas no futuro, os nomes ficam num `.env.example` e os valores reais num `.env.local`, que não vai para o Git.
