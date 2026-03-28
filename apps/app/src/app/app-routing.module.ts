import { NgModule } from "@angular/core";
import { RouterModule, type Routes } from "@angular/router";
import { AdminGuard } from "./core/guards/admin.guard";
import { AuthGuard } from "./core/guards/auth.guard";
import { GuestGuard } from "./core/guards/guest.guard";
import { MainShellComponent } from "./layout/main-shell/main-shell.component";
import { CadastroComponent } from "./pages/cadastro/cadastro.component";
import { FavoritosComponent } from "./pages/favoritos/favoritos.component";
import { HomeComponent } from "./pages/home/home.component";
import { LoginComponent } from "./pages/login/login.component";
import { AssistidosComponent } from "./pages/assistidos/assistidos.component";
import { RankingsAssistidosComponent } from "./pages/admin/rankings/rankings-assistidos/rankings-assistidos.component";
import { RankingsFavoritosComponent } from "./pages/admin/rankings/rankings-favoritos/rankings-favoritos.component";
import { UsuariosAdminComponent } from "./pages/admin/usuarios/usuarios-admin.component";
import { DetalheUsuarioComponent } from "./pages/admin/usuarios/detalhe-usuario/detalhe-usuario.component";
import { CadastrarAdminComponent } from "./pages/admin/cadastrar-admin/cadastrar-admin.component";

const rotas: Routes = [
  { path: "login", component: LoginComponent, canActivate: [GuestGuard] },
  { path: "cadastro", component: CadastroComponent, canActivate: [GuestGuard] },
  {
    path: "",
    component: MainShellComponent,
    canActivate: [AuthGuard],
    children: [
      { path: "home", component: HomeComponent },
      { path: "assistidos", component: AssistidosComponent },
      { path: "favoritos", component: FavoritosComponent },
      {
        path: "admin",
        canActivate: [AdminGuard],
        children: [
          {
            path: "rankings/assistidos",
            component: RankingsAssistidosComponent
          },
          {
            path: "rankings/favoritos",
            component: RankingsFavoritosComponent
          },
          { path: "usuarios", component: UsuariosAdminComponent },
          { path: "usuarios/:id", component: DetalheUsuarioComponent },
          { path: "cadastrar-admin", component: CadastrarAdminComponent }
        ]
      },
      { path: "", pathMatch: "full", redirectTo: "home" }
    ]
  },
  { path: "**", redirectTo: "home" }
];

@NgModule({
  imports: [RouterModule.forRoot(rotas)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
