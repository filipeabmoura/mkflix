import { HttpException, HttpStatus } from "@nestjs/common";
import { EApiCodes } from "@mk/model";

export class MkException extends HttpException {
  public readonly mkCode: EApiCodes;

  public readonly tipo: "error" | "warn";

  constructor(
    message: string,
    status: HttpStatus,
    mkCode: EApiCodes,
    tipo: "error" | "warn" = "error"
  ) {
    super({ message, mkCode, tipo }, status);
    this.mkCode = mkCode;
    this.tipo = tipo;
  }
}
