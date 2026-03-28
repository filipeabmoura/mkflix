import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { IUsuarioAutenticado } from "@mk/model";

export const User = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): IUsuarioAutenticado => {
    const request = ctx.switchToHttp().getRequest<{ user: IUsuarioAutenticado }>();
    return request.user;
  }
);
