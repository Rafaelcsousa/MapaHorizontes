import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Projeto, Horizonte, Ambidestria, StatusProjeto, C4ViewMode, ContextoNode } from '../types';
import { TelemetricHorizonStore } from '../services/telemetricLayout';
import { C4ContextStore } from '../services/c4ContextStore';
import { ContextIcon } from './ContextIcons';
import { convertDriveUrlToDirectImageUrl } from '../utils/imageHelper';
import { 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  AlertCircle, 
  HelpCircle, 
  Layers, 
  Box, 
  Cpu, 
  Code2, 
  Database, 
  Target, 
  Lightbulb, 
  Activity,
  ArrowLeft
} from 'lucide-react';

interface MapaEstrategicoProps {
  projetos: Projeto[];
  projetoSelecionadoId?: string;
  onSelectProjeto: (id: string) => void;
  onUpdatePosicao: (id: string, x: number, y: number) => void;
  searchTerm?: string;
  statusFilter?: string;
  c4ViewMode?: C4ViewMode;
  onC4ViewModeChange?: (mode: C4ViewMode) => void;
  selectedContext?: string;
  onSelectedContextChange?: (ctx: string) => void;
  zoomLevel?: number;
  onZoomChange?: (zoom: number) => void;
  onToggleDrawer?: () => void;
  isDrawerOpen?: boolean;
}

const getAmbidestriaColor = (amb: Ambidestria) => {
  switch (amb) {
    case 'explotacao': return { bg: 'bg-orange-500', text: 'text-orange-700', border: 'border-orange-500', hex: '#EA580C' };
    case 'ambidestria': return { bg: 'bg-blue-500', text: 'text-blue-700', border: 'border-blue-500', hex: '#2563EB' };
    case 'exploracao': return { bg: 'bg-purple-500', text: 'text-purple-700', border: 'border-purple-500', hex: '#7C3AED' };
    default: return { bg: 'bg-slate-400', text: 'text-slate-700', border: 'border-slate-400', hex: '#64748B' };
  }
};

const getStatusBadge = (status: StatusProjeto) => {
  const s = (status || '').toLowerCase();
  if (s === 'finalizado') {
    return { text: 'Finalizado', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: CheckCircle2 };
  } else if (s === 'teste' || s === 'operando' || s === 'em_andamento' || s === 'em andamento') {
    return { text: 'Em andamento', bg: 'bg-blue-100 text-blue-800 border-blue-300', icon: Clock };
  } else if (s === 'proxima_etapa' || s === 'próxima etapa') {
    return { text: 'Próxima Etapa', bg: 'bg-indigo-100 text-indigo-800 border-indigo-300', icon: Sparkles };
  } else if (s === 'planejamento' || s === 'em planejamento') {
    return { text: 'Em Planejamento', bg: 'bg-purple-100 text-purple-800 border-purple-300', icon: AlertCircle };
  } else {
    return { text: 'Ideia', bg: 'bg-pink-100 text-pink-800 border-pink-300', icon: HelpCircle };
  }
};

