import { HttpErrorResponse } from "@angular/common/http";
import { Component, inject } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { EApiCodes } from "@mk/model";
import { finalize } from "rxjs";
import { extrairErroApi, mensagemErroHttp } from "../../core/api-error";
import { AuthService } from "../../core/services/auth.service";

@Component({
  selector: "app-cadastro",
  templateUrl: "./cadastro.component.html",
  styleUrls: ["./cadastro.component.css"]
})
export class CadastroComponent {
  private readonly formBuilder = inject(FormBuilder);

  private readonly auth = inject(AuthService);

  private readonly router = inject(Router);

  readonly formulario = this.formBuilder.nonNullable.group({
    nome: ["", [Validators.required, Validators.minLength(2)]],
    email: ["", [Validators.required, Validators.email]],
    senha: ["", [Validators.required, Validators.minLength(6)]]
  });

  carregando = false;

  mensagemErro: string | null = null;

  enviar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.mensagemErro = null;
    this.carregando = true;
    const dados = this.formulario.getRawValue();
    this.auth
      .cadastro(dados)
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: () => {
          void this.router.navigate(["/login"], {
            queryParams: { cadastro: "ok" }
          });
        },
        error: (erro: HttpErrorResponse) => {
          const api = extrairErroApi(erro);
          if (api?.mkCode === EApiCodes.Email_Ja_Cadastrado) {
            this.mensagemErro =
              "Este e-mail já está cadastrado. Use outro e-mail ou faça login.";
            return;
          }
          this.mensagemErro = mensagemErroHttp(erro);
        }
      });
  }
}
