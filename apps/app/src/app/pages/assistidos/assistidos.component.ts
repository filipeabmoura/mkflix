import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit, ViewChild } from "@angular/core";
import type { IUsuarioFilmeMarcacao } from "@mk/model";
import { EApiCodes } from "@mk/model";
import { firstValueFrom } from "rxjs";
import { extrairErroApi, mensagemErroHttp } from "../../core/api-error";
import { FilmeCatalogoService } from "../../core/services/filme-catalogo.service";
import { UsuarioFilmesService } from "../../core/services/usuario-filmes.service";
import type { ILinhaFilmeGrid } from "../../shared/models/linha-filme-grid";
import { DxDataGridComponent } from "devextreme-angular";

@Component({
  selector: "app-assistidos",
  templateUrl: "./assistidos.component.html",
  styleUrls: ["./assistidos.component.css"]
})
export class AssistidosComponent implements OnInit {
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
    this.filmes.listarAssistidos().subscribe({
      next: async (marcacoes: IUsuarioFilmeMarcacao[]) => {
        this.linhas = marcacoes.map((m) => ({
          titulo: m.filme.titulo,
          ano: m.filme.ano,
          imdbId: m.filme.imdbId,
          filmeId: m.filme.id,
          marcadoEm: m.marcadoEm,
          posterUrl: m.filme.posterUrl ?? null,
          assistido: true,
          favorito: false
        }));
        await this.sincronizarEstado();
      },
      error: (e: HttpErrorResponse) => {
        this.erro = mensagemErroHttp(e);
      }
    });
  }

  private async sincronizarEstado(): Promise<void> {
    const ids = this.linhas.map((l) => l.imdbId);
    if (ids.length === 0) return;
    try {
      const estados = await firstValueFrom(this.catalogo.filmesEstado(ids));
      const mapa = new Map(estados.map((e) => [e.imdbId.toLowerCase(), e]));
      for (const linha of this.linhas) {
        const estado = mapa.get(linha.imdbId.toLowerCase());
        if (estado) {
          linha.favorito = estado.favorito;
        }
      }
      this.grid?.instance.refresh();
    } catch {
      /* silencia — o estado de favorito é informativo */
    }
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
      `Remover "${linha.titulo}" dos assistidos? Se estiver favoritado, o favorito também será removido.`
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
    if (linha.favorito) {
      const ok = await this.confirmar(
        "Remover favorito",
        `Remover "${linha.titulo}" dos favoritos?`
      );
      if (!ok) return;
      try {
        await firstValueFrom(this.catalogo.removerFavorito(linha.filmeId));
        linha.favorito = false;
        this.grid?.instance.refresh();
      } catch (e: unknown) {
        this.erro =
          e instanceof HttpErrorResponse
            ? mensagemErroHttp(e)
            : "Erro ao remover favorito.";
      }
      return;
    }

    try {
      await firstValueFrom(this.catalogo.marcarFavorito(linha.imdbId));
      linha.favorito = true;
      this.grid?.instance.refresh();
    } catch (e: unknown) {
      if (e instanceof HttpErrorResponse) {
        const api = extrairErroApi(e);
        if (api?.mkCode === EApiCodes.Favorito_Sem_Assistido) {
          this.erro =
            "O filme precisa ser assistido antes de ser favoritado.";
          return;
        }
        this.erro = mensagemErroHttp(e);
      } else {
        this.erro = "Erro ao favoritar.";
      }
    }
  }
}
