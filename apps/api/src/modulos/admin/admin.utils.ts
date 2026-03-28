import type { Usuario } from "@mk/database";
import type { IFilme, IUsuario, TTipoUsuario } from "@mk/model";

export type TUsuarioSemSenha = Omit<Usuario, "senha">;

export function usuarioSemSenhaParaResposta(usuario: TUsuarioSemSenha): IUsuario {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    tipo: usuario.tipo as TTipoUsuario,
    createdAt: usuario.createdAt.toISOString(),
    updatedAt: usuario.updatedAt.toISOString()
  };
}

export function filmePrismaParaIFilme(filme: {
  id: number;
  imdbId: string;
  titulo: string;
  ano: string;
  posterUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}): IFilme {
  return {
    id: filme.id,
    imdbId: filme.imdbId,
    titulo: filme.titulo,
    ano: filme.ano,
    posterUrl: filme.posterUrl ?? null,
    createdAt: filme.createdAt.toISOString(),
    updatedAt: filme.updatedAt.toISOString()
  };
}
