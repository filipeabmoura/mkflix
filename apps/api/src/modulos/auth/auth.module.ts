import { Module } from "@nestjs/common";
import { ClientModule } from "../../core/client/client.module";
import { AuthCoreModule } from "../../core/auth/auth-core.module";
import { AuthController } from "./auth.controller";
import { AuthDAO } from "./auth.dao";
import { AuthService } from "./auth.service";

@Module({
  imports: [ClientModule, AuthCoreModule],
  controllers: [AuthController],
  providers: [AuthService, AuthDAO],
  exports: [AuthCoreModule]
})
export class AuthModule {}
