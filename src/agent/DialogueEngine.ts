import { Dialogo } from '../types';
import { AgentDialogueQuestion } from './types';

export class DialogueEngine {
  /**
   * Avalia se o agente deve iniciar uma pergunta de curiosidade controlada.
   * Verifica o histórico de diálogos anteriores para EVITAR REPETIÇÃO.
   */
  public static evaluateCuriosity(
    projetoId: string,
    projetoTitulo: string,
    sugestao: { horizonte: number; ambidestria: string; complexidadeOperacional: number; motivos: string[]; confianca: number },
    decisaoHumana: { horizonte: number; ambidestria: string; complexidadeOperacional: number },
    historicoDialogos: Dialogo[]
  ): AgentDialogueQuestion | null {
    
    // 1. REGRA: Se a confiança for alta e a decisão humana for idêntica à sugestão, não perguntar!
    const mudouHorizonte = sugestao.horizonte !== decisaoHumana.horizonte;
    const mudouAmbidestria = sugestao.ambidestria !== decisaoHumana.ambidestria;
    const diffComplexidade = Math.abs(sugestao.complexidadeOperacional - decisaoHumana.complexidadeOperacional);
    const mudouComplexidade = diffComplexidade >= 2;

    if (!mudouHorizonte && !mudouAmbidestria && !mudouComplexidade && sugestao.confianca >= 65) {
      return null;
    }

    // 2. REGRA DE NÃO REPETIÇÃO: Verificar se já existe uma pergunta do tipo feedback_agente registrada
    const jaPerguntouProjeto = historicoDialogos.some(d => 
      d.projetoId === projetoId && d.tipo === 'feedback_agente'
    );
    if (jaPerguntouProjeto) {
      return null; // Evita perguntar novamente no mesmo projeto
    }

    // 3. GERAR PERGUNTA CURTA, CONTEXTUAL E ESPECÍFICA

    // Caso 1: Mudança de Horizonte
    if (mudouHorizonte) {
      return {
        campoRelacionado: 'horizonte',
        pergunta: `Eu havia sugerido Horizonte ${sugestao.horizonte} porque a iniciativa ${sugestao.motivos[0] || 'possui características táticas'}. Você classificou como Horizonte ${decisaoHumana.horizonte}. Este projeto pode ser executado de forma independente sem depender de iniciativas de médio prazo?`,
        contexto: `Divergência de Horizonte: Agente sugeriu H${sugestao.horizonte}, Humano selecionou H${decisaoHumana.horizonte}.`,
        sugestaoAgente: sugestao.horizonte,
        decisaoHumana: decisaoHumana.horizonte,
        confiancaAntes: sugestao.confianca,
      };
    }

    // Caso 2: Mudança Significativa de Complexidade
    if (mudouComplexidade) {
      return {
        campoRelacionado: 'complexidadeOperacional',
        pergunta: `Eu havia sugerido Complexidade ${sugestao.complexidadeOperacional} por envolver alterações de processos ou integração. Você definiu como ${decisaoHumana.complexidadeOperacional}. Existe alguma infraestrutura ou experiência prévia disponível que reduza esse esforço?`,
        contexto: `Divergência de Complexidade: Agente sugeriu ${sugestao.complexidadeOperacional}, Humano selecionou ${decisaoHumana.complexidadeOperacional}.`,
        sugestaoAgente: sugestao.complexidadeOperacional,
        decisaoHumana: decisaoHumana.complexidadeOperacional,
        confiancaAntes: sugestao.confianca,
      };
    }

    // Caso 3: Mudança de Ambidestria
    if (mudouAmbidestria) {
      return {
        campoRelacionado: 'ambidestria',
        pergunta: `Classifiquei como ${sugestao.ambidestria} por reaproveitar estruturas existentes. Você escolheu ${decisaoHumana.ambidestria}. O que nesta iniciativa representa a principal mudança em relação ao processo atual?`,
        contexto: `Divergência de Ambidestria: Agente sugeriu ${sugestao.ambidestria}, Humano selecionou ${decisaoHumana.ambidestria}.`,
        sugestaoAgente: sugestao.ambidestria,
        decisaoHumana: decisaoHumana.ambidestria,
        confiancaAntes: sugestao.confianca,
      };
    }

    // Caso 4: Confiança Baixa
    if (sugestao.confianca < 60) {
      return {
        campoRelacionado: 'horizonte',
        pergunta: `Tenho poucas evidências anteriores para este escopo. Qual é o principal entregável ou marco esperado para o projeto "${projetoTitulo}"?`,
        contexto: `Confiança baixa (${sugestao.confianca}%).`,
        sugestaoAgente: sugestao.horizonte,
        decisaoHumana: decisaoHumana.horizonte,
        confiancaAntes: sugestao.confianca,
      };
    }

    return null;
  }
}
