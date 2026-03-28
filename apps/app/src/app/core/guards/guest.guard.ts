import { Injectable } from "@angular/core";
import {
  CanActivate,
  Router,
  type UrlTree
} from "@angular/router";
import { AuthService } from "../services/auth.service";

@Injectable({ providedIn: "root" })
export class GuestGuard implements CanActivate {
  constructor(
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

  canActivate(): boolean | UrlTree {
    if (!this.auth.estaAutenticado) {
      return true;
    }
    return this.router.createUrlTree(["/home"]);
  }
}
