import { Body, Controller, Delete, Param, ParseIntPipe, Post } from "@nestjs/common";
import type {
  IFavorito,
  ISincronizarFilmeBody,
  IUsuarioAutenticado
} from "@mk/model";
import { User } from "../../core/decorators/user.decorator";
import { MkValidationPipe } from "../../core/validation/validation.pipe";
import { CorpoImdbIdValidator } from "./listas-filme.validators";
import { ListasFilmeService } from "./listas-filme.service";

@Controller("favoritos")
export class FavoritoController {
  constructor(private readonly listasFilmeService: ListasFilmeService) {}

  @Post()
  async criar(
    @User() usuario: IUsuarioAutenticado,
    @Body(new MkValidationPipe(new CorpoImdbIdValidator())) corpo: ISincronizarFilmeBody
  ): Promise<IFavorito> {
    return this.listasFilmeService.adicionarFavorito(usuario.id, corpo);
  }

  @Delete(":filmeId")
  async remover(
    @User() usuario: IUsuarioAutenticado,
    @Param("filmeId", ParseIntPipe) filmeId: number
  ): Promise<void> {
    await this.listasFilmeService.removerFavorito(usuario.id, filmeId);
  }
}
