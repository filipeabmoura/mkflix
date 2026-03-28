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

  private linhas: ILinhaHomeFilme[] = [];

  private totalOmdb = 0;

  private proximaPaginaOmdb = 1;

  private termoAtivo = "";

  private fimOmdb = false;

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
    this.linhas = [];
    this.totalOmdb = 0;
    this.proximaPaginaOmdb = 1;
    this.fimOmdb = false;
    this.erroBusca = null;
    this.dataSource = this.criarStore();
    queueMicrotask(() => {
      this.grid?.instance.refresh();
    });
  }

  private async executarCarga(
    loadOptions: LoadOptions
  ): Promise<{ data: ILinhaHomeFilme[]; totalCount: number }> {
    if (this.termoAtivo.trim().length === 0) {
      return { data: [], totalCount: 0 };
    }
    const skip = loadOptions.skip ?? 0;
    const take = loadOptions.take ?? 20;
    const precisa = skip + take;
    this.erroBusca = null;
    this.carregandoBusca = true;
    try {
      await this.garantirLinhasAte(precisa);
      const fatia = this.linhas.slice(skip, skip + take);
      return { data: fatia, totalCount: this.totalOmdb };
    } catch (erro: unknown) {
      if (erro instanceof HttpErrorResponse) {
        this.erroBusca = mensagemErroHttp(erro);
      } else {
        this.erroBusca = "Erro ao buscar filmes.";
      }
      return { data: [], totalCount: 0 };
    } finally {
      this.carregandoBusca = false;
    }
  }

  private async garantirLinhasAte(precisa: number): Promise<void> {
    const termo = this.termoAtivo;
    while (true) {
      if (this.linhas.length >= precisa) {
        break;
      }
      if (this.totalOmdb > 0 && this.linhas.length >= this.totalOmdb) {
        break;
      }
      if (this.fimOmdb) {
        break;
      }
      const resposta = await firstValueFrom(
        this.catalogo.buscar({ q: termo, page: this.proximaPaginaOmdb })
      );
      if (this.proximaPaginaOmdb === 1) {
        this.totalOmdb = resposta.totalResultados;
      }
      const novosItens = resposta.itens;
      if (novosItens.length === 0) {
        this.fimOmdb = true;
        break;
      }
      const novasLinhas = novosItens.map((item) => this.mapearLinha(item));
      this.linhas.push(...novasLinhas);
      this.proximaPaginaOmdb += 1;
      if (novosItens.length < 10) {
        this.fimOmdb = true;
      }
      await this.aplicarEstadoNasLinhas(novasLinhas.map((l) => l.imdbId));
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

  private async aplicarEstadoNasLinhas(ids: string[]): Promise<void> {
    if (ids.length === 0) {
      return;
    }
    const estados = await firstValueFrom(this.catalogo.filmesEstado(ids));
    const mapa = new Map(
      estados.map((e) => [e.imdbId.toLowerCase(), e] as const)
    );
    const conjunto = new Set(ids.map((id) => id.toLowerCase()));
    for (const linha of this.linhas) {
      if (!conjunto.has(linha.imdbId)) {
        continue;
      }
      const estado = mapa.get(linha.imdbId);
      if (estado !== undefined) {
        linha.assistido = estado.assistido;
        linha.favorito = estado.favorito;
        linha.filmeId = estado.filmeId ?? null;
      }
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

  private recarregarGrid(): void {
    const fonte = this.grid?.instance.getDataSource();
    fonte?.reload();
  }

  async aoAlternarAssistido(linha: ILinhaHomeFilme): Promise<void> {
    if (linha.assistido) {
      if (linha.filmeId === null) {
        await this.aplicarEstadoNasLinhas([linha.imdbId]);
      }
      if (linha.filmeId === null) {
        return;
      }
      const ok = await this.confirmar(
        "Remover assistido",
        "Remover dos assistidos também remove o favorito deste filme. Continuar?"
      );
      if (!ok) {
        return;
      }
      try {
        await firstValueFrom(this.catalogo.removerAssistido(linha.filmeId));
        linha.assistido = false;
        linha.favorito = false;
        this.recarregarGrid();
      } catch (erro: unknown) {
        this.erroBusca =
          erro instanceof HttpErrorResponse
            ? mensagemErroHttp(erro)
            : "Erro ao remover assistido.";
      }
      return;
    }
    const ok = await this.confirmar(
      "Marcar assistido",
      `Marcar "${linha.titulo}" como assistido?`
    );
    if (!ok) {
      return;
    }
    try {
      const criado = await firstValueFrom(
        this.catalogo.marcarAssistido(linha.imdbId)
      );
      linha.assistido = true;
      linha.filmeId = criado.filmeId;
      await this.aplicarEstadoNasLinhas([linha.imdbId]);
      this.recarregarGrid();
    } catch (erro: unknown) {
      this.erroBusca =
        erro instanceof HttpErrorResponse
          ? mensagemErroHttp(erro)
          : "Erro ao marcar assistido.";
    }
  }

  async aoAlternarFavorito(linha: ILinhaHomeFilme): Promise<void> {
    if (linha.favorito) {
      if (linha.filmeId === null) {
        await this.aplicarEstadoNasLinhas([linha.imdbId]);
      }
      if (linha.filmeId === null) {
        return;
      }
      const ok = await this.confirmar(
        "Remover favorito",
        `Remover "${linha.titulo}" dos favoritos?`
      );
      if (!ok) {
        return;
      }
      try {
        await firstValueFrom(this.catalogo.removerFavorito(linha.filmeId));
        linha.favorito = false;
        this.recarregarGrid();
      } catch (erro: unknown) {
        this.erroBusca =
          erro instanceof HttpErrorResponse
            ? mensagemErroHttp(erro)
            : "Erro ao remover favorito.";
      }
      return;
    }
    try {
      await firstValueFrom(this.catalogo.marcarFavorito(linha.imdbId));
      linha.favorito = true;
      await this.aplicarEstadoNasLinhas([linha.imdbId]);
      this.recarregarGrid();
    } catch (erro: unknown) {
      if (erro instanceof HttpErrorResponse) {
        const api = extrairErroApi(erro);
        if (api?.mkCode === EApiCodes.Favorito_Sem_Assistido) {
          const ok = await this.confirmar(
            "Favoritar",
            "É preciso marcar como assistido antes. Deseja marcar como assistido e favoritar agora?"
          );
          if (!ok) {
            return;
          }
          try {
            const assistido = await firstValueFrom(
              this.catalogo.marcarAssistido(linha.imdbId)
            );
            linha.assistido = true;
            linha.filmeId = assistido.filmeId;
            await firstValueFrom(this.catalogo.marcarFavorito(linha.imdbId));
            linha.favorito = true;
            await this.aplicarEstadoNasLinhas([linha.imdbId]);
            this.recarregarGrid();
          } catch (erro2: unknown) {
            this.erroBusca =
              erro2 instanceof HttpErrorResponse
                ? mensagemErroHttp(erro2)
                : "Erro ao favoritar.";
          }
          return;
        }
        this.erroBusca = mensagemErroHttp(erro);
        return;
      }
      this.erroBusca = "Erro ao favoritar.";
    }
  }
}
