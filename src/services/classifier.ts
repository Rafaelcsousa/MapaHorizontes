import { Projeto, ClassificacaoSugestao } from '../types';
import { strategicAgent } from '../agent/StrategicAgent';

export class ProjectClassifier {
  /**
   * Executa a classificação estratégica assistida através do StrategicAgent
   */
  static classify(
    novoProjeto: { titulo: string; descricao: string; status?: string; relacoes?: any[] },
    projetosExistentes: Projeto[]
  ): ClassificacaoSugestao {
    const res = strategicAgent.analyzeProject(novoProjeto, projetosExistentes);

    const projetosRelacionadosSugeridos = res.projetosSemelhantes.map(s => ({
      projetoId: s.projetoId,
      titulo: s.titulo,
      tipoRelacao: 'oportunidade' as const,
      motivo: s.predominanciaMotivo,
      score: s.similaridadeScore,
    }));

    return {
      horizonte: res.horizonte,
      ambidestria: res.ambidestria,
      complexidadeOperacional: res.complexidadeOperacional,
      motivos: res.motivos,
      confianca: res.confianca,
      projetosRelacionadosSugeridos,
    };
  }
}
