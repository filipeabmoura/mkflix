# MkFlix — Plataforma de Gestão de Filmes (OMDb)

Teste técnico Microkids — aplicação fullstack para busca, favoritos e assistidos de filmes, consumindo a API externa OMDb.

---

## Tecnologias utilizadas


| Camada                   | Tecnologia                           |
| ------------------------ | ------------------------------------ |
| Monorepo                 | `pnpm` workspaces + `turborepo`      |
| Backend                  | NestJS + TypeScript                  |
| Frontend                 | Angular 18 + DevExtreme 24           |
| Banco de dados           | PostgreSQL (via Docker) + Prisma ORM |
| Autenticação             | JWT (access token)                   |
| Validação                | Zod                                  |
| Contratos compartilhados | `packages/model` (interfaces, enums) |
| API externa              | OMDb API                             |


---

## Estrutura do monorepo

```
apps/
  api/    # NestJS — backend REST
  app/    # Angular — frontend

packages/
  database-mkflix/  # Prisma schema, migrations, seed e client, docker-compose
  model/            # Contratos compartilhados (interfaces, enums, tipos)

docs/
  ARQUITETURA_E_SETUP_MONOREPO.md
  REQUISITOS_DO_PROJETO.md
```

---

## Pré-requisitos

- Node.js LTS
- pnpm (`npm i -g pnpm`)
- Docker em execução

---

## Como rodar o projeto

### 1. Instalar dependências

```bash
pnpm install
```

### 2. Configurar e subir o banco de dados (Docker)

O PostgreSQL roda via Docker Compose. Primeiro configure o `.env` do pacote de banco:

```bash
cp packages/database-mkflix/.env.example packages/database-mkflix/.env
```

Edite `packages/database-mkflix/.env` com os valores desejados:

```env
# não use aspas

POSTGRES_USER=mkflix
POSTGRES_PASSWORD=mkflix
POSTGRES_DB=mkflix
DATABASE_URL=postgresql://mkflix:mkflix@localhost:5433/mkflix
```

> A porta exposta é **5433** (mapeada para 5432 dentro do container).

Suba o container:

```bash
cd packages/database-mkflix
docker compose up -d
```

### 3. Configurar variáveis de ambiente da API

```bash
cp apps/api/.env.example apps/api/.env
```

Edite `apps/api/.env` (use os mesmos dados do banco configurados acima):

```env
#não use aspas

PORT=3000
DATABASE_URL=postgresql://mkflix:mkflix@localhost:5433/mkflix
JWT_SECRET=seu_secret_jwt
OMDB_API_KEY=sua_chave_omdb #solicite sua chave em [https://www.omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx)
```

### 4. Executar migrations e seed

```bash
# Gera o Prisma Client e aplica migrations
pnpm --filter @mk/database migrate-dev

# Cria o usuário ADMIN inicial (admin@mkflix.com / admin123)
pnpm --filter @mk/database seed
```

### 5. Subir em desenvolvimento

```bash
pnpm dev
```

- API disponível em: `http://localhost:3000`
- Frontend disponível em: `http://localhost:4200`

---

## Usuário inicial (seed)


| Campo  | Valor              |
| ------ | ------------------ |
| E-mail | `admin@mkflix.com` |
| Senha  | `admin123`         |
| Tipo   | `admin`            |


---

## Scripts principais


| Comando                                  | Descrição                                 |
| ---------------------------------------- | ----------------------------------------- |
| `pnpm dev`                               | Inicia API e frontend em paralelo (watch) |
| `pnpm build`                             | Build de todos os workspaces              |
| `pnpm lint`                              | Lint de todos os workspaces               |
| `pnpm --filter @mk/database seed`        | Executa o seed do banco                   |
| `pnpm --filter @mk/database migrate-dev` | Cria/aplica migrations                    |
| `pnpm --filter @mk/api build`            | Build apenas da API                       |
| `pnpm --filter @mk/app build`            | Build apenas do frontend                  |


---

## Decisões técnicas

### Arquitetura Transaction Script

O backend segue o padrão `Controller → Validation (Zod) → Service → DAO (Prisma)`. Cada módulo é responsável pelo seu próprio DAO e expõe seus casos de uso via Service. Módulos só se comunicam entre si via Service, nunca via DAO direto.

