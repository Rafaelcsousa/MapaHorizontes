import React from 'react';
import { Projeto, C4ViewMode } from '../types';
import { ContextIcon } from './ContextIcons';
import { 
  Search, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Box, 
  Cpu, 
  Code2, 
  Database,
  Globe,
  LayoutGrid
} from 'lucide-react';

interface MetricasSuperioresProps {
  projetos: Projeto[];
  searchTerm: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  c4ViewMode: C4ViewMode;
  onC4ViewModeChange: (mode: C4ViewMode) => void;
  selectedContext: string;
  onSelectedContextChange: (ctx: string) => void;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
}

export const MetricasSuperiores: React.FC<MetricasSuperioresProps> = ({
  projetos,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  c4ViewMode,
  onC4ViewModeChange,
  selectedContext,
  onSelectedContextChange,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onZoomReset,
}) => {
  const contextosDisponiveis = Array.from(
    new Set(projetos.map(p => p.contexto || 'Geral'))
  ).sort();

  return (
    <header className="bg-white border-b border-slate-200 px-4 py-3 shadow-xs">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        
        {/* LADO ESQUERDO: TÍTULO DA APLICAÇÃO & FILTRO DE CONTEXTO MACRO */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-slate-900 tracking-tight leading-none">
                MAPA DE HORIZONTES ESTRATÉGICOS
              </h1>
              <span className="bg-blue-100 text-blue-800 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-blue-200 uppercase tracking-wider">
                C4 Model v2.5
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Gestão de Projetos, Ideias, Visão Institucional & Atendimentos
            </p>
          </div>
        </div>

        {/* NAVEGAÇÃO DOS 5 NÍVEIS DE ZOOM C4 MODEL (LEVELS A, B, C, D, E) */}
        <div className="flex items-center justify-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner overflow-x-auto">
          <button
            onClick={() => onC4ViewModeChange('contextos')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
              c4ViewMode === 'contextos'
                ? 'bg-blue-600 text-white shadow-sm scale-102'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
            title="Nível A — Visão Macro dos Microssistemas (Nugem, Apoio)"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Nível A (Microssistemas)</span>
          </button>

          <button
            onClick={() => onC4ViewModeChange('iniciativas')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
              c4ViewMode === 'iniciativas'
                ? 'bg-blue-600 text-white shadow-sm scale-102'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
            title="Nível B — Contexto (O Mapa dos 3 Horizontes em Grid 3 Linhas)"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Nível B (Grid 3 Horizontes)</span>
          </button>

          <button
            onClick={() => onC4ViewModeChange('conteineres')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
              c4ViewMode === 'conteineres'
                ? 'bg-blue-600 text-white shadow-sm scale-102'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
            title="Nível C — Contêineres e Bancos de Dados (Postgres/Firestore/Redis/S3)"
          >
            <Box className="w-3.5 h-3.5" />
            <span>Nível C (Contêineres)</span>
          </button>

          <button
            onClick={() => onC4ViewModeChange('componentes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
              c4ViewMode === 'componentes'
                ? 'bg-blue-600 text-white shadow-sm scale-102'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
            title="Nível D — Componentes e Regras (dimFuncao, RN-01 a RN-09)"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Nível D (Componentes)</span>
          </button>

          <button
            onClick={() => onC4ViewModeChange('codigos')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
              c4ViewMode === 'codigos'
                ? 'bg-blue-600 text-white shadow-sm scale-102'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
            title="Nível E — Visão Técnica (Schemas DDL SQL / JSON Firestore)"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Nível E (Schemas)</span>
          </button>
        </div>

        {/* LADO DIREITO: FILTROS & CONTROLES DE ZOOM TELEMÉTRICO */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          
          {/* Seletor de Contexto */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <ContextIcon name={selectedContext} className="w-4 h-4 text-blue-600" />
            <select
              value={selectedContext}
              onChange={(e) => onSelectedContextChange(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 border-none outline-none cursor-pointer pr-1"
            >
              <option value="todos">Todos os Microssistemas</option>
              {contextosDisponiveis.map(ctx => (
                <option key={ctx} value={ctx}>{ctx}</option>
              ))}
            </select>
          </div>

          {/* Campo de Busca */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar iniciativas..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-36 md:w-44 transition-all"
            />
          </div>

          {/* Controles de Zoom Telemétrico */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-0.5">
            <button
              onClick={onZoomOut}
              className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 transition"
              title="Zoom Out (Diminuir Zoom)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            
            <span className="text-[11px] font-bold text-slate-700 px-2 min-w-[42px] text-center font-mono">
              {Math.round(zoomLevel * 100)}%
            </span>

            <button
              onClick={onZoomIn}
              className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 transition"
              title="Zoom In (Aumentar Zoom)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onZoomReset}
              className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 border-l border-slate-200 ml-0.5 transition"
              title="Resetar Zoom (100%)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </header>
  );
};
