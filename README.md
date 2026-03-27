# Teste OMDb - Scaffold Monorepo (Microkids Style)

Base inicial para o teste tecnico com arquitetura e convencoes alinhadas ao padrao Microkids.

## Stack
- Monorepo: `pnpm` + `turbo`
- Backend: NestJS + TypeScript
- Frontend: Angular
- Banco: PostgreSQL + Prisma
- Compartilhado: `packages/model`, `packages/utils`

## Estrutura
```txt
apps/
  api/  # NestJS
  app/  # Angular

packages/
  database/ # Prisma schema/client
  model/    # contratos compartilhados
  utils/    # helpers compartilhados
```

## Requisitos
- Node.js LTS
- pnpm
- PostgreSQL

## Setup rapido
1. Instale dependencias:
   ```bash
   pnpm install
   ```
2. Copie e ajuste variaveis da API:
   - `apps/api/.env.example` -> `apps/api/.env`
3. Gere o Prisma Client:
   ```bash
   pnpm --filter @mk/database build
   ```
4. Suba o monorepo em desenvolvimento:
   ```bash
   pnpm dev
   ```

## Scripts principais (raiz)
- `pnpm dev`
- `pnpm build`
- `pnpm lint`
- `pnpm format`
- `pnpm test`

## Scripts por workspace
### API (`@mk/api`)
- `pnpm --filter @mk/api dev`
- `pnpm --filter @mk/api build`

### Frontend (`@mk/app`)
- `pnpm --filter @mk/app dev`
- `pnpm --filter @mk/app build`

### Database (`@mk/database`)
- `pnpm --filter @mk/database migrate-dev`
- `pnpm --filter @mk/database deploy-db`
- `pnpm --filter @mk/database seed`

## Convencoes arquiteturais
- Backend em Transaction Script: `Controller -> Validation -> Service -> DAO`.
- Integracao externa OMDb via service dedicado.
- Erros padronizados por codigos (`EApiCodes`) em `packages/model`.
- Modulos acessam outros modulos via `Service`, nunca DAO direto.

## Proximos passos
1. Implementar modulos backend (`auth`, `filme`, `favorito`, `assistido`, `admin`).
2. Adicionar validadores Zod e filtro global de erros.
3. Integrar frontend com interceptor JWT/refresh.
4. Adicionar testes de unidade e e2e por fluxo critico.

Para detalhes completos de arquitetura e roadmap, consulte `docs/ARQUITETURA_E_SETUP_MONOREPO.md`.
