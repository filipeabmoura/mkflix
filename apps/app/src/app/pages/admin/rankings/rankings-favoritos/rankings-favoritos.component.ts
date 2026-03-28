import { HttpErrorResponse } from "@angular/common/http";
import { Component } from "@angular/core";
import type { IRankingFilmeItem } from "@mk/model";
import CustomStore from "devextreme/data/custom_store";
import type { LoadOptions } from "devextreme/data/load_options";
import { firstValueFrom } from "rxjs";
import { mensagemErroHttp } from "../../../../core/api-error";
import { AdminService } from "../../../../core/services/admin.service";
import type { ILinhaRanking } from "../rankings-assistidos/rankings-assistidos.component";

function mapearLinha(item: IRankingFilmeItem): ILinhaRanking {
  return {
    filmeId: item.filme.id,
    titulo: item.filme.titulo,
    ano: item.filme.ano,
    imdbId: item.filme.imdbId,
    posterUrl: item.filme.posterUrl ?? null,
    quantidade: item.quantidade
  };
}

@Component({
  selector: "app-rankings-favoritos",
  templateUrl: "./rankings-favoritos.component.html",
  styleUrls: ["./rankings-favoritos.component.css"]
})
export class RankingsFavoritosComponent {
  dataSource: CustomStore;
  erro: string | null = null;

  constructor(private readonly adminSvc: AdminService) {
    this.dataSource = this.criarStore();
  }

  private criarStore(): CustomStore {
    return new CustomStore({
      key: "filmeId",
      load: (op: LoadOptions) => this.carregar(op)
    });
  }

  private async carregar(
    op: LoadOptions
  ): Promise<{ data: ILinhaRanking[]; totalCount: number }> {
    const take = op.take ?? 20;
    const skip = op.skip ?? 0;
    const page = Math.floor(skip / take) + 1;

    this.erro = null;
    try {
      const resp = await firstValueFrom(
        this.adminSvc.rankingFavoritos(page, take)
      );
      return {
        data: resp.itens.map(mapearLinha),
        totalCount: resp.totalItens
      };
    } catch (e: unknown) {
      this.erro =
        e instanceof HttpErrorResponse
          ? mensagemErroHttp(e)
          : "Erro ao carregar ranking.";
      return { data: [], totalCount: 0 };
    }
  }
}
