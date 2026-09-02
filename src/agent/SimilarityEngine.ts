import { Projeto } from '../types';

const STOPWORDS = new Set([
  'de', 'a', 'o', 'que', 'e', 'do', 'da', 'em', 'um', 'para', 'com', 'não', 'uma', 'os', 'no', 'se',
  'na', 'por', 'mais', 'as', 'dos', 'como', 'mas', 'ao', 'ele', 'das', 'à', 'seu', 'sua', 'ou',
  'quando', 'muito', 'nos', 'já', 'eu', 'também', 'só', 'pelo', 'pela', 'até', 'isso', 'ela', 'entre',
  'depois', 'sem', 'mesmo', 'aos', 'seus', 'quem', 'nas', 'me', 'esse', 'eles', 'você', 'essa', 'num'
]);

export class SimilarityEngine {
  public static tokenize(text: string): string[] {
    if (!text) return [];
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 2 && !STOPWORDS.has(t));
  }

  public static calculateJaccard(tokensA: string[], tokensB: string[]): number {
    if (tokensA.length === 0 || tokensB.length === 0) return 0;
    const setA = new Set(tokensA);
    const setB = new Set(tokensB);

    let intersection = 0;
    setA.forEach(t => { if (setB.has(t)) intersection++; });

    const union = setA.size + setB.size - intersection;
    return union === 0 ? 0 : intersection / union;
  }

  public static findSimilarProjects(
    projeto: { titulo: string; descricao: string },
    projetosExistentes: Projeto[]
  ) {
    const tokensTarget = [...this.tokenize(projeto.titulo), ...this.tokenize(projeto.descricao)];
    
    const resultados = projetosExistentes.map(p => {
      const tokensP = [...this.tokenize(p.titulo), ...this.tokenize(p.descricao)];
      const sim = this.calculateJaccard(tokensTarget, tokensP);
      
      return {
        projetoId: p.id,
        titulo: p.titulo,
        horizonte: p.horizonte,
        similaridadeScore: Math.round(sim * 100),
        predominanciaMotivo: `Possui alta semelhança de termos e escopo (${Math.round(sim * 100)}% de similaridade)`
      };
    });

    return resultados
      .filter(r => r.similaridadeScore > 12)
      .sort((a, b) => b.similaridadeScore - a.similaridadeScore);
  }
}
