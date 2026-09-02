import React, { useState, useEffect } from 'react';
import { Dialogo, TipoDialogo, StatusAtividade } from '../types';
import { subscribeDialogos, addDialogoBD, updateDialogoStatusBD, deleteDialogoBD } from '../lib/firebase';
import { 
  MessageSquare, 
  CheckSquare, 
  Lightbulb, 
  Flag, 
  Calendar, 
  FileText, 
  Eye, 
  Gavel, 
  Plus, 
  Trash2, 
  Clock, 
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  XCircle,
  PlayCircle,
  BrainCircuit
} from 'lucide-react';

interface LinhaTemporalDialogosProps {
  projetoId: string;
  projetoTitulo: string;
}

const TIPOS_CONFIG: Record<TipoDialogo, { label: string; icon: any; color: string; bg: string }> = {
  dialogo: { label: 'Diálogo', icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  atividade: { label: 'Atividade', icon: CheckSquare, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  ideia: { label: 'Ideia', icon: Lightbulb, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
  etapa: { label: 'Etapa', icon: Flag, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
  agenda: { label: 'Agenda', icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  documento: { label: 'Documento', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
  observacao: { label: 'Observação', icon: Eye, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' },
  decisao: { label: 'Decisão', icon: Gavel, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
  feedback_agente: { label: 'Feedback Agente', icon: BrainCircuit, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
};

export const LinhaTemporalDialogos: React.FC<LinhaTemporalDialogosProps> = ({ projetoId, projetoTitulo }) => {
  const [dialogos, setDialogos] = useState<Dialogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [tipo, setTipo] = useState<TipoDialogo>('dialogo');
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [statusAtividade, setStatusAtividade] = useState<StatusAtividade>('aberta');
  const [dataInicio, setDataInicio] = useState('');
  const [dataLimite, setDataLimite] = useState('');
  const [urlDocumento, setUrlDocumento] = useState('');
  const [nomeDocumento, setNomeDocumento] = useState('');

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeDialogos(projetoId, (data) => {
      setDialogos(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [projetoId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;

    await addDialogoBD({
      projetoId,
      tipo,
      titulo: titulo.trim(),
      conteudo: conteudo.trim(),
      status: tipo === 'atividade' ? statusAtividade : undefined,
      dataInicio: dataInicio || undefined,
      dataLimite: dataLimite || undefined,
      urlDocumento: urlDocumento.trim() || undefined,
      nomeDocumento: nomeDocumento.trim() || undefined,
    });

    // Reset Form
    setTitulo('');
    setConteudo('');
    setUrlDocumento('');
    setNomeDocumento('');
    setDataInicio('');
    setDataLimite('');
    setIsAdding(false);
  };

  const handleToggleStatusAtividade = async (id: string, currentStatus?: StatusAtividade) => {
    const nextMap: Record<StatusAtividade, StatusAtividade> = {
      aberta: 'em_andamento',
      em_andamento: 'concluida',
      concluida: 'cancelada',
      cancelada: 'aberta'
    };
    const nextStatus = nextMap[currentStatus || 'aberta'];
    await updateDialogoStatusBD(id, nextStatus);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja realmente excluir este registro da linha do tempo?')) {
      await deleteDialogoBD(id);
    }
  };

  const getStatusBadgeAtividade = (status?: StatusAtividade) => {
    switch (status) {
      case 'concluida': return { label: 'Concluída', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: CheckCircle2 };
      case 'em_andamento': return { label: 'Em Andamento', bg: 'bg-blue-100 text-blue-800 border-blue-300', icon: PlayCircle };
      case 'cancelada': return { label: 'Cancelada', bg: 'bg-rose-100 text-rose-800 border-rose-300', icon: XCircle };
      default: return { label: 'Aberta', bg: 'bg-amber-100 text-amber-800 border-amber-300', icon: AlertCircle };
    }
  };

  return (
    <div className="mt-6 border-t border-slate-200 pt-6">
      
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            Diálogos e Atividades
          </h3>
          <p className="text-xs text-slate-500">Histórico cronológico de decisões, tarefas e ideias</p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          {isAdding ? 'Cancelar' : 'Adicionar registro'}
        </button>
      </div>

      {/* Formulário de Novo Registro */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 animate-in fade-in duration-200">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Registro</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoDialogo)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {Object.entries(TIPOS_CONFIG).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Título / Resumo *</label>
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Definir primeira versão da arquitetura..."
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Conteúdo / Detalhes</label>
            <textarea
              rows={2}
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              placeholder="Registrar anotações, decisões ou próximos passos..."
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            />
          </div>

          {/* Campos Específicos para Atividade ou Agenda */}
          {(tipo === 'atividade' || tipo === 'agenda' || tipo === 'etapa') && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Data Início</label>
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Data Limite / Prazo</label>
                <input
                  type="date"
                  value={dataLimite}
                  onChange={(e) => setDataLimite(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800"
                />
              </div>
            </div>
          )}

          {/* Campo para Documentos */}
          {(tipo === 'documento' || urlDocumento) && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nome do Documento</label>
                <input
                  type="text"
                  value={nomeDocumento}
                  onChange={(e) => setNomeDocumento(e.target.value)}
                  placeholder="Ex: Documento de Requisitos PDF"
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Link do Documento (URL/Drive)</label>
                <input
                  type="url"
                  value={urlDocumento}
                  onChange={(e) => setUrlDocumento(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-xs"
            >
              Salvar Registro
            </button>
          </div>
        </form>
      )}

      {/* Lista da Linha do Tempo */}
      {loading ? (
        <div className="text-center py-6 text-xs text-slate-400">Carregando histórico...</div>
      ) : dialogos.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-600">Nenhum registro na linha do tempo</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Adicione diários, decisões, tarefas ou ideias deste projeto.</p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {dialogos.map((item) => {
            const config = TIPOS_CONFIG[item.tipo || 'dialogo'] || TIPOS_CONFIG.dialogo;
            const Icon = config.icon;
            const statusBadge = item.tipo === 'atividade' ? getStatusBadgeAtividade(item.status) : null;
            const StatusBadgeIcon = statusBadge?.icon;

            const dateFormatted = item.criadoEm
              ? new Date(item.criadoEm.seconds ? item.criadoEm.seconds * 1000 : item.criadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
              : 'Recente';

            return (
              <div key={item.id} className="relative group">
                {/* Marcador na linha do tempo */}
                <div className={`absolute -left-6 top-1 w-5 h-5 rounded-full ${config.bg} flex items-center justify-center border shadow-2xs`}>
                  <Icon className={`w-3 h-3 ${config.color}`} />
                </div>

                {/* Conteúdo do Card da Timeline */}
                <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs hover:border-slate-300 transition">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${config.bg} ${config.color}`}>
                          {config.label}
                        </span>

                        {statusBadge && StatusBadgeIcon && (
                          <button
                            onClick={() => handleToggleStatusAtividade(item.id, item.status)}
                            className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusBadge.bg} hover:opacity-80 transition cursor-pointer`}
                            title="Clique para alternar o status da atividade"
                          >
                            <StatusBadgeIcon className="w-3 h-3" />
                            {statusBadge.label}
                          </button>
                        )}

                        <span className="text-[10px] text-slate-400 font-medium">{dateFormatted}</span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-800 mt-1">{item.titulo}</h4>
                    </div>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-slate-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition p-1"
                      title="Excluir registro"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {item.conteudo && (
                    <p className="text-xs text-slate-600 mt-1.5 whitespace-pre-wrap leading-relaxed">
                      {item.conteudo}
                    </p>
                  )}

                  {/* Datas limite */}
                  {(item.dataInicio || item.dataLimite) && (
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500 font-medium">
                      {item.dataInicio && <span>Início: {item.dataInicio}</span>}
                      {item.dataLimite && <span className="text-amber-700 font-semibold">Prazo: {item.dataLimite}</span>}
                    </div>
                  )}

                  {/* Link para Documento */}
                  {item.urlDocumento && (
                    <a
                      href={item.urlDocumento}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 mt-2 hover:underline"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      {item.nomeDocumento || 'Visualizar documento em anexo'}
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
