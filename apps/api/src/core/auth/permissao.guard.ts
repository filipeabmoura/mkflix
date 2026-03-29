import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { IUsuarioAutenticado } from "@mk/model";
import { EApiCodes } from "@mk/model";
import { MkException } from "../exceptions/mk.exception";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import {
  PERMISSAO_KEY,
  type IPermissaoMetadata
} from "../decorators/permissao.decorator";

@Injectable()
export class PermissaoGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
    if (isPublic === true) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: IUsuarioAutenticado }>();
    const user = request.user;
    if (!user) {
      throw new UnauthorizedException();
    }

    const permissao = this.reflector.getAllAndOverride<IPermissaoMetadata>(
      PERMISSAO_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!permissao || permissao.tiposUsuario.length === 0) {
      return true;
    }

    if (!permissao.tiposUsuario.includes(user.tipo)) {
      throw new MkException(
        "Acesso negado",
        HttpStatus.FORBIDDEN,
        EApiCodes.Proibido
      );
    }

    return true;
  }
}
