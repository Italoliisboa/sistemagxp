
import React, { useState, useEffect } from 'react';
import { API } from '../api';
import { Profile } from '../types';

const Admin: React.FC = () => {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // PIN de segurança padrão para deploy: 3530
    if (pin === '3530') {
      setIsAuthenticated(true);
      setLoading(true);
      const s = await API.getGlobalStats();
      const u = await API.getAllUsers();
      setStats(s);
      setUsers(u);
      setLoading(false);
    } else {
      alert("ACESSO NEGADO. OPERAÇÃO REGISTRADA.");
      setPin('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl text-center space-y-6 animate-in zoom-in duration-300">
        <div className="text-5xl">🔐</div>
        <h2 className="text-2xl font-black text-red-500 uppercase tracking-tighter">Terminal Root</h2>
        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Insira o PIN de acesso nível Arquiteto</p>
        <input 
          type="password" 
          maxLength={4}
          autoFocus
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-5 text-center text-4xl tracking-[0.5em] outline-none focus:border-red-500 text-white font-mono"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
        />
        <button 
          onClick={handleLogin}
          className="w-full bg-red-600 hover:bg-red-500 py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-red-900/20"
        >
          Autenticar
        </button>
      </div>
    );
  }

  if (loading) return <div className="text-center py-20 text-zinc-500 font-mono animate-pulse">[ ANALISANDO NÚCLEO DO SISTEMA... ]</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Admin Core</h2>
          <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-1 animate-pulse">● Acesso Root Ativo</p>
        </div>
        <button onClick={() => window.location.reload()} className="text-zinc-600 hover:text-white text-[10px] font-black uppercase tracking-widest">Sair do Terminal</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
          <div className="text-zinc-500 text-[10px] font-black uppercase mb-1">Total de Operadores</div>
          <div className="text-4xl font-black text-white">{stats?.totalUsers}</div>
        </div>
        <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
          <div className="text-zinc-500 text-[10px] font-black uppercase mb-1">Protocolos de Hábito</div>
          <div className="text-4xl font-black text-white">{stats?.totalHabits}</div>
        </div>
        <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
          <div className="text-zinc-500 text-[10px] font-black uppercase mb-1">Missões Lançadas</div>
          <div className="text-4xl font-black text-white">{stats?.totalTasks}</div>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl">
        <div className="p-5 bg-zinc-950/50 border-b border-zinc-800 font-black text-[10px] uppercase tracking-widest text-zinc-500">Mural de Heróis Sincronizados</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-[9px] text-zinc-600 uppercase font-black bg-zinc-950/30">
              <tr>
                <th className="px-6 py-5">Identificador</th>
                <th className="px-6 py-5">Operador</th>
                <th className="px-6 py-5">Status (Lvl)</th>
                <th className="px-6 py-5 text-right">Experiência (XP)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-zinc-800/20 transition-colors">
                  <td className="px-6 py-5 font-mono text-[10px] text-zinc-600">{u.id.substring(0, 8)}</td>
                  <td className="px-6 py-5">
                    <div className="font-black text-zinc-100">{u.name}</div>
                    <div className="text-[10px] text-zinc-600 truncate max-w-[150px]">{u.email}</div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="bg-blue-600/10 text-blue-500 px-3 py-1 rounded-lg text-[10px] font-black uppercase">LVL {u.level}</span>
                  </td>
                  <td className="px-6 py-5 text-right font-mono text-zinc-200">{u.xp.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;
