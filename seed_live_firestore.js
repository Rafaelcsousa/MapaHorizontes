import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  setDoc
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB3q9VeoGWNIw6LjdzPsG_MSWJMh2Sn6VA",
  authDomain: "mapahorizontes.firebaseapp.com",
  projectId: "mapahorizontes",
  storageBucket: "mapahorizontes.firebasestorage.app",
  messagingSenderId: "457711073184",
  appId: "1:457711073184:web:5b93bb26e407933d7c16c5",
  measurementId: "G-2JYRL82S67"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const MICROSSISTEMAS = [
  {
    id: "apoio",
    nome: "Sistema SIGAP (Página do Apoio)",
    sigla: "APOIO",
    descricao: "Portal do Docente, Atendimentos, PEA, Vivências e Gestão Pedagógica",
    corHex: "#2563EB",
    icone: "SIGAP",
    responsavel: "Equipe SIGAP",
    totalProjetos: 13
  },
  {
    id: "nugem",
    nome: "Módulo Nugem (Turmas Ativas)",
    sigla: "NUGEM",
    descricao: "Monitoramento de Turmas Ativas, Funil Comercial e Telemetria Diária no Firestore",
    corHex: "#7C3AED",
    icone: "IA",
    responsavel: "Equipe Nugem",
    totalProjetos: 5
  }
];

