import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post
} from "@nestjs/common";
import type {
  IAssistido,
  IUsuarioAutenticado,
  ISincronizarFilmeBody,
  IUsuarioFilmeMarcacao
} from "@mk/model";
import { User } from "../../core/decorators/user.decorator";
import { MkValidationPipe } from "../../core/validation/validation.pipe";
import { CorpoImdbIdValidator } from "./listas-filme.validators";
import { ListasFilmeService } from "./listas-filme.service";

@Controller("assistidos")
export class AssistidoController {
  constructor(private readonly listasFilmeService: ListasFilmeService) {}

  @Get()
  async listar(
    @User() usuario: IUsuarioAutenticado
  ): Promise<IUsuarioFilmeMarcacao[]> {
    return this.listasFilmeService.listarAssistidosMarcacao(usuario.id);
  }

  @Post()
  async criar(
    @User() usuario: IUsuarioAutenticado,
    @Body(new MkValidationPipe(new CorpoImdbIdValidator())) corpo: ISincronizarFilmeBody
  ): Promise<IAssistido> {
    return this.listasFilmeService.adicionarAssistido(usuario.id, corpo);
  }

  @Delete(":filmeId")
  async remover(
    @User() usuario: IUsuarioAutenticado,
    @Param("filmeId", ParseIntPipe) filmeId: number
  ): Promise<void> {
    await this.listasFilmeService.removerAssistido(usuario.id, filmeId);
  }
}
