import { HttpStatus, Injectable, PipeTransform } from "@nestjs/common";
import { ZodError } from "zod";
import { EApiCodes } from "@mk/model";
import { MkException } from "../exceptions/mk.exception";
import type { MkValidator } from "./mk.validator";

@Injectable()
export class MkValidationPipe<T> implements PipeTransform {
  constructor(private readonly validator: MkValidator<T>) {}

  transform(value: unknown): T {
    try {
      return this.validator.validate(value);
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const primeira = error.errors[0];
        const message = primeira?.message ?? "Validação inválida";
        throw new MkException(
          message,
          HttpStatus.BAD_REQUEST,
          EApiCodes.Validacao_Invalida
        );
      }
      throw error;
    }
  }
}
