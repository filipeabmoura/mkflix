import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DxDataGridModule, DxPopupModule } from "devextreme-angular";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { AuthInterceptor } from "./core/interceptors/auth.interceptor";
import { MainShellComponent } from "./layout/main-shell/main-shell.component";
import { CadastroComponent } from "./pages/cadastro/cadastro.component";
import { FavoritosComponent } from "./pages/favoritos/favoritos.component";
import { HomeComponent } from "./pages/home/home.component";
import { LoginComponent } from "./pages/login/login.component";
import { AssistidosComponent } from "./pages/assistidos/assistidos.component";
import { SharedModule } from "./shared/shared.module";
import { RankingsAssistidosComponent } from "./pages/admin/rankings/rankings-assistidos/rankings-assistidos.component";
import { RankingsFavoritosComponent } from "./pages/admin/rankings/rankings-favoritos/rankings-favoritos.component";
import { UsuariosAdminComponent } from "./pages/admin/usuarios/usuarios-admin.component";
import { DetalheUsuarioComponent } from "./pages/admin/usuarios/detalhe-usuario/detalhe-usuario.component";
import { CadastrarAdminComponent } from "./pages/admin/cadastrar-admin/cadastrar-admin.component";

@NgModule({
  declarations: [
    AppComponent,
    MainShellComponent,
    LoginComponent,
    CadastroComponent,
    HomeComponent,
    AssistidosComponent,
    FavoritosComponent,
    RankingsAssistidosComponent,
    RankingsFavoritosComponent,
    UsuariosAdminComponent,
    DetalheUsuarioComponent,
    CadastrarAdminComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    DxDataGridModule,
    DxPopupModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
