import { HttpStatus, Injectable } from "@nestjs/common";
import type {
  IAssistido,
  IFavorito,
  IFilme,
  IFilmeEstadoItem,
  ISincronizarFilmeBody,
  IUsuarioFilmeMarcacao
} from "@mk/model";
import { EApiCodes } from "@mk/model";
import { MkException } from "../../core/exceptions/mk.exception";
import { FilmeService } from "../filme/filme.service";
import { filmeParaResposta } from "../filme/filme.utils";
import { AssistidoDAO } from "./assistido.dao";
import { FavoritoDAO } from "./favorito.dao";
import {
  assistidoParaResposta,
  dedupeImdbIdsPreservandoOrdem,
  favoritoParaResposta
} from "./listas-filme.utils";

@Injectable()
export class ListasFilmeService {
  constructor(
    private readonly filmeService: FilmeService,
    private readonly favoritoDAO: FavoritoDAO,
    private readonly assistidoDAO: AssistidoDAO
  ) {}

  async adicionarFavorito(
    usuarioId: number,
    corpo: ISincronizarFilmeBody
  ): Promise<IFavorito> {
    const filme = await this.filmeService.sincronizarPorImdbId(corpo.imdbId);
    const assistido = await this.assistidoDAO.exists(usuarioId, filme.id);
    if (!assistido) {
      throw new MkException(
        "Marque o filme como assistido antes de favoritar.",
        HttpStatus.CONFLICT,
        EApiCodes.Favorito_Sem_Assistido,
        "error",
        { imdbId: filme.imdbId, filme }
      );
    }
    const jaFavorito = await this.favoritoDAO.exists(usuarioId, filme.id);
    if (jaFavorito) {
      throw new MkException(
        "Este filme já está nos favoritos.",
        HttpStatus.CONFLICT,
        EApiCodes.Favorito_Ja_Existe,
        "error",
        { filmeId: filme.id, imdbId: filme.imdbId }
      );
    }
    const criado = await this.favoritoDAO.create(usuarioId, filme.id);
    return favoritoParaResposta(criado);
  }

  async removerFavorito(usuarioId: number, filmeId: number): Promise<void> {
    const removidos = await this.favoritoDAO.deleteByUsuarioAndFilme(
      usuarioId,
      filmeId
    );
    if (removidos === 0) {
      throw new MkException(
        "Favorito não encontrado.",
        HttpStatus.NOT_FOUND,
        EApiCodes.Nao_Encontrado
      );
    }
  }

  async adicionarAssistido(
    usuarioId: number,
    corpo: ISincronizarFilmeBody
  ): Promise<IAssistido> {
    const filme = await this.filmeService.sincronizarPorImdbId(corpo.imdbId);
    const jaAssistido = await this.assistidoDAO.exists(usuarioId, filme.id);
    if (jaAssistido) {
      throw new MkException(
        "Este filme já está marcado como assistido.",
        HttpStatus.CONFLICT,
        EApiCodes.Assistido_Ja_Existe,
        "error",
        { filmeId: filme.id, imdbId: filme.imdbId }
      );
    }
    const criado = await this.assistidoDAO.create(usuarioId, filme.id);
    return assistidoParaResposta(criado);
  }

  async removerAssistido(usuarioId: number, filmeId: number): Promise<void> {
    const removidos = await this.assistidoDAO.deleteByUsuarioAndFilme(
      usuarioId,
      filmeId
    );
    if (removidos === 0) {
      throw new MkException(
        "Registro de assistido não encontrado.",
        HttpStatus.NOT_FOUND,
        EApiCodes.Nao_Encontrado
      );
    }
    await this.favoritoDAO.deleteByUsuarioAndFilme(usuarioId, filmeId);
  }

  async listarFavoritosMarcacao(
    usuarioId: number
  ): Promise<IUsuarioFilmeMarcacao[]> {
    const linhas = await this.favoritoDAO.listarPorUsuarioComFilme(usuarioId);
    return linhas.map((row) => ({
      filme: filmeParaResposta(row.filme),
      marcadoEm: row.createdAt.toISOString()
    }));
  }

  async listarAssistidosMarcacao(
    usuarioId: number
  ): Promise<IUsuarioFilmeMarcacao[]> {
    const linhas = await this.assistidoDAO.listarPorUsuarioComFilme(usuarioId);
    return linhas.map((row) => ({
      filme: filmeParaResposta(row.filme),
      marcadoEm: row.createdAt.toISOString()
    }));
  }

  async estadoFilmesPorImdbIds(
    usuarioId: number,
    imdbIds: string[]
  ): Promise<IFilmeEstadoItem[]> {
    const ordenados = dedupeImdbIdsPreservandoOrdem(imdbIds);
    const mapaFilmes = await this.filmeService.obterMapaFilmesPorImdbIds(ordenados);
    const filmeIds = ordenados
      .map((imdb) => mapaFilmes.get(imdb)?.id)
      .filter((id): id is number => id !== undefined);

    const [favoritos, assistidos] = await Promise.all([
      this.favoritoDAO.findByUsuarioAndFilmeIds(usuarioId, filmeIds),
      this.assistidoDAO.findByUsuarioAndFilmeIds(usuarioId, filmeIds)
    ]);

    const favoritoPorFilmeId = new Set(favoritos.map((f) => f.filmeId));
    const assistidoPorFilmeId = new Set(assistidos.map((a) => a.filmeId));

    return ordenados.map((imdbId) => {
      const filme: IFilme | undefined = mapaFilmes.get(imdbId);
      if (filme === undefined) {
        return { imdbId, assistido: false, favorito: false, filmeId: null };
      }
      return {
        imdbId,
        assistido: assistidoPorFilmeId.has(filme.id),
        favorito: favoritoPorFilmeId.has(filme.id),
        filmeId: filme.id
      };
    });
  }
}
