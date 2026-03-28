import { Injectable } from "@nestjs/common";
import type { Filme } from "@mk/database";
import { ClientService } from "../../core/client/client.service";

export type TDadosFilmeUpsert = {
  imdbId: string;
  titulo: string;
  ano: string;
  posterUrl: string | null;
};

@Injectable()
export class FilmeDAO {
  constructor(private readonly client: ClientService) {}

  async upsertPorImdbId(dados: TDadosFilmeUpsert): Promise<Filme> {
    return this.client.filme.upsert({
      where: { imdbId: dados.imdbId },
      create: {
        imdbId: dados.imdbId,
        titulo: dados.titulo,
        ano: dados.ano,
        posterUrl: dados.posterUrl
      },
      update: {
        titulo: dados.titulo,
        ano: dados.ano,
        posterUrl: dados.posterUrl
      }
    });
  }
}
