import { z } from "zod";
import type { ICadastroUsuario, ILoginUsuario } from "@mk/model";
import type { MkValidator } from "../../core/validation/mk.validator";

const cadastroSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").trim(),
  email: z.string().email("E-mail inválido").trim(),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres")
});

const loginSchema = z.object({
  email: z.string().email("E-mail inválido").trim(),
  senha: z.string().min(1, "Senha é obrigatória")
});

export class CadastroUsuarioValidator implements MkValidator<ICadastroUsuario> {
  validate(value: unknown): ICadastroUsuario {
    return cadastroSchema.parse(value);
  }
}

export class LoginUsuarioValidator implements MkValidator<ILoginUsuario> {
  validate(value: unknown): ILoginUsuario {
    return loginSchema.parse(value);
  }
}
