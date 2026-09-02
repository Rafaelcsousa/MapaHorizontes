import React, { useState, useEffect } from 'react';
import { Projeto, Dialogo, C4ViewMode } from './types';
import { subscribeProjetos, subscribeDialogos, addProjetoBD, updateProjetoBD, deleteProjetoBD, isUsingLocalStorage } from './lib/firebase';
import { MetricasSuperiores } from './components/MetricasSuperiores';
import { MapaEstrategico } from './components/MapaEstrategico';
import { PainelLateral } from './components/PainelLateral';
import { LoginModal } from './components/LoginModal';
import { AlertTriangle, Layers, Plus } from 'lucide-react';

export const App: React.FC = () => {
  const [authenticated, setAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('mapa_estrategico_team_auth') === 'true';
  });

  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [projetoSelecionadoId, setProjetoSelecionadoId] = useState<string | undefined>(undefined);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Estados dos 5 Níveis C4 Model e Zoom Telemétrico
  const [c4ViewMode, setC4ViewMode] = useState<C4ViewMode>('iniciativas');
  const [selectedContext, setSelectedContext] = useState<string>('todos');
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);

  const [historicoDialogos, setHistoricoDialogos] = useState<Dialogo[]>([]);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  // Subscrever aos Projetos do Firestore / LocalStorage
  useEffect(() => {
    if (!authenticated) return;
    const unsubscribe = subscribeProjetos((data) => {
      setProjetos(data);
    });
    return () => unsubscribe();
  }, [authenticated]);

  // Subscrever aos Diálogos do Projeto Selecionado
  useEffect(() => {
    if (!projetoSelecionadoId) {
      setHistoricoDialogos([]);
      return;
    }
    const unsubscribe = subscribeDialogos(projetoSelecionadoId, (data) => {
      setHistoricoDialogos(data);
    });
    return () => unsubscribe();
  }, [projetoSelecionadoId]);

  // NAVEGAÇÃO REGRESSIVA COM A TECLA ESC (5 NÍVEIS DE ZOOM C4 MODEL)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Se o gaveteiro de detalhes ou formulário estiver aberto, fecha primeiro
        if (isDrawerOpen || isCreatingNew) {
          setIsDrawerOpen(false);
          setIsCreatingNew(false);
          return;
        }

        // Se um projeto específico estiver selecionado, desseleciona
        if (projetoSelecionadoId) {
          setProjetoSelecionadoId(undefined);
          return;
        }

        // Regressão nos 5 Níveis de Zoom C4 Model: codigos -> componentes -> conteineres -> iniciativas -> contextos
        if (c4ViewMode === 'codigos') {
          setC4ViewMode('componentes');
        } else if (c4ViewMode === 'componentes') {
          setC4ViewMode('conteineres');
        } else if (c4ViewMode === 'conteineres') {
          setC4ViewMode('iniciativas');
        } else if (c4ViewMode === 'iniciativas') {
          setC4ViewMode('contextos');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, isCreatingNew, projetoSelecionadoId, c4ViewMode]);

  const handleSaveProjeto = async (data: Omit<Projeto, 'id' | 'criadoEm' | 'atualizadoEm'> & { id?: string }) => {
    if (data.id) {
      await updateProjetoBD(data.id, data);
      setProjetoSelecionadoId(data.id);
    } else {
      const newId = await addProjetoBD(data as any);
      setProjetoSelecionadoId(newId);
    }
  };

  const handleDeleteProjeto = async (id: string) => {
    await deleteProjetoBD(id);
    if (projetoSelecionadoId === id) {
      setProjetoSelecionadoId(undefined);
    }
  };

  const handleUpdatePosicao = async (id: string, x: number, y: number) => {
    await updateProjetoBD(id, { posicao: { x, y } });
  };

  const projetoSelecionado = projetos.find(p => p.id === projetoSelecionadoId);

  if (!authenticated) {
    return <LoginModal onAuthenticated={() => setAuthenticated(true)} />;
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-800 antialiased relative">
      
      {/* Banner de aviso para fallback local */}
      {isUsingLocalStorage() && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-1.5 text-center text-xs font-semibold text-amber-800 flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>Modo Local (LocalStorage) ativo. Para conectar ao Cloud Firestore, adicione as credenciais no arquivo .env</span>
        </div>
      )}

      {/* Cabeçalho com Métricas e Alternador C4 Model em 5 Níveis */}
      <div className="relative z-20 flex items-center justify-between bg-white border-b border-slate-200">
        <div className="flex-1">
          <MetricasSuperiores
            projetos={projetos}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            c4ViewMode={c4ViewMode}
            onC4ViewModeChange={setC4ViewMode}
            selectedContext={selectedContext}
            onSelectedContextChange={setSelectedContext}
            zoomLevel={zoomLevel}
            onZoomIn={() => setZoomLevel(z => Math.min(3.0, z + 0.15))}
            onZoomOut={() => setZoomLevel(z => Math.max(0.4, z - 0.15))}
            onZoomReset={() => setZoomLevel(1.0)}
          />
        </div>
      </div>

      {/* Área Principal do Mapa e Gaveteiro Lateral */}
      <div className="flex-1 flex overflow-hidden relative">
        <MapaEstrategico
          projetos={projetos}
          projetoSelecionadoId={projetoSelecionadoId}
          onSelectProjeto={(id) => {
            setProjetoSelecionadoId(id || undefined);
            if (id) setIsDrawerOpen(true);
          }}
          onUpdatePosicao={handleUpdatePosicao}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          c4ViewMode={c4ViewMode}
          onC4ViewModeChange={setC4ViewMode}
          selectedContext={selectedContext}
          onSelectedContextChange={setSelectedContext}
          zoomLevel={zoomLevel}
          onZoomChange={setZoomLevel}
          onToggleDrawer={() => setIsDrawerOpen(prev => !prev)}
          isDrawerOpen={isDrawerOpen}
        />

        {/* Drawer Lateral de Edição & Detalhes Retrátil */}
        <PainelLateral
          isOpen={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false);
            setIsCreatingNew(false);
          }}
          projetoSelecionado={projetoSelecionado}
          projetosExistentes={projetos}
          historicoDialogos={historicoDialogos}
          onSelectProjeto={(id) => setProjetoSelecionadoId(id || undefined)}
          onSaveProjeto={handleSaveProjeto}
          onDeleteProjeto={handleDeleteProjeto}
          isCreatingNew={isCreatingNew}
          onSetIsCreatingNew={setIsCreatingNew}
        />
      </div>

    </div>
  );
};

export default App;
