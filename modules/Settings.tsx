
import React, { useState, useEffect } from 'react';
import { User, UserSettings as IUserSettings } from '../types';
import { API } from '../api';

interface SettingsProps {
  user: User;
  refreshUser: () => void;
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ user, refreshUser, onLogout }) => {
  const [settings, setSettings] = useState<IUserSettings>({ waterGoal: 2500, notificationsEnabled: true, theme: 'dark' });
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, [user.id]);

  const loadSettings = async () => {
    const s = await API.getSettings(user.id);
    setSettings(s);
    setLoading(false);
  };

  const handleSaveProfile = async () => {
    await API.updateProfile(user.id, { name });
    await API.updateSettings(user.id, settings);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
    refreshUser();
  };

  const handleUpdateSettings = (updates: Partial<IUserSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const handleExportData = () => {
    const data = JSON.stringify(user);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `life_rpg_profile_${user.name.toLowerCase()}.json`;
    link.click();
  };

  if (loading) return <div className="text-center py-20 text-zinc-500 font-mono">CARREGANDO AJUSTES...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 animate-in fade-in duration-500">
      <div className="flex items-center gap-6 mb-8">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-4xl shadow-2xl">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-3xl font-black text-white">Ajustes do Operador</h2>
          <p className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold mt-1">Nível {user.level} • Protocolo Identificado</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">👤 Perfil do Personagem</h3>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Nome de Exibição</label>
              <input 
                type="text" 
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all text-white"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block opacity-50">Email (Somente Leitura)</label>
              <input 
                type="email" 
                disabled
                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 outline-none text-zinc-600 cursor-not-allowed"
                value={email}
              />
            </div>
            <button 
              onClick={handleSaveProfile}
              className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20"
            >
              Sincronizar Protocolo
            </button>
            {isSuccess && <p className="text-green-500 text-[10px] text-center font-bold uppercase tracking-widest">✓ Sincronia concluída com sucesso</p>}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">⚙️ Preferências</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-zinc-100">Meta de Água</h4>
                  <p className="text-[9px] text-zinc-500 uppercase font-black">Consumo Diário em ml</p>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="number"
                    className="w-24 bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-2 text-center font-black text-blue-500 outline-none"
                    value={settings.waterGoal}
                    onChange={(e) => handleUpdateSettings({ waterGoal: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center opacity-40">
                <div>
                  <h4 className="font-bold">Notificações Push</h4>
                  <p className="text-[9px] text-zinc-500 uppercase font-black">Lembretes Operacionais</p>
                </div>
                <div className="w-10 h-5 bg-zinc-800 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">💾 Sistema</h3>
            <button 
              onClick={handleExportData}
              className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Exportar Snapshot (.json)
            </button>
            <button 
              onClick={onLogout}
              className="w-full py-3 bg-red-900/10 hover:bg-red-900/30 text-red-500 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Encerrar Sessão
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
