
import React, { useState } from 'react';
import { DB } from '../db';

const Admin: React.FC = () => {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const handleLogin = () => {
    // Standard PIN 3530
    if (pin === '3530') {
      setIsAuthenticated(true);
      setStats(DB.getStats());
    } else {
      alert("PIN Inválido. O log do sistema registrou sua falha.");
      setPin('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-center space-y-6">
        <div className="text-5xl">🔐</div>
        <h2 className="text-xl font-rpg font-bold text-red-500">Área Administrativa</h2>
        <p className="text-slate-400 text-sm">Insira o PIN de acesso de nível Arquiteto.</p>
        <input 
          type="password" 
          maxLength={4}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-4 text-center text-3xl tracking-[1em] outline-none focus:ring-2 ring-red-500"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
        />
        <button 
          onClick={handleLogin}
          className="w-full bg-red-600 hover:bg-red-500 py-3 rounded-xl font-bold transition-all shadow-lg shadow-red-900/20"
        >
          Autenticar
        </button>
      </div>
    );
  }

  const users = DB.getAllUsers();

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in zoom-in duration-300">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-rpg font-bold text-white tracking-tighter">ADMIN TERMINAL</h2>
        <div className="bg-red-500/10 text-red-500 px-3 py-1 rounded border border-red-500/20 text-xs font-bold uppercase">Root Access Active</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <div className="text-slate-500 text-[10px] font-black uppercase">Usuários</div>
          <div className="text-3xl font-bold">{stats.totalUsers}</div>
        </div>
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <div className="text-slate-500 text-[10px] font-black uppercase">Hábitos Criados</div>
          <div className="text-3xl font-bold">{stats.totalHabits}</div>
        </div>
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <div className="text-slate-500 text-[10px] font-black uppercase">Missões Lancadas</div>
          <div className="text-3xl font-bold">{stats.totalTasks}</div>
        </div>
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <div className="text-slate-500 text-[10px] font-black uppercase">XP Gerado</div>
          <div className="text-3xl font-bold text-cyan-400">{stats.totalXP}</div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-4 bg-slate-800/50 border-b border-slate-800 font-bold text-sm">Lista de Heróis do Sistema</div>
        <table className="w-full text-left">
          <thead className="text-[10px] text-slate-500 uppercase font-black">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Nome</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Level</th>
              <th className="px-6 py-4">XP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {users.map(u => (
              <tr key={u.id} className="text-sm">
                <td className="px-6 py-4 font-mono text-slate-500">{u.id}</td>
                <td className="px-6 py-4 font-bold">{u.name}</td>
                <td className="px-6 py-4 text-slate-400">{u.email}</td>
                <td className="px-6 py-4"><span className="bg-slate-800 px-2 py-0.5 rounded text-cyan-400">LVL {u.level}</span></td>
                <td className="px-6 py-4 font-mono">{u.xp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Admin;
