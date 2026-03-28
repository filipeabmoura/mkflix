import type { Assistido, Favorito } from "@mk/database";
import type { IAssistido, IFavorito } from "@mk/model";

export function favoritoParaResposta(row: Favorito): IFavorito {
  return {
    id: row.id,
    usuarioId: row.usuarioId,
    filmeId: row.filmeId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  };
}

export function assistidoParaResposta(row: Assistido): IAssistido {
  return {
    id: row.id,
    usuarioId: row.usuarioId,
    filmeId: row.filmeId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  };
}

/** Remove duplicatas preservando a primeira ocorrência (imdbId em minúsculas). */
export function dedupeImdbIdsPreservandoOrdem(imdbIds: string[]): string[] {
  const visto = new Set<string>();
  const resultado: string[] = [];
  for (const bruto of imdbIds) {
    const id = bruto.toLowerCase();
    if (visto.has(id)) {
      continue;
    }
    visto.add(id);
    resultado.push(id);
  }
  return resultado;
}
