import { HttpErrorResponse } from "@angular/common/http";
import { Component, ViewChild } from "@angular/core";
import { DxDataGridComponent } from "devextreme-angular";
import CustomStore from "devextreme/data/custom_store";
import type { LoadOptions } from "devextreme/data/load_options";
import type { IOmdbResultadoBusca } from "@mk/model";
import { EApiCodes } from "@mk/model";
import { firstValueFrom } from "rxjs";
import { extrairErroApi, mensagemErroHttp } from "../../core/api-error";
import { FilmeCatalogoService } from "../../core/services/filme-catalogo.service";

export interface ILinhaHomeFilme {
  imdbId: string;
  titulo: string;
  ano: string;
  posterUrl: string | null;
  assistido: boolean;
  favorito: boolean;
  filmeId: number | null;
}

const OMDB_PAGE_SIZE = 10;

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"]
})
export class HomeComponent {
  @ViewChild(DxDataGridComponent, { static: false })
  grid?: DxDataGridComponent;

  termoBusca = "";
  erroBusca: string | null = null;
  carregandoBusca = false;
  dataSource: CustomStore;
  popupVisivel = false;
  popupTitulo = "";
  popupTexto = "";

  private resolverPopup?: (valor: boolean) => void;
  private totalOmdb = 0;
  private termoAtivo = "";

  constructor(private readonly catalogo: FilmeCatalogoService) {
    this.dataSource = this.criarStore();
  }

  private criarStore(): CustomStore {
    return new CustomStore({
      key: "imdbId",
      load: (op: LoadOptions) => this.executarCarga(op)
    });
  }

  buscar(): void {
    const termo = this.termoBusca.trim();
    if (termo.length === 0) {
      this.erroBusca = "Digite um termo para buscar.";
      return;
    }
    this.termoAtivo = termo;
    this.totalOmdb = 0;
    this.erroBusca = null;
    this.dataSource = this.criarStore();
    queueMicrotask(() => this.grid?.instance.refresh());
  }

  private async executarCarga(
    loadOptions: LoadOptions
  ): Promise<{ data: ILinhaHomeFilme[]; totalCount: number }> {
    if (this.termoAtivo.trim().length === 0) {
      return { data: [], totalCount: 0 };
    }

    const skip = loadOptions.skip ?? 0;
    const take = loadOptions.take ?? 20;

    /**
     * Calcula quais páginas da OMDb (base 10 itens/pág) cobrem
     * o intervalo [skip, skip+take) do grid.
     *
     * Exemplo — pageSize=20, página 1 do grid (skip=0, take=20):
     *   startOmdb=1, endOmdb=2 → busca pages 1 e 2
     *   startOffset = 0 % 10 = 0 → slice(0, 20)
     *
     * Exemplo — pageSize=20, página 11 do grid (skip=200, take=20):
     *   startOmdb=21, endOmdb=22 → busca pages 21 e 22
     *   startOffset = 200 % 10 = 0 → slice(0, 20)
     */
    const startOmdbPage = Math.floor(skip / OMDB_PAGE_SIZE) + 1;
    const endOmdbPage = Math.ceil((skip + take) / OMDB_PAGE_SIZE);

    this.erroBusca = null;
    this.carregandoBusca = true;

    try {
      // Busca paralela de todas as páginas OMDb necessárias
      const fetches = Array.from(
        { length: endOmdbPage - startOmdbPage + 1 },
        (_, i) =>
          firstValueFrom(
            this.catalogo.buscar({ q: this.termoAtivo, page: startOmdbPage + i })
          )
      );
      const respostas = await Promise.all(fetches);

      // totalResults é o mesmo em qualquer página do mesmo termo
      this.totalOmdb = respostas[0].totalResultados;

      // Junta todos os itens recebidos
      const combined: IOmdbResultadoBusca[] = respostas.flatMap((r) => r.itens);

      // Fatia exatamente o que o grid pediu
      const startOffset = skip % OMDB_PAGE_SIZE;
      const pageItens = combined.slice(startOffset, startOffset + take);

      const linhas = pageItens.map((item) => this.mapearLinha(item));

      // Busca estado (assistido/favorito) em lote para esta página
      await this.aplicarEstadoNasLinhas(linhas);

      return { data: linhas, totalCount: this.totalOmdb };
    } catch (erro: unknown) {
      this.erroBusca =
        erro instanceof HttpErrorResponse
          ? mensagemErroHttp(erro)
          : "Erro ao buscar filmes.";
      return { data: [], totalCount: 0 };
    } finally {
      this.carregandoBusca = false;
    }
  }

