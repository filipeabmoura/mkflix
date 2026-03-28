import type { Filme } from "@mk/database";
import type { IFilme } from "@mk/model";

export function filmeParaResposta(filme: Filme): IFilme {
  return {
    id: filme.id,
    imdbId: filme.imdbId,
    titulo: filme.titulo,
    ano: filme.ano,
    posterUrl: filme.posterUrl ?? null,
    createdAt: filme.createdAt.toISOString(),
    updatedAt: filme.updatedAt.toISOString()
  };
}
