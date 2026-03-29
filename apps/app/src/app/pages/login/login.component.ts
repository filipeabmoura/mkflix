import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit, inject } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { EApiCodes } from "@mk/model";
import { finalize } from "rxjs";
import { extrairErroApi, mensagemErroHttp } from "../../core/api-error";
import { AuthService } from "../../core/services/auth.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"]
})
export class LoginComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);

  private readonly auth = inject(AuthService);

  private readonly router = inject(Router);

  private readonly route = inject(ActivatedRoute);

  readonly formulario = this.formBuilder.nonNullable.group({
    email: ["", [Validators.required, Validators.email]],
    senha: ["", [Validators.required, Validators.minLength(6)]]
  });

  carregando = false;

  mensagemErro: string | null = null;

  mensagemInfo: string | null = null;

  ngOnInit(): void {
    if (this.route.snapshot.queryParamMap.get("cadastro") === "ok") {
      this.mensagemInfo = "Cadastro concluído. Faça login para continuar.";
    }
  }

  enviar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.mensagemErro = null;
    this.carregando = true;
    const { email, senha } = this.formulario.getRawValue();
    this.auth
      .login({ email, senha })
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: () => {
          void this.router.navigate(["/home"]);
        },
        error: (erro: HttpErrorResponse) => {
          this.mensagemErro = mensagemErroHttp(erro);
          const api = extrairErroApi(erro);
          if (api?.mkCode === EApiCodes.Credenciais_Invalidas) {
            this.mensagemErro =
              api.message ?? "E-mail ou senha inválidos. Verifique e tente de novo.";
          }
        }
      });
  }
}
