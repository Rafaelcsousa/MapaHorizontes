import React, { useState, useEffect } from 'react';
import { Projeto, Horizonte, Ambidestria, StatusProjeto, TipoRelacao, ClassificacaoSugestao, Dialogo } from '../types';
import { convertDriveUrlToDirectImageUrl } from '../utils/imageHelper';
import { ProjectClassifier } from '../services/classifier';
import { strategicAgent } from '../agent/StrategicAgent';
import { AgentDialogueQuestion } from '../agent/types';
import { C4ContextStore } from '../services/c4ContextStore';
import { LinhaTemporalDialogos } from './LinhaTemporalDialogos';
import { 
  Plus, 
  X, 
  Sparkles, 
  Check, 
  Edit3, 
  Trash2, 
  Compass, 
  BrainCircuit,
  ChevronDown,
  ChevronUp,
  Send,
  Database,
  Code2,
  FileCode2,
  Layers,
  Box
} from 'lucide-react';

interface PainelLateralProps {
  isOpen: boolean;
  onClose: () => void;
  projetoSelecionado?: Projeto;
  projetosExistentes: Projeto[];
  historicoDialogos: Dialogo[];
  onSelectProjeto: (id: string | undefined) => void;
  onSaveProjeto: (projeto: Omit<Projeto, 'id' | 'criadoEm' | 'atualizadoEm'> & { id?: string }) => Promise<void>;
  onDeleteProjeto: (id: string) => Promise<void>;
  isCreatingNew: boolean;
  onSetIsCreatingNew: (value: boolean) => void;
}

