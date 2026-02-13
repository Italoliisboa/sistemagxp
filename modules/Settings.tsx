
import React, { useState, useEffect } from 'react';
import { User, UserSettings as IUserSettings } from '../types';
import { DB } from '../db';

interface SettingsProps {
  user: User;
  refreshUser: () => void;
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ user, refreshUser, onLogout }) => {
  const [settings, setSettings] = useState<IUserSettings>(DB.getSettings(user.id));
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [newPin, setNewPin] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSaveProfile = () => {
    DB.updateUser(user.id, { name, email });
    if (newPin.length === 5) {
      DB.updateUser(user.id, { diaryPinHash: newPin });
      setNewPin('');
    }
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
    refreshUser();
  };

  const handleUpdateSettings = (updates: Partial<IUserSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    DB.updateSettings(user.id, newSettings);
  };

  const handleExportData = () => {
    const data = JSON.stringify(localStorage.getItem('LIFE_RPG_DATA_V2'));
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `life_rpg_export_${user.name.toLowerCase()}.json`;
    link.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 animate-in fade-in duration-500">
      <div className="flex items-center gap-6 mb-8">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-4xl shadow-2xl">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-3xl font-rpg font-bold">Ajustes do Herói</h2>
          <p className="text-slate-500 uppercase tracking-widest text-xs font-bold mt-1">Nível {user.level} • {user.xp} XP acumulado</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">👤 Perfil do Personagem</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Nome de Exibição</label>
              <input 
                type="text" 
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-indigo-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Email de Acesso</label>
              <input 
                type="email" 
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-indigo-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block text-amber-500">Novo PIN do Diário (5 dígitos)</label>
              <input 
                type="password" 
                maxLength={5}
                placeholder="Deixe em branco para manter"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-amber-500"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
              />
            </div>
            <button 
              onClick={handleSaveProfile}
              className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-bold transition-all shadow-lg"
            >
              Salvar Alterações
            </button>
            {isSuccess && <p className="text-green-500 text-xs text-center font-bold">✓ Atualizado com sucesso!</p>}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">⚙️ Preferências</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold">Meta de Água</h4>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Ajuste seu consumo diário</p>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="number"
                    className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-center font-bold"
                    value={settings.waterGoal}
                    onChange={(e) => handleUpdateSettings({ waterGoal: Number(e.target.value) })}
                  />
                  <span className="text-xs font-bold text-slate-500">ml</span>
                </div>
              </div>

              <div className="flex justify-between items-center opacity-50 cursor-not-allowed">
                <div>
                  <h4 className="font-bold">Notificações</h4>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Breve: Push de lembretes</p>
                </div>
                <div className="w-10 h-6 bg-slate-800 rounded-full relative">
                   <div className="absolute left-1 top-1 w-4 h-4 bg-slate-600 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">💾 Gerenciar Dados</h3>
            <div className="space-y-3">
              <button 
                onClick={handleExportData}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold transition-colors uppercase tracking-widest"
              >
                Exportar Backup (.json)
              </button>
              <button 
                onClick={onLogout}
                className="w-full py-3 bg-red-900/10 hover:bg-red-900/30 text-red-500 border border-red-500/20 rounded-xl text-xs font-bold transition-colors uppercase tracking-widest"
              >
                Encerrar Sessão
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
