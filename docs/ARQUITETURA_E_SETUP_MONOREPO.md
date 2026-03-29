# Arquitetura e Setup — MkFlix (Microkids)

## 1. Objetivo

Documentar a arquitetura, organização e decisões técnicas do projeto MkFlix, desenvolvido como teste técnico para a vaga de Desenvolvedor Fullstack na Microkids.

A aplicação consome a API externa OMDb e permite que usuários gerenciem filmes favoritos e assistidos, com autenticação JWT e controle de acesso por tipo de usuário (ADMIN / COMUM).

---

## 2. Stack


| Camada         | Tecnologia                                  |
| -------------- | ------------------------------------------- |
| Monorepo       | `pnpm` workspaces + `turborepo`             |
| Backend        | NestJS + TypeScript                         |
| Frontend       | Angular 18 + DevExtreme 24                  |
| Banco de dados | PostgreSQL (via Docker) + Prisma ORM        |
| Autenticação   | JWT (access token)                          |
| Validação      | Zod                                         |
| API externa    | OMDb API                                    |
| Contratos      | `packages/model` (interfaces, enums, tipos) |


---

## 3. Estrutura de pastas

```
mkflix/
├── apps/
│   ├── api/                  # Backend NestJS
│   │   └── src/
│   │       ├── core/         # Guards, pipes, filtros, interceptors globais
│   │       └── modulos/      # Módulos de domínio (auth, filme, listas, admin)
│   └── app/                  # Frontend Angular
│       └── src/app/
│           ├── core/         # Guards, serviços, interceptors
│           ├── layout/       # Shell (header + sidebar)
│           ├── pages/        # Páginas por rota
│           └── shared/       # Componentes e modelos reutilizáveis
├── packages/
│   ├── database-mkflix/      # Prisma schema, migrations, seed, client, docker-compose
│   ├── model/                # Contratos compartilhados (I..., E..., T...)
│   └── utils/                # Helpers puros sem acoplamento de framework
├── docs/
│   └── ARQUITETURA_E_SETUP_MONOREPO.md
|   └── REQUISITOS_DO_PROJETO.md
├── README.md
```

---

## 4. Arquitetura backend — Transaction Script

Cada endpoint segue o fluxo:

```
Request → Controller → Pipe (Zod) → Service → DAO (Prisma) → Response
```

- **Controller**: recebe e mapeia a request; aplica decorators de autenticação/permissão.
- **Validators** (`*.validators.ts`): schemas Zod por operação; validados via `MkValidationPipe`.
- **Service**: aplica a regra de negócio; única camada que toma decisões de domínio.
- **DAO** (`*.dao.ts`): executa queries via Prisma; sem lógica de negócio.
- **Filter global**: captura `MkException` e erros Prisma; retorna resposta padronizada com `mkCode`.

**Regra de isolamento:** módulos não acessam o DAO de outros módulos — a comunicação entre módulos é feita apenas via `Service` exportado.

---

## 5. Módulos backend

### `auth`

- `POST /auth/cadastro` — cadastro de usuário COMUM (Zod, bcrypt, e-mail único).
- `POST /auth/login` — login com retorno de JWT.
- Guard global de autenticação (`JwtAuthGuard`).
- Decorator `@Public()` para rotas abertas; `@Permissao(ETipoUsuario.admin)` para admin.

### `filme`

- `GET /filmes/buscar?q=&page=` — proxy paginado da OMDb (1 chamada por request).
- `OmdbService`: timeout, tratamento de falhas, mapeamento para `EApiCodes`.
- Upsert de `Filme` por `imdbId` ao persistir favorito/assistido (validação prévia na OMDb).

### `listas-filme`

- `POST /assistidos` / `DELETE /assistidos/:filmeId` — marcar/remover assistido.
- `POST /favoritos` / `DELETE /favoritos/:filmeId` — favoritar/desfavoritar.
- `GET /usuarios/me/filmes-estado?imdbIds=...` — estado em lote (assistido + favorito) para sincronizar grids.
- Regras de negócio: não duplicar por usuário (constraint única); favoritar exige assistido (409 `Favorito_Sem_Assistido`); remover assistido remove favorito em cascata.

### `admin`

