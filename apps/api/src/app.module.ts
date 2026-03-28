import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { join } from "path";
import { AuthModule } from "./modulos/auth/auth.module";
import { FilmeModule } from "./modulos/filme/filme.module";
import { JwtAuthGuard } from "./core/auth/jwt-auth.guard";
import { PermissaoGuard } from "./core/auth/permissao.guard";
import { ClientModule } from "./core/client/client.module";
import { MkExceptionFilter } from "./core/filters/mk-exception.filter";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // dist/app.module.js -> apps/api/.env (independe do cwd ao rodar turbo/pnpm)
      envFilePath: [
        join(__dirname, "..", ".env"),
        join(__dirname, "..", ".env.local")
      ]
    }),
    ClientModule,
    AuthModule,
    FilmeModule
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissaoGuard },
    { provide: APP_FILTER, useClass: MkExceptionFilter }
  ]
})
export class AppModule {}
