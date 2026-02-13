
import React, { useState, useEffect } from 'react';
import { User, FinancialEntry } from '../types';
import { API } from '../api';

interface FinanceProps {
  user: User;
  refreshUser: () => void;
}

const Finance: React.FC<FinanceProps> = ({ user, refreshUser }) => {
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Geral');

  useEffect(() => { loadFinance(); }, [user.id]);

  const loadFinance = async () => {
    setLoading(true);
    const data = await API.getFinance(user.id);
    setEntries(data);
    setLoading(false);
  };

  const totalIncome = entries.filter(e => e.type === 'income').reduce((acc, e) => acc + e.amount, 0);
  const totalExpense = entries.filter(e => e.type === 'expense').reduce((acc, e) => acc + e.amount, 0);
  const balance = totalIncome - totalExpense;

  const handleAdd = async () => {
    if (!amount || isNaN(Number(amount))) return;
    await API.addFinance(user.id, {
      type,
      amount: Number(amount),
      description,
      category,
      date: new Date().toISOString().split('T')[0]
    }, user.xp);
    
    setAmount('');
    setDescription('');
    loadFinance();
    refreshUser();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 text-center shadow-xl">
          <div className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Balanço Operacional</div>
          <div className={`text-4xl font-black tracking-tighter ${balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 text-center shadow-xl">
          <div className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Tesouros Coletados</div>
          <div className="text-3xl font-black text-blue-500 tracking-tighter">R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 text-center shadow-xl">
          <div className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Tributos Pagos</div>
          <div className="text-3xl font-black text-amber-500 tracking-tighter">R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 shadow-2xl space-y-8">
        <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">💰 Registro de Transação</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Fluxo</label>
            <select 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-white"
              value={type}
              onChange={(e) => setType(e.target.value as any)}
            >
              <option value="expense">Despesa (Tributo)</option>
              <option value="income">Receita (Tesouro)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Valor R$</label>
            <input 
              type="number" 
              placeholder="0,00"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-white"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Descrição</label>
            <input 
              type="text" 
              placeholder="Ex: Aluguel, Salário..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-white"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button 
              onClick={handleAdd}
              className="w-full bg-blue-600 hover:bg-blue-500 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20"
            >
              Lançar +8 XP
            </button>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-950/50 text-zinc-500 text-[9px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-6 py-5">Sincronia</th>
                <th className="px-6 py-5">Descrição</th>
                <th className="px-6 py-5">Tipo</th>
                <th className="px-6 py-5 text-right">Montante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {entries.map(entry => (
                <tr key={entry.id} className="hover:bg-zinc-800/20 transition-colors">
                  <td className="px-6 py-5 text-[10px] font-mono text-zinc-600">{entry.date}</td>
                  <td className="px-6 py-5 font-bold text-zinc-200 text-sm">{entry.description}</td>
                  <td className="px-6 py-5">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${entry.type === 'income' ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'}`}>
                      {entry.type === 'income' ? 'Receita' : 'Despesa'}
                    </span>
                  </td>
                  <td className={`px-6 py-5 text-right font-black text-sm ${entry.type === 'income' ? 'text-blue-400' : 'text-amber-500'}`}>
                    {entry.type === 'income' ? '+' : '-'} R$ {entry.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && entries.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-zinc-600 font-mono text-xs uppercase tracking-widest">Nenhuma transação registrada no livro razão.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Finance;
