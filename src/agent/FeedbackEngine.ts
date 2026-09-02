import { addDialogoBD } from '../lib/firebase';
import { AgentDialogueQuestion } from './types';

export class FeedbackEngine {
  /**
   * Grava o feedback do agente na coleção `dialogos` utilizando o tipo `feedback_agente`
   */
  public static async recordFeedback(
    projetoId: string,
    question: AgentDialogueQuestion,
    respostaUsuario: string
  ): Promise<string> {
    const conteudoFormatado = `
**Campo analisado**: ${question.campoRelacionado}
**Sugestão do Agente**: ${question.sugestaoAgente}
**Decisão Humana**: ${question.decisaoHumana}
**Pergunta do Agente**: ${question.pergunta}
**Justificativa/Resposta do Usuário**: ${respostaUsuario}
**Confiança Inicial**: ${question.confiancaAntes}%
`.trim();

    return await addDialogoBD({
      projetoId,
      tipo: 'feedback_agente' as any,
      titulo: `Feedback do Agente: ${question.campoRelacionado}`,
      conteudo: conteudoFormatado,
    });
  }
}
