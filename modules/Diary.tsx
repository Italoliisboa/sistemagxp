
import React, { useState, useEffect } from 'react';
import { User, DiaryEntry } from '../types';
import { DB } from '../db';

interface DiaryProps {
  user: User;
  refreshUser: () => void;
}

const Diary: React.FC<DiaryProps> = ({ user, refreshUser }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<Partial<DiaryEntry> | null>(null);
  const [search, setSearch] = useState('');
  // Use any to avoid NodeJS.Timeout which is not available in the browser environment
  const [sessionTimeout, setSessionTimeout] = useState<any>(null);

  useEffect(() => {
    if (isAuthenticated) {
      setEntries(DB.getDiaryEntries(user.id));
      // Auto-lock session after 5 minutes of inactivity
      const timeout = setTimeout(() => setIsAuthenticated(false), 300000);
      setSessionTimeout(timeout);
      return () => clearTimeout(timeout);
    }
  }, [isAuthenticated, user.id]);

  const handleVerify = () => {
    if (DB.verifyDiaryPin(user.id, pin)) {
      setIsAuthenticated(true);
      setPin('');
    } else {
      alert("Acesso Negado. Tente novamente.");
      setPin('');
    }
  };

  const handleSave = () => {
    if (!editingEntry?.content) return;
    if (editingEntry.id) {
      DB.updateDiaryEntry(user.id, editingEntry.id, editingEntry.title || '', editingEntry.content);
    } else {
      DB.addDiaryEntry(user.id, editingEntry.title || '', editingEntry.content);
    }
    setEditingEntry(null);
    setEntries(DB.getDiaryEntries(user.id));
    refreshUser();
  };

  const filteredEntries = entries.filter(e => 
    e.title?.toLowerCase().includes(search.toLowerCase()) || 
    e.content.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-12 bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl text-center space-y-6">
        <div className="text-5xl">📔</div>
        <h2 className="text-2xl font-rpg font-bold">Diário Protegido</h2>
        <p className="text-slate-400 text-sm">Insira seu PIN de 5 dígitos para ler suas memórias.</p>
        <input 
          type="password" 
          maxLength={5}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-4 text-center text-3xl tracking-[0.5em] outline-none focus:ring-2 ring-cyan-500"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
        />
        <button 
          onClick={handleVerify}
          className="w-full bg-cyan-600 hover:bg-cyan-500 py-3 rounded-xl font-bold transition-all"
        >
          Desbloquear
        </button>
      </div>
    );
  }

  if (editingEntry) {
    return (
      <div className="max-w-4xl mx-auto bg-slate-900 rounded-3xl border border-slate-800 p-6 md:p-8 space-y-6">
        <div className="flex justify-between items-center">
          <button onClick={() => setEditingEntry(null)} className="text-slate-400 hover:text-white">← Voltar</button>
          <button 
            onClick={handleSave}
            className="bg-cyan-600 hover:bg-cyan-500 px-6 py-2 rounded-xl font-bold transition-all"
          >
            Salvar Registro
          </button>
        </div>
        <input 
          type="text"
          placeholder="Título do dia (Opcional)"
          className="w-full bg-transparent text-3xl font-bold outline-none placeholder-slate-700"
          value={editingEntry.title || ''}
          onChange={(e) => setEditingEntry({...editingEntry, title: e.target.value})}
        />
        <textarea 
          placeholder="Comece a escrever sua jornada..."
          className="w-full h-[60vh] bg-transparent resize-none outline-none text-lg text-slate-300 leading-relaxed"
          value={editingEntry.content || ''}
          onChange={(e) => setEditingEntry({...editingEntry, content: e.target.value})}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-3xl font-rpg font-bold">Memórias do Herói</h2>
        <div className="flex w-full md:w-auto gap-4">
          <input 
            type="text" 
            placeholder="Buscar nas sombras..." 
            className="flex-1 md:w-64 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 outline-none focus:ring-1 ring-cyan-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button 
            onClick={() => setEditingEntry({ title: '', content: '' })}
            className="bg-cyan-600 hover:bg-cyan-500 px-6 py-2 rounded-xl font-bold flex items-center gap-2"
          >
            <span>✍️</span> Novo Registro
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEntries.map(entry => (
          <div 
            key={entry.id} 
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/50 transition-all cursor-pointer group flex flex-col h-64"
            onClick={() => setEditingEntry(entry)}
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {new Date(entry.createdAt).toLocaleDateString()}
              </span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm("Deletar memória para sempre?")) {
                    DB.deleteDiaryEntry(user.id, entry.id);
                    setEntries(DB.getDiaryEntries(user.id));
                  }
                }}
                className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-500 transition-opacity"
              >
                🗑️
              </button>
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-200 line-clamp-2">{entry.title || 'Sem Título'}</h3>
            <p className="text-slate-500 text-sm line-clamp-4 flex-1">{entry.content}</p>
          </div>
        ))}
        {entries.length === 0 && (
          <div className="col-span-full py-20 text-center bg-slate-900/30 rounded-3xl border-2 border-dashed border-slate-800">
            <p className="text-slate-500">Nenhum registro encontrado. Comece a escrever sua história.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Diary;
