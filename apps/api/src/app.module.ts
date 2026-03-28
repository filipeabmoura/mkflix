import { Module } from "@nestjs/common";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { AuthModule } from "./modulos/auth/auth.module";
import { JwtAuthGuard } from "./core/auth/jwt-auth.guard";
import { PermissaoGuard } from "./core/auth/permissao.guard";
import { ClientModule } from "./core/client/client.module";
import { MkExceptionFilter } from "./core/filters/mk-exception.filter";

@Module({
  imports: [ClientModule, AuthModule],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissaoGuard },
    { provide: APP_FILTER, useClass: MkExceptionFilter }
  ]
})
export class AppModule {}
