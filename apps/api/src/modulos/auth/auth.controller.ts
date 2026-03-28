import { Body, Controller, Post } from "@nestjs/common";
import type {
  IAuthLoginResponse,
  ICadastroUsuario,
  ILoginUsuario,
  IUsuario
} from "@mk/model";
import { Public } from "../../core/decorators/public.decorator";
import { Permissao } from "../../core/decorators/permissao.decorator";
import { MkValidationPipe } from "../../core/validation/validation.pipe";
import { AuthService } from "./auth.service";
import {
  CadastroUsuarioValidator,
  LoginUsuarioValidator
} from "./auth.validators";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("cadastro")
  @Public()
  async cadastrarComum(
    @Body(new MkValidationPipe(new CadastroUsuarioValidator())) body: ICadastroUsuario
  ): Promise<IUsuario> {
    return this.authService.cadastrarComum(body);
  }

  @Post("login")
  @Public()
  async login(
    @Body(new MkValidationPipe(new LoginUsuarioValidator())) body: ILoginUsuario
  ): Promise<IAuthLoginResponse> {
    return this.authService.login(body);
  }

  @Post("admin/cadastro")
  @Permissao({ tiposUsuario: ["admin"] })
  async cadastrarAdmin(
    @Body(new MkValidationPipe(new CadastroUsuarioValidator())) body: ICadastroUsuario
  ): Promise<IUsuario> {
    return this.authService.cadastrarAdminPorAdmin(body);
  }
}
