/** Linha normalizada para grids DevExtreme (assistidos / favoritos). */
export interface ILinhaFilmeGrid {
  titulo: string;
  ano: string;
  imdbId: string;
  filmeId: number;
  marcadoEm: string;
  posterUrl?: string | null;
  assistido: boolean;
  favorito: boolean;
}
