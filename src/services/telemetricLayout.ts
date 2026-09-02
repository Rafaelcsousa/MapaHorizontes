import { Projeto, Horizonte } from '../types';

export interface GridRowBands {
  h3Top: number;
  h3Bottom: number;
  h2Top: number;
  h2Bottom: number;
  h1Top: number;
  h1Bottom: number;
}

export class TelemetricHorizonStore {
  /**
   * Limites em % de Y para cada uma das 3 Linhas do Grid
   */
  public static readonly GRID_BANDS: GridRowBands = {
    h3Top: 5,      // Horizonte 3 — Visão / Estratégico (Linha Superior)
    h3Bottom: 32,
    h2Top: 36,     // Horizonte 2 — Gerenciamento / Ideias (Linha Média)
    h2Bottom: 64,
    h1Top: 68,     // Horizonte 1 — Operacional / Produção (Linha Inferior)
    h1Bottom: 94,
  };

  /**
   * Obtém a faixa de Y em % para o Horizonte selecionado
   */
  public static getHorizonYLimits(horizonte: Horizonte): { yMin: number; yMax: number } {
    switch (horizonte) {
      case 3:
        return { yMin: this.GRID_BANDS.h3Top, yMax: this.GRID_BANDS.h3Bottom };
      case 2:
        return { yMin: this.GRID_BANDS.h2Top, yMax: this.GRID_BANDS.h2Bottom };
      case 1:
      default:
        return { yMin: this.GRID_BANDS.h1Top, yMax: this.GRID_BANDS.h1Bottom };
    }
  }

  /**
   * Restringe estritamente as coordenadas (X, Y) para a Linha do Grid correspondente ao Horizonte
   */
  public static clampToHorizon(
    x: number, 
    y: number, 
    horizonte: Horizonte
  ): { x: number; y: number } {
    const limits = this.getHorizonYLimits(horizonte);

    // X restrito entre 4% e 94% da largura da tela
    const clampedX = Math.min(94, Math.max(4, x));
    
    // Y restrito estritamente dentro da faixa da Linha do Grid correspondente
    const clampedY = Math.min(limits.yMax, Math.max(limits.yMin, y));

    return { x: clampedX, y: clampedY };
  }

  /**
   * Distribui automaticamente um projeto em uma vaga vazia na sua Linha do Grid
   */
  public static calculateAutomaticSlot(
    projeto: Projeto,
    horizonteProjetos: Projeto[],
    indexInHorizon: number
  ): { x: number; y: number } {
    const total = Math.max(1, horizonteProjetos.length);
    const limits = this.getHorizonYLimits(projeto.horizonte || 1);

    // Distribuição horizontal (X) uniforme na linha
    const stepX = 86 / (total + 1);
    const posX = 7 + (indexInHorizon + 1) * stepX;

    // Y centralizado na faixa da linha com pequena variação alternada
    const midY = (limits.yMin + limits.yMax) / 2;
    const offsetY = (indexInHorizon % 2 === 0 ? -3 : 3);
    const posY = midY + offsetY;

    return this.clampToHorizon(posX, posY, projeto.horizonte || 1);
  }
}
