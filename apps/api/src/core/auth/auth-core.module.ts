import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./jwt.strategy";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { PermissaoGuard } from "./permissao.guard";

function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length === 0) {
    return "mkflix-dev-secret-definir-jwt-secret";
  }
  return secret;
}

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      global: true,
      useFactory: () => ({
        secret: jwtSecret(),
        signOptions: { expiresIn: "7d" }
      })
    })
  ],
  providers: [JwtStrategy, JwtAuthGuard, PermissaoGuard],
  exports: [JwtModule, PassportModule, JwtAuthGuard, PermissaoGuard]
})
export class AuthCoreModule {}
