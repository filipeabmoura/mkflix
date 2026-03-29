import { HttpService } from "@nestjs/axios";
import { HttpStatus, Injectable } from "@nestjs/common";
import type { IOmdbResultadoBusca } from "@mk/model";
import { EApiCodes } from "@mk/model";
import { AxiosError } from "axios";
import { firstValueFrom } from "rxjs";
import { MkException } from "../../core/exceptions/mk.exception";

const OMDB_BASE_URL = "https://www.omdbapi.com/";

type OmdbSearchItemRaw = {
  Title: string;
  Year: string;
  imdbID: string;
  Poster?: string;
  Type?: string;
};

type OmdbSearchResponseRaw = {
  Search?: OmdbSearchItemRaw[];
  totalResults?: string;
  Response: string;
  Error?: string;
};

type OmdbByIdResponseRaw = {
  imdbID?: string;
  Title?: string;
  Year?: string;
  Poster?: string;
  Response: string;
  Error?: string;
};

export type TOmdbFilmeDetalhe = {
  imdbId: string;
  titulo: string;
  ano: string;
  posterUrl: string | null;
};

@Injectable()
export class OmdbService {
  constructor(private readonly http: HttpService) {}

  private apiKey(): string {
    const key = process.env.OMDB_API_KEY;
    if (key === undefined || key.trim().length === 0) {
      throw new MkException(
        "Chave da API OMDb não configurada (OMDB_API_KEY)",
        HttpStatus.SERVICE_UNAVAILABLE,
        EApiCodes.Falha_Integracao_OMDB
      );
    }
    return key.trim();
  }

  /**
   * Uma requisição HTTP à OMDb por chamada (paginação lazy no cliente).
   */
  async buscarPorTitulo(
    termo: string,
    paginaOmdb: number
  ): Promise<{ totalResultados: number; itens: IOmdbResultadoBusca[] }> {
    const params = {
      apikey: this.apiKey(),
      s: termo,
      page: paginaOmdb
    };

    let data: OmdbSearchResponseRaw;
    try {
      const response = await firstValueFrom(
        this.http.get<OmdbSearchResponseRaw>(OMDB_BASE_URL, { params })
      );
      data = response.data;
    } catch (error: unknown) {
      this.tratarErroHttp(error);
    }

    if (data.Response === "False") {
      const msg = data.Error ?? "Nenhum resultado";
      if (
        msg.toLowerCase().includes("not found") ||
        msg.toLowerCase().includes("não encontrado") ||
        msg.toLowerCase().includes("movie not found")
      ) {
        return { totalResultados: 0, itens: [] };
      }
      if (msg.toLowerCase().includes("too many results")) {
        throw new MkException(
          "Refine a busca: muitos resultados na OMDb",
          HttpStatus.BAD_REQUEST,
          EApiCodes.Validacao_Invalida
        );
      }
      throw new MkException(
        msg,
        HttpStatus.BAD_GATEWAY,
        EApiCodes.Falha_Integracao_OMDB
      );
    }

    const lista = data.Search ?? [];
    const total = data.totalResults ? Number.parseInt(data.totalResults, 10) : lista.length;
    const totalResultados = Number.isNaN(total) ? lista.length : total;

    const itens: IOmdbResultadoBusca[] = lista.map((item) => ({
      imdbId: item.imdbID,
      titulo: item.Title,
      ano: item.Year,
      posterUrl: posterParaUrl(item.Poster),
      tipo: item.Type
    }));

    return { totalResultados, itens };
  }

  async buscarDetalhePorImdbId(imdbId: string): Promise<TOmdbFilmeDetalhe> {
    const params = {
      apikey: this.apiKey(),
      i: imdbId,
      plot: "short"
    };

    let data: OmdbByIdResponseRaw;
    try {
      const response = await firstValueFrom(
        this.http.get<OmdbByIdResponseRaw>(OMDB_BASE_URL, { params })
      );
      data = response.data;
    } catch (error: unknown) {
      this.tratarErroHttp(error);
    }

    if (
      data.Response === "False" ||
      !data.imdbID ||
      !data.Title ||
      !data.Year
    ) {
      throw new MkException(
        data.Error ?? "Filme não encontrado na OMDb",
        HttpStatus.NOT_FOUND,
        EApiCodes.Filme_Nao_Encontrado_OMDB
      );
    }

    return {
      imdbId: data.imdbID,
      titulo: data.Title,
      ano: data.Year,
      posterUrl: posterParaUrl(data.Poster)
    };
  }

  private tratarErroHttp(error: unknown): never {
    if (error instanceof MkException) {
      throw error;
    }
    if (error instanceof AxiosError) {
      const code = error.code;
      if (
        code === "ECONNABORTED" ||
        code === "ETIMEDOUT" ||
        error.message.toLowerCase().includes("timeout")
      ) {
        throw new MkException(
          "Tempo esgotado ao consultar a OMDb",
          HttpStatus.GATEWAY_TIMEOUT,
          EApiCodes.Falha_Integracao_OMDB
        );
      }
      throw new MkException(
        "Falha de rede ao consultar a OMDb",
        HttpStatus.BAD_GATEWAY,
        EApiCodes.Falha_Integracao_OMDB
      );
    }
    throw new MkException(
      "Falha ao consultar a OMDb",
      HttpStatus.BAD_GATEWAY,
      EApiCodes.Falha_Integracao_OMDB
    );
  }
}

function posterParaUrl(poster: string | undefined): string | null {
  if (poster === undefined || poster === "N/A" || poster.trim().length === 0) {
    return null;
  }
  return poster;
}
