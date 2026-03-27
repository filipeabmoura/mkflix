-- Rename existing column without data loss
ALTER TABLE "Usuario" RENAME COLUMN "senhaHash" TO "senha";

-- Rename existing enum type without recreating values/column
ALTER TYPE "TipoUsuario" RENAME TO "ETipoUsuario";
