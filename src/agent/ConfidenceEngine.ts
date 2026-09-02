import { AgentFactor } from './types';

export class ConfidenceEngine {
  /**
   * Calcula o score de confiança (0 a 100%) da classificação do agente
   */
  public static calculateConfidence(
    fatores: AgentFactor[],
    similarCount: number,
    motivosCount: number,
    temContradicao: boolean
  ): number {
    let baseConfidence = 60;

    // Bônus por quantidade de evidências/fatores
    const fatoresBonus = Math.min(25, fatores.length * 5);
    baseConfidence += fatoresBonus;

    // Bônus por projetos semelhantes encontrados no histórico
    if (similarCount > 0) {
      baseConfidence += Math.min(15, similarCount * 4);
    }

    // Penalidade se houver dados contraditórios
    if (temContradicao) {
      baseConfidence -= 20;
    }

    return Math.min(95, Math.max(35, baseConfidence));
  }
}
