import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import type { IUsuarioFilmeMarcacao } from "@mk/model";
import { mensagemErroHttp } from "../../core/api-error";
import { UsuarioFilmesService } from "../../core/services/usuario-filmes.service";
import type { ILinhaFilmeGrid } from "../../shared/models/linha-filme-grid";

@Component({
  selector: "app-favoritos",
  templateUrl: "./favoritos.component.html",
  styleUrls: ["./favoritos.component.css"]
})
export class FavoritosComponent implements OnInit {
  linhas: ILinhaFilmeGrid[] = [];

  erro: string | null = null;

  constructor(private readonly filmes: UsuarioFilmesService) {}

  ngOnInit(): void {
    this.filmes.listarFavoritos().subscribe({
      next: (marcacoes: IUsuarioFilmeMarcacao[]) => {
        this.linhas = marcacoes.map((m) => ({
          titulo: m.filme.titulo,
          ano: m.filme.ano,
          imdbId: m.filme.imdbId,
          marcadoEm: m.marcadoEm
        }));
      },
      error: (e: HttpErrorResponse) => {
        this.erro = mensagemErroHttp(e);
      }
    });
  }
}