const PROJETOS_COMPLETOS = [
  // -------------------------------------------------------------
  // APOIO - H3
  // -------------------------------------------------------------
  {
    id: 'proj_apoio_h3_1',
    titulo: 'Modelo Referência Mundial em Participação Efetiva do Usuário [Meta: 95% Aprovação]',
    descricao: 'Indicador estratégico de longo prazo do Apoio para alcançar 95% de aprovação docente e >90% de resolução no 1º contato.',
    contexto: 'Sistema SIGAP',
    horizonte: 3,
    status: 'planejamento',
    ambidestria: 'exploracao',
    complexidadeOperacional: 5,
    posicao: { x: 15, y: 18 },
    detalhesTecnicos: 'dimIndicador, analiseRelatorioPeriodo, configuracaoInstitucional',
    bancosDados: 'PostgreSQL, Analytics Engine',
    relacoes: [{ projetoDestinoId: 'proj_apoio_h2_1', tipo: 'principal' }],
    conteineres: [
      { id: 'c_apoio_h3_1', nome: 'Dashboard de Engajamento e Participação', tipo: 'analytics_dashboard', resumoTecnico: 'Painel de consolidação de satisfação docente e resolução no 1º contato', tecnologias: 'React, PostgreSQL Analytics' }
    ],
    componentes: [
      { id: 'cmp_apoio_h3_1', nome: 'FNC_CONSOLIDAR_PARTICIPATION_SCORE', tipo: 'calculo_kpi', descricaoFluxo: 'Consolida aprovação pedagógica >= 95% e resolução no 1º contato > 90%' }
    ],
    codigos: [
      { id: 'cod_apoio_h3_1', nomeArquivo: 'dimIndicador.sql', tipoArtefato: 'ddl_postgres', estruturaDetalhada: 'CREATE TABLE dimIndicador (id UUID PRIMARY KEY, codigoIndicador VARCHAR, metaTarget NUMERIC(5,2));' }
    ]
  },
  {
    id: 'proj_apoio_h3_2',
    titulo: 'Fluxo Enxuto: Ocorrências Corretivas < 1% das Operações Totais',
    descricao: 'Indicador de qualidade para manter a taxa de ocorrências corretivas e chamados operacionais abaixo de 1% do volume total.',
    contexto: 'Sistema SIGAP',
    horizonte: 3,
    status: 'planejamento',
    ambidestria: 'exploracao',
    complexidadeOperacional: 5,
    posicao: { x: 30, y: 18 },
    detalhesTecnicos: 'fatoOcorrenciaAula, dimTipoOcorrenciaOperacional, fatoMetricaSistema',
    bancosDados: 'PostgreSQL',
    relacoes: [{ projetoDestinoId: 'proj_apoio_h1_1', tipo: 'principal' }],
    conteineres: [
      { id: 'c_apoio_h3_2', nome: 'Engine de Qualidade Operacional', tipo: 'postgresql_tab', resumoTecnico: 'Monitoramento contínuo de falhas técnicas e operacionais', tecnologias: 'PostgreSQL 15' }
    ],
    componentes: [
      { id: 'cmp_apoio_h3_2', nome: 'FNC_CALCULAR_TAXA_CORRETIVA', tipo: 'calculo_kpi', descricaoFluxo: 'Calcula percentual de ocorrências corretivas vs preventivas (< 1.0%)' }
    ],
    codigos: [
      { id: 'cod_apoio_h3_2', nomeArquivo: 'fatoOcorrenciaAula.sql', tipoArtefato: 'ddl_postgres', estruturaDetalhada: 'CREATE TABLE fatoOcorrenciaAula (idOcorrencia UUID PRIMARY KEY, tipoOcorrencia VARCHAR, gravidade VARCHAR);' }
    ]
  },
  {
    id: 'proj_apoio_h3_3',
    titulo: 'Satisfação & Experiência: Premiações & 100% Tratativa Registrada de Críticas',
    descricao: 'Indicador estratégico para figurar em premiações de excelência ao cliente com garantia de 100% de resposta registrada às críticas de ouvidoria.',
    contexto: 'Sistema SIGAP',
    horizonte: 3,
    status: 'planejamento',
    ambidestria: 'exploracao',
    complexidadeOperacional: 5,
    posicao: { x: 45, y: 18 },
    detalhesTecnicos: 'solicitacaoOuvidoria, dimTipoOuvidoria, fatoExperienciaUsuario',
    bancosDados: 'PostgreSQL',
    relacoes: [{ projetoDestinoId: 'proj_apoio_h1_1', tipo: 'principal' }],
    conteineres: [
      { id: 'c_apoio_h3_3', nome: 'Central de Ouvidoria & Feedbacks', tipo: 'postgresql_tab', resumoTecnico: 'Registro de manifestações com workflow de tratativa obrigatória', tecnologias: 'PostgreSQL 15' }
    ],
    componentes: [
      { id: 'cmp_apoio_h3_3', nome: 'FNC_GARANTIR_TRATATIVA_CRITICAS', tipo: 'funcao_regra', descricaoFluxo: 'Valida que 100% das críticas registradas possuam resposta e solução gravadas' }
    ],
    codigos: [
      { id: 'cod_apoio_h3_3', nomeArquivo: 'solicitacaoOuvidoria.sql', tipoArtefato: 'ddl_postgres', estruturaDetalhada: 'CREATE TABLE solicitacaoOuvidoria (id UUID PRIMARY KEY, mensagem TEXT, respostaTratativa TEXT, statusTratativa VARCHAR);' }
    ]
  },

  // -------------------------------------------------------------
  // APOIO - H2
  // -------------------------------------------------------------
  {
    id: 'proj_apoio_h2_1',
    titulo: 'Sistema de Pesquisas Complexas (PAP) & Questionários Dinâmicos',
    descricao: 'Módulo de inquéritos dinâmicos, avaliação de vivências pedagógicas e perfil de docentes.',
    contexto: 'Sistema SIGAP',
    horizonte: 2,
    status: 'teste',
    ambidestria: 'ambidestria',
    complexidadeOperacional: 3,
    posicao: { x: 20, y: 50 },
    detalhesTecnicos: 'analisePAP, dimPerguntaVivencia, analiseVivenciaResposta',
    bancosDados: 'PostgreSQL Proposto',
    relacoes: [{ projetoDestinoId: 'proj_apoio_h1_1', tipo: 'principal' }],
    conteineres: [
      { id: 'c_apoio_h2_1', nome: 'Módulo de Inquéritos PAP', tipo: 'postgresql_tab', resumoTecnico: 'Questionários dinâmicos de avaliação pedagógica', tecnologias: 'PostgreSQL JSONB' }
    ],
    componentes: [
      { id: 'cmp_apoio_h2_1', nome: 'FNC_DISPARAR_PESQUISA_PAP', tipo: 'funcao_regra', descricaoFluxo: 'Disparo automatizado de pesquisas por perfil de docente' }
    ],
    codigos: [
      { id: 'cod_apoio_h2_1', nomeArquivo: 'analisePAP.sql', tipoArtefato: 'ddl_postgres', estruturaDetalhada: 'CREATE TABLE analisePAP (id UUID PRIMARY KEY, idDocente UUID, respostas JSONB);' }
    ]
  },
  {
    id: 'proj_apoio_h2_2',
    titulo: 'RoadMap Museu & Acervo Histórico Acadêmico',
    descricao: 'Linha do tempo interativa e acervo histórico de conquistas pedagógicas da instituição.',
    contexto: 'Sistema SIGAP',
    horizonte: 2,
    status: 'teste',
    ambidestria: 'ambidestria',
    complexidadeOperacional: 3,
    posicao: { x: 40, y: 50 },
    detalhesTecnicos: 'dimAcaoExperiencia, snapshotInstitucional',
    bancosDados: 'PostgreSQL Proposto',
    relacoes: [{ projetoDestinoId: 'proj_apoio_h1_6', tipo: 'principal' }],
    conteineres: [
      { id: 'c_apoio_h2_2', nome: 'Acervo Virtual do Museu', tipo: 'postgresql_tab', resumoTecnico: 'Galeria histórica e fotográfica acadêmica', tecnologias: 'PostgreSQL 15' }
    ],
    componentes: [
      { id: 'cmp_apoio_h2_2', nome: 'FNC_EXIBIR_LINHA_TEMPO', tipo: 'funcao_regra', descricaoFluxo: 'Recupera dados históricos do acervo' }
    ],
    codigos: [
      { id: 'cod_apoio_h2_2', nomeArquivo: 'snapshotInstitucional.sql', tipoArtefato: 'ddl_postgres', estruturaDetalhada: 'CREATE TABLE snapshotInstitucional (id UUID PRIMARY KEY, anoMes VARCHAR, eventoJson JSONB);' }
    ]
  },

  // -------------------------------------------------------------
  // APOIO - H1
  // -------------------------------------------------------------
  {
    id: 'proj_apoio_h1_1',
    titulo: 'Página do Apoio (Portal do Docente & Atendimentos)',
    descricao: 'Página operacional de atendimento aos docentes, registro de ocorrências operacionais e gestão de permissões por cargo.',
    contexto: 'Sistema SIGAP',
    horizonte: 1,
    status: 'operando',
    ambidestria: 'explotacao',
    complexidadeOperacional: 2,
    posicao: { x: 10, y: 82 },
    detalhesTecnicos: 'dimPagina, dimComponente, dimFuncao, fatoExperienciaAula, fatoOcorrenciaAula',
    bancosDados: 'PostgreSQL, Redis Cache (permissionManifest), Object Storage S3',
    relacoes: [],
    conteineres: [
      { id: 'c_apoio_h1_1', nome: 'Frontend SPA Página do Apoio', tipo: 'frontend_spa', resumoTecnico: 'Portal principal do docente e suporte', tecnologias: 'React, TypeScript, Tailwind' },
      { id: 'c_apoio_h1_1_db', nome: 'Banco PostgreSQL Apoio', tipo: 'postgresql_tab', resumoTecnico: 'Tabelas dimPagina, dimComponente, fatoOcorrenciaAula', tecnologias: 'PostgreSQL 15' },
      { id: 'c_apoio_h1_1_redis', nome: 'Redis Cache Permissões', tipo: 'redis_cache', resumoTecnico: 'ReadModel permissionManifest acelerado', tecnologias: 'Redis Cluster' }
    ],
    componentes: [
      { id: 'cmp_apoio_h1_1', nome: 'Catálogo Semântico & Permissões', tipo: 'funcao_regra', descricaoFluxo: 'dimPagina -> dimComponente -> dimFuncao -> relacionamentoPermissao' },
      { id: 'cmp_apoio_h1_1_2', nome: 'FNC_REGISTRAR_OCORRENCIA_OPERACIONAL', tipo: 'fluxo_ocorrencia', descricaoFluxo: 'fatoOcorrenciaAula com gravidade e suporte técnico' }
    ],
    codigos: [
      { id: 'cod_apoio_h1_1', nomeArquivo: 'dimPagina.sql', tipoArtefato: 'ddl_postgres', estruturaDetalhada: 'CREATE TABLE dimPagina (idPagina UUID PRIMARY KEY, codigo VARCHAR, rota VARCHAR);' }
    ]
  },
  {
    id: 'proj_apoio_h1_2',
    titulo: 'PEA — Plano de Ensino e Aprendizagem',
    descricao: 'Módulo de elaboração, validação de seções pedagógicas e geração de PDF assinado do PEA.',
    contexto: 'Sistema SIGAP',
    horizonte: 1,
    status: 'operando',
    ambidestria: 'explotacao',
    complexidadeOperacional: 2,
    posicao: { x: 22, y: 82 },
    detalhesTecnicos: 'dimSecaoPEA, analisePEA, relacionamentoPEAMaterial',
    bancosDados: 'PostgreSQL, Object Storage S3',
    relacoes: [],
    conteineres: [
      { id: 'c_apoio_h1_2', nome: 'Módulo de PEA & Materiais', tipo: 'postgresql_tab', resumoTecnico: 'Editor de PEA por seções pedagógicas', tecnologias: 'PostgreSQL, S3' }
    ],
    componentes: [
      { id: 'cmp_apoio_h1_2', nome: 'FNC_GERAR_SNAPSHOT_PEA', tipo: 'funcao_regra', descricaoFluxo: 'Gera snapshot imutável em PDF no Object Storage' }
    ],
    codigos: [
      { id: 'cod_apoio_h1_2', nomeArquivo: 'analisePEA.sql', tipoArtefato: 'ddl_postgres', estruturaDetalhada: 'CREATE TABLE analisePEA (id UUID PRIMARY KEY, conteudoJson JSONB, statusAprovacao VARCHAR);' }
    ]
  },
  {
    id: 'proj_apoio_h1_3',
    titulo: 'Digitação & Formulário de Vivência Pedagógica',
    descricao: 'Registro de vivências de aula, instrumentos de avaliação de competências docentes e upload de TED em vídeo.',
    contexto: 'Sistema SIGAP',
    horizonte: 1,
    status: 'operando',
    ambidestria: 'explotacao',
    complexidadeOperacional: 2,
    posicao: { x: 34, y: 82 },
    detalhesTecnicos: 'dimInstrumentoVivencia, fatoVivenciaAula, fatoRespostaVivencia',
    bancosDados: 'PostgreSQL, Object Storage MinIO/S3',
    relacoes: [],
    conteineres: [
      { id: 'c_apoio_h1_3', nome: 'Formulários de Vivência Pedagógica', tipo: 'postgresql_tab', resumoTecnico: 'Coleta de avaliação pedagógica e TED', tecnologias: 'PostgreSQL, S3' }
    ],
    componentes: [
      { id: 'cmp_apoio_h1_3', nome: 'FNC_REGISTRAR_VIVENCIA_PEDAGOGICA', tipo: 'funcao_regra', descricaoFluxo: 'Grava respostas e calcula score de competências docentes' }
    ],
    codigos: [
      { id: 'cod_apoio_h1_3', nomeArquivo: 'fatoVivenciaAula.sql', tipoArtefato: 'ddl_postgres', estruturaDetalhada: 'CREATE TABLE fatoVivenciaAula (idVivencia UUID PRIMARY KEY, scoreCompetencia NUMERIC(4,2));' }
    ]
  },
  {
    id: 'proj_apoio_h1_4',
    titulo: 'Relatório de Vivências Pedagógicas',
    descricao: 'Análise consolidada e gráficos de desempenho das vivências pedagógicas por curso e docente.',
    contexto: 'Sistema SIGAP',
    horizonte: 1,
    status: 'operando',
    ambidestria: 'explotacao',
    complexidadeOperacional: 2,
    posicao: { x: 46, y: 82 },
    detalhesTecnicos: 'fatoVivenciaAula, analiseVivenciaResposta',
    bancosDados: 'PostgreSQL, Redis Cache',
    relacoes: [],
    conteineres: [
      { id: 'c_apoio_h1_4', nome: 'Dashboard de Vivências', tipo: 'analytics_dashboard', resumoTecnico: 'Consolidação de médias e feedbacks pedagógicos', tecnologias: 'React, PostgreSQL' }
    ],
    componentes: [
      { id: 'cmp_apoio_h1_4', nome: 'FNC_CONSOLIDAR_RELATORIO_VIVENCIA', tipo: 'calculo_kpi', descricaoFluxo: 'Agrega médias de vivências pedagógicas' }
    ],
    codigos: [
      { id: 'cod_apoio_h1_4', nomeArquivo: 'analiseVivenciaResposta.sql', tipoArtefato: 'ddl_postgres', estruturaDetalhada: 'CREATE TABLE analiseVivenciaResposta (id UUID PRIMARY KEY, respostaTexto TEXT);' }
    ]
  },
  {
    id: 'proj_apoio_h1_5',
    titulo: 'Calendário Institucional & Reservas de Sala',
    descricao: 'Gestão de agenda de aulas, disponibilidade de salas físicas e solicitações de itens logísticos.',
    contexto: 'Sistema SIGAP',
    horizonte: 1,
    status: 'operando',
    ambidestria: 'explotacao',
    complexidadeOperacional: 2,
    posicao: { x: 58, y: 82 },
    detalhesTecnicos: 'dimAgenda, dimSala, solicitacaoSala, solicitacaoMaterialLogistico',
    bancosDados: 'PostgreSQL, Redis Cache (calendar)',
    relacoes: [],
    conteineres: [
      { id: 'c_apoio_h1_5', nome: 'Módulo de Agenda e Reservas', tipo: 'postgresql_tab', resumoTecnico: 'Validação de choque de horários e reservas de sala', tecnologias: 'PostgreSQL, Redis' }
    ],
    componentes: [
      { id: 'cmp_apoio_h1_5', nome: 'FNC_VALIDAR_CONFLITO_HORARIO', tipo: 'funcao_regra', descricaoFluxo: 'Garante que sala não possua reservas duplicadas' }
    ],
    codigos: [
      { id: 'cod_apoio_h1_5', nomeArquivo: 'dimAgenda.sql', tipoArtefato: 'ddl_postgres', estruturaDetalhada: 'CREATE TABLE dimAgenda (idAgenda UUID PRIMARY KEY, dataInicio TIMESTAMP, dataFim TIMESTAMP);' }
    ]
  },
  {
    id: 'proj_apoio_h1_6',
    titulo: 'HOME Institucional & Painel do Docente',
    descricao: 'Portal inicial do docente com notícias por área, próximas aulas do dia e resumo de pendências.',
    contexto: 'Sistema SIGAP',
    horizonte: 1,
    status: 'operando',
    ambidestria: 'explotacao',
    complexidadeOperacional: 2,
    posicao: { x: 68, y: 82 },
    detalhesTecnicos: 'dimPublicacao, relacionamentoPublicacaoArea, fatoPendenciaAula',
    bancosDados: 'PostgreSQL, Redis Cache (home)',
    relacoes: [],
    conteineres: [
      { id: 'c_apoio_h1_6', nome: 'Portal HOME', tipo: 'frontend_spa', resumoTecnico: 'Hub central de notícias e agenda diária', tecnologias: 'React, Tailwind' }
    ],
    componentes: [
      { id: 'cmp_apoio_h1_6', nome: 'FNC_CARREGAR_PROXIMAS_AULAS', tipo: 'funcao_regra', descricaoFluxo: 'Busca cronograma do dia do docente' }
    ],
    codigos: [
      { id: 'cod_apoio_h1_6', nomeArquivo: 'dimPublicacao.sql', tipoArtefato: 'ddl_postgres', estruturaDetalhada: 'CREATE TABLE dimPublicacao (idPublicacao UUID PRIMARY KEY, titulo VARCHAR, texto TEXT);' }
    ]
  },

  // -------------------------------------------------------------
  // NUGEM - H3
  // -------------------------------------------------------------
  {
    id: 'proj_nugem_h3_1',
    titulo: 'Tendência de Mercado Preditiva (>50% Cursos Formulados Preditivamente)',
    descricao: 'Indicador de visão do Nugem para antecipar mais de 50% das aberturas de turmas por análise preditiva de mercado.',
    contexto: 'Inovação & IA',
    horizonte: 3,
    status: 'planejamento',
    ambidestria: 'exploracao',
    complexidadeOperacional: 5,
    posicao: { x: 60, y: 18 },
    detalhesTecnicos: 'scoreOportunidadeMercado, relacionamentoAberturaTurma',
    bancosDados: 'Cloud Firestore Preditivo',
    relacoes: [{ projetoDestinoId: 'proj_nugem_h2_1', tipo: 'principal' }],
    conteineres: [
      { id: 'c_nugem_h3_1', nome: 'Engine Preditiva de Mercado', tipo: 'firestore_col', resumoTecnico: 'Algoritmo de formulação antecipada de turmas', tecnologias: 'Cloud Firestore' }
    ],
    componentes: [
      { id: 'cmp_nugem_h3_1', nome: 'FNC_ANALISAR_TENDENCIA_MERCADO', tipo: 'algoritmo_preditivo', descricaoFluxo: 'Garante > 50% de turmas formuladas por análise preditiva de mercado' }
    ],
    codigos: [
      { id: 'cod_nugem_h3_1', nomeArquivo: 'relacionamentoAberturaTurma.json', tipoArtefato: 'schema_firestore', estruturaDetalhada: '{ "idTurma": "string", "fonteOrigem": "preditivo_mercado", "score": 88.0 }' }
    ]
  },
  {
    id: 'proj_nugem_h3_2',
    titulo: 'Pensou, Pesquisou, Entrou: Funil Comercial Adaptativo e Ramificado',
    descricao: 'Indicador estratégico de visão do Nugem para ramificar o funil comercial e cobrir todas as necessidades observadas e não observadas dos candidatos.',
    contexto: 'Inovação & IA',
    horizonte: 3,
    status: 'planejamento',
    ambidestria: 'exploracao',
    complexidadeOperacional: 5,
    posicao: { x: 75, y: 18 },
    detalhesTecnicos: 'fato_funil_vendas, necessidadesObservadas, necessidadesNaoObservadas',
    bancosDados: 'Cloud Firestore',
    relacoes: [{ projetoDestinoId: 'proj_nugem_h2_1', tipo: 'principal' }],
    conteineres: [
      { id: 'c_nugem_h3_2', nome: 'Funil Comercial Ramificado', tipo: 'firestore_col', resumoTecnico: 'Captura adaptativa de candidatos por perfil', tecnologias: 'Cloud Firestore' }
    ],
    componentes: [
      { id: 'cmp_nugem_h3_2', nome: 'FNC_RAMIFICAR_FUNIL_VENDAS', tipo: 'algoritmo_preditivo', descricaoFluxo: 'Ramifica funil comercial para necessidades observadas e não observadas' }
    ],
    codigos: [
      { id: 'cod_nugem_h3_2', nomeArquivo: 'fato_funil_vendas.json', tipoArtefato: 'schema_firestore', estruturaDetalhada: '{ "idTurma": "string", "necessidadesObservadas": ["flexibilidade"], "taxaConversao": 42.5 }' }
    ]
  },
  {
    id: 'proj_nugem_h3_3',
    titulo: 'Otimização de Recursos Firestore < 10% da Cota Spark',
    descricao: 'Indicador estratégico de infraestrutura para manter consumo diário < 5.000 leituras no Cloud Firestore.',
    contexto: 'Inovação & IA',
    horizonte: 3,
    status: 'planejamento',
    ambidestria: 'exploracao',
    complexidadeOperacional: 5,
    posicao: { x: 90, y: 18 },
    detalhesTecnicos: 'telemetria_diaria, RN-09',
    bancosDados: 'Cloud Firestore Google Cloud',
    relacoes: [{ projetoDestinoId: 'proj_nugem_h1_1', tipo: 'principal' }],
    conteineres: [
      { id: 'c_nugem_h3_3', nome: 'Coleção telemetria_diaria', tipo: 'firestore_col', resumoTecnico: 'Consolidado diário de leituras/escritas', tecnologias: 'Cloud Firestore' }
    ],
    componentes: [
      { id: 'cmp_nugem_h3_3', nome: 'RN-09 TELEMETRIA DIÁRIA ATÔMICA', tipo: 'calculo_kpi', regraNegocioCodigo: 'RN-09', descricaoFluxo: 'FieldValue.increment em lote de 50 no ID YYYY-MM-DD' }
    ],
    codigos: [
      { id: 'cod_nugem_h3_3', nomeArquivo: 'telemetria_diaria.json', tipoArtefato: 'schema_firestore', estruturaDetalhada: '{ "totalLeituras": "increment", "totalEscritas": "increment" }' }
    ]
  },

  // -------------------------------------------------------------
  // NUGEM - H2
  // -------------------------------------------------------------
  {
    id: 'proj_nugem_h2_1',
    titulo: 'Previsão Automatizada de Abertura de Turmas & Quórum Comercial',
    descricao: 'Módulo comercial com regras RN-05 (Controles Empilhados 230px) e RN-06 (Validação de Quórum Aptos >= Mínimo).',
    contexto: 'Inovação & IA',
    horizonte: 2,
    status: 'teste',
    ambidestria: 'ambidestria',
    complexidadeOperacional: 3,
    posicao: { x: 75, y: 50 },
    detalhesTecnicos: 'relacionamentoAberturaTurma, fato_funil_vendas',
    bancosDados: 'Cloud Firestore',
    relacoes: [{ projetoDestinoId: 'proj_nugem_h1_1', tipo: 'principal' }],
    conteineres: [
      { id: 'c_nugem_h2_1', nome: 'Coleção fato_funil_vendas', tipo: 'firestore_col', resumoTecnico: 'Monitor de inscritos, aptos e matriculados', tecnologias: 'Cloud Firestore' }
    ],
    componentes: [
      { id: 'cmp_nugem_h2_1', nome: 'RN-06 Validação de Quórum Comercial', tipo: 'funcao_regra', regraNegocioCodigo: 'RN-06', descricaoFluxo: 'Aptos >= Quórum Mínimo Exigido' }
    ],
    codigos: [
      { id: 'cod_nugem_h2_1', nomeArquivo: 'fato_funil_vendas.json', tipoArtefato: 'schema_firestore', estruturaDetalhada: '{ "idTurma": "string", "totalInscritos": 45, "totalAptos": 30 }' }
    ]
  },

  // -------------------------------------------------------------
  // NUGEM - H1
  // -------------------------------------------------------------
  {
    id: 'proj_nugem_h1_1',
    titulo: 'Monitoramento de Turmas Ativas no Mês (v2.5)',
    descricao: 'Painel operacional com 114 turmas ativas, 5.162 disciplinas com Lazy Loading (RN-07) e Cache RAM de sessão (RN-08).',
    contexto: 'Inovação & IA',
    horizonte: 1,
    status: 'operando',
    ambidestria: 'explotacao',
    complexidadeOperacional: 2,
    posicao: { x: 85, y: 82 },
    detalhesTecnicos: 'turmas_ativas_readmodel, fato_cronograma, telemetria_diaria (RN-09)',
    bancosDados: 'Cloud Firestore (nugem-aceef)',
    relacoes: [],
    conteineres: [
      { id: 'c_nugem_h1_1', nome: 'turmas_ativas_readmodel', tipo: 'firestore_col', resumoTecnico: '114 documentos de turmas com progresso %', tecnologias: 'Cloud Firestore' },
      { id: 'c_nugem_h1_1_crono', nome: 'fato_cronograma', tipo: 'firestore_col', resumoTecnico: '5.162 documentos de disciplinas e encontros', tecnologias: 'Cloud Firestore (Lazy Loading)' },
      { id: 'c_nugem_h1_1_telemetry', nome: 'telemetria_diaria', tipo: 'firestore_col', resumoTecnico: 'Consolidado diário de leituras/escritas', tecnologias: 'Cloud Firestore (RN-09)' }
    ],
    componentes: [
      { id: 'cmp_nugem_h1_1', nome: 'RN-01 Filtro Turma Ativa Mês', tipo: 'funcao_regra', regraNegocioCodigo: 'RN-01', descricaoFluxo: 'dataInicio <= ultimoDiaMes AND dataFim >= primeiroDiaMes' },
      { id: 'cmp_nugem_h1_1_2', nome: 'RN-07 Lazy Loading de Disciplinas', tipo: 'funcao_regra', regraNegocioCodigo: 'RN-07', descricaoFluxo: 'Carrega disciplinas sob demanda ao clicar (economia 97.6% leituras)' }
    ],
    codigos: [
      { id: 'cod_nugem_h1_1', nomeArquivo: 'turmas_ativas_readmodel.json', tipoArtefato: 'schema_firestore', estruturaDetalhada: '{ "idTurma": "string", "siglaTurmaFormatada": "ABA-T5", "progressoPercentual": 75.0 }' }
    ]
  }
];

