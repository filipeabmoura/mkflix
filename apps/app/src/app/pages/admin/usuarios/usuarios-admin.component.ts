import { HttpErrorResponse } from "@angular/common/http";
import { Component } from "@angular/core";
import { Router } from "@angular/router";
import type { IUsuario } from "@mk/model";
import CustomStore from "devextreme/data/custom_store";
import type { LoadOptions } from "devextreme/data/load_options";
import { firstValueFrom } from "rxjs";
import { mensagemErroHttp } from "../../../core/api-error";
import { AdminService } from "../../../core/services/admin.service";

@Component({
  selector: "app-usuarios-admin",
  templateUrl: "./usuarios-admin.component.html",
  styleUrls: ["./usuarios-admin.component.css"]
})
export class UsuariosAdminComponent {
  dataSource: CustomStore;
  erro: string | null = null;

  constructor(
    private readonly adminSvc: AdminService,
    private readonly router: Router
  ) {
    this.dataSource = this.criarStore();
  }

  private criarStore(): CustomStore {
    return new CustomStore({
      key: "id",
      load: (op: LoadOptions) => this.carregar(op)
    });
  }

  private async carregar(
    op: LoadOptions
  ): Promise<{ data: IUsuario[]; totalCount: number }> {
    const take = op.take ?? 20;
    const skip = op.skip ?? 0;
    const page = Math.floor(skip / take) + 1;

    this.erro = null;
    try {
      const resp = await firstValueFrom(
        this.adminSvc.listarUsuarios(page, take)
      );
      return { data: resp.itens, totalCount: resp.totalItens };
    } catch (e: unknown) {
      this.erro =
        e instanceof HttpErrorResponse
          ? mensagemErroHttp(e)
          : "Erro ao carregar usuários.";
      return { data: [], totalCount: 0 };
    }
  }

  verDetalhe(id: number): void {
    void this.router.navigate(["/admin/usuarios", id]);
  }
}
