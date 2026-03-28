import { Controller, Get, Query } from "@nestjs/common";
import type { IFilmeEstadoItem, IFilmesEstadoQuery, IUsuarioAutenticado } from "@mk/model";
import { User } from "../../core/decorators/user.decorator";
import { MkValidationPipe } from "../../core/validation/validation.pipe";
import { FilmesEstadoQueryValidator } from "./listas-filme.validators";
import { ListasFilmeService } from "./listas-filme.service";

@Controller("usuarios")
export class UsuarioListasController {
  constructor(private readonly listasFilmeService: ListasFilmeService) {}

  @Get("me/filmes-estado")
  async filmesEstado(
    @User() usuario: IUsuarioAutenticado,
    @Query(new MkValidationPipe(new FilmesEstadoQueryValidator()))
    query: IFilmesEstadoQuery
  ): Promise<IFilmeEstadoItem[]> {
    return this.listasFilmeService.estadoFilmesPorImdbIds(usuario.id, query.imdbIds);
  }
}
