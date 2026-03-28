import { Injectable } from "@nestjs/common";
import type { Assistido } from "@mk/database";
import { ClientService } from "../../core/client/client.service";

@Injectable()
export class AssistidoDAO {
  constructor(private readonly client: ClientService) {}

  async create(usuarioId: number, filmeId: number): Promise<Assistido> {
    return this.client.assistido.create({
      data: { usuarioId, filmeId }
    });
  }

  async deleteByUsuarioAndFilme(usuarioId: number, filmeId: number): Promise<number> {
    const resultado = await this.client.assistido.deleteMany({
      where: { usuarioId, filmeId }
    });
    return resultado.count;
  }

  async exists(usuarioId: number, filmeId: number): Promise<boolean> {
    const row = await this.client.assistido.findFirst({
      where: { usuarioId, filmeId },
      select: { id: true }
    });
    return row !== null;
  }

  async findByUsuarioAndFilmeIds(
    usuarioId: number,
    filmeIds: number[]
  ): Promise<Assistido[]> {
    if (filmeIds.length === 0) {
      return [];
    }
    return this.client.assistido.findMany({
      where: { usuarioId, filmeId: { in: filmeIds } }
    });
  }
}
