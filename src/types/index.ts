export type Horizonte = 1 | 2 | 3;

export type Ambidestria = 'explotacao' | 'ambidestria' | 'exploracao';

export type StatusProjeto = 
  | 'finalizado' 
  | 'teste' 
  | 'operando' 
  | 'proxima_etapa' 
  | 'planejamento' 
  | 'idealizado'
  | string;

export type TipoRelacao = 'principal' | 'oportunidade' | 'dependencia' | 'alternativa';

export interface Relacao {
  projetoDestinoId: string;
  tipo: TipoRelacao;
}

export interface Posicao {
  x: number; // Porcentagem no canvas (0-100)
  y: number; // Porcentagem no canvas (0-100)
}

export interface ConteinerItem {
  id: string;
  nome: string;
  tipo: 'frontend_spa' | 'postgresql_tab' | 'firestore_col' | 'redis_cache' | 'object_storage' | 'analytics_dashboard' | string;
  resumoTecnico: string;
  tecnologias: string;
  tabelasOuColecoes?: string;
}

export interface ComponenteItem {
  id: string;
  nome: string;
  tipo: 'funcao_regra' | 'fluxo_ocorrencia' | 'algoritmo_preditivo' | 'calculo_kpi' | string;
  regraNegocioCodigo?: string;
  descricaoFluxo: string;
  permissaoCargo?: string;
}

export interface CodigoSchemaItem {
  id: string;
  nomeArquivo: string;
  tipoArtefato: 'ddl_postgres' | 'schema_firestore' | 'contrato_api' | string;
  estruturaDetalhada: string;
  notasArquiteturais?: string;
}

export interface ClassificacaoSugestao {
  horizonte: Horizonte;
  ambidestria: Ambidestria;
  complexidadeOperacional: 1 | 2 | 3 | 4 | 5;
  motivos: string[];
  confianca: number;
  projetosRelacionadosSugeridos?: any[];
  horizonteSugestao?: Horizonte;
  ambidestriaSugestao?: Ambidestria;
  complexidadeSugestao?: 1 | 2 | 3 | 4 | 5;
  motivoAgente?: string;
  confiancaAgente?: number;
}

export interface Projeto {
  id: string;
  titulo: string;
  descricao: string;
  imagemUrl?: string;
  status: StatusProjeto;
  horizonte: Horizonte;
  ambidestria: Ambidestria;
  complexidadeOperacional: 1 | 2 | 3 | 4 | 5;
  confiancaClassificacao?: number;
  posicao: Posicao;
  relacoes: Relacao[];
  contexto?: string; // Macrosistema / Coleção (ex: Sistema SIGAP, Inovação & IA, etc.)
  detalhesTecnicos?: string;
  bancosDados?: string;
  observacoesTecnicas?: string;
  
  // Subcoleções do C4 Model
  conteineresList?: ConteinerItem[];
  componentesList?: ComponenteItem[];
  codigosList?: CodigoSchemaItem[];

  criadoEm?: any;
  atualizadoEm?: any;
}

// 5 Níveis de Zoom do C4 Model:
export type C4ViewMode = 'contextos' | 'iniciativas' | 'conteineres' | 'componentes' | 'codigos';

export interface ContextoNode {
  id: string;
  nome: string;
  quantidadeProjetos: number;
  posicao: { x: number; y: number };
  projetos: Projeto[];
}

export interface ConexaoContexto {
  origemId: string;
  destinoId: string;
  quantidadeConexoes: number;
}

export type TipoDialogo = 
  | 'dialogo' 
  | 'atividade' 
  | 'ideia' 
  | 'etapa' 
  | 'agenda' 
  | 'documento' 
  | 'observacao' 
  | 'decisao'
  | 'feedback_agente'
  | string;

export type StatusAtividade = 'aberta' | 'pendente' | 'em_andamento' | 'concluido' | 'concluida' | 'cancelado' | 'cancelada' | string;

export interface Dialogo {
  id: string;
  projetoId: string;
  tipo?: TipoDialogo;
  titulo?: string;
  conteudo?: string;
  pergunta?: string;
  resposta?: string;
  confianca?: number;
  statusAtividade?: StatusAtividade;
  dataInicio?: string;
  dataLimite?: string;
  nomeDocumento?: string;
  urlDocumento?: string;
  status?: 'sucesso' | 'em_analise' | 'revisar' | string;
  criadoEm?: any;
  atualizadoEm?: any;
}
