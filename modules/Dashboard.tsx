
import React from 'react';
import { Profile } from '../types';

interface DashboardProps {
  profile: Profile;
  setView: (v: string) => void;
  refresh: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ profile, setView }) => {
  const nextLevelXP = profile.level * profile.level * 100;
  const progress = (profile.xp / nextLevelXP) * 100;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Main Status Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-zinc-900 border border-zinc-800 p-8 rounded-lg relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] select-none">
             <span className="text-9xl font-black">L{profile.level}</span>
          </div>
          
          <div className="relative z-10">
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Status do Operador</p>
            <h1 className="text-3xl font-black text-white tracking-tight mb-8">{profile.name}</h1>
            
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Nível {profile.level}</span>
                <span className="text-[10px] font-mono text-zinc-500">{profile.xp} / {nextLevelXP} XP</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-950 rounded-full border border-zinc-800 overflow-hidden">
                <div 
                  className="h-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all duration-1000"
                  style={{ width: `${Math.min(100, progress)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex-1 bg-zinc-900 border border-zinc-800 p-6 rounded-lg flex flex-col justify-center">
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Frequência</p>
            <div className="text-4xl font-black text-white">{profile.streak} <span className="text-sm font-normal text-zinc-500">dias</span></div>
          </div>
          <button 
            onClick={() => setView('tasks')}
            className="flex-1 bg-blue-600 hover:bg-blue-500 transition-all p-6 rounded-lg text-left group shadow-lg shadow-blue-900/20"
          >
            <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest mb-1">Ação Requerida</p>
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-white uppercase">Ver Missões</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </button>
        </div>
      </div>

      {/* Industrial Tools Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <ToolCard icon="🔁" label="Hábitos" onClick={() => setView('habits')} />
        <ToolCard icon="📜" label="Missões" onClick={() => setView('tasks')} />
        <ToolCard icon="💰" label="Tesouraria" onClick={() => setView('finance')} />
        <ToolCard icon="⚔️" label="Treino" onClick={() => setView('fitness')} />
        <ToolCard icon="💧" label="Hidratação" onClick={() => setView('water')} />
        <ToolCard icon="📔" label="Diário" onClick={() => setView('diary')} />
        <ToolCard icon="📂" label="Arquivos" onClick={() => setView('attachments')} />
        <ToolCard icon="⚙️" label="Ajustes" onClick={() => setView('settings')} />
      </div>

      {/* System Log Footer */}
      <div className="bg-zinc-950 border border-zinc-800 p-4 rounded font-mono text-[10px] text-zinc-600">
        <div className="flex justify-between items-center mb-2">
          <span className="uppercase font-bold tracking-tighter">System Terminal v4.0.1</span>
          <span className="text-blue-500 animate-pulse">● ONLINE</span>
        </div>
        <div className="space-y-1">
          <p>> Conexão segura estabelecida com Supabase Cloud...</p>
          <p>> Perfil do usuário "{profile.name}" carregado com sucesso.</p>
          <p>> {new Date().toLocaleTimeString()} - Logs de atividade sincronizados.</p>
        </div>
      </div>
    </div>
  );
};

const ToolCard = ({ icon, label, onClick }: any) => (
  <button 
    onClick={onClick}
    className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-lg hover:bg-zinc-800/80 hover:border-zinc-700 transition-all text-left space-y-3 group"
  >
    <div className="text-xl grayscale group-hover:grayscale-0 transition-all">{icon}</div>
    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-zinc-200">{label}</p>
  </button>
);

export default Dashboard;
