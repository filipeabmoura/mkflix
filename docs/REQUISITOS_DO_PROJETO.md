# Avaliação — Requisitos do PDF vs. Projeto Implementado

## Autenticação ✅


| Requisito           | Status                                       |
| ------------------- | -------------------------------------------- |
| Cadastro de usuário | Implementado — `POST /auth/cadastro` com Zod |
| Login               | Implementado — `POST /auth/login` com JWT    |
| Mecanismo JWT       | Implementado — guards, interceptor Angular   |


---

## Usuário COMUM ✅


| Requisito                       | Status                                                   |
| ------------------------------- | -------------------------------------------------------- |
| Buscar filmes por título (OMDb) | Implementado — home com campo de busca + grid DevExtreme |
| Adicionar à lista de favoritos  | Implementado — botão ♥ com confirmação                   |
| Marcar como assistido           | Implementado — botão ✓ com confirmação                   |
| Listar filmes favoritos         | Implementado — página `/favoritos`                       |
| Listar filmes assistidos        | Implementado — página `/assistidos`                      |


---

## Usuário ADMIN ✅


| Requisito                               | Status                                      |
| --------------------------------------- | ------------------------------------------- |
| Listar filmes mais favoritados          | Implementado — `/admin/rankings/favoritos`  |
| Listar filmes mais assistidos           | Implementado — `/admin/rankings/assistidos` |
| Visualizar dados do usuário selecionado | Implementado — `/admin/usuarios/:id`        |
| Lista de favoritos do usuário           | Implementado — no detalhe do usuário        |
| Lista de assistidos do usuário          | Implementado — no detalhe do usuário        |


---

## Regras de negócio ✅


| Regra                                          | Status                                                 |
| ---------------------------------------------- | ------------------------------------------------------ |
| Não duplicar favorito por usuário              | Implementado — constraint + 409                        |
| Não duplicar assistido por usuário             | Implementado — constraint + 409                        |
| Filme deve existir na OMDb antes de persistir  | Implementado — upsert validado via OMDb                |
| Tratar falhas da API externa                   | Implementado — `EApiCodes`, mensagens de erro no front |
| Funcionalidades admin protegidas por permissão | Implementado — `AdminGuard` + `@Permissao` no backend  |


---

## Requisitos Técnicos ✅


| Requisito                  | Status                                                   |
| -------------------------- | -------------------------------------------------------- |
| Frontend Angular           | ✅ Angular 18                                             |
| Backend Node.js TypeScript | ✅ NestJS                                                 |
| Banco PostgreSQL           | ✅                                                        |
| ORM Prisma                 | ✅                                                        |
| Validações Zod             | ✅                                                        |
| DevExtreme nos grids       | ✅                                                        |
| GitFlow                    | ✅ (branch `develop` ativa, monorepo publicado no GitHub) |
| Transaction Script         | ✅ (services por caso de uso)                             |
| Monorepo no GitHub         | ✅ Publicado                                              |


---

## Entrega (README) ✅

README criado com:

- Como rodar o projeto
- Tecnologias utilizadas
- Decisões tomadas
- Melhorias futuras

---

## O que foi feito além do solicitado


| Extra                                    | Descrição                                                                                  |
| ---------------------------------------- | ------------------------------------------------------------------------------------------ |
| **Remover assistido/favorito**           | O PDF só pede "adicionar". O projeto implementa também o toggle de remoção com confirmação |
| **Sincronização de estado no grid OMDb** | Após buscar, os botões refletem o estado real do banco (assistido/favorito já marcados)    |
| **Fluxo "favoritar sem assistir"**       | Popup especial que oferece marcar os dois de uma vez — regra inventada e bem resolvida     |
| **Fluxo "desassistir remove favorito"**  | Coerência de dados com aviso ao usuário                                                    |
| **Paginação remota no grid OMDb**        | Cálculo inteligente das páginas OMDb para minimizar chamadas à API                         |
| **Admin cadastra outro admin**           | PDF não pede; implementado como funcionalidade de gestão                                   |
| **Identidade visual Microkids**          | Paleta, fonte Sora, logo, gradiente, DevExtreme estilizado                                 |
| **Coluna de pôster** nos grids           | Poster exibido em assistidos, favoritos e home                                             |
| **Paginação completa** em todos os grids | Seletor de página, info de total, tamanhos configuráveis                                   |


---

## Resumo

O projeto atende **100% dos requisitos funcionais** do PDF. O monorepo está publicado no GitHub e o README contém instruções de execução, tecnologias utilizadas e decisões de arquitetura tomadas ao longo do desenvolvimento.