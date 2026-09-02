import React from 'react';

interface ContextIconProps {
  name: string;
  className?: string;
}

export const ContextIcon: React.FC<ContextIconProps> = ({ name, className = 'w-10 h-10' }) => {
  const norm = (name || '').toLowerCase();

  if (norm.includes('inovação') || norm.includes('ia') || norm.includes('pesquisa')) {
    return <InovacaoIaIcon className={className} />;
  }
  if (norm.includes('biblio') || norm.includes('livro') || norm.includes('pós')) {
    return <BiblioPosIcon className={className} />;
  }
  if (norm.includes('sigap') || norm.includes('sistema') || norm.includes('computador')) {
    return <SistemaSigapIcon className={className} />;
  }
  if (norm.includes('portfólio') || norm.includes('portfolio') || norm.includes('mapa')) {
    return <MapaPortfolioIcon className={className} />;
  }
  if (norm.includes('aluno') || norm.includes('portal') || norm.includes('celular')) {
    return <PortalAlunoIcon className={className} />;
  }

  // Ícone Padrão
  return <GenericContextIcon className={className} />;
};

// 1. INOVAÇÃO & IA: Laboratório de pesquisa com tubos de ensaio, bolhas e órbita atômica que borbulha e funciona no hover
export const InovacaoIaIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <div className={`relative group inline-flex items-center justify-center ${className}`}>
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full text-blue-400 group-hover:text-blue-300 transition-colors">
      {/* Balão de Ensaio / Frasco do Laboratório */}
      <path d="M 26 12 L 38 12 M 30 12 L 30 24 L 16 46 C 14 50 17 54 22 54 L 42 54 C 47 54 50 50 48 46 L 34 24 L 34 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* Líquido Químico Animado */}
      <path d="M 19 41 Q 26 37, 32 41 T 45 41 L 44 48 C 43 51 40 53 37 53 L 27 53 C 24 53 21 51 20 48 Z" fill="#3B82F6" className="opacity-80 group-hover:animate-pulse transition-all" />
      
      {/* Bolhas que sobem no Hover */}
      <circle cx="28" cy="38" r="2" fill="#93C5FD" className="group-hover:animate-bounce transition-all duration-300" />
      <circle cx="35" cy="34" r="2.5" fill="#60A5FA" className="group-hover:animate-bounce transition-all duration-500 delay-100" />
      <circle cx="31" cy="27" r="1.5" fill="#BFDBFE" className="group-hover:animate-ping transition-all duration-700 delay-200" />

      {/* Órbita Atômica da IA em rotação no Hover */}
      <ellipse cx="32" cy="34" rx="22" ry="8" stroke="#93C5FD" strokeWidth="1.5" strokeDasharray="3,3" className="group-hover:rotate-180 origin-center transition-transform duration-1000" />
      <circle cx="50" cy="34" r="2.5" fill="#60A5FA" className="group-hover:scale-125 transition-transform" />
    </svg>
  </div>
);

// 2. BIBLIOPÓS: Estante de livros onde os livros deslizam e trocam de lugar no hover
export const BiblioPosIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <div className={`relative group inline-flex items-center justify-center ${className}`}>
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full text-indigo-400 group-hover:text-indigo-300 transition-colors">
      {/* Prateleira da Estante */}
      <path d="M 8 50 L 56 50" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      
      {/* Livro 1 (Vermelho/Rosa) */}
      <rect x="14" y="22" width="8" height="28" rx="2" fill="#EC4899" className="group-hover:-translate-y-2 group-hover:rotate-3 transition-transform duration-300 origin-bottom" />
      
      {/* Livro 2 (Azul) - Desliza para o lado no hover */}
      <rect x="24" y="16" width="9" height="34" rx="2" fill="#3B82F6" className="group-hover:translate-x-3 transition-transform duration-300" />
      
      {/* Livro 3 (Amarelo) - Inclina no hover */}
      <rect x="35" y="20" width="8" height="30" rx="2" fill="#F59E0B" className="group-hover:-translate-x-2 group-hover:-rotate-6 transition-transform duration-300 origin-bottom" />
      
      {/* Livro 4 (Roxo) */}
      <rect x="45" y="24" width="7" height="26" rx="2" fill="#8B5CF6" className="group-hover:translate-y-1 transition-transform duration-300" />
    </svg>
  </div>
);

