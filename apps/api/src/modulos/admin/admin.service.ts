import { HttpStatus, Injectable } from "@nestjs/common";
import type {
  IPaginacaoAdminQuery,
  IPaginado,
  IRankingFilmeItem,
  IUsuario,
  IUsuarioDetalheAdmin
} from "@mk/model";
import { EApiCodes } from "@mk/model";
import { MkException } from "../../core/exceptions/mk.exception";
import { AdminDAO } from "./admin.dao";
import {
  filmePrismaParaIFilme,
  usuarioSemSenhaParaResposta
} from "./admin.utils";

@Injectable()
export class AdminService {
  constructor(private readonly adminDAO: AdminDAO) {}

  async rankingAssistidos(
    query: IPaginacaoAdminQuery
  ): Promise<IPaginado<IRankingFilmeItem>> {
    return this.rankingPorTipo(query, "assistidos");
  }

  async rankingFavoritos(
    query: IPaginacaoAdminQuery
  ): Promise<IPaginado<IRankingFilmeItem>> {
    return this.rankingPorTipo(query, "favoritos");
  }

  private async rankingPorTipo(
    query: IPaginacaoAdminQuery,
    tipo: "assistidos" | "favoritos"
  ): Promise<IPaginado<IRankingFilmeItem>> {
    const skip = (query.page - 1) * query.pageSize;
    const take = query.pageSize;
    const [totalItens, grupos] = await Promise.all([
      tipo === "assistidos"
        ? this.adminDAO.contarGruposAssistidos()
        : this.adminDAO.contarGruposFavoritos(),
      tipo === "assistidos"
        ? this.adminDAO.rankingAssistidosPagina(skip, take)
        : this.adminDAO.rankingFavoritosPagina(skip, take)
    ]);
    const filmeIds = grupos.map((g) => g.filmeId);
    const filmes = await this.adminDAO.findFilmesByIds(filmeIds);
    const mapa = new Map(filmes.map((f) => [f.id, f]));
    const itens: IRankingFilmeItem[] = grupos.map((grupo) => {
      const filme = mapa.get(grupo.filmeId);
      if (filme === undefined) {
        throw new MkException(
          "Inconsistência ao montar ranking: filme não encontrado.",
          HttpStatus.INTERNAL_SERVER_ERROR,
          EApiCodes.Validacao_Invalida
        );
      }
      return {
        filme: filmePrismaParaIFilme(filme),
        quantidade: grupo.quantidade
      };
    });
    const totalPaginas =
      totalItens === 0 ? 0 : Math.ceil(totalItens / query.pageSize);
    return {
      page: query.page,
      pageSize: query.pageSize,
      totalItens,
      totalPaginas,
      itens
    };
  }

  async listarUsuarios(
    query: IPaginacaoAdminQuery
  ): Promise<IPaginado<IUsuario>> {
    const skip = (query.page - 1) * query.pageSize;
    const take = query.pageSize;
    const [totalItens, linhas] = await Promise.all([
      this.adminDAO.contarUsuarios(),
      this.adminDAO.listarUsuariosPagina(skip, take)
    ]);
    const totalPaginas =
      totalItens === 0 ? 0 : Math.ceil(totalItens / query.pageSize);
    return {
      page: query.page,
      pageSize: query.pageSize,
      totalItens,
      totalPaginas,
      itens: linhas.map(usuarioSemSenhaParaResposta)
    };
  }

  async detalheUsuario(usuarioId: number): Promise<IUsuarioDetalheAdmin> {
    const row = await this.adminDAO.buscarUsuarioComListas(usuarioId);
    if (row === null) {
      throw new MkException(
        "Usuário não encontrado.",
        HttpStatus.NOT_FOUND,
        EApiCodes.Nao_Encontrado
      );
    }
    const { favoritos, assistidos, ...restoUsuario } = row;
    return {
      usuario: usuarioSemSenhaParaResposta(restoUsuario),
      favoritos: favoritos.map((f) => ({
        filme: filmePrismaParaIFilme(f.filme),
        marcadoEm: f.createdAt.toISOString()
      })),
      assistidos: assistidos.map((a) => ({
        filme: filmePrismaParaIFilme(a.filme),
        marcadoEm: a.createdAt.toISOString()
      }))
    };
  }
}
