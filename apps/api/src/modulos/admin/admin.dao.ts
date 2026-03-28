import { Injectable } from "@nestjs/common";
import type { Filme } from "@mk/database";
import { Prisma } from "@mk/database";
import { ClientService } from "../../core/client/client.service";
import type { TUsuarioSemSenha } from "./admin.utils";

@Injectable()
export class AdminDAO {
  constructor(private readonly client: ClientService) {}

  async rankingAssistidosPagina(
    skip: number,
    take: number
  ): Promise<Array<{ filmeId: number; quantidade: number }>> {
    const linhas = await this.client.$queryRaw<
      Array<{ filmeId: number; quantidade: bigint }>
    >(Prisma.sql`
      SELECT a."filmeId", COUNT(*)::bigint AS quantidade
      FROM "Assistido" a
      GROUP BY a."filmeId"
      ORDER BY COUNT(*) DESC
      LIMIT ${take} OFFSET ${skip}
    `);
    return linhas.map((l) => ({
      filmeId: l.filmeId,
      quantidade: Number(l.quantidade)
    }));
  }

  async contarGruposAssistidos(): Promise<number> {
    const linhas = await this.client.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*)::bigint AS count FROM (
        SELECT "filmeId" FROM "Assistido" GROUP BY "filmeId"
      ) AS grupos
    `;
    return Number(linhas[0]?.count ?? 0);
  }

  async rankingFavoritosPagina(
    skip: number,
    take: number
  ): Promise<Array<{ filmeId: number; quantidade: number }>> {
    const linhas = await this.client.$queryRaw<
      Array<{ filmeId: number; quantidade: bigint }>
    >(Prisma.sql`
      SELECT f."filmeId", COUNT(*)::bigint AS quantidade
      FROM "Favorito" f
      GROUP BY f."filmeId"
      ORDER BY COUNT(*) DESC
      LIMIT ${take} OFFSET ${skip}
    `);
    return linhas.map((l) => ({
      filmeId: l.filmeId,
      quantidade: Number(l.quantidade)
    }));
  }

  async contarGruposFavoritos(): Promise<number> {
    const linhas = await this.client.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*)::bigint AS count FROM (
        SELECT "filmeId" FROM "Favorito" GROUP BY "filmeId"
      ) AS grupos
    `;
    return Number(linhas[0]?.count ?? 0);
  }

  async findFilmesByIds(ids: number[]): Promise<Filme[]> {
    if (ids.length === 0) {
      return [];
    }
    return this.client.filme.findMany({ where: { id: { in: ids } } });
  }

  async contarUsuarios(): Promise<number> {
    return this.client.usuario.count();
  }

  async listarUsuariosPagina(skip: number, take: number): Promise<TUsuarioSemSenha[]> {
    return this.client.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { id: "asc" },
      skip,
      take
    });
  }

  async buscarUsuarioComListas(usuarioId: number) {
    return this.client.usuario.findUnique({
      where: { id: usuarioId },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        createdAt: true,
        updatedAt: true,
        favoritos: {
          select: {
            createdAt: true,
            filme: true
          },
          orderBy: { createdAt: "desc" }
        },
        assistidos: {
          select: {
            createdAt: true,
            filme: true
          },
          orderBy: { createdAt: "desc" }
        }
      }
    });
  }
}