export const PainelLateral: React.FC<PainelLateralProps> = ({
  isOpen,
  onClose,
  projetoSelecionado,
  projetosExistentes,
  historicoDialogos,
  onSelectProjeto,
  onSaveProjeto,
  onDeleteProjeto,
  isCreatingNew,
  onSetIsCreatingNew,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  // Form State Básico
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [contexto, setContexto] = useState('Sistema SIGAP');
  const [imagemUrl, setImagemUrl] = useState('');
  const [status, setStatus] = useState<StatusProjeto>('idealizado');
  const [horizonte, setHorizonte] = useState<Horizonte>(2);
  const [ambidestria, setAmbidestria] = useState<Ambidestria>('ambidestria');
  const [complexidade, setComplexidade] = useState<1 | 2 | 3 | 4 | 5>(2);
  const [relacoes, setRelacoes] = useState<{ projetoDestinoId: string; tipo: TipoRelacao }[]>([]);

  // Form State Técnico (Sanfona minimizada por padrão)
  const [isTechSectionOpen, setIsTechSectionOpen] = useState(false);
  const [detalhesTecnicos, setDetalhesTecnicos] = useState('');
  const [bancosDados, setBancosDados] = useState('');
  const [observacoesTecnicas, setObservacoesTecnicas] = useState('');

  // State do Agente sob demanda
  const [sugestao, setSugestao] = useState<ClassificacaoSugestao | null>(null);
  const [mostrarSugestao, setMostrarSugestao] = useState(false);
  const [isAnalyzingAgent, setIsAnalyzingAgent] = useState(false);

  // State de Curiosidade Controlada (DialogueEngine)
  const [curiosityQuestion, setCuriosityQuestion] = useState<AgentDialogueQuestion | null>(null);
  const [respostaCuriosidade, setRespostaCuriosidade] = useState('');

  const contextList = C4ContextStore.getContextList(projetosExistentes);

  useEffect(() => {
    if (isCreatingNew) {
      setTitulo('');
      setDescricao('');
      setContexto('Sistema SIGAP');
      setImagemUrl('');
      setStatus('idealizado');
      setHorizonte(2);
      setAmbidestria('ambidestria');
      setComplexidade(2);
      setRelacoes([]);
      setDetalhesTecnicos('');
      setBancosDados('');
      setObservacoesTecnicas('');
      setIsTechSectionOpen(false);
      setIsEditing(true);
      setSugestao(null);
      setMostrarSugestao(false);
      setCuriosityQuestion(null);
    } else if (projetoSelecionado) {
      setTitulo(projetoSelecionado.titulo || '');
      setDescricao(projetoSelecionado.descricao || '');
      setContexto(projetoSelecionado.contexto || 'Sistema SIGAP');
      setImagemUrl(projetoSelecionado.imagemUrl || '');
      setStatus(projetoSelecionado.status || 'idealizado');
      setHorizonte(projetoSelecionado.horizonte || 2);
      setAmbidestria(projetoSelecionado.ambidestria || 'ambidestria');
      setComplexidade(projetoSelecionado.complexidadeOperacional || 2);
      setRelacoes(projetoSelecionado.relacoes || []);
      setDetalhesTecnicos(projetoSelecionado.detalhesTecnicos || '');
      setBancosDados(projetoSelecionado.bancosDados || '');
      setObservacoesTecnicas(projetoSelecionado.observacoesTecnicas || '');
      setIsTechSectionOpen(false);
      setIsEditing(false);
      setSugestao(null);
      setMostrarSugestao(false);
      setCuriosityQuestion(null);
    }
  }, [projetoSelecionado, isCreatingNew]);

  const handleConsultarAgente = () => {
    if (!titulo.trim() && !descricao.trim()) return;
    setIsAnalyzingAgent(true);
    const outrosProjetos = projetosExistentes.filter(p => p.id !== projetoSelecionado?.id);
    const res = ProjectClassifier.classify({ titulo, descricao, status, relacoes }, outrosProjetos);
    setSugestao(res);
    setMostrarSugestao(true);
    setIsAnalyzingAgent(false);
  };

  const handleAceitarSugestao = () => {
    if (!sugestao) return;
    setHorizonte(sugestao.horizonte);
    setAmbidestria(sugestao.ambidestria);
    setComplexidade(sugestao.complexidadeOperacional);
    setMostrarSugestao(false);
  };

  const handleAddRelacao = (destinoId: string, tipo: TipoRelacao) => {
    if (!destinoId || relacoes.some(r => r.projetoDestinoId === destinoId)) return;
    setRelacoes([...relacoes, { projetoDestinoId: destinoId, tipo }]);
  };

  const handleRemoveRelacao = (destinoId: string) => {
    setRelacoes(relacoes.filter(r => r.projetoDestinoId !== destinoId));
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !descricao.trim()) return;

    const projetoIdTarget = projetoSelecionado && !isCreatingNew ? projetoSelecionado.id : undefined;

    if (sugestao && projetoIdTarget) {
      const question = strategicAgent.checkCuriosityQuestion(
        projetoIdTarget,
        titulo,
        sugestao,
        { horizonte, ambidestria, complexidadeOperacional: complexidade },
        historicoDialogos
      );

      if (question) {
        setCuriosityQuestion(question);
      }
    }

    await onSaveProjeto({
      id: projetoIdTarget,
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      contexto: contexto.trim() || 'Sistema SIGAP',
      imagemUrl: imagemUrl.trim() || undefined,
      status,
      horizonte,
      ambidestria,
      complexidadeOperacional: complexidade,
      confiancaClassificacao: sugestao?.confianca,
      posicao: projetoSelecionado?.posicao || { x: 0, y: 0 },
      relacoes,
      detalhesTecnicos: detalhesTecnicos.trim() || undefined,
      bancosDados: bancosDados.trim() || undefined,
      observacoesTecnicas: observacoesTecnicas.trim() || undefined,
    });

    setIsEditing(false);
    onSetIsCreatingNew(false);
  };

  const handleSendCuriosityResponse = async () => {
    if (!curiosityQuestion || !projetoSelecionado || !respostaCuriosidade.trim()) return;
    await strategicAgent.recordUserFeedback(projetoSelecionado.id, curiosityQuestion, respostaCuriosidade.trim());
    setCuriosityQuestion(null);
    setRespostaCuriosidade('');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop Overlay */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity animate-in fade-in" 
      />

      {/* Sliding Drawer Container */}
      <aside className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-white border-l border-slate-200 h-full flex flex-col p-6 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
        
        {/* Header do Drawer */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-blue-600" />
            Gestão de Projetos
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
            title="Fechar menu (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ESTADO PADRÃO */}
        {!projetoSelecionado && !isCreatingNew && (
          <div className="flex flex-col items-center justify-center text-center my-auto py-12 flex-1">
            <div className="w-20 h-20 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-5 shadow-inner">
              <Compass className="w-10 h-10 stroke-[1.5]" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">Nenhum projeto selecionado</h3>
            <p className="text-xs text-slate-500 max-w-xs mt-2 leading-relaxed">
              Selecione um ponto do mapa ou adicione uma nova iniciativa para começar.
            </p>

            <div className="w-full max-w-xs space-y-3 mt-8">
              <button
                onClick={() => onSetIsCreatingNew(true)}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition shadow-md flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Adicionar projeto
              </button>
            </div>
          </div>
        )}

        {/* ESTADO FORMULÁRIO (Adicionar / Editar) */}
        {(isCreatingNew || isEditing) && (
          <form onSubmit={handleSubmitForm} className="space-y-4 mt-4 flex-1">
            
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Nome do projeto *</label>
              <input
                type="text"
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Central de Atendimento Integrada"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Descrição da ideia *</label>
              <textarea
                rows={3}
                required
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descreva os objetivos, pessoas envolvidas e entregáveis pretendidos..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
              />
            </div>

            {/* SELETOR DE CONTEXTO / MACROSISTEMA (MODELO C4) */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5 text-blue-600" />
                Contexto / Macrosistema (Nível C4) *
              </label>
              <input
                type="text"
                required
                list="contexts-list"
                value={contexto}
                onChange={(e) => setContexto(e.target.value)}
                placeholder="Ex: Sistema SIGAP, Portal do Aluno, BiblioPós..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:bg-white"
              />
              <datalist id="contexts-list">
                {contextList.map((ctx, i) => <option key={i} value={ctx} />)}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Situação atual *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusProjeto)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:bg-white"
              >
                <option value="idealizado">Ideia / Idealizado</option>
                <option value="planejamento">Planejamento</option>
                <option value="proxima_etapa">Próxima Etapa</option>
                <option value="teste">Teste / Em andamento</option>
                <option value="operando">Operando</option>
                <option value="finalizado">Finalizado</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Link da Imagem / Mockup (Google Drive ou URL pública)
              </label>
              <input
                type="url"
                value={imagemUrl}
                onChange={(e) => setImagemUrl(e.target.value)}
                placeholder="Cole o link do Google Drive (Qualquer pessoa com o link)..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-1.5 text-xs text-slate-800 focus:bg-white"
              />
              {imagemUrl && (
                <div className="mt-2 w-full h-32 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative">
                  <img
                    src={convertDriveUrlToDirectImageUrl(imagemUrl)}
                    alt="Preview mockup"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Horizonte</label>
                <select
                  value={horizonte}
                  onChange={(e) => setHorizonte(Number(e.target.value) as Horizonte)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800"
                >
                  <option value={1}>1 — Curto Prazo (Operacional)</option>
                  <option value={2}>2 — Médio Prazo (Gerencial)</option>
                  <option value={3}>3 — Longo Prazo (Estratégico)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ambidestria</label>
                <select
                  value={ambidestria}
                  onChange={(e) => setAmbidestria(e.target.value as Ambidestria)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800"
                >
                  <option value="explotacao">Explotação (Laranja)</option>
                  <option value="ambidestria">Ambidestria (Azul)</option>
                  <option value="exploracao">Exploração (Roxo)</option>
                </select>
              </div>
            </div>

            {/* SEÇÃO RETRÁTIL DE DETALHAMENTO TÉCNICO & ARQUITETURA */}
            <div className="border border-slate-200 rounded-xl overflow-hidden mt-4 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setIsTechSectionOpen(!isTechSectionOpen)}
                className="w-full px-4 py-2.5 bg-slate-100 hover:bg-slate-200/80 flex items-center justify-between text-left text-xs font-bold text-slate-800 transition border-b border-slate-200"
              >
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-blue-600" />
                  <span>Detalhamento Técnico & Arquitetura (Equipe)</span>
                </div>
                {isTechSectionOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </button>

              {isTechSectionOpen && (
                <div className="p-4 space-y-3.5 bg-white animate-in fade-in duration-150">
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                        <BrainCircuit className="w-4 h-4 text-blue-600" />
                        Agente Estratégico
                      </p>
                      <p className="text-[11px] text-blue-700">Solicitar análise sob demanda.</p>
                    </div>

                    <button
                      type="button"
                      onClick={handleConsultarAgente}
                      disabled={isAnalyzingAgent}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition shadow-xs flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {isAnalyzingAgent ? 'Analisando...' : 'Consultar Agente'}
                    </button>
                  </div>

                  {sugestao && mostrarSugestao && (
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-blue-200 rounded-xl p-3.5 relative shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-extrabold text-blue-900 uppercase tracking-wider">
                          Recomendação do Agente
                        </span>
                        <span className="text-[10px] font-extrabold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                          Confiança: {sugestao.confianca}%
                        </span>
                      </div>

                      <p className="text-xs font-bold text-slate-800">
                        Horizonte: <span className="text-blue-700">H{sugestao.horizonte}</span> | Ambidestria: <span className="text-blue-700 capitalize">{sugestao.ambidestria}</span>
                      </p>

                      <div className="mt-2 text-[11px] text-slate-700 space-y-1 bg-white/80 rounded-lg p-2.5 border border-blue-100">
                        <p className="font-bold text-slate-800 mb-1">Motivos:</p>
                        <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                          {sugestao.motivos.map((motivo, idx) => (
                            <li key={idx}>{motivo}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-blue-200/60">
                        <button
                          type="button"
                          onClick={() => setMostrarSugestao(false)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-500 hover:text-slate-700"
                        >
                          Ignorar
                        </button>
                        <button
                          type="button"
                          onClick={handleAceitarSugestao}
                          className="px-3 py-1 text-[11px] font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-xs flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Aceitar
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <FileCode2 className="w-3.5 h-3.5 text-blue-600" />
                      Funções Internas e Arquitetura Detalhada
                    </label>
                    <textarea
                      rows={2}
                      value={detalhesTecnicos}
                      onChange={(e) => setDetalhesTecnicos(e.target.value)}
                      placeholder="Mapeie os módulos internos, componentes e funções principais..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:bg-white resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-amber-600" />
                      Bancos de Dados, Tabelas e Tipos de Dados
                    </label>
                    <textarea
                      rows={2}
                      value={bancosDados}
                      onChange={(e) => setBancosDados(e.target.value)}
                      placeholder="Descreva os bancos (Firestore, Postgres, etc.), coleções e esquemas..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:bg-white resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-purple-600" />
                      Observações Técnicas e Diretrizes de Dev
                    </label>
                    <textarea
                      rows={2}
                      value={observacoesTecnicas}
                      onChange={(e) => setObservacoesTecnicas(e.target.value)}
                      placeholder="Notas sobre infraestrutura, integração de APIs e decisões da equipe..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:bg-white resize-none"
                    />
                  </div>

                  {/* CONEXÕES E TIPOS DE CAMINHO */}
                  <div className="pt-2 border-t border-slate-200">
                    <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
                      <span>Projetos do Caminho & Conexões ({relacoes.length})</span>
                      <span className="text-[10px] text-slate-400 font-normal">Linhas e visualização</span>
                    </label>

                    {relacoes.length > 0 && (
                      <div className="space-y-1.5 mb-3">
                        {relacoes.map((rel, idx) => {
                          const dest = projetosExistentes.find(p => p.id === rel.projetoDestinoId);
                          return (
                            <div key={idx} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                                  {rel.tipo}
                                </span>
                                <span className="font-semibold text-slate-800 line-clamp-1">{dest?.titulo || 'Projeto'}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveRelacao(rel.projetoDestinoId)}
                                className="text-slate-400 hover:text-rose-600 p-0.5"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <select
                        id="selectDestino"
                        className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800"
                      >
                        <option value="">Selecione o projeto destino...</option>
                        {projetosExistentes
                          .filter(p => p.id !== projetoSelecionado?.id && !relacoes.some(r => r.projetoDestinoId === p.id))
                          .map(p => (
                            <option key={p.id} value={p.id}>{p.titulo} (H{p.horizonte})</option>
                          ))}
                      </select>

                      <select
                        id="selectTipo"
                        className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800"
                      >
                        <option value="principal">Principal</option>
                        <option value="oportunidade">Oportunidade</option>
                        <option value="dependencia">Dependência</option>
                        <option value="alternativa">Alternativa</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => {
                          const destEl = document.getElementById('selectDestino') as HTMLSelectElement;
                          const tipoEl = document.getElementById('selectTipo') as HTMLSelectElement;
                          if (destEl && destEl.value && tipoEl) {
                            handleAddRelacao(destEl.value, tipoEl.value as TipoRelacao);
                            destEl.value = '';
                          }
                        }}
                        className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        title="Adicionar conexão"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                  </div>

                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  onSetIsCreatingNew(false);
                  setIsEditing(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md"
              >
                Salvar Projeto
              </button>
            </div>
          </form>
        )}

        {/* ESTADO DETALHES DO PROJETO SELECIONADO */}
        {projetoSelecionado && !isCreatingNew && !isEditing && (
          <div className="space-y-4 mt-4 flex-1">
            
            {curiosityQuestion && (
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 shadow-sm animate-in fade-in">
                <div className="flex items-center gap-2 mb-1.5">
                  <BrainCircuit className="w-4 h-4 text-amber-700" />
                  <span className="text-xs font-extrabold text-amber-900">Curiosidade do Agente Estratégico</span>
                </div>

                <p className="text-xs text-amber-900 leading-relaxed font-medium">
                  {curiosityQuestion.pergunta}
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="text"
                    value={respostaCuriosidade}
                    onChange={(e) => setRespostaCuriosidade(e.target.value)}
                    placeholder="Digite sua explicação para o agente..."
                    className="flex-1 bg-white border border-amber-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none"
                  />
                  <button
                    onClick={handleSendCuriosityResponse}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition shadow-xs flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Responder
                  </button>
                </div>
              </div>
            )}

            {/* Fotografia de Capa do Projeto */}
            {projetoSelecionado.imagemUrl && (
              <div className="w-full h-44 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative shadow-sm">
                <img
                  src={convertDriveUrlToDirectImageUrl(projetoSelecionado.imagemUrl)}
                  alt={projetoSelecionado.titulo}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  Horizonte {projetoSelecionado.horizonte}
                </span>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                  <Box className="w-3 h-3 text-blue-600" />
                  {projetoSelecionado.contexto || 'Sistema SIGAP'}
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 mt-1 leading-tight">
                {projetoSelecionado.titulo}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="bg-slate-100 text-slate-800 font-semibold px-2.5 py-1 rounded-lg border border-slate-200">
                Situação: <span className="text-blue-700 capitalize">{projetoSelecionado.status}</span>
              </div>
              <div className="bg-slate-100 text-slate-800 font-semibold px-2.5 py-1 rounded-lg border border-slate-200 capitalize">
                Ambidestria: <span className="text-purple-700">{projetoSelecionado.ambidestria}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Descrição do Projeto</h4>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200 whitespace-pre-wrap">
                {projetoSelecionado.descricao}
              </p>
            </div>

            {/* DETALHAMENTO TÉCNICO NA VISUALIZAÇÃO */}
            {(projetoSelecionado.detalhesTecnicos || projetoSelecionado.bancosDados || projetoSelecionado.observacoesTecnicas) && (
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-blue-600" />
                  Especificações Técnicas da Equipe
                </h4>

                {projetoSelecionado.detalhesTecnicos && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Funções Internas & Módulos:</p>
                    <p className="text-xs text-slate-700 whitespace-pre-wrap">{projetoSelecionado.detalhesTecnicos}</p>
                  </div>
                )}

                {projetoSelecionado.bancosDados && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Bancos de Dados & Tabelas:</p>
                    <p className="text-xs text-slate-700 whitespace-pre-wrap">{projetoSelecionado.bancosDados}</p>
                  </div>
                )}

                {projetoSelecionado.observacoesTecnicas && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Observações Técnicas:</p>
                    <p className="text-xs text-slate-700 whitespace-pre-wrap">{projetoSelecionado.observacoesTecnicas}</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition flex items-center justify-center gap-1.5"
              >
                <Edit3 className="w-4 h-4 text-slate-600" />
                Editar Projeto
              </button>

              <button
                onClick={async () => {
                  if (confirm(`Excluir permanentemente o projeto "${projetoSelecionado.titulo}"?`)) {
                    await onDeleteProjeto(projetoSelecionado.id);
                    onSelectProjeto(undefined);
                  }
                }}
                className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* LINHA TEMPORAL DE DIÁLOGOS E ATIVIDADES */}
            <LinhaTemporalDialogos
              projetoId={projetoSelecionado.id}
              projetoTitulo={projetoSelecionado.titulo}
            />

          </div>
        )}

      </aside>
    </>
  );
};
