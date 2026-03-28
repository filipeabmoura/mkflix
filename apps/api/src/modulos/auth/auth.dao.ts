import { Injectable } from "@nestjs/common";
import type { Prisma, Usuario } from "@mk/database";
import { ClientService } from "../../core/client/client.service";

@Injectable()
export class AuthDAO {
  constructor(private readonly client: ClientService) {}

  findByEmail(email: string): Promise<Usuario | null> {
    return this.client.usuario.findUnique({ where: { email } });
  }

  create(data: Prisma.UsuarioCreateInput): Promise<Usuario> {
    return this.client.usuario.create({ data });
  }
}
