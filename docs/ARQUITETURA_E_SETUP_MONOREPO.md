# Arquitetura e Setup Monorepo (Referencia Microkids)

## 1) Objetivo
Este documento define como iniciar, organizar e evoluir o projeto do teste tecnico (OMDb) no mesmo estilo estrutural usado no projeto Microkids:
- Monorepo com `pnpm` + `turborepo`
- Backend NestJS + TypeScript
- Frontend Angular
- PostgreSQL + Prisma
- Contratos compartilhados em package proprio
- Arquitetura Transaction Script (`Controller -> Validation -> Service -> DAO`)

## 2) Stack e decisoes iniciais
### Backend
- Node.js + TypeScript
- NestJS
- JWT para autenticacao
- Prisma ORM

### Frontend
- Angular
- DevExtreme (opcional para aderencia ao teste)

### Dados
- PostgreSQL
- Prisma Migrations

### Monorepo
- `pnpm` workspaces
- `turbo` para orquestracao de build/dev/lint

### Validacao e erros
- Zod na camada de validacao
- Erros de API padronizados por enum (`EApiCodes`)

## 3) Estrutura de pastas
```txt
seu-projeto/
├── apps/
│   ├── api/
│   └── app/
├── packages/
│   ├── database/
│   ├── model/
│   └── utils/
├── docs/
│   └── ARQUITETURA_E_SETUP_MONOREPO.md
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.json
└── README.md
```

## 4) Bootstrap do monorepo
1. Instalar pre-requisitos: Node LTS, `pnpm`, PostgreSQL.
2. Configurar raiz com `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.json`.
3. Criar `apps/api` e `apps/app`.
4. Criar `packages/model`, `packages/database`, `packages/utils`.
5. Instalar dependencias com `pnpm install`.

## 5) Arquivos base da raiz
### `pnpm-workspace.yaml`
```yaml
packages:
  - apps/*
  - packages/*
```

### `package.json`
Scripts padrao:
- `dev`: `turbo dev --parallel`
- `build`: `turbo build --parallel`
- `lint`: `turbo lint --parallel`
- `format`: `turbo format --parallel`
- `test`: `turbo test --parallel`

### `turbo.json`
- `dev` persistente, sem cache.
- `build` com `dependsOn` em `^build`.
- pipelines para `lint`, `format`, `test`.

## 6) Organizacao dos workspaces
### `apps/api` (NestJS)
Padrao por modulo:
- `*.controller.ts`
- `*.service.ts`
- `*.dao.ts`
- `*.validators.ts`
- `*.module.ts`

Estrutura recomendada:
```txt
apps/api/src/
├── main.ts
├── app.module.ts
├── core/
└── modulos/
```

### `apps/app` (Angular)
Estrutura recomendada:
```txt
apps/app/src/app/
├── core/
├── pages/
├── shared/
├── services/
```

Padroes:
- URL via `ConfiguracoesService.endpointBuilder(...)` (ou helper equivalente).
- Interceptor para token/refresh.
- Tratamento centralizado de erros.

### `packages/model`
Pacote de contratos compartilhados:
- Interfaces (`I...`)
- Enums (`E...`)
- Types (`T...`)

### `packages/database`
- `prisma/schema.prisma`
- `prisma/migrations/*`
- `src/index.ts` com export do Prisma Client

### `packages/utils`
Helpers puros e reutilizaveis (sem acoplamento de framework).

## 7) Arquitetura backend (Transaction Script)
Fluxo por endpoint:
1. Controller recebe request, aplica decorators e validacao.
2. Validation com Zod (`MkValidationPipe` + validators de modulo).
3. Service aplica regra de negocio.
4. DAO executa persistencia com Prisma.
5. Filter padroniza retorno de erro.

Regra chave:
- Modulos externos nao usam `DAO` de outro modulo.
- Integracao entre modulos ocorre apenas via `Service` exportado.

