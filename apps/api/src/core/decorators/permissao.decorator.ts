import { SetMetadata } from "@nestjs/common";
import type { TTipoUsuario } from "@mk/model";

export const PERMISSAO_KEY = "permissao";

export interface IPermissaoMetadata {
  tiposUsuario: TTipoUsuario[];
}

export const Permissao = (
  metadata: IPermissaoMetadata
): ReturnType<typeof SetMetadata> => SetMetadata(PERMISSAO_KEY, metadata);
