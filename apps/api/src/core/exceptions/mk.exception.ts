import { HttpException, HttpStatus } from "@nestjs/common";
import { EApiCodes } from "@mk/model";

export class MkException extends HttpException {
  public readonly mkCode: EApiCodes;

  public readonly tipo: "error" | "warn";

  public readonly detalhes?: Record<string, unknown>;

  constructor(
    message: string,
    status: HttpStatus,
    mkCode: EApiCodes,
    tipo: "error" | "warn" = "error",
    detalhes?: Record<string, unknown>
  ) {
    const corpo: Record<string, unknown> = { message, mkCode, tipo };
    if (detalhes !== undefined) {
      corpo.detalhes = detalhes;
    }
    super(corpo, status);
    this.mkCode = mkCode;
    this.tipo = tipo;
    this.detalhes = detalhes;
  }
}
