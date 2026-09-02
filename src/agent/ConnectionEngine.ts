import { Projeto } from '../types';
import { SimilarityEngine } from './SimilarityEngine';
import { AgentConnectionSuggestion } from './types';

export class ConnectionEngine {
  /**
   * Analisa projetos existentes e sugere conexões com categorias ricas e justificativas
   */
  public static suggestConnections(
    projeto: Projeto,
    projetosExistentes: Projeto[]
  ): AgentConnectionSuggestion[] {
    const tokensTarget = [...SimilarityEngine.tokenize(projeto.titulo), ...SimilarityEngine.tokenize(projeto.descricao)];
    const sugestoes: AgentConnectionSuggestion[] = [];

    projetosExistentes.forEach(dest => {
      if (dest.id === projeto.id) return;

      const tokensDest = [...SimilarityEngine.tokenize(dest.titulo), ...SimilarityEngine.tokenize(dest.descricao)];
      const sim = SimilarityEngine.calculateJaccard(tokensTarget, tokensDest);

      if (sim > 0.12) {
        let papel: AgentConnectionSuggestion['papel'] = 'oportunidade';
        let motivo = `Sinergia de escopo e termos semelhantes (${Math.round(sim * 100)}%)`;

        if (dest.horizonte < projeto.horizonte) {
          papel = 'habilitador';
          motivo = `O projeto "${dest.titulo}" (H${dest.horizonte}) atua como habilitador ou base operacional necessária`;
        } else if (dest.horizonte > projeto.horizonte) {
          papel = 'evolucao';
          motivo = `Este projeto pode evoluir e preparar o caminho para o projeto estratégico "${dest.titulo}" (H${dest.horizonte})`;
        } else if (dest.ambidestria === projeto.ambidestria) {
          papel = 'complementar';
          motivo = `Iniciativas complementares no mesmo horizonte (H${projeto.horizonte})`;
        }

        sugestoes.push({
          projetoOrigemId: projeto.id,
          projetoDestinoId: dest.id,
          tituloDestino: dest.titulo,
          papel,
          motivo,
          confianca: Math.round(sim * 100),
        });
      }
    });

    return sugestoes.sort((a, b) => b.confianca - a.confianca).slice(0, 4);
  }
}
