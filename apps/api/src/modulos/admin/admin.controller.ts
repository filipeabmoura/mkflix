import { Controller, Get, Param, ParseIntPipe, Query } from "@nestjs/common";
import type {
  IPaginacaoAdminQuery,
  IPaginado,
  IRankingFilmeItem,
  IUsuario,
  IUsuarioDetalheAdmin
} from "@mk/model";
import { Permissao } from "../../core/decorators/permissao.decorator";
import { MkValidationPipe } from "../../core/validation/validation.pipe";
import { AdminService } from "./admin.service";
import { PaginacaoAdminValidator } from "./admin.validators";

@Controller("admin")
@Permissao({ tiposUsuario: ["admin"] })
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("rankings/assistidos")
  rankingAssistidos(
    @Query(new MkValidationPipe(new PaginacaoAdminValidator()))
    query: IPaginacaoAdminQuery
  ): Promise<IPaginado<IRankingFilmeItem>> {
    return this.adminService.rankingAssistidos(query);
  }

  @Get("rankings/favoritos")
  rankingFavoritos(
    @Query(new MkValidationPipe(new PaginacaoAdminValidator()))
    query: IPaginacaoAdminQuery
  ): Promise<IPaginado<IRankingFilmeItem>> {
    return this.adminService.rankingFavoritos(query);
  }

  @Get("usuarios")
  listarUsuarios(
    @Query(new MkValidationPipe(new PaginacaoAdminValidator()))
    query: IPaginacaoAdminQuery
  ): Promise<IPaginado<IUsuario>> {
    return this.adminService.listarUsuarios(query);
  }

  @Get("usuarios/:id")
  detalheUsuario(
    @Param("id", ParseIntPipe) id: number
  ): Promise<IUsuarioDetalheAdmin> {
    return this.adminService.detalheUsuario(id);
  }
}
