import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import type {
  IAssistido,
  IBuscaFilmesQuery,
  IBuscaFilmesResposta,
  IFavorito,
  IFilmeEstadoItem
} from "@mk/model";
import { Observable, of } from "rxjs";
import { ConfiguracoesService } from "./configuracoes.service";

@Injectable({ providedIn: "root" })
export class FilmeCatalogoService {
  constructor(
    private readonly http: HttpClient,
    private readonly config: ConfiguracoesService
  ) {}

  buscar(query: IBuscaFilmesQuery): Observable<IBuscaFilmesResposta> {
    const params = new HttpParams()
      .set("q", query.q)
      .set("page", String(query.page));
    return this.http.get<IBuscaFilmesResposta>(
      this.config.endpoint("filmes", "buscar"),
      { params }
    );
  }

  filmesEstado(imdbIds: string[]): Observable<IFilmeEstadoItem[]> {
    if (imdbIds.length === 0) {
      return of([]);
    }
    const params = new HttpParams().set("imdbIds", imdbIds.join(","));
    return this.http.get<IFilmeEstadoItem[]>(
      this.config.endpoint("usuarios", "me", "filmes-estado"),
      { params }
    );
  }

  marcarAssistido(imdbId: string): Observable<IAssistido> {
    return this.http.post<IAssistido>(this.config.endpoint("assistidos"), {
      imdbId
    });
  }

  removerAssistido(filmeId: number): Observable<unknown> {
    return this.http.delete(
      this.config.endpoint("assistidos", String(filmeId))
    );
  }

  marcarFavorito(imdbId: string): Observable<IFavorito> {
    return this.http.post<IFavorito>(this.config.endpoint("favoritos"), {
      imdbId
    });
  }

  removerFavorito(filmeId: number): Observable<unknown> {
    return this.http.delete(
      this.config.endpoint("favoritos", String(filmeId))
    );
  }
}
