import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import type {
  ICadastroUsuario,
  IPaginado,
  IRankingFilmeItem,
  IUsuario,
  IUsuarioDetalheAdmin
} from "@mk/model";
import { Observable } from "rxjs";
import { ConfiguracoesService } from "./configuracoes.service";

@Injectable({ providedIn: "root" })
export class AdminService {
  constructor(
    private readonly http: HttpClient,
    private readonly config: ConfiguracoesService
  ) {}

  rankingAssistidos(
    page: number,
    pageSize: number
  ): Observable<IPaginado<IRankingFilmeItem>> {
    const params = new HttpParams()
      .set("page", page)
      .set("pageSize", pageSize);
    return this.http.get<IPaginado<IRankingFilmeItem>>(
      this.config.endpoint("admin", "rankings", "assistidos"),
      { params }
    );
  }

  rankingFavoritos(
    page: number,
    pageSize: number
  ): Observable<IPaginado<IRankingFilmeItem>> {
    const params = new HttpParams()
      .set("page", page)
      .set("pageSize", pageSize);
    return this.http.get<IPaginado<IRankingFilmeItem>>(
      this.config.endpoint("admin", "rankings", "favoritos"),
      { params }
    );
  }

  listarUsuarios(
    page: number,
    pageSize: number
  ): Observable<IPaginado<IUsuario>> {
    const params = new HttpParams()
      .set("page", page)
      .set("pageSize", pageSize);
    return this.http.get<IPaginado<IUsuario>>(
      this.config.endpoint("admin", "usuarios"),
      { params }
    );
  }

  detalheUsuario(id: number): Observable<IUsuarioDetalheAdmin> {
    return this.http.get<IUsuarioDetalheAdmin>(
      this.config.endpoint("admin", "usuarios", String(id))
    );
  }

  cadastrarAdmin(dados: ICadastroUsuario): Observable<IUsuario> {
    return this.http.post<IUsuario>(
      this.config.endpoint("auth", "admin", "cadastro"),
      dados
    );
  }
}
