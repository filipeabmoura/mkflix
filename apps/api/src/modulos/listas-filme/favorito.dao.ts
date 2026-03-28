import { Injectable } from "@nestjs/common";
import type { Favorito } from "@mk/database";
import { ClientService } from "../../core/client/client.service";

@Injectable()
export class FavoritoDAO {
  constructor(private readonly client: ClientService) {}

  async create(usuarioId: number, filmeId: number): Promise<Favorito> {
    return this.client.favorito.create({
      data: { usuarioId, filmeId }
    });
  }

  async deleteByUsuarioAndFilme(usuarioId: number, filmeId: number): Promise<number> {
    const resultado = await this.client.favorito.deleteMany({
      where: { usuarioId, filmeId }
    });
    return resultado.count;
  }

  async exists(usuarioId: number, filmeId: number): Promise<boolean> {
    const row = await this.client.favorito.findFirst({
      where: { usuarioId, filmeId },
      select: { id: true }
    });
    return row !== null;
  }

  async findByUsuarioAndFilmeIds(
    usuarioId: number,
    filmeIds: number[]
  ): Promise<Favorito[]> {
    if (filmeIds.length === 0) {
      return [];
    }
    return this.client.favorito.findMany({
      where: { usuarioId, filmeId: { in: filmeIds } }
    });
  }
}
