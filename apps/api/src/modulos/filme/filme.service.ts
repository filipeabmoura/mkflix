import { Injectable } from "@nestjs/common";
import type {
  IBuscaFilmesQuery,
  IBuscaFilmesResposta,
  IFilme
} from "@mk/model";
import { FilmeDAO } from "./filme.dao";
import { filmeParaResposta } from "./filme.utils";
import { OmdbService } from "./omdb.service";

@Injectable()
export class FilmeService {
  constructor(
    private readonly omdbService: OmdbService,
    private readonly filmeDAO: FilmeDAO
  ) {}

  async buscar(query: IBuscaFilmesQuery): Promise<IBuscaFilmesResposta> {
    const { totalResultados, itens } = await this.omdbService.buscarPorTitulo(
      query.q,
      query.page
    );
    return {
      pagina: query.page,
      totalResultados,
      itens
    };
  }

  /**
   * Garante que o filme existe no banco após validação na OMDb (upsert por imdbId).
   */
  async sincronizarPorImdbId(imdbId: string): Promise<IFilme> {
    const detalhe = await this.omdbService.buscarDetalhePorImdbId(imdbId);
    const salvo = await this.filmeDAO.upsertPorImdbId({
      imdbId: detalhe.imdbId,
      titulo: detalhe.titulo,
      ano: detalhe.ano,
      posterUrl: detalhe.posterUrl
    });
    return filmeParaResposta(salvo);
  }
}
