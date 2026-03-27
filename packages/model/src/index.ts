export enum EApiCodes {
  Filme_Nao_Encontrado_OMDB = "Filme_Nao_Encontrado_OMDB",
  Falha_Integracao_OMDB = "Falha_Integracao_OMDB",
  Validacao_Invalida = "Validacao_Invalida",
  Nao_Autorizado = "Nao_Autorizado"
}

export type TTipoUsuario = "admin" | "comum";

export interface IUsuario {
  id: string;
  nome: string;
  email: string;
  tipo: TTipoUsuario;
  createdAt: string;
  updatedAt: string;
}

export interface IFilme {
  id: string;
  imdbId: string;
  titulo: string;
  ano: string;
  posterUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IFavorito {
  id: string;
  usuarioId: string;
  filmeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAssistido {
  id: string;
  usuarioId: string;
  filmeId: string;
  createdAt: string;
  updatedAt: string;
}