export const MapaEstrategico: React.FC<MapaEstrategicoProps> = ({
  projetos,
  projetoSelecionadoId,
  onSelectProjeto,
  onUpdatePosicao,
  searchTerm = '',
  statusFilter = 'todos',
  c4ViewMode = 'iniciativas',
  onC4ViewModeChange,
  selectedContext = 'todos',
  onSelectedContextChange,
  zoomLevel = 1.0,
  onZoomChange,
  onToggleDrawer,
  isDrawerOpen,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredProjetoId, setHoveredProjetoId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [transientPosMap, setTransientPosMap] = useState<Record<string, { x: number; y: number }>>({});
  
  // Posições dos Nós de Contexto (Macrosistemas Nível 1 C4)
  const [contextPositions, setContextPositions] = useState<Record<string, { x: number; y: number }>>(() => {
    try {
      const saved = localStorage.getItem('mapa_estrategico_context_positions');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // TELEMETRIA DO POINTER: Ponto de origem do Zoom dinâmico focado no mouse/touchpad
  const [zoomOrigin, setZoomOrigin] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  // Animações de Transição Prezi (Zoom In / Zoom Out)
  const [preziAnimation, setPreziAnimation] = useState<'idle' | 'zoomingIn' | 'zoomingOut'>('idle');
  const prevC4ModeRef = useRef<C4ViewMode>(c4ViewMode);

  // Trava para evitar que o clique abra detalhes ao arrastar
  const hasMovedRef = useRef(false);
  const dragStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Dispara animação estilo Prezi quando muda o nível C4
  useEffect(() => {
    if (prevC4ModeRef.current !== c4ViewMode) {
      if (['conteineres', 'componentes', 'codigos'].includes(c4ViewMode)) {
        setPreziAnimation('zoomingIn');
        setTimeout(() => setPreziAnimation('idle'), 1300);
      } else if (c4ViewMode === 'contextos') {
        setPreziAnimation('zoomingOut');
        setTimeout(() => setPreziAnimation('idle'), 1300);
      }
      prevC4ModeRef.current = c4ViewMode;
    }
  }, [c4ViewMode]);

  // 1. Filtro C4 de Delimitação Dupla (Internos e Externos)
  const { internos, externos } = useMemo(() => {
    return C4ContextStore.getC4Boundaries(selectedContext, projetos);
  }, [selectedContext, projetos]);

  // 2. Filtragem de projetos visíveis
  const projetosExibidos = useMemo(() => {
    const baseList = selectedContext === 'todos' ? projetos : [...internos, ...externos];
    return baseList.filter(p => {
      const matchSearch = !searchTerm || p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || p.descricao.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'todos' || (p.status || '').toLowerCase().includes(statusFilter.toLowerCase());
      return matchSearch && matchStatus;
    });
  }, [projetos, internos, externos, selectedContext, searchTerm, statusFilter]);

  // 3. Mapeamento e restrição em 3 Linhas do Grid
  const projetosPosicionados = useMemo(() => {
    const byHorizonte: Record<number, Projeto[]> = { 1: [], 2: [], 3: [] };
    projetosExibidos.forEach(p => {
      const h = p.horizonte || 1;
      if (!byHorizonte[h]) byHorizonte[h] = [];
      byHorizonte[h].push(p);
    });

    return projetosExibidos.map(p => {
      if (transientPosMap[p.id]) {
        return { ...p, calculatedPos: transientPosMap[p.id] };
      }

      let rawPos = p.posicao;
      if (!rawPos || (rawPos.x === 0 && rawPos.y === 0)) {
        const hList = byHorizonte[p.horizonte || 1] || [];
        const idx = hList.findIndex(item => item.id === p.id);
        rawPos = TelemetricHorizonStore.calculateAutomaticSlot(p, hList, idx);
      }

      const clampedPos = TelemetricHorizonStore.clampToHorizon(rawPos.x, rawPos.y, p.horizonte || 1);
      return { ...p, calculatedPos: clampedPos };
    });
  }, [projetosExibidos, transientPosMap]);

  // Projeto atualmente em foco para os Níveis C, D e E
  const projetoAtualFoco = useMemo(() => {
    return projetos.find(p => p.id === projetoSelecionadoId) || projetosPosicionados[0] || projetos[0];
  }, [projetoSelecionadoId, projetos, projetosPosicionados]);

  // 4. Nós de Contextos para Visão Nível 1 C4 Model (Prezi Macro)
  const contextNodes = useMemo(() => {
    return C4ContextStore.buildContextNodes(projetos, contextPositions);
  }, [projetos, contextPositions]);

  const interContextConnections = useMemo(() => {
    return C4ContextStore.buildInterContextConnections(contextNodes, projetos);
  }, [contextNodes, projetos]);

  // 5. Grafo de conexões conectadas para destaque no Hover
  const connectedNodesSet = useMemo(() => {
    if (!hoveredProjetoId) return null;

    const visited = new Set<string>();
    visited.add(hoveredProjetoId);

    const traverseOutgoing = (currId: string) => {
      const proj = projetos.find(p => p.id === currId);
      if (!proj) return;
      (proj.relacoes || []).forEach(r => {
        if (!visited.has(r.projetoDestinoId)) {
          visited.add(r.projetoDestinoId);
          traverseOutgoing(r.projetoDestinoId);
        }
      });
    };

    const traverseIncoming = (currId: string) => {
      projetos.forEach(p => {
        (p.relacoes || []).forEach(r => {
          if (r.projetoDestinoId === currId && !visited.has(p.id)) {
            visited.add(p.id);
            traverseIncoming(p.id);
          }
        });
      });
    };

    traverseOutgoing(hoveredProjetoId);
    traverseIncoming(hoveredProjetoId);

    return visited;
  }, [hoveredProjetoId, projetos]);

  // 6. TELEMETRIA DO MOUS / TOUCHPAD COM ORIGEM DE ZOOM FOCADA NO CURSOR
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || Math.abs(e.deltaY) < 50) {
        e.preventDefault();

        // Extrai a posição exata do cursor para centralizar a ampliação/redução
        const rect = container.getBoundingClientRect();
        const mouseXPercent = Math.min(95, Math.max(5, ((e.clientX - rect.left) / rect.width) * 100));
        const mouseYPercent = Math.min(95, Math.max(5, ((e.clientY - rect.top) / rect.height) * 100));

        setZoomOrigin({ x: mouseXPercent, y: mouseYPercent });

        const zoomFactor = e.deltaY < 0 ? 1.12 : 0.88;
        const newZoom = Math.min(3.0, Math.max(0.4, zoomLevel * zoomFactor));

        if (onZoomChange) {
          onZoomChange(newZoom);
        }
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [zoomLevel, onZoomChange]);

  // 7. MANIPULADOR DE ARRASTE DE CONTEXTOS (NÍVEL 1 C4)
  const handleMouseDownContext = (e: React.MouseEvent, node: ContextoNode) => {
    e.stopPropagation();
    if (!containerRef.current) return;

    hasMovedRef.current = false;
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    setDraggingId(node.id);

    const onGlobalMouseMove = (moveEvent: MouseEvent) => {
      if (!containerRef.current) return;

      const dist = Math.hypot(moveEvent.clientX - dragStartPosRef.current.x, moveEvent.clientY - dragStartPosRef.current.y);
      if (dist > 5) {
        hasMovedRef.current = true;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const mouseXPercent = Math.min(92, Math.max(8, ((moveEvent.clientX - rect.left) / rect.width) * 100));
      const mouseYPercent = Math.min(92, Math.max(8, ((moveEvent.clientY - rect.top) / rect.height) * 100));

      setContextPositions(prev => {
        const next = { ...prev, [node.id]: { x: mouseXPercent, y: mouseYPercent } };
        try {
          localStorage.setItem('mapa_estrategico_context_positions', JSON.stringify(next));
        } catch {}
        return next;
      });
    };

    const onGlobalMouseUp = () => {
      window.removeEventListener('mousemove', onGlobalMouseMove);
      window.removeEventListener('mouseup', onGlobalMouseUp);
      setDraggingId(null);
    };

    window.addEventListener('mousemove', onGlobalMouseMove);
    window.addEventListener('mouseup', onGlobalMouseUp);
  };

  // 8. MANIPULADOR GLOBAL DE DRAG & DROP EM GRID
  const handleMouseDownProjeto = (e: React.MouseEvent, projeto: Projeto, currentPos: { x: number; y: number }) => {
    e.stopPropagation();
    if (!containerRef.current) return;

    const projId = projeto.id;
    const projHorizonte = projeto.horizonte || 1;

    hasMovedRef.current = false;
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    setDraggingId(projId);

    const onGlobalMouseMove = (moveEvent: MouseEvent) => {
      if (!containerRef.current) return;

      const dist = Math.hypot(moveEvent.clientX - dragStartPosRef.current.x, moveEvent.clientY - dragStartPosRef.current.y);
      if (dist > 5) {
        hasMovedRef.current = true;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const mouseXPercent = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      const mouseYPercent = ((moveEvent.clientY - rect.top) / rect.height) * 100;

      const clamped = TelemetricHorizonStore.clampToHorizon(mouseXPercent, mouseYPercent, projHorizonte);

      setTransientPosMap(prev => ({
        ...prev,
        [projId]: clamped,
      }));
    };

    const onGlobalMouseUp = (upEvent: MouseEvent) => {
      window.removeEventListener('mousemove', onGlobalMouseMove);
      window.removeEventListener('mouseup', onGlobalMouseUp);
      setDraggingId(null);

      if (hasMovedRef.current && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const mouseXPercent = ((upEvent.clientX - rect.left) / rect.width) * 100;
        const mouseYPercent = ((upEvent.clientY - rect.top) / rect.height) * 100;

        const finalClamped = TelemetricHorizonStore.clampToHorizon(mouseXPercent, mouseYPercent, projHorizonte);
        onUpdatePosicao(projId, finalClamped.x, finalClamped.y);
      }
    };

    window.addEventListener('mousemove', onGlobalMouseMove);
    window.addEventListener('mouseup', onGlobalMouseUp);
  };

  const handleMouseMoveContainer = (e: React.MouseEvent) => {
    if (hoveredProjetoId && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const hoveredProjeto = useMemo(() => {
    return projetos.find(p => p.id === hoveredProjetoId);
  }, [hoveredProjetoId, projetos]);

  // Classes de Animação estilo Prezi Parallax
  const getPreziTransformClass = () => {
    if (preziAnimation === 'zoomingIn') {
      return 'animate-in zoom-in-30 fade-in duration-1000 ease-in-out';
    }
    if (preziAnimation === 'zoomingOut') {
      return 'animate-in zoom-out-150 fade-in duration-1000 ease-in-out';
    }
    return '';
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 select-none relative">
      
      {/* Botão Flutuante de Abertura do Drawer */}
      {onToggleDrawer && (
        <button
          onClick={onToggleDrawer}
          className="absolute top-4 right-4 z-30 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition border border-blue-500"
        >
          <Layers className="w-4 h-4" />
          <span>Gestão de Projetos</span>
        </button>
      )}

      {/* CANVAS PRINCIPAL EM GRID DE 3 LINHAS HORIZONTAIS */}
      <div 
        ref={containerRef}
        onClick={() => {
          if (!hasMovedRef.current) {
            onSelectProjeto('');
          }
        }}
        className={`flex-1 relative w-full h-full min-h-[680px] bg-white border-b border-slate-200 overflow-hidden cursor-crosshair ${getPreziTransformClass()}`}
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
          transition: preziAnimation !== 'idle' 
            ? 'transform 1200ms cubic-bezier(0.22, 1, 0.36, 1), opacity 1200ms ease-out' 
            : 'transform 300ms cubic-bezier(0.25, 1, 0.5, 1)',
        }}
        onMouseMove={handleMouseMoveContainer}
        onMouseLeave={() => setHoveredProjetoId(null)}
      >

        {/* NÍVEL 1 C4 MODEL: VISÃO MACRO DOS CONTEXTOS (PREZI-STYLE COM ÍCONES ANIMADOS) */}
        {c4ViewMode === 'contextos' ? (
          <div className="absolute inset-0 z-10 p-6 md:p-12 flex flex-col items-center justify-center">
            
            {/* SVG Conexões entre Contextos */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              {interContextConnections.map((conn, idx) => {
                const nodeO = contextNodes.find(n => n.id === conn.origemId);
                const nodeD = contextNodes.find(n => n.id === conn.destinoId);
                if (!nodeO || !nodeD) return null;

                return (
                  <path
                    key={idx}
                    d={`M ${nodeO.posicao.x} ${nodeO.posicao.y} Q 50 50, ${nodeD.posicao.x} ${nodeD.posicao.y}`}
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="1.2"
                    strokeDasharray="3,3"
                    className="animate-pulse"
                  />
                );
              })}
            </svg>

            {/* Cartões Responsivos dos Contextos */}
            {contextNodes.map((node) => (
              <div
                key={node.id}
                style={{
                  left: `${node.posicao.x}%`,
                  top: `${node.posicao.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                onMouseDown={(e) => handleMouseDownContext(e, node)}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!hasMovedRef.current) {
                    if (onSelectedContextChange && onC4ViewModeChange) {
                      onSelectedContextChange(node.nome);
                      onC4ViewModeChange('iniciativas');
                    }
                  }
                }}
                className="absolute z-20 bg-gradient-to-br from-slate-900/95 via-blue-950 to-indigo-950 text-white rounded-2xl p-4 md:p-6 shadow-2xl border-2 border-blue-400/50 hover:border-blue-400 hover:scale-105 transition-all duration-300 cursor-grab active:cursor-grabbing w-[clamp(180px,22vw,280px)] text-center group backdrop-blur-md"
              >
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-blue-600/20 border border-blue-400/30 flex items-center justify-center mx-auto mb-3 text-blue-300 group-hover:scale-110 group-hover:bg-blue-600/30 transition-all duration-300 shadow-inner">
                  <ContextIcon name={node.nome} className="w-8 h-8 md:w-10 md:h-10" />
                </div>

                <h3 className="text-sm md:text-base font-extrabold tracking-tight text-white leading-tight">
                  {node.nome}
                </h3>
                
                <p className="text-[11px] md:text-xs text-blue-200 mt-1 font-medium">
                  {node.quantidadeProjetos} iniciativa(s) mapeada(s)
                </p>

                <div className="mt-3 pt-2.5 border-t border-blue-800/60 flex items-center justify-center gap-1 text-[10px] md:text-[11px] font-bold text-blue-300 group-hover:text-white transition">
                  <span>Mergulhar no Contexto (Prezi Zoom In)</span>
                  <Sparkles className="w-3.5 h-3.5 text-blue-400 group-hover:rotate-12 transition-transform" />
                </div>
              </div>
            ))}

          </div>
        ) : c4ViewMode === 'conteineres' ? (
          /* NÍVEL C C4 MODEL: CONTÊINERES & BANCOS DE DADOS DO CARD */
          <div className="absolute inset-0 z-20 bg-slate-900/95 backdrop-blur-md p-6 overflow-y-auto text-white">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between border-b border-slate-700 pb-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-600 text-white font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full">
                      Nível C — Contêineres C4
                    </span>
                    <span className="text-slate-400 text-xs font-mono">
                      Subcoleção: /projetos/{projetoAtualFoco?.id}/conteineres
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white mt-1">
                    {projetoAtualFoco?.titulo}
                  </h2>
                </div>

                <button
                  onClick={() => onC4ViewModeChange && onC4ViewModeChange('iniciativas')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar ao Mapa (ESC)</span>
                </button>
              </div>

              {/* LISTA DE CONTÊINERES E BANCOS DE DADOS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(projetoAtualFoco?.conteineresList || [
                  { id: 'c1', nome: 'Contêiner Frontend SPA', tipo: 'frontend_spa', resumoTecnico: 'Aplicação Web em produção/teste', tecnologias: 'React, TypeScript, Tailwind' },
                  { id: 'c2', nome: 'Banco PostgreSQL / Firestore', tipo: 'postgresql_tab', resumoTecnico: 'Tabelas relacionais e coleções', tecnologias: 'PostgreSQL 15, Firestore' },
                  { id: 'c3', nome: 'Cache Redis / Memória', tipo: 'redis_cache', resumoTecnico: 'ReadModels e aceleradores de sessão', tecnologias: 'Redis Cluster' }
                ]).map((c, idx) => (
                  <div key={idx} className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 shadow-lg hover:border-blue-500 transition">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                        <Box className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{c.nome}</h4>
                        <span className="text-[10px] font-mono text-blue-300 uppercase">{c.tipo}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mb-3">
                      {c.resumoTecnico}
                    </p>

                    <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Stack: {c.tecnologias}</span>
                      <button 
                        onClick={() => onC4ViewModeChange && onC4ViewModeChange('componentes')}
                        className="text-blue-400 font-bold hover:underline flex items-center gap-1"
                      >
                        <span>Componentes &rarr;</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : c4ViewMode === 'componentes' ? (
          /* NÍVEL D C4 MODEL: COMPONENTES & REGRAS DE NEGÓCIO (dimFuncao, RN-01 a RN-09) */
          <div className="absolute inset-0 z-20 bg-slate-900/95 backdrop-blur-md p-6 overflow-y-auto text-white">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between border-b border-slate-700 pb-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-600 text-white font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full">
                      Nível D — Componentes & Regras C4
                    </span>
                    <span className="text-slate-400 text-xs font-mono">
                      Subcoleção: /projetos/{projetoAtualFoco?.id}/componentes
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white mt-1">
                    {projetoAtualFoco?.titulo}
                  </h2>
                </div>

                <button
                  onClick={() => onC4ViewModeChange && onC4ViewModeChange('conteineres')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar aos Contêineres (ESC)</span>
                </button>
              </div>

              {/* LISTA DE COMPONENTES E REGRAS DE NEGÓCIO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(projetoAtualFoco?.componentesList || [
                  { id: 'cmp1', nome: 'Catálogo Semântico & Capabilities', tipo: 'funcao_regra', descricaoFluxo: 'dimPagina -> dimComponente -> dimFuncao -> relacionamentoPermissao' },
                  { id: 'cmp2', nome: 'Validador de Permissões de Cargo', tipo: 'funcao_regra', descricaoFluxo: 'Revalidação no backend via permissionManifest no Redis' },
                  { id: 'cmp3', nome: 'Motor de Telemetria e Indicadores', tipo: 'calculo_kpi', descricaoFluxo: 'Acúmulo atômico em lote usando FieldValue.increment' }
                ]).map((cmp, idx) => (
                  <div key={idx} className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 shadow-lg hover:border-indigo-500 transition">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
                        <Cpu className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{cmp.nome}</h4>
                        {cmp.regraNegocioCodigo && (
                          <span className="bg-indigo-900/80 text-indigo-300 font-mono text-[9px] px-1.5 py-0.5 rounded border border-indigo-700 font-bold mr-1">
                            {cmp.regraNegocioCodigo}
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-indigo-300 uppercase">{cmp.tipo}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mb-3">
                      {cmp.descricaoFluxo}
                    </p>

                    <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Papel: Regra de Negócio / Capability</span>
                      <button 
                        onClick={() => onC4ViewModeChange && onC4ViewModeChange('codigos')}
                        className="text-indigo-400 font-bold hover:underline flex items-center gap-1"
                      >
                        <span>Schemas &rarr;</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : c4ViewMode === 'codigos' ? (
          /* NÍVEL E C4 MODEL: SCHEMAS DDL SQL & FIRESTORE */
          <div className="absolute inset-0 z-20 bg-slate-900/95 backdrop-blur-md p-6 overflow-y-auto text-white">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between border-b border-slate-700 pb-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-purple-600 text-white font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full">
                      Nível E — Visão Técnica (Schemas & DDLs C4)
                    </span>
                    <span className="text-slate-400 text-xs font-mono">
                      Subcoleção: /projetos/{projetoAtualFoco?.id}/codigos
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white mt-1">
                    {projetoAtualFoco?.titulo}
                  </h2>
                </div>

                <button
                  onClick={() => onC4ViewModeChange && onC4ViewModeChange('componentes')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar aos Componentes (ESC)</span>
                </button>
              </div>

              {/* LISTA DE SCHEMAS E DDLS */}
              <div className="space-y-4">
                {(projetoAtualFoco?.codigosList || [
                  { id: 'cod1', nomeArquivo: 'dimPagina.sql', tipoArtefato: 'ddl_postgres', estruturaDetalhada: 'CREATE TABLE dimPagina (\n  idPagina UUID PRIMARY KEY,\n  codigo VARCHAR NOT NULL,\n  rota VARCHAR NOT NULL\n);' },
                  { id: 'cod2', nomeArquivo: 'turmas_ativas_readmodel.json', tipoArtefato: 'schema_firestore', estruturaDetalhada: '{\n  "idTurma": "string",\n  "siglaTurmaFormatada": "ABA-T5",\n  "progressoPercentual": 75.0\n}' }
                ]).map((cod, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-xl">
                    <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2 font-mono text-xs text-purple-300">
                        <Code2 className="w-4 h-4 text-purple-400" />
                        <span className="font-bold">{cod.nomeArquivo}</span>
                        <span className="bg-purple-950 text-purple-400 text-[10px] px-2 py-0.5 rounded border border-purple-800 uppercase">
                          {cod.tipoArtefato}
                        </span>
                      </div>
                    </div>

                    <pre className="p-3 bg-slate-900 rounded-xl text-xs font-mono text-slate-200 overflow-x-auto border border-slate-800 leading-relaxed">
                      {cod.estruturaDetalhada}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* NÍVEL B C4 MODEL: MAPA DOS 3 HORIZONTES EM GRID DE 3 LINHAS HORIZONTAIS */
          <>
            {/* LINHAS DO GRID BACKDROP */}
            <div className="absolute inset-0 flex flex-col pointer-events-none">
              
              {/* LINHA 3 (TOPO): HORIZONTE 3 — VISÃO & ESTRATÉGICO */}
              <div className="h-[33%] bg-gradient-to-b from-purple-50/60 to-purple-100/20 border-b-2 border-dashed border-purple-200/80 relative p-3">
                <div className="flex items-center gap-2 text-purple-800 font-extrabold text-xs tracking-wider uppercase bg-purple-100/80 border border-purple-300 px-3 py-1 rounded-full w-fit shadow-2xs">
                  <Target className="w-4 h-4 text-purple-700" />
                  <span>Horizonte 3 — Visão / Estratégico (Objetivos Institucionais)</span>
                </div>
              </div>

              {/* LINHA 2 (MEIO): HORIZONTE 2 — GERENCIAMENTO & IDEIAS */}
              <div className="h-[33%] bg-gradient-to-b from-sky-50/50 to-sky-100/20 border-b-2 border-dashed border-sky-200/80 relative p-3">
                <div className="flex items-center gap-2 text-sky-800 font-extrabold text-xs tracking-wider uppercase bg-sky-100/80 border border-sky-300 px-3 py-1 rounded-full w-fit shadow-2xs">
                  <Lightbulb className="w-4 h-4 text-sky-700" />
                  <span>Horizonte 2 — Gerenciamento / Médio Prazo (Ideias & Planejamento)</span>
                </div>
              </div>

              {/* LINHA 1 (BASE): HORIZONTE 1 — OPERACIONAL & PRODUÇÃO */}
              <div className="h-[34%] bg-gradient-to-b from-orange-50/50 to-orange-100/20 relative p-3">
                <div className="flex items-center gap-2 text-orange-800 font-extrabold text-xs tracking-wider uppercase bg-orange-100/80 border border-orange-300 px-3 py-1 rounded-full w-fit shadow-2xs">
                  <Activity className="w-4 h-4 text-orange-700" />
                  <span>Horizonte 1 — Curto Prazo / Operacional (Sistemas em Produção)</span>
                </div>
              </div>

            </div>

            {/* DELIMITAÇÃO DUPLA C4 MODEL (FAIXA INTERNA DO CONTEXTO SELECIONADO) */}
            {selectedContext !== 'todos' && (
              <div className="absolute inset-x-4 md:inset-x-8 top-12 bottom-16 border-2 border-dashed border-blue-500/80 rounded-3xl pointer-events-none z-0 bg-blue-50/10">
                <div className="absolute left-6 top-3 bg-blue-600 text-white font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5 pointer-events-auto">
                  <ContextIcon name={selectedContext} className="w-4 h-4" />
                  Delimitação C4 Interna: {selectedContext}
                </div>
              </div>
            )}

            {/* CAMADA SVG DAS CONEXÕES HIERÁRQUICAS VERTICAIS */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <defs>
                <marker id="arrowSolid" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#2563EB" />
                </marker>
                <marker id="arrowDashed" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#8B5CF6" />
                </marker>
              </defs>

              {projetosPosicionados.flatMap(projOrigem => {
                return (projOrigem.relacoes || []).map((rel, idx) => {
                  const projDestino = projetosPosicionados.find(p => p.id === rel.projetoDestinoId);
                  if (!projDestino) return null;

                  const x1 = projOrigem.calculatedPos.x;
                  const y1 = projOrigem.calculatedPos.y;
                  const x2 = projDestino.calculatedPos.x;
                  const y2 = projDestino.calculatedPos.y;

                  const dx = x2 - x1;
                  const dy = y2 - y1;
                  const cx1 = x1 + dx * 0.25;
                  const cy1 = y1 + dy * 0.1 - 3;
                  const cx2 = x1 + dx * 0.75;
                  const cy2 = y2 - 3;

                  const isDashed = rel.tipo === 'oportunidade' || rel.tipo === 'alternativa';
                  const isPathActive = connectedNodesSet
                    ? connectedNodesSet.has(projOrigem.id) && connectedNodesSet.has(projDestino.id)
                    : false;
                  
                  const isDimmed = connectedNodesSet && !isPathActive;

                  return (
                    <path
                      key={`${projOrigem.id}-${projDestino.id}-${idx}`}
                      d={`M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`}
                      fill="none"
                      stroke={
                        isPathActive 
                          ? '#2563EB' 
                          : isDashed 
                            ? '#8B5CF6' 
                            : '#3B82F6'
                      }
                      strokeWidth={isPathActive ? '1.5' : '0.8'}
                      strokeDasharray={isDashed ? '1.5,1.5' : 'none'}
                      opacity={isDimmed ? 0.1 : isPathActive ? 1 : 0.65}
                      markerEnd={isDashed ? 'url(#arrowDashed)' : 'url(#arrowSolid)'}
                      className="transition-all duration-300"
                    />
                  );
                });
              })}
            </svg>

            {/* CARTÕES RESPONSIVOS DOS PROJETOS NAS LINHAS DO GRID */}
            {projetosPosicionados.map((projeto) => {
              const isSelected = projeto.id === projetoSelecionadoId;
              const isHovered = projeto.id === hoveredProjetoId;
              const isDragging = projeto.id === draggingId;
              const isConnected = connectedNodesSet ? connectedNodesSet.has(projeto.id) : true;
              const isDimmed = connectedNodesSet ? !isConnected : false;

              const isExternal = selectedContext !== 'todos' && (projeto.contexto || 'Geral').trim().toLowerCase() !== selectedContext.trim().toLowerCase();

              const ambColors = getAmbidestriaColor(projeto.ambidestria);
              const badge = getStatusBadge(projeto.status);
              const StatusIcon = badge.icon;

              return (
                <div
                  key={projeto.id}
                  style={{
                    left: `${projeto.calculatedPos.x}%`,
                    top: `${projeto.calculatedPos.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  onMouseEnter={() => setHoveredProjetoId(projeto.id)}
                  onMouseLeave={() => setHoveredProjetoId(null)}
                  onMouseDown={(e) => handleMouseDownProjeto(e, projeto, projeto.calculatedPos)}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!hasMovedRef.current) {
                      onSelectProjeto(projeto.id);
                    }
                  }}
                  className={`absolute z-10 cursor-grab active:cursor-grabbing ${
                    isDragging ? 'transition-none z-40 scale-110 shadow-2xl' : 'transition-all duration-300'
                  } ${isDimmed ? 'opacity-25 grayscale scale-95' : 'opacity-100 scale-100'} ${
                    isHovered || isSelected ? 'z-30 scale-110' : ''
                  }`}
                >
                  <div 
                    className={`bg-white/95 backdrop-blur-xs border rounded-xl p-2.5 shadow-md w-[clamp(150px,18vw,230px)] text-left transition-all ${
                      isSelected 
                        ? 'ring-2 ring-blue-600 border-blue-600 shadow-lg' 
                        : isHovered 
                          ? 'ring-2 ring-blue-400 border-blue-400 shadow-xl' 
                          : isExternal
                            ? 'border-slate-300 border-dashed bg-slate-50/90'
                            : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className={`w-3 h-3 rounded-full ${ambColors.bg} shrink-0 mt-0.5 shadow-xs`} title={`Ambidestria: ${projeto.ambidestria}`} />
                      <div>
                        <h3 className="text-xs font-bold text-slate-800 leading-tight line-clamp-2">
                          {projeto.titulo}
                        </h3>
                        {isExternal && (
                          <span className="text-[9px] font-extrabold text-blue-600 bg-blue-50 border border-blue-200 rounded px-1 mt-0.5 inline-block">
                            Externo: {projeto.contexto}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                        <StatusIcon className="w-3 h-3" />
                        {badge.text}
                      </span>
                      
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        H{projeto.horizonte}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Tooltip Detalhado */}
            {hoveredProjeto && tooltipPos && !draggingId && (
              <div
                style={{
                  left: `${Math.min(window.innerWidth - 300, tooltipPos.x + 15)}px`,
                  top: `${Math.max(15, tooltipPos.y - 120)}px`,
                }}
                className="absolute z-50 pointer-events-none bg-slate-900/95 text-white backdrop-blur-md rounded-xl p-3.5 shadow-2xl border border-slate-700 w-72 text-left animate-in fade-in zoom-in duration-150"
              >
                {hoveredProjeto.imagemUrl && (
                  <div className="w-full h-28 rounded-lg overflow-hidden mb-2 bg-slate-800 border border-slate-700">
                    <img 
                      src={convertDriveUrlToDirectImageUrl(hoveredProjeto.imagemUrl)} 
                      alt={hoveredProjeto.titulo} 
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${getAmbidestriaColor(hoveredProjeto.ambidestria).bg}`} />
                  <p className="text-xs font-bold text-white line-clamp-1">{hoveredProjeto.titulo}</p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[10px]">
                  <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-medium">
                    Horizonte {hoveredProjeto.horizonte}
                  </span>
                  <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-medium capitalize">
                    {hoveredProjeto.ambidestria}
                  </span>
                  <span className="bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800 font-medium">
                    {getStatusBadge(hoveredProjeto.status).text}
                  </span>
                </div>

                {hoveredProjeto.descricao && (
                  <p className="text-[11px] text-slate-300 mt-2 line-clamp-2 font-normal leading-snug border-t border-slate-800 pt-2">
                    {hoveredProjeto.descricao}
                  </p>
                )}
              </div>
            )}
          </>
        )}

      </div>

      {/* Legenda Inferior */}
      <footer className="bg-white border-t border-slate-200 px-6 py-3 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-bold text-slate-800">Legenda de Ambidestria:</span>
          
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-orange-500 inline-block" />
            <span className="font-semibold text-slate-700">Explotação</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
            <span className="font-semibold text-slate-700">Ambidestria</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />
            <span className="font-semibold text-slate-700">Exploração</span>
          </div>
        </div>

        <div className="flex items-center gap-4 border-l border-slate-200 pl-4">
          <span className="font-bold text-slate-800">Conexões:</span>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-0.5 bg-blue-500" />
            <span className="text-slate-600">Caminho principal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-0.5 border-t border-dashed border-purple-500" />
            <span className="text-slate-600">Oportunidade adjacente</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
