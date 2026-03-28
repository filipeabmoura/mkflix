import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ClientModule } from "../../core/client/client.module";
import { FilmeController } from "./filme.controller";
import { FilmeDAO } from "./filme.dao";
import { FilmeService } from "./filme.service";
import { OmdbService } from "./omdb.service";

@Module({
  imports: [
    ClientModule,
    HttpModule.register({
      timeout: 10_000,
      maxRedirects: 0
    })
  ],
  controllers: [FilmeController],
  providers: [OmdbService, FilmeService, FilmeDAO],
  exports: [FilmeService, OmdbService, FilmeDAO]
})
export class FilmeModule {}
