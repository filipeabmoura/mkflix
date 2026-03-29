import { Component, OnDestroy, OnInit } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { filter, Subscription } from "rxjs";
import { AuthService } from "../../core/services/auth.service";

@Component({
  selector: "app-main-shell",
  templateUrl: "./main-shell.component.html",
  styleUrls: ["./main-shell.component.css"]
})
export class MainShellComponent implements OnInit, OnDestroy {
  menuAberto = false;

  tituloPagina = "MkFlix";

  private sub?: Subscription;

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.sub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        this.atualizarTitulo();
      });
    this.atualizarTitulo();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  alternarMenu(): void {
    this.menuAberto = !this.menuAberto;
  }

  fecharMenu(): void {
    this.menuAberto = false;
  }

  sair(): void {
    this.auth.logout();
    void this.router.navigate(["/login"]);
  }

  get nomeUsuario(): string {
    return this.auth.usuarioAtual?.nome ?? "";
  }

  get isAdmin(): boolean {
    return this.auth.usuarioAtual?.tipo === "admin";
  }

  private atualizarTitulo(): void {
    const url = this.router.url.split("?")[0];
    if (url.startsWith("/assistidos")) {
      this.tituloPagina = "Assistidos";
    } else if (url.startsWith("/favoritos")) {
      this.tituloPagina = "Favoritos";
    } else if (url.includes("/admin/rankings/assistidos")) {
      this.tituloPagina = "Ranking — Assistidos";
    } else if (url.includes("/admin/rankings/favoritos")) {
      this.tituloPagina = "Ranking — Favoritos";
    } else if (/\/admin\/usuarios\/\d+/.test(url)) {
      this.tituloPagina = "Detalhe do Usuário";
    } else if (url.startsWith("/admin/usuarios")) {
      this.tituloPagina = "Usuários";
    } else if (url.startsWith("/admin/cadastrar-admin")) {
      this.tituloPagina = "Cadastrar Admin";
    } else {
      this.tituloPagina = "Início";
    }
  }
}
