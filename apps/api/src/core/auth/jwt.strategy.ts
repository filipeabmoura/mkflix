import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import type { IJwtPayload, IUsuarioAutenticado } from "@mk/model";

function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length === 0) {
    return "mkflix-dev-secret-definir-jwt-secret";
  }
  return secret;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret()
    });
  }

  validate(payload: IJwtPayload): IUsuarioAutenticado {
    return {
      id: payload.sub,
      email: payload.email,
      tipo: payload.tipo
    };
  }
}
