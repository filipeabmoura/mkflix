import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import type { IUsuarioFilmeMarcacao } from "@mk/model";
import { Observable } from "rxjs";
import { ConfiguracoesService } from "./configuracoes.service";

@Injectable({ providedIn: "root" })
export class UsuarioFilmesService {
  constructor(
    private readonly http: HttpClient,
    private readonly config: ConfiguracoesService
  ) {}

  listarFavoritos(): Observable<IUsuarioFilmeMarcacao[]> {
    return this.http.get<IUsuarioFilmeMarcacao[]>(
      this.config.endpoint("favoritos")
    );
  }

  listarAssistidos(): Observable<IUsuarioFilmeMarcacao[]> {
    return this.http.get<IUsuarioFilmeMarcacao[]>(
      this.config.endpoint("assistidos")
    );
  }
}