// 3. SISTEMA SIGAP: Monitor de computador com páginas/janelas alternando telas no hover
export const SistemaSigapIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <div className={`relative group inline-flex items-center justify-center ${className}`}>
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full text-sky-400 group-hover:text-sky-300 transition-colors">
      {/* Monitor do Computador */}
      <rect x="10" y="12" width="44" height="32" rx="4" stroke="currentColor" strokeWidth="3" fill="#0F172A" />
      <path d="M 26 44 L 22 54 M 38 44 L 42 54 M 18 54 L 46 54" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      
      {/* Barra de Janela */}
      <circle cx="16" cy="18" r="1.5" fill="#EF4444" />
      <circle cx="21" cy="18" r="1.5" fill="#F59E0B" />
      <circle cx="26" cy="18" r="1.5" fill="#10B981" />

      {/* Página 1 (Alterna no Hover) */}
      <rect x="16" y="24" width="14" height="14" rx="2" fill="#38BDF8" className="group-hover:opacity-20 transition-opacity duration-300" />
      <path d="M 34 26 L 48 26 M 34 31 L 44 31 M 34 36 L 46 36" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" className="group-hover:stroke-sky-300 transition-colors" />

      {/* Página 2 (Surge no Hover com transição) */}
      <rect x="28" y="22" width="18" height="16" rx="2" fill="#2563EB" className="opacity-0 group-hover:opacity-90 group-hover:scale-105 transition-all duration-300" />
      <path d="M 32 26 L 42 26 M 32 30 L 40 30" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </svg>
  </div>
);

// 4. MAPA PORTFÓLIO: Mapa cartográfico com pinos demarcando locais no hover
export const MapaPortfolioIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <div className={`relative group inline-flex items-center justify-center ${className}`}>
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full text-emerald-400 group-hover:text-emerald-300 transition-colors">
      {/* Dobras do Mapa Cartográfico */}
      <path d="M 10 16 L 24 10 L 40 18 L 54 12 L 54 48 L 40 54 L 24 46 L 10 52 Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" fill="#064E3B" fillOpacity="0.4" />
      <path d="M 24 10 L 24 46 M 40 18 L 40 54" stroke="currentColor" strokeWidth="2" strokeDasharray="2,2" />

      {/* Pino 1 (Verde) */}
      <g className="group-hover:-translate-y-1 transition-transform duration-300">
        <path d="M 22 28 C 22 24 25 21 28 21 C 31 21 34 24 34 28 C 34 33 28 39 28 39 C 28 39 22 33 22 28 Z" fill="#10B981" />
        <circle cx="28" cy="27" r="2" fill="#FFFFFF" />
      </g>

      {/* Pino 2 (Rosa - Surge marcando novo local no Hover) */}
      <g className="opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-3 transition-all duration-500 delay-100">
        <path d="M 38 36 C 38 33 40 30 43 30 C 46 30 48 33 48 36 C 48 40 43 45 43 45 C 43 45 38 40 38 36 Z" fill="#F43F5E" />
        <circle cx="43" cy="35" r="1.5" fill="#FFFFFF" />
      </g>
    </svg>
  </div>
);

// 5. PORTAL DO ALUNO: Perfil de estudante em smartphone com toque/clique no hover
export const PortalAlunoIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <div className={`relative group inline-flex items-center justify-center ${className}`}>
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full text-purple-400 group-hover:text-purple-300 transition-colors">
      {/* Corpo do Smartphone */}
      <rect x="18" y="10" width="28" height="46" rx="5" stroke="currentColor" strokeWidth="3" fill="#1E1B4B" />
      <line x1="28" y1="14" x2="36" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />

      {/* Avatar do Aluno */}
      <circle cx="32" cy="26" r="6" fill="#A855F7" className="group-hover:scale-110 transition-transform origin-center" />
      <path d="M 23 38 C 23 33 27 31 32 31 C 37 31 41 33 41 38 Z" fill="#C084FC" />

      {/* Dedo/Cursor de Toque clicando na tela no Hover */}
      <g className="opacity-0 group-hover:opacity-100 group-hover:scale-100 scale-50 transition-all duration-300">
        <circle cx="32" cy="42" r="7" fill="#C084FC" fillOpacity="0.4" className="animate-ping" />
        <path d="M 36 46 L 32 38 L 29 42 Z" fill="#FFFFFF" />
      </g>
    </svg>
  </div>
);

const GenericContextIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <div className={`relative group inline-flex items-center justify-center ${className}`}>
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full text-slate-400 group-hover:text-blue-400 transition-colors">
      <rect x="14" y="14" width="36" height="36" rx="8" stroke="currentColor" strokeWidth="3" fill="#1E293B" />
      <path d="M 24 24 L 40 24 M 24 32 L 40 32 M 24 40 L 32 40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  </div>
);
