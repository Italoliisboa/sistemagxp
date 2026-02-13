
import React from 'react';
import { Profile } from '../types';

interface DashboardProps {
  profile: Profile;
  setView: (v: string) => void;
  refresh: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ profile, setView }) => {
  const nextXP = profile.level * profile.level * 100;
  const progress = (profile.xp / nextXP) * 100;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header - Industrial Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="text-9xl font-black">0{profile.level}</span>
          </div>
          
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.3em] mb-2">Operador Identificado</p>
              <h1 className="text-4xl font-rpg font-bold tracking-tight text-white mb-6">
                {profile.name}
              </h1>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-600/10 text-blue-500 px-3 py-1 rounded border border-blue-500/20 text-xs font-black uppercase tracking-widest">
                    Level {profile.level}
                  </div>
                  <span className="text-zinc-500 text-[10px] font-bold uppercase">{profile.xp} / {nextXP} XP</span>
                </div>
              </div>
              <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden border border-zinc-700/50">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-center">
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Frequência Operacional</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">{profile.streak}</span>
              <span className="text-zinc-500 text-xs font-bold uppercase">Dias</span>
            </div>
            <div className="flex gap-1 mt-3">
              {[...Array(7)].map((_, i) => (
                <div key={i} className={`h-1 flex-1 rounded-full ${i < profile.streak ? 'bg-blue-500' : 'bg-zinc-800'}`}></div>
              ))}
            </div>
          </div>
          <button 
            onClick={() => setView('tasks')}
            className="bg-blue-600 hover:bg-blue-500 transition-all text-white rounded-2xl p-6 font-bold flex items-center justify-between group shadow-lg shadow-blue-900/20"
          >
            <div className="text-left">
              <p className="text-blue-200 text-[10px] font-black uppercase tracking-widest mb-1">Ação Requerida</p>
              <div className="text-lg">Próxima Missão</div>
            </div>
            <span className="text-2xl group-hover:translate-x-2 transition-transform">→</span>
          </button>
        </div>
      </div>

      {/* Grid de Ferramentas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <NavCard icon="🔁" title="Hábitos" onClick={() => setView('habits')} count="8" />
        <NavCard icon="📜" title="Missões" onClick={() => setView('tasks')} count="12" />
        <NavCard icon="💰" title="Finanças" onClick={() => {}} count="R$" />
        <NavCard icon="🛡️" title="Perfil" onClick={() => {}} count="ID" />
      </div>

      {/* Log de Atividade Recente - Estilo Terminal */}
      <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
          <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Log de Sincronização</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">Live Connection</span>
          </div>
        </div>
        <div className="p-6 font-mono text-[11px] text-zinc-500 space-y-2">
          <p><span className="text-blue-500">[AUTH]</span> Sessão criptografada estabelecida para {profile.name}.</p>
          <p><span className="text-zinc-600">[DB]</span> Carregando módulos de persistência v4.1.0...</p>
          <p><span className="text-emerald-500/80">[XP]</span> Último ganho registrado: +15 XP (Missão Finalizada).</p>
        </div>
      </div>
    </div>
  );
};

const NavCard = ({ icon, title, onClick, count }: any) => (
  <button 
    onClick={onClick}
    className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl hover:bg-zinc-800/60 hover:border-zinc-700 transition-all text-left flex flex-col gap-4 group"
  >
    <div className="flex justify-between items-start">
      <span className="text-xl group-hover:scale-110 transition-transform">{icon}</span>
      <span className="text-zinc-700 font-bold text-xs">{count}</span>
    </div>
    <span className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors uppercase tracking-wider">{title}</span>
  </button>
);

export default Dashboard;