- `GET /admin/rankings/assistidos?page=&pageSize=` — ranking por contagem, paginado.
- `GET /admin/rankings/favoritos?page=&pageSize=` — idem para favoritos.
- `GET /admin/usuarios?page=&pageSize=` — listagem paginada de usuários.
- `GET /admin/usuarios/:id` — detalhe: dados + assistidos + favoritos do usuário.
- `POST /admin/usuarios` — cadastro de novo usuário ADMIN (protegido por `@Permissao`).

---

## 6. Modelo de dados (Prisma)

```prisma
model Usuario {
  id        Int       @id @default(autoincrement())
  nome      String
  email     String    @unique
  senha     String
  tipo      String    @default("comum")   // "comum" | "admin"
  assistidos Assistido[]
  favoritos  Favorito[]
}

model Filme {
  id        Int       @id @default(autoincrement())
  imdbId    String    @unique
  titulo    String
  ano       String
  posterUrl String?
  assistidos Assistido[]
  favoritos  Favorito[]
}

model Assistido {
  id        Int      @id @default(autoincrement())
  usuarioId Int
  filmeId   Int
  marcadoEm DateTime @default(now())
  usuario   Usuario  @relation(...)
  filme     Filme    @relation(...)
  @@unique([usuarioId, filmeId])
}

model Favorito {
  id        Int      @id @default(autoincrement())
  usuarioId Int
  filmeId   Int
  marcadoEm DateTime @default(now())
  usuario   Usuario  @relation(...)
  filme     Filme    @relation(...)
  @@unique([usuarioId, filmeId])
}
```

As constraints `@@unique([usuarioId, filmeId])` são a garantia de banco contra duplicatas, reforçadas também na camada de serviço.

---

## 7. Padronização de erros

Todos os erros retornam o envelope:

```json
{
  "statusCode": 409,
  "message": "Descrição legível",
  "mkCode": "Favorito_Sem_Assistido",
  "type": "MkException"
}
```

O `mkCode` (enum `EApiCodes` em `packages/model`) permite ao frontend tomar decisões semânticas sem depender de mensagens de texto, como exibir o fluxo de "marcar assistido + favoritar em um passo".

---

## 8. Arquitetura frontend — Angular

### Organização

```
core/
  guards/       # AuthGuard, GuestGuard, AdminGuard
  services/     # AuthService, FilmeCatalogoService, AdminService, ConfiguracoesService
  interceptors/ # JWT interceptor

layout/
  main-shell/   # Header (logo + hamburger + usuário) + Sidebar (navegação)

pages/
  login/
  cadastro/
  home/         # Busca OMDb + grid com paginação remota
  assistidos/
  favoritos/
  admin/
    rankings/
    usuarios/
    cadastrar-admin/

shared/
  components/   # mk-button, mk-alert, mk-page-title
  models/       # interfaces de grid (ILinhaFilmeGrid, etc.)
```

### Autenticação

- `AuthService` armazena o token JWT em `localStorage`.
- `JwtInterceptor` injeta o header `Authorization: Bearer ...` em todas as requisições autenticadas.
- `AuthGuard` protege rotas de usuário logado; `GuestGuard` protege rotas de não-logado; `AdminGuard` protege rotas admin.

### Paginação remota OMDb (home)

A OMDb retorna 10 itens por página. O `CustomStore` do DevExtreme envia `skip` e `take`. A lógica calcula quais páginas OMDb cobrem o intervalo:

```typescript
const startOmdbPage = Math.floor(skip / 10) + 1;
const endOmdbPage   = Math.ceil((skip + take) / 10);
```

As páginas são buscadas em paralelo via `Promise.all`, os resultados são concatenados, fatiados e enriquecidos com o estado do banco (assistido/favorito) antes de retornar ao grid. Com `allowedPageSizes: [10, 20, 50]` — todos múltiplos de 10 — o `skip` sempre cai no início de uma página OMDb, garantindo o mínimo de chamadas.

### Componentes DevExtreme utilizados

- `DxDataGridModule` — grids em todas as telas com paginação, ordenação e templates customizados.
- `DxPopupModule` — popups de confirmação de ações.

---

## 9. Contratos compartilhados (`packages/model`)

Interfaces, enums e tipos TypeScript consumidos tanto pelo backend quanto pelo frontend:

