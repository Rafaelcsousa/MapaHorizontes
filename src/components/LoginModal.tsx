import React, { useState } from 'react';
import { Lock, ShieldCheck, KeyRound, ArrowRight } from 'lucide-react';

interface LoginModalProps {
  onAuthenticated: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onAuthenticated }) => {
  const [tokenInput, setTokenInput] = useState('');
  const [error, setError] = useState(false);

  const expectedToken = import.meta.env.VITE_TEAM_ACCESS_TOKEN || 'mapa2026';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenInput.trim() === expectedToken.trim()) {
      localStorage.setItem('mapa_estrategico_team_auth', 'true');
      onAuthenticated();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-8 text-center">
        
        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mx-auto mb-5 shadow-inner">
          <Lock className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Acesso Restrito — Mapa Estratégico
        </h2>
        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
          Informe a chave de acesso enviada para a equipe para visualizar e editar o mapa.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-blue-600" />
              Código de Acesso da Equipe
            </label>
            <input
              type="password"
              required
              autoFocus
              value={tokenInput}
              onChange={(e) => {
                setTokenInput(e.target.value);
                setError(false);
              }}
              placeholder="Digite a chave da equipe..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-mono tracking-wider focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />
            {error && (
              <p className="text-xs font-semibold text-rose-600 mt-1.5 animate-in fade-in">
                Código de acesso inválido. Verifique o token da sua equipe.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition shadow-md flex items-center justify-center gap-2"
          >
            <span>Acessar Painel</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100">
          <p className="text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Sessão segura de trabalho da equipe
          </p>
        </div>

      </div>
    </div>
  );
};
