import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, tap } from "rxjs";
import type {
  IAuthLoginResponse,
  ICadastroUsuario,
  ILoginUsuario,
  IUsuario
} from "@mk/model";
import { ConfiguracoesService } from "./configuracoes.service";

const CHAVE_TOKEN = "mkflix_token";
const CHAVE_USUARIO = "mkflix_user";

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly usuario$ = new BehaviorSubject<IUsuario | null>(
    this.lerUsuarioArmazenado()
  );

  constructor(
    private readonly http: HttpClient,
    private readonly config: ConfiguracoesService
  ) {}

  get observarUsuario(): Observable<IUsuario | null> {
    return this.usuario$.asObservable();
  }

  get usuarioAtual(): IUsuario | null {
    return this.usuario$.value;
  }

  get token(): string | null {
    return localStorage.getItem(CHAVE_TOKEN);
  }

  get estaAutenticado(): boolean {
    return this.token !== null && this.token.length > 0;
  }

  login(credenciais: ILoginUsuario): Observable<IAuthLoginResponse> {
    return this.http
      .post<IAuthLoginResponse>(
        this.config.endpoint("auth", "login"),
        credenciais
      )
      .pipe(
        tap((resposta) => {
          this.persistirSessao(resposta.accessToken, resposta.usuario);
        })
      );
  }

  cadastro(dados: ICadastroUsuario): Observable<IUsuario> {
    return this.http.post<IUsuario>(
      this.config.endpoint("auth", "cadastro"),
      dados
    );
  }

  logout(): void {
    localStorage.removeItem(CHAVE_TOKEN);
    localStorage.removeItem(CHAVE_USUARIO);
    this.usuario$.next(null);
  }

  private persistirSessao(token: string, usuario: IUsuario): void {
    localStorage.setItem(CHAVE_TOKEN, token);
    localStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario));
    this.usuario$.next(usuario);
  }

  private lerUsuarioArmazenado(): IUsuario | null {
    const bruto = localStorage.getItem(CHAVE_USUARIO);
    if (bruto === null || bruto.length === 0) {
      return null;
    }
    try {
      return JSON.parse(bruto) as IUsuario;
    } catch {
      return null;
    }
  }
}
