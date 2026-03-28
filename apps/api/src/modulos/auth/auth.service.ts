import { HttpStatus, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import type { IAuthLoginResponse, ICadastroUsuario, IJwtPayload, ILoginUsuario, IUsuario } from "@mk/model";
import { EApiCodes } from "@mk/model";
import { MkException } from "../../core/exceptions/mk.exception";
import { AuthDAO } from "./auth.dao";
import { usuarioParaResposta } from "./auth.utils";

@Injectable()
export class AuthService {
  constructor(
    private readonly authDAO: AuthDAO,
    private readonly jwtService: JwtService
  ) {}

  async cadastrarComum(dados: ICadastroUsuario): Promise<IUsuario> {
    return this.cadastrarPorTipo(dados, "comum");
  }

  async cadastrarAdminPorAdmin(dados: ICadastroUsuario): Promise<IUsuario> {
    return this.cadastrarPorTipo(dados, "admin");
  }

  async login(dados: ILoginUsuario): Promise<IAuthLoginResponse> {
    const usuario = await this.authDAO.findByEmail(dados.email);
    if (!usuario) {
      throw new MkException(
        "E-mail ou senha inválidos",
        HttpStatus.UNAUTHORIZED,
        EApiCodes.Credenciais_Invalidas
      );
    }
    const senhaConfere = await bcrypt.compare(dados.senha, usuario.senha);
    if (!senhaConfere) {
      throw new MkException(
        "E-mail ou senha inválidos",
        HttpStatus.UNAUTHORIZED,
        EApiCodes.Credenciais_Invalidas
      );
    }
    const payload: IJwtPayload = {
      sub: usuario.id,
      email: usuario.email,
      tipo: usuario.tipo
    };
    const accessToken = await this.jwtService.signAsync(payload);
    return {
      accessToken,
      usuario: usuarioParaResposta(usuario)
    };
  }

  private async cadastrarPorTipo(
    dados: ICadastroUsuario,
    tipo: "comum" | "admin"
  ): Promise<IUsuario> {
    const existente = await this.authDAO.findByEmail(dados.email);
    if (existente) {
      throw new MkException(
        "E-mail já cadastrado",
        HttpStatus.CONFLICT,
        EApiCodes.Email_Ja_Cadastrado
      );
    }
    const senhaHash = await bcrypt.hash(dados.senha, 10);
    const criado = await this.authDAO.create({
      nome: dados.nome,
      email: dados.email,
      senha: senhaHash,
      tipo
    });
    return usuarioParaResposta(criado);
  }
}
