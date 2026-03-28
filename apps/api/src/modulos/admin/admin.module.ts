import { Module } from "@nestjs/common";
import { ClientModule } from "../../core/client/client.module";
import { AdminController } from "./admin.controller";
import { AdminDAO } from "./admin.dao";
import { AdminService } from "./admin.service";

@Module({
  imports: [ClientModule],
  controllers: [AdminController],
  providers: [AdminService, AdminDAO]
})
export class AdminModule {}
