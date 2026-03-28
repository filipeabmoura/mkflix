import type { Usuario } from "@mk/database";
import type { IUsuario, TTipoUsuario } from "@mk/model";

export function usuarioParaResposta(usuario: Usuario): IUsuario {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    tipo: usuario.tipo as TTipoUsuario,
    createdAt: usuario.createdAt.toISOString(),
    updatedAt: usuario.updatedAt.toISOString()
  };
}
