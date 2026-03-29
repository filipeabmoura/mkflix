import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEFAULT_ADMIN_EMAIL = "admin@mkflix.com";
const DEFAULT_ADMIN_PASSWORD = "admin123";
const DEFAULT_ADMIN_NOME = "Administrador";

async function main(): Promise<void> {
  const email = process.env.SEED_ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAIL;
  const plainPassword = process.env.SEED_ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD;
  const senha = await bcrypt.hash(plainPassword, 10);

  await prisma.usuario.upsert({
    where: { email },
    create: {
      nome: DEFAULT_ADMIN_NOME,
      email,
      senha,
      tipo: "admin"
    },
    update: {
      nome: DEFAULT_ADMIN_NOME,
      senha,
      tipo: "admin"
    }
  });
}

void main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
