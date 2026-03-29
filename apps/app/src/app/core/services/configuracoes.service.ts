import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";

@Injectable({ providedIn: "root" })
export class ConfiguracoesService {
  readonly apiBaseUrl = environment.apiBaseUrl.replace(/\/$/, "");

  /** Monta URL da API a partir de segmentos (sem barra inicial). */
  endpoint(...segmentos: string[]): string {
    const caminho = segmentos
      .map((s) => s.replace(/^\//, "").replace(/\/$/, ""))
      .filter((s) => s.length > 0)
      .join("/");
    return `${this.apiBaseUrl}/${caminho}`;
  }
}
