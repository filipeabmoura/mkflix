import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import type {
  IBuscaFilmesQuery,
  IBuscaFilmesResposta,
  IFilme,
  ISincronizarFilmeBody
} from "@mk/model";
import { MkValidationPipe } from "../../core/validation/validation.pipe";
import { FilmeService } from "./filme.service";
import {
  BuscaFilmesQueryValidator,
  SincronizarFilmeBodyValidator
} from "./filme.validators";

@Controller("filmes")
export class FilmeController {
  constructor(private readonly filmeService: FilmeService) {}

  /**
   * Uma chamada à OMDb por request; `page` é a página OMDb (1-based).
   */
  @Get("buscar")
  async buscar(
    @Query(new MkValidationPipe(new BuscaFilmesQueryValidator()))
    query: IBuscaFilmesQuery
  ): Promise<IBuscaFilmesResposta> {
    return this.filmeService.buscar(query);
  }

  /**
   * Valida o filme na OMDb e faz upsert local (uso antes de favoritar/assistir).
   */
  @Post("sincronizar")
  async sincronizar(
    @Body(new MkValidationPipe(new SincronizarFilmeBodyValidator()))
    body: ISincronizarFilmeBody
  ): Promise<IFilme> {
    return this.filmeService.sincronizarPorImdbId(body.imdbId);
  }
}
