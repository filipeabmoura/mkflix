import { HttpErrorResponse } from "@angular/common/http";
import { Component } from "@angular/core";
import { inject } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import type { IUsuario } from "@mk/model";
import { EApiCodes } from "@mk/model";
import { extrairErroApi, mensagemErroHttp } from "../../../core/api-error";
import { AdminService } from "../../../core/services/admin.service";

@Component({
  selector: "app-cadastrar-admin",
  templateUrl: "./cadastrar-admin.component.html",
  styleUrls: ["./cadastrar-admin.component.css"]
})
export class CadastrarAdminComponent {
  private readonly fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    nome: ["", [Validators.required, Validators.minLength(2)]],
    email: ["", [Validators.required, Validators.email]],
    senha: ["", [Validators.required, Validators.minLength(6)]]
  });

  erro: string | null = null;
  sucesso: string | null = null;
  enviando = false;
  criado: IUsuario | null = null;

  constructor(private readonly adminSvc: AdminService) {}

  enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.erro = null;
    this.sucesso = null;
    this.criado = null;
    this.enviando = true;

    const dados = this.form.getRawValue();
    this.adminSvc.cadastrarAdmin(dados).subscribe({
      next: (usuario) => {
        this.criado = usuario;
        this.sucesso = `Admin "${usuario.nome}" cadastrado com sucesso!`;
        this.form.reset();
        this.enviando = false;
      },
      error: (e: HttpErrorResponse) => {
        const api = extrairErroApi(e);
        this.erro =
          api?.mkCode === EApiCodes.Email_Ja_Cadastrado
            ? "Este e-mail já está em uso. Escolha outro."
            : mensagemErroHttp(e);
        this.enviando = false;
      }
    });
  }

  temErro(campo: string): boolean {
    const ctrl = this.form.get(campo);
    return !!(ctrl?.invalid && ctrl.touched);
  }
}
