import { NgModule } from "@angular/core";
import { RouterModule, type Routes } from "@angular/router";
import { AuthGuard } from "./core/guards/auth.guard";
import { GuestGuard } from "./core/guards/guest.guard";
import { MainShellComponent } from "./layout/main-shell/main-shell.component";
import { CadastroComponent } from "./pages/cadastro/cadastro.component";
import { FavoritosComponent } from "./pages/favoritos/favoritos.component";
import { HomeComponent } from "./pages/home/home.component";
import { LoginComponent } from "./pages/login/login.component";
import { AssistidosComponent } from "./pages/assistidos/assistidos.component";

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
