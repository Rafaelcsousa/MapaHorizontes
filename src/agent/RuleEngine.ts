import { Projeto, Horizonte, Ambidestria } from '../types';
import { AgentFactor } from './types';

export class RuleEngine {
  // Pesos adaptativos padrão (podem ser ajustados pelo FeedbackEngine)
  private weights = {
    keywordH1: 2.0,
    keywordH2: 2.0,
    keywordH3: 2.5,
    keywordExploit: 2.0,
    keywordAmbi: 2.0,
    keywordExplore: 2.5,
    dependencyH1: 1.5,
    dependencyH2: 1.5,
  };

  /**
   * Avalia as regras heurísticas determinísticas para o projeto
   */
  public evaluate(
    projeto: { titulo: string; descricao: string; status?: string; relacoes?: any[] },
    projetosExistentes: Projeto[]
  ) {
    const textFull = (projeto.titulo + ' ' + projeto.descricao).toLowerCase();
    const fatores: AgentFactor[] = [];
    const motivos: string[] = [];

    let h1Score = 0;
    let h2Score = 0;
    let h3Score = 0;

    let expScore = 0;
    let ambScore = 0;
    let innScore = 0;

    let compScore = 2;

    // Regras de Horizonte
    const h1Keywords = ['operacao', 'operacional', 'rotina', 'suporte', 'imediato', 'urgente', 'manutencao', 'correcao', 'diario', 'semanal', 'execucao', 'ajuste', 'atualizacao'];
    const h2Keywords = ['gerencial', 'processo', 'tatico', 'reestruturacao', 'dashboard', 'indicador', 'plano', 'gestao', 'integracao', 'otimizacao', 'automacao', 'fluxo', 'coordenacao'];
    const h3Keywords = ['estratégico', 'estrategico', 'inovacao', 'longo prazo', 'futuro', 'disrupcao', 'laboratorio', 'pesquisa', 'inteligencia artificial', 'ia', 'novo modelo', 'transformacao', 'visao', 'ia generativa'];

    h1Keywords.forEach(kw => {
      if (textFull.includes(kw)) {
        h1Score += this.weights.keywordH1;
        fatores.push({ regra: 'keyword_h1', peso: this.weights.keywordH1, descricao: `Foco em rotina/operação (${kw})` });
        motivos.push(`Descrição contém foco operacional: "${kw}"`);
      }
    });

    h2Keywords.forEach(kw => {
      if (textFull.includes(kw)) {
        h2Score += this.weights.keywordH2;
        fatores.push({ regra: 'keyword_h2', peso: this.weights.keywordH2, descricao: `Foco gerencial/tático (${kw})` });
        motivos.push(`Descrição indica objetivo gerencial/tático: "${kw}"`);
      }
    });

    h3Keywords.forEach(kw => {
      if (textFull.includes(kw)) {
        h3Score += this.weights.keywordH3;
        fatores.push({ regra: 'keyword_h3', peso: this.weights.keywordH3, descricao: `Visão estratégica/futuro (${kw})` });
        motivos.push(`Descrição indica inovação estratégica de longo prazo: "${kw}"`);
      }
    });

    // Regras de Ambidestria
    const expKeywords = ['eficiencia', 'reforco', 'reducao de custo', 'estabilidade', 'padronizacao', 'otimizar', 'melhoria continua', 'qualidade', 'execucao'];
    const ambKeywords = ['ponte', 'transicao', 'integrar', 'modernizacao', 'migracao', 'conectar', 'escala', 'digitalizacao'];
    const innKeywords = ['inovacao', 'descoberta', 'hipotese', 'experimento', 'novo', 'pesquisa', 'futuro', 'exploracao', 'prototipo'];

    expKeywords.forEach(kw => { if (textFull.includes(kw)) expScore += this.weights.keywordExploit; });
    ambKeywords.forEach(kw => { if (textFull.includes(kw)) ambScore += this.weights.keywordAmbi; });
    innKeywords.forEach(kw => { if (textFull.includes(kw)) innScore += this.weights.keywordExplore; });

    // Regras de Conexões e Dependências
    const relacoes = projeto.relacoes || [];
    if (relacoes.length > 0) {
      fatores.push({ regra: 'relacoes_count', peso: relacoes.length, descricao: `Possui ${relacoes.length} conexões com outros projetos` });
      relacoes.forEach(rel => {
        const dest = projetosExistentes.find(p => p.id === rel.projetoDestinoId);
        if (dest) {
          if (dest.horizonte === 1) {
            h2Score += this.weights.dependencyH1;
            motivos.push(`Depende do projeto operacional (H1) "${dest.titulo}"`);
          } else if (dest.horizonte === 2) {
            h3Score += this.weights.dependencyH2;
            motivos.push(`Conectado ao projeto gerencial (H2) "${dest.titulo}"`);
          }
        }
      });
    }

    // Estimativa de Complexidade
    if (textFull.length > 250) compScore += 1;
    if (relacoes.length >= 2) compScore += 1;
    if (textFull.includes('integracao') || textFull.includes('banco de dados') || textFull.includes('alteracao de processo')) {
      compScore += 1;
      motivos.push('Exige alteração de processos ou integração de sistemas');
    }

    const complexidadeCalculada = Math.min(5, Math.max(1, compScore)) as 1 | 2 | 3 | 4 | 5;

    let horizonteSugerido: Horizonte = 2;
    if (h3Score > h2Score && h3Score > h1Score) horizonteSugerido = 3;
    else if (h1Score > h2Score && h1Score >= h3Score) horizonteSugerido = 1;
    else horizonteSugerido = 2;

    let ambidestriaSugerida: Ambidestria = 'ambidestria';
    if (expScore > ambScore && expScore > innScore) ambidestriaSugerida = 'explotacao';
    else if (innScore > expScore && innScore > ambScore) ambidestriaSugerida = 'exploracao';

    return {
      horizonteSugerido,
      ambidestriaSugerida,
      complexidadeCalculada,
      motivos,
      fatores,
      scores: { h1Score, h2Score, h3Score, expScore, ambScore, innScore }
    };
  }

  public updateWeight(regra: keyof typeof RuleEngine.prototype.weights, delta: number) {
    if (this.weights[regra] !== undefined) {
      this.weights[regra] = Math.max(0.5, Math.min(5.0, this.weights[regra] + delta));
    }
  }
}