- `IUsuario`, `ICadastroUsuario`, `ILoginUsuario`, `IAutenticado`
- `IFilme`, `IOmdbResultadoBusca`, `IOmdbBuscaResposta`
- `IFilmeEstadoItem`, `IUsuarioFilmeMarcacao`, `IRankingFilmeItem`
- `IPaginado<T>` — envelope de paginação genérico
- `EApiCodes` — enum de códigos de erro padronizados
- `IUsuarioDetalheAdmin`, `IUsuarioAdmin`

---

## 10. Seed inicial

O seed em `packages/database-mkflix/prisma/seed.ts` cria um usuário ADMIN padrão:


| Campo  | Valor               |
| ------ | ------------------- |
| Nome   | Administrador       |
| E-mail | `admin@mkflix.com`  |
| Senha  | `admin123` (bcrypt) |
| Tipo   | `admin`             |


---

## 11. Banco de dados — Docker

O PostgreSQL é provisionado via Docker Compose em `packages/database-mkflix/docker-compose.yaml`:

```yaml
services:
  postgres:
    image: postgres:16.9-bullseye
    container_name: mkflix-postgres
    env_file: ./.env
    ports:
      - "5433:5432"   # porta local 5433 → 5432 no container
    volumes:
      - mkflix_postgres_data:/var/lib/postgresql/data
```

O Compose lê as variáveis do arquivo `packages/database-mkflix/.env`:

```env
POSTGRES_USER=mkflix
POSTGRES_PASSWORD=mkflix
POSTGRES_DB=mkflix
DATABASE_URL="postgresql://mkflix:mkflix@localhost:5433/mkflix"
```

Para subir o banco:

```bash
cd packages/database-mkflix
docker compose up -d
```

---

## 12. Variáveis de ambiente

### `packages/database-mkflix/.env`


| Variável            | Descrição                                                                  |
| ------------------- | -------------------------------------------------------------------------- |
| `POSTGRES_USER`     | Usuário do PostgreSQL (usado pelo Docker)                                  |
| `POSTGRES_PASSWORD` | Senha do PostgreSQL (usado pelo Docker)                                    |
| `POSTGRES_DB`       | Nome do banco (usado pelo Docker)                                          |
| `DATABASE_URL`      | URL de conexão Prisma — deve usar os mesmos valores acima e a porta `5433` |


### `apps/api/.env`


| Variável       | Descrição                                                |
| -------------- | -------------------------------------------------------- |
| `PORT`         | Porta da API (padrão: `3000`)                            |
| `DATABASE_URL` | Mesma URL configurada em `packages/database-mkflix/.env` |
| `JWT_SECRET`   | Segredo para assinar tokens JWT                          |
| `OMDB_API_KEY` | Chave da API OMDb (`https://www.omdbapi.com/`)           |


Nenhum dos arquivos `.env` é versionado. Usar os respectivos `.env.example` como referência.

---

## 13. GitFlow

```
main       ← produção / entrega estável
develop    ← integração contínua
feature/*  ← uma feature por branch, sempre a partir de develop
```

Convenção de commits (semântica, em português):

```
feat(escopo): descrição
fix(escopo): descrição
refactor(escopo): descrição
style(escopo): descrição
chore(escopo): descrição
docs(escopo): descrição
```

Escopos utilizados: `api`, `app`, `database`, `model`, `root`.

---

## 14. Decisões arquiteturais


| Decisão                                      | Justificativa                                                                              |
| -------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Monorepo (`apps` + `packages`)               | Compartilhamento de tipos e código sem duplicação; build orquestrado pelo Turborepo        |
| Contratos em `packages/model`                | Único ponto de verdade para interfaces entre backend e frontend                            |
| Transaction Script                           | Simples, rastreável e adequado ao escopo do teste; evita complexidade desnecessária de DDD |
| Persistir filme após validação OMDb          | Garante que nenhum `imdbId` inválido entre no banco; requisito explícito do PDF            |
| Constraints únicas no banco                  | Última linha de defesa contra duplicatas, além da validação no service                     |
| `EApiCodes`                                  | Permite decisões semânticas no frontend sem depender de mensagens de texto                 |
| Paginação remota com cálculo de páginas OMDb | Minimiza chamadas à API externa; pageSize múltiplo de 10 elimina desperdício               |
| DevExtreme `CustomStore`                     | Controle total sobre carregamento remoto, estado e refresh do grid                         |


