import { z } from "zod";
import type { IFilmesEstadoQuery, ISincronizarFilmeBody } from "@mk/model";
import type { MkValidator } from "../../core/validation/mk.validator";

const imdbIdSchema = z
  .string()
  .trim()
  .transform((v) => v.toLowerCase())
  .pipe(z.string().regex(/^tt\d+$/, "imdbId deve ser no formato tt1234567"));

const corpoImdbSchema = z.object({
  imdbId: imdbIdSchema
});

const filmesEstadoQuerySchema = z.object({
  imdbIds: z
    .string()
    .min(1, "Informe imdbIds (separados por vírgula)")
    .transform((s) =>
      s
        .split(",")
        .map((x) => x.trim())
        .filter((x) => x.length > 0)
    )
    .pipe(
      z
        .array(imdbIdSchema)
        .min(1, "Informe ao menos um imdbId")
        .max(100, "No máximo 100 imdbIds por requisição")
    )
});

export class CorpoImdbIdValidator implements MkValidator<ISincronizarFilmeBody> {
  validate(value: unknown): ISincronizarFilmeBody {
    return corpoImdbSchema.parse(value);
  }
}

export class FilmesEstadoQueryValidator implements MkValidator<IFilmesEstadoQuery> {
  validate(value: unknown): IFilmesEstadoQuery {
    return filmesEstadoQuerySchema.parse(value);
  }
}