async function seedFirestore() {
  console.log("=== ENVIANDO DADOS PARA CLOUD FIRESTORE (PROJECT: mapahorizontes) ===");

  // 1. Gravar Microssistemas
  for (const m of MICROSSISTEMAS) {
    const ref = doc(db, "microssistemas", m.id);
    await setDoc(ref, m, { merge: true });
    console.log(`[Microssistema OK] -> microssistemas/${m.id}`);
  }

  // 2. Gravar Projetos e Subcoleções
  for (const p of PROJETOS_COMPLETOS) {
    const { conteineres, componentes, codigos, ...projData } = p;
    
    // Gravar documento principal em `projetos`
    const projRef = doc(db, "projetos", p.id);
    await setDoc(projRef, projData, { merge: true });
    console.log(`[Projeto OK] -> projetos/${p.id}`);

    // Subcoleção 1: conteineres
    if (conteineres && conteineres.length > 0) {
      for (const c of conteineres) {
        const subRef = doc(db, `projetos/${p.id}/conteineres`, c.id);
        await setDoc(subRef, c, { merge: true });
        console.log(`   └─ [Subcoleção Contêiner OK] -> projetos/${p.id}/conteineres/${c.id}`);
      }
    }

    // Subcoleção 2: componentes
    if (componentes && componentes.length > 0) {
      for (const cmp of componentes) {
        const subRef = doc(db, `projetos/${p.id}/componentes`, cmp.id);
        await setDoc(subRef, cmp, { merge: true });
        console.log(`   └─ [Subcoleção Componente OK] -> projetos/${p.id}/componentes/${cmp.id}`);
      }
    }

    // Subcoleção 3: codigos
    if (codigos && codigos.length > 0) {
      for (const cod of codigos) {
        const subRef = doc(db, `projetos/${p.id}/codigos`, cod.id);
        await setDoc(subRef, cod, { merge: true });
        console.log(`   └─ [Subcoleção Código/Schema OK] -> projetos/${p.id}/codigos/${cod.id}`);
      }
    }
  }

  console.log("\n====================================================");
  console.log("✅ CARGA NO CLOUD FIRESTORE mapahorizontes CONCLUÍDA!");
  console.log("====================================================");
  process.exit(0);
}

seedFirestore().catch(err => {
  console.error("❌ ERRO AO CARREGAR NO CLOUD FIRESTORE:", err);
  process.exit(1);
});
