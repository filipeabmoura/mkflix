import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import type { IUsuarioDetalheAdmin, IUsuarioFilmeMarcacao } from "@mk/model";
import { mensagemErroHttp } from "../../../../core/api-error";
import { AdminService } from "../../../../core/services/admin.service";

@Component({
  selector: "app-detalhe-usuario",
  templateUrl: "./detalhe-usuario.component.html",
  styleUrls: ["./detalhe-usuario.component.css"]
})
export class DetalheUsuarioComponent implements OnInit {
  detalhe: IUsuarioDetalheAdmin | null = null;
  erro: string | null = null;
  carregando = true;

  assistidos: IUsuarioFilmeMarcacao[] = [];
  favoritos: IUsuarioFilmeMarcacao[] = [];

  constructor(
    private readonly adminSvc: AdminService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get("id"));
    if (Number.isNaN(id) || id <= 0) {
      void this.router.navigate(["/admin/usuarios"]);
      return;
    }

    this.adminSvc.detalheUsuario(id).subscribe({
      next: (dados) => {
        this.detalhe = dados;
        this.assistidos = dados.assistidos;
        this.favoritos = dados.favoritos;
        this.carregando = false;
      },
      error: (e: HttpErrorResponse) => {
        this.erro = mensagemErroHttp(e);
        this.carregando = false;
      }
    });
  }

  voltar(): void {
    void this.router.navigate(["/admin/usuarios"]);
  }
}
