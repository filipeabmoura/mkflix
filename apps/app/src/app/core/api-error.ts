import type { HttpErrorResponse } from "@angular/common/http";

export interface ICorpoErroApi {
  statusCode?: number;
  message?: string;
  mkCode?: string;
  tipo?: string;
  detalhes?: Record<string, unknown>;
}

export function extrairErroApi(erro: HttpErrorResponse): ICorpoErroApi | null {
  const corpo = erro.error;
  if (corpo !== null && typeof corpo === "object" && !Array.isArray(corpo)) {
    return corpo as ICorpoErroApi;
  }
  return null;
}

export function mensagemErroHttp(erro: HttpErrorResponse): string {
  const api = extrairErroApi(erro);
  if (api?.message !== undefined && api.message.length > 0) {
    return api.message;
  }
  if (typeof erro.error === "string" && erro.error.length > 0) {
    return erro.error;
  }
  return erro.message || "Erro de rede. Tente novamente.";
}
