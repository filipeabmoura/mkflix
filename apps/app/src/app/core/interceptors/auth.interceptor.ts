import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AuthService } from "../services/auth.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private readonly auth: AuthService) {}

  intercept(
    requisicao: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const token = this.auth.token;
    if (token === null || token.length === 0) {
      return next.handle(requisicao);
    }
    const clonada = requisicao.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next.handle(clonada);
  }
}