## 8) Autenticacao e autorizacao
- Cadastro e login com JWT.
- Refresh token recomendado.
- Guard global de autenticacao.
- Guard de permissao por tipo de usuario.
- Decorators: `@Public()`, `@Permissao(...)`, `@User()`.

## 9) Banco de dados (modelo inicial)
Tabelas principais:
- `usuario`
- `filme`
- `favorito`
- `assistido`

Constraints:
- `favorito`: `UNIQUE (usuario_id, filme_id)`
- `assistido`: `UNIQUE (usuario_id, filme_id)`
- `filme.imdb_id`: unico

Regra de negocio:
- Filme so persiste localmente apos validacao na OMDb.

## 10) Integracao OMDb
Criar `OmdbService` dedicado:
- timeout + retry controlado
- tratamento de cenarios:
  - filme nao encontrado
  - falha de rede/timeout
  - resposta invalida

Mapeamento de erros para `EApiCodes`:
- `Filme_Nao_Encontrado_OMDB`
- `Falha_Integracao_OMDB`

## 11) Padrao de validacao e erros
- Validacao por Zod em `*.validators.ts`.
- Excecao padrao com `message`, `status`, `mkCode`, `type`.
- Response de erro consistente para traduzir no frontend.

## 12) Scripts por workspace (minimo)
### Root
- `dev`, `build`, `lint`, `format`, `test`

### `apps/api`
- `dev`: `nest start --watch`
- `build`: `nest build`
- `lint`: `eslint ./src`
- `format`: `prettier ./src --write`
- `test`: `jest`

### `apps/app`
- `dev`: `ng serve`
- `build`: `ng build`
- `lint`: `eslint ./src`
- `format`: `prettier ./src --write`
- `test`: `ng test`

### `packages/database`
- `build`: `prisma generate && tsc`
- `migrate-dev`: `prisma migrate dev`
- `deploy-db`: `prisma migrate deploy`
- `seed`: `prisma db seed`

### `packages/model` e `packages/utils`
- `build`, `lint`, `format`

## 13) Ambiente e configuracao
- `apps/api/.env` com:
  - `PORT`
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `OMDB_API_KEY`
- Angular com `apps/app/src/environments/*`

Boas praticas:
- manter `.env.example` atualizado
- nunca versionar `.env` real

## 14) GitFlow e commits
Branches:
- `main`
- `develop`
- `feature/*`
- `fix/*`

Convencao de commits:
- `feat:`
- `fix:`
- `refactor:`
- `chore:`
- `docs:`
- `test:`

## 15) Pipeline e qualidade
Antes de merge:
- `pnpm lint`
- `pnpm format` (ou check)
- `pnpm test`

CI recomendada:
1. `pnpm install`
2. build de todos workspaces
3. lint + testes
4. validacao de migrations (quando aplicavel)

## 16) Roadmap de implementacao
1. Bootstrap monorepo (`pnpm` + `turbo`)
2. Criar `packages/model` e `packages/database`
3. Subir PostgreSQL e Prisma inicial
4. Criar auth (cadastro/login/JWT)
5. Criar integracao OMDb
6. Criar favoritos/assistidos com constraints unicas
7. Criar endpoints admin
8. Integrar frontend Angular
9. Ajustar validacao/erros
10. Fechar README final

## 17) Checklist final de entrega
- Monorepo funcional com `pnpm dev`
- API com JWT + autorizacao por tipo
- Validacoes com Zod aplicadas
- Erros padronizados por `EApiCodes`
- Regras de nao duplicidade no banco e servico
- Integracao OMDb resiliente
- Endpoints admin protegidos
- Frontend consumindo API com interceptor
- README com decisoes tecnicas e execucao

## 18) Decisoes arquiteturais para justificar
- Por que monorepo (`apps` + `packages`)?
- Por que contratos em `packages/model`?
- Por que Transaction Script?
- Por que refresh token?
- Por que persistir filme local apos validacao OMDb?
- Como constraints unicas garantem regras?
- Como `EApiCodes` melhora UX/manutencao?
