import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";
import type { Response } from "express";
import { MkException } from "../exceptions/mk.exception";

@Catch(MkException, HttpException)
export class MkExceptionFilter implements ExceptionFilter {
  catch(exception: MkException | HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const payload = exception.getResponse();

    if (exception instanceof MkException) {
      const body = payload as Record<string, unknown>;
      const corpo: Record<string, unknown> = {
        statusCode: status,
        message: body.message,
        mkCode: body.mkCode,
        tipo: body.tipo
      };
      if (body.detalhes !== undefined) {
        corpo.detalhes = body.detalhes;
      }
      response.status(status).json(corpo);
      return;
    }

    if (typeof payload === "string") {
      response.status(status).json({ statusCode: status, message: payload });
      return;
    }

    if (typeof payload === "object" && payload !== null && "message" in payload) {
      const p = payload as { message: string | string[] };
      const message = Array.isArray(p.message) ? p.message.join(", ") : p.message;
      response.status(status).json({ statusCode: status, message });
      return;
    }

    response.status(status).json({ statusCode: status, message: "Erro" });
  }
}
