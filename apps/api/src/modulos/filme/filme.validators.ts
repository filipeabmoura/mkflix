import { z } from "zod";
import type { IBuscaFilmesQuery, ISincronizarFilmeBody } from "@mk/model";
import type { MkValidator } from "../../core/validation/mk.validator";

const imdbIdSchema = z
  .string()
  .trim()
  .transform((v) => v.toLowerCase())
  .pipe(z.string().regex(/^tt\d+$/, "imdbId deve ser no formato tt1234567"));

const buscaFilmesQuerySchema = z.object({
  q: z.string().min(1, "Informe um termo de busca").trim(),
  page: z.coerce.number().int().min(1).default(1)
});

const sincronizarFilmeBodySchema = z.object({
  imdbId: imdbIdSchema
});

export class BuscaFilmesQueryValidator implements MkValidator<IBuscaFilmesQuery> {
  validate(value: unknown): IBuscaFilmesQuery {
    return buscaFilmesQuerySchema.parse(value);
  }
}

export class SincronizarFilmeBodyValidator
  implements MkValidator<ISincronizarFilmeBody>
{
  validate(value: unknown): ISincronizarFilmeBody {
    return sincronizarFilmeBodySchema.parse(value);
  }
}
