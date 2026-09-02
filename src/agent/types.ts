import { Projeto, Horizonte, Ambidestria, StatusProjeto, TipoRelacao } from '../types';

export interface AgentFactor {
  regra: string;
  peso: number;
  descricao: string;
}

export interface AgentClassificationResult {
  horizonte: Horizonte;
  ambidestria: Ambidestria;
  complexidadeOperacional: 1 | 2 | 3 | 4 | 5;
  confianca: number; // 0 a 100%
  motivos: string[];
  fatores: AgentFactor[];
  projetosSemelhantes: {
    projetoId: string;
    titulo: string;
    horizonte: Horizonte;
    similaridadeScore: number; // 0 a 100
    predominanciaMotivo: string;
  }[];
}

export interface AgentDialogueQuestion {
  campoRelacionado: 'horizonte' | 'ambidestria' | 'complexidadeOperacional' | 'conexao';
  pergunta: string;
  contexto: string;
  sugestaoAgente: any;
  decisaoHumana: any;
  confiancaAntes: number;
}

export interface AgentConnectionSuggestion {
  projetoOrigemId: string;
  projetoDestinoId: string;
  tituloDestino: string;
  papel: 'dependencia' | 'habilitador' | 'evolucao' | 'oportunidade' | 'alternativa' | 'complementar' | 'sucessor';
  motivo: string;
  confianca: number;
}

export interface StrategicPathSequence {
  tituloCaminho: string;
  descricao: string;
  projetosEnvolvidos: {
    id: string;
    titulo: string;
    horizonte: Horizonte;
    complexidade: number;
  }[];
  complexidadeAcumulada: number;
  oportunidadesAlternativas: string[];
}