### Contratos compartilhados (`packages/model`)

Interfaces, enums e tipos TypeScript são definidos em um único pacote e consumidos tanto pelo backend quanto pelo frontend, garantindo consistência nos contratos de API sem duplicação.

### Paginação remota OMDb (home)

A OMDb retorna 10 itens por página. O grid DevExtreme envia `skip` e `take`, e o frontend calcula quais páginas OMDb cobrem o intervalo solicitado, buscando-as em paralelo (`Promise.all`). Isso permite pageSize configurável (10, 20, 50) com o mínimo de chamadas à API.

### Regras de negócio extras (além do PDF)

- **Toggle de remoção**: além de adicionar favorito/assistido, é possível removê-los com confirmação.
- **Fluxo "favoritar sem assistir"**: ao tentar favoritar um filme não assistido, o sistema oferece marcar os dois em um único passo.
- **Fluxo "desassistir remove favorito"**: ao remover assistido, o sistema avisa que o favorito também será removido.
- **Sincronização de estado no grid OMDb**: após cada busca, o sistema consulta o banco para refletir nos botões o estado real (já assistido/favoritado ou não).
- **Admin cadastra outro admin**: endpoint protegido por permissão para criação de novos usuários admin.

### Padronização de erros

Todos os erros da API retornam um `mkCode` (enum `EApiCodes`) além do status HTTP, permitindo ao frontend tomar decisões semânticas sem depender de mensagens de texto.

### GitFlow

O projeto segue GitFlow clássico: `main` para produção, `develop` para integração contínua, `feature/`* para cada entrega. Commits semânticos em português (`feat`, `fix`, `refactor`, `chore`, `style`, `docs`).

---

## Funcionalidades implementadas

### Usuário COMUM

- Cadastro e login com JWT
- Busca de filmes por título via OMDb
- Marcar/desmarcar filme como assistido (com confirmação)
- Favoritar/desfavoritar filme (com confirmação)
- Listagem paginada de assistidos e favoritos
- Botões de ação com estado sincronizado com o banco

### Usuário ADMIN

- Ranking dos filmes mais assistidos (paginado)
- Ranking dos filmes mais favoritados (paginado)
- Listagem paginada de todos os usuários
- Detalhe de usuário: dados + lista de assistidos + lista de favoritos
- Cadastro de novo usuário admin

---

## Melhorias futuras


| Melhoria                        | Descrição                                                                                                                                        |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Lista "Assistir mais tarde"** | Permitir que o usuário salve filmes em uma fila de interesse, sem marcá-los como assistidos ou favoritos                                         |
| **Promoção de usuário a admin** | Admin poder alterar o tipo de um usuário COMUM para ADMIN diretamente pela interface, sem precisar cadastrar uma nova conta                      |
| **Dashboards de rankings**      | Substituir ou complementar as tabelas de ranking por gráficos interativos (barras, pizza) mostrando os filmes mais assistidos e mais favoritados |
| **Avaliação de filmes**         | Usuário poder dar uma nota (1–5 estrelas) a um filme assistido, com média exibida nos rankings                                                   |
| **Busca por filtros avançados** | Filtrar filmes por ano, tipo (filme/série) e gênero diretamente na tela home                                                                     |
| **Perfil do usuário**           | Tela para o próprio usuário visualizar e editar seus dados (nome, senha)                                                                         |
| **Notificações**                | Alertas em tempo real (WebSocket) quando um filme ultrapassa um número de marcações, visível para admins                                         |
| **Cache de buscas OMDb**        | Armazenar resultados de buscas recentes em cache (Redis ou memória com TTL) para reduzir chamadas à API externa                                  |
| **Testes automatizados**        | Cobertura de testes unitários nos services do backend (Jest) e testes e2e nos fluxos críticos (Cypress ou Playwright)                            |


---

Para detalhes de arquitetura, consulte `[docs/ARQUITETURA_E_SETUP_MONOREPO.md](docs/ARQUITETURA_E_SETUP_MONOREPO.md)`.

Para detalhes de adequação aos requisitos, consulte `[docs/REQUISITOS_DO_PROJETO.md](docs/REQUISITOS_DO_PROJETO.md)`.