import { Injectable } from "@angular/core";
import { CanActivate, Router, type UrlTree } from "@angular/router";
import { AuthService } from "../services/auth.service";

@Injectable({ providedIn: "root" })
export class AdminGuard implements CanActivate {
  constructor(
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

  canActivate(): boolean | UrlTree {
    if (this.auth.usuarioAtual?.tipo === "admin") {
      return true;
    }
    return this.router.createUrlTree(["/home"]);
  }
}
