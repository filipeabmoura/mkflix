import { z } from "zod";
import type { IPaginacaoAdminQuery } from "@mk/model";
import type { MkValidator } from "../../core/validation/mk.validator";

const paginacaoAdminSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20)
});

export class PaginacaoAdminValidator implements MkValidator<IPaginacaoAdminQuery> {
  validate(value: unknown): IPaginacaoAdminQuery {
    return paginacaoAdminSchema.parse(value);
  }
}