  private mapearLinha(item: IOmdbResultadoBusca): ILinhaHomeFilme {
    return {
      imdbId: item.imdbId.toLowerCase(),
      titulo: item.titulo,
      ano: item.ano,
      posterUrl: item.posterUrl ?? null,
      assistido: false,
      favorito: false,
      filmeId: null
    };
  }

  private async aplicarEstadoNasLinhas(linhas: ILinhaHomeFilme[]): Promise<void> {
    if (linhas.length === 0) return;
    try {
      const ids = linhas.map((l) => l.imdbId);
      const estados = await firstValueFrom(this.catalogo.filmesEstado(ids));
      const mapa = new Map(estados.map((e) => [e.imdbId.toLowerCase(), e] as const));
      for (const linha of linhas) {
        const estado = mapa.get(linha.imdbId);
        if (estado !== undefined) {
          linha.assistido = estado.assistido;
          linha.favorito = estado.favorito;
          linha.filmeId = estado.filmeId ?? null;
        }
      }
    } catch {
      // Estado não crítico: grid carrega sem estado em caso de falha
    }
  }

  private async sincronizarLinha(linha: ILinhaHomeFilme): Promise<void> {
    try {
      const estados = await firstValueFrom(
        this.catalogo.filmesEstado([linha.imdbId])
      );
      const estado = estados[0];
      if (estado) {
        linha.assistido = estado.assistido;
        linha.favorito = estado.favorito;
        linha.filmeId = estado.filmeId ?? null;
      }
    } catch {
      // silencia
    }
  }

  // ── Popup ──────────────────────────────────────────────────────────

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

  private recarregarGrid(): void {
    this.grid?.instance.refresh();
  }

  // ── Ações ─────────────────────────────────────────────────────────

  async aoAlternarAssistido(linha: ILinhaHomeFilme): Promise<void> {
    if (linha.assistido) {
      if (linha.filmeId === null) await this.sincronizarLinha(linha);
      if (linha.filmeId === null) return;

      const ok = await this.confirmar(
        "Remover assistido",
        "Remover dos assistidos também remove o favorito deste filme. Continuar?"
      );
      if (!ok) return;

      try {
        await firstValueFrom(this.catalogo.removerAssistido(linha.filmeId));
        this.recarregarGrid();
      } catch (e: unknown) {
        this.erroBusca =
          e instanceof HttpErrorResponse
            ? mensagemErroHttp(e)
            : "Erro ao remover assistido.";
      }
      return;
    }

    const ok = await this.confirmar(
      "Marcar assistido",
      `Marcar "${linha.titulo}" como assistido?`
    );
    if (!ok) return;

    try {
      await firstValueFrom(this.catalogo.marcarAssistido(linha.imdbId));
      this.recarregarGrid();
    } catch (e: unknown) {
      this.erroBusca =
        e instanceof HttpErrorResponse
          ? mensagemErroHttp(e)
          : "Erro ao marcar assistido.";
    }
  }

  async aoAlternarFavorito(linha: ILinhaHomeFilme): Promise<void> {
    if (linha.favorito) {
      if (linha.filmeId === null) await this.sincronizarLinha(linha);
      if (linha.filmeId === null) return;

      const ok = await this.confirmar(
        "Remover favorito",
        `Remover "${linha.titulo}" dos favoritos?`
      );
      if (!ok) return;

      try {
        await firstValueFrom(this.catalogo.removerFavorito(linha.filmeId));
        this.recarregarGrid();
      } catch (e: unknown) {
        this.erroBusca =
          e instanceof HttpErrorResponse
            ? mensagemErroHttp(e)
            : "Erro ao remover favorito.";
      }
      return;
    }

    try {
      await firstValueFrom(this.catalogo.marcarFavorito(linha.imdbId));
      this.recarregarGrid();
    } catch (e: unknown) {
      if (e instanceof HttpErrorResponse) {
        const api = extrairErroApi(e);
        if (api?.mkCode === EApiCodes.Favorito_Sem_Assistido) {
          const ok = await this.confirmar(
            "Favoritar",
            "É preciso marcar como assistido antes. Deseja marcar como assistido e favoritar agora?"
          );
          if (!ok) return;
          try {
            await firstValueFrom(this.catalogo.marcarAssistido(linha.imdbId));
            await firstValueFrom(this.catalogo.marcarFavorito(linha.imdbId));
            this.recarregarGrid();
          } catch (e2: unknown) {
            this.erroBusca =
              e2 instanceof HttpErrorResponse
                ? mensagemErroHttp(e2)
                : "Erro ao favoritar.";
          }
          return;
        }
        this.erroBusca = mensagemErroHttp(e);
        return;
      }
      this.erroBusca = "Erro ao favoritar.";
    }
  }
}
