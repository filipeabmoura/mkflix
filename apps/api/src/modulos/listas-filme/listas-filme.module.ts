import { Module } from "@nestjs/common";
import { ClientModule } from "../../core/client/client.module";
import { FilmeModule } from "../filme/filme.module";
import { AssistidoController } from "./assistido.controller";
import { AssistidoDAO } from "./assistido.dao";
import { FavoritoController } from "./favorito.controller";
import { FavoritoDAO } from "./favorito.dao";
import { ListasFilmeService } from "./listas-filme.service";
import { UsuarioListasController } from "./usuario-listas.controller";

@Module({
  imports: [ClientModule, FilmeModule],
  controllers: [
    FavoritoController,
    AssistidoController,
    UsuarioListasController
  ],
  providers: [ListasFilmeService, FavoritoDAO, AssistidoDAO]
})
export class ListasFilmeModule {}
