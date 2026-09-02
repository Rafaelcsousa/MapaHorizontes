import { Projeto, Dialogo } from '../types';
import { RuleEngine } from './RuleEngine';
import { SimilarityEngine } from './SimilarityEngine';
import { ConfidenceEngine } from './ConfidenceEngine';
import { DialogueEngine } from './DialogueEngine';
import { FeedbackEngine } from './FeedbackEngine';
import { ConnectionEngine } from './ConnectionEngine';
import { PathEngine } from './PathEngine';
import { AgentClassificationResult, AgentDialogueQuestion, AgentConnectionSuggestion, StrategicPathSequence } from './types';

export class StrategicAgent {
  private ruleEngine: RuleEngine;

  constructor() {
    this.ruleEngine = new RuleEngine();
  }

  /**
   * Executa a análise completa do projeto utilizando todos os submotores
   */
  public analyzeProject(
    projeto: { titulo: string; descricao: string; status?: string; relacoes?: any[] },
    projetosExistentes: Projeto[]
  ): AgentClassificationResult {
    // 1. Avalia regras heurísticas (RuleEngine)
    const ruleEval = this.ruleEngine.evaluate(projeto, projetosExistentes);

    // 2. Avalia similaridade com projetos existentes (SimilarityEngine)
    const projetosSemelhantes = SimilarityEngine.findSimilarProjects(projeto, projetosExistentes);

    // 3. Calcula a confiança dinâmica (ConfidenceEngine)
    const confianca = ConfidenceEngine.calculateConfidence(
      ruleEval.fatores,
      projetosSemelhantes.length,
      ruleEval.motivos.length,
      false
    );

    return {
      horizonte: ruleEval.horizonteSugerido,
      ambidestria: ruleEval.ambidestriaSugerida,
      complexidadeOperacional: ruleEval.complexidadeCalculada,
      confianca,
      motivos: ruleEval.motivos,
      fatores: ruleEval.fatores,
      projetosSemelhantes,
    };
  }

  /**
   * Executa o DialogueEngine de curiosidade controlada
   */
  public checkCuriosityQuestion(
    projetoId: string,
    projetoTitulo: string,
    sugestao: { horizonte: number; ambidestria: string; complexidadeOperacional: number; motivos: string[]; confianca: number },
    decisaoHumana: { horizonte: number; ambidestria: string; complexidadeOperacional: number },
    historicoDialogos: Dialogo[]
  ): AgentDialogueQuestion | null {
    return DialogueEngine.evaluateCuriosity(
      projetoId,
      projetoTitulo,
      sugestao,
      decisaoHumana,
      historicoDialogos
    );
  }

  /**
   * Registra a resposta humana de feedback na coleção dialogos
   */
  public async recordUserFeedback(
    projetoId: string,
    question: AgentDialogueQuestion,
    respostaUsuario: string
  ): Promise<string> {
    return await FeedbackEngine.recordFeedback(projetoId, question, respostaUsuario);
  }

  /**
   * Sugere conexões estratégicas entre projetos
   */
  public suggestConnections(
    projeto: Projeto,
    projetosExistentes: Projeto[]
  ): AgentConnectionSuggestion[] {
    return ConnectionEngine.suggestConnections(projeto, projetosExistentes);
  }

  /**
   * Constrói caminhos estratégicos de longo prazo
   */
  public getStrategicPaths(projetos: Projeto[]): StrategicPathSequence[] {
    return PathEngine.constructStrategicPaths(projetos);
  }
}

// Instância singleton pronta para exportação
export const strategicAgent = new StrategicAgent();
