import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit, ViewChild } from "@angular/core";
import type { IUsuarioFilmeMarcacao } from "@mk/model";
import { firstValueFrom } from "rxjs";
import { mensagemErroHttp } from "../../core/api-error";
import { FilmeCatalogoService } from "../../core/services/filme-catalogo.service";
import { UsuarioFilmesService } from "../../core/services/usuario-filmes.service";
import type { ILinhaFilmeGrid } from "../../shared/models/linha-filme-grid";
import { DxDataGridComponent } from "devextreme-angular";

@Component({
  selector: "app-favoritos",
  templateUrl: "./favoritos.component.html",
  styleUrls: ["./favoritos.component.css"]
})
export class FavoritosComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: false })
  grid?: DxDataGridComponent;

  linhas: ILinhaFilmeGrid[] = [];

  erro: string | null = null;

  popupVisivel = false;
  popupTitulo = "";
  popupTexto = "";

  private resolverPopup?: (valor: boolean) => void;

  constructor(
    private readonly filmes: UsuarioFilmesService,
    private readonly catalogo: FilmeCatalogoService
  ) {}

  ngOnInit(): void {
    this.carregar();
  }

  private carregar(): void {
    this.erro = null;
    this.filmes.listarFavoritos().subscribe({
      next: (marcacoes: IUsuarioFilmeMarcacao[]) => {
        this.linhas = marcacoes.map((m) => ({
          titulo: m.filme.titulo,
          ano: m.filme.ano,
          imdbId: m.filme.imdbId,
          filmeId: m.filme.id,
          marcadoEm: m.marcadoEm,
          posterUrl: m.filme.posterUrl ?? null,
          assistido: true,
          favorito: true
        }));
      },
      error: (e: HttpErrorResponse) => {
        this.erro = mensagemErroHttp(e);
      }
    });
  }

  private confirmar(titulo: string, texto: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.popupTitulo = titulo;
      this.popupTexto = texto;
      this.resolverPopup = resolve;
      this.popupVisivel = true;
    });
  }

  popupConfirmar(): void {
    const resolver = this.resolverPopup;
    this.resolverPopup = undefined;
    resolver?.(true);
    this.popupVisivel = false;
  }

  popupCancelar(): void {
    const resolver = this.resolverPopup;
    this.resolverPopup = undefined;
    resolver?.(false);
    this.popupVisivel = false;
  }

  aoPopupOculto(): void {
    if (this.resolverPopup !== undefined) {
      this.resolverPopup(false);
      this.resolverPopup = undefined;
    }
  }

  async aoAlternarAssistido(linha: ILinhaFilmeGrid): Promise<void> {
    const ok = await this.confirmar(
      "Remover assistido",
      `Remover "${linha.titulo}" dos assistidos? O favorito também será removido.`
    );
    if (!ok) return;
    try {
      await firstValueFrom(this.catalogo.removerAssistido(linha.filmeId));
      this.linhas = this.linhas.filter((l) => l.filmeId !== linha.filmeId);
      this.grid?.instance.refresh();
    } catch (e: unknown) {
      this.erro =
        e instanceof HttpErrorResponse
          ? mensagemErroHttp(e)
          : "Erro ao remover assistido.";
    }
  }

  async aoAlternarFavorito(linha: ILinhaFilmeGrid): Promise<void> {
    const ok = await this.confirmar(
      "Remover favorito",
      `Remover "${linha.titulo}" dos favoritos?`
    );
    if (!ok) return;
    try {
      await firstValueFrom(this.catalogo.removerFavorito(linha.filmeId));
      this.linhas = this.linhas.filter((l) => l.filmeId !== linha.filmeId);
      this.grid?.instance.refresh();
    } catch (e: unknown) {
      this.erro =
        e instanceof HttpErrorResponse
          ? mensagemErroHttp(e)
          : "Erro ao remover favorito.";
    }
  }
}
