
import React, { useState } from 'react';
import { User, FinancialEntry, UserFile } from '../types';
import { DB } from '../db';

interface FinanceProps {
  user: User;
  refreshUser: () => void;
}

const Finance: React.FC<FinanceProps> = ({ user, refreshUser }) => {
  const entries = DB.getFinance(user.id);
  const userFiles = DB.getUserFiles(user.id);
  
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Geral');
  const [selectedFile, setSelectedFile] = useState<string>('');

  const totalIncome = entries.filter(e => e.type === 'income').reduce((acc, e) => acc + e.amount, 0);
  const totalExpense = entries.filter(e => e.type === 'expense').reduce((acc, e) => acc + e.amount, 0);
  const balance = totalIncome - totalExpense;

  const handleAdd = () => {
    if (!amount || isNaN(Number(amount))) return;
    const entry = DB.addFinance(user.id, {
      type,
      amount: Number(amount),
      description,
      category,
      date: new Date().toISOString().split('T')[0],
      attachments: selectedFile ? [selectedFile] : []
    });
    setAmount('');
    setDescription('');
    setSelectedFile('');
    refreshUser();
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = text.split('\n').slice(1); // skip header
      let count = 0;
      rows.forEach(row => {
        const [date, desc, value, cat] = row.split(',');
        if (date && desc && value) {
          const amount = parseFloat(value);
          DB.addFinance(user.id, {
            type: amount >= 0 ? 'income' : 'expense',
            amount: Math.abs(amount),
            description: desc,
            category: cat?.trim() || 'Importado',
            date: date.trim()
          });
          count++;
        }
      });
      alert(`${count} transações importadas com sucesso!`);
      refreshUser();
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center shadow-lg">
          <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Balanço do Reino</div>
          <div className={`text-4xl font-rpg font-bold ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            R$ {balance.toFixed(2)}
          </div>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center shadow-lg">
          <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Tesouros (Mês)</div>
          <div className="text-3xl font-rpg font-bold text-cyan-400">R$ {totalIncome.toFixed(2)}</div>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center shadow-lg">
          <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Tributos (Mês)</div>
          <div className="text-3xl font-rpg font-bold text-amber-400">R$ {totalExpense.toFixed(2)}</div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold flex items-center gap-2">💰 Novo Lançamento</h3>
          <label className="text-xs bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl font-bold border border-slate-700 cursor-pointer transition-colors">
            📥 Importar Extrato (CSV)
            <input type="file" className="hidden" accept=".csv" onChange={handleImportCSV} />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <select 
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-amber-500"
            value={type}
            onChange={(e) => setType(e.target.value as any)}
          >
            <option value="expense">Despesa</option>
            <option value="income">Receita</option>
          </select>
          <input 
            type="number" 
            placeholder="Valor R$..."
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-amber-500"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <input 
            type="text" 
            placeholder="Descrição..."
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-amber-500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <select 
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-amber-500"
            value={selectedFile}
            onChange={(e) => setSelectedFile(e.target.value)}
          >
            <option value="">Anexar Comprovante</option>
            {userFiles.map(f => <option key={f.id} value={f.id}>{f.fileName}</option>)}
          </select>
          <button 
            onClick={handleAdd}
            className="bg-amber-600 hover:bg-amber-500 px-6 py-3 rounded-xl font-bold transition-all"
          >
            Registrar (+8 XP)
          </button>
        </div>
      </div>

      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-slate-800/50 text-slate-500 text-[10px] font-black uppercase tracking-wider">
            <tr>
              <th className="px-6 py-5">Data</th>
              <th className="px-6 py-5">Descrição</th>
              <th className="px-6 py-5">Categoria</th>
              <th className="px-6 py-5">Anexo</th>
              <th className="px-6 py-5 text-right">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {entries.slice().reverse().map(entry => (
              <tr key={entry.id} className="hover:bg-slate-800/20 transition-colors group">
                <td className="px-6 py-5 text-xs text-slate-500">{entry.date}</td>
                <td className="px-6 py-5 font-bold text-slate-200">{entry.description}</td>
                <td className="px-6 py-5"><span className="bg-slate-800 px-2 py-1 rounded text-[10px] font-black uppercase text-slate-400">{entry.category}</span></td>
                <td className="px-6 py-5">
                  {entry.attachments && entry.attachments.length > 0 && (
                    <button 
                      onClick={() => {
                        const file = userFiles.find(f => f.id === entry.attachments![0]);
                        if (file) {
                          const link = document.createElement('a');
                          link.href = file.data;
                          link.download = file.fileName;
                          link.click();
                        }
                      }}
                      className="text-xs text-cyan-500 hover:underline"
                    >
                      📎 Ver
                    </button>
                  )}
                </td>
                <td className={`px-6 py-5 text-right font-rpg font-bold ${entry.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                  {entry.type === 'income' ? '+' : '-'} R$ {entry.amount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Finance;
