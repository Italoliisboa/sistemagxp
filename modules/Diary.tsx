
import React, { useState, useEffect } from 'react';
import { User, DiaryEntry } from '../types';
import { API } from '../api';

interface DiaryProps {
  user: User;
  refreshUser: () => void;
}

const Diary: React.FC<DiaryProps> = ({ user, refreshUser }) => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<Partial<DiaryEntry> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDiary();
  }, [user.id]);

  const loadDiary = async () => {
    setLoading(true);
    // Correctly using the now existing API.getDiary
    const data = await API.getDiary(user.id);
    setEntries(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!editingEntry?.content) return;
    // Correctly using the now existing API.addDiary
    await API.addDiary(user.id, editingEntry.title || '', editingEntry.content, user.xp);
    setEditingEntry(null);
    loadDiary();
    refreshUser();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este registro permanentemente?")) return;
    // Correctly using the now existing API.deleteDiary
    await API.deleteDiary(id);
    loadDiary();
  };

  if (editingEntry) {
    return (
      <div className="max-w-4xl mx-auto bg-zinc-900 rounded-3xl border border-zinc-800 p-8 space-y-6 animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex justify-between items-center">
          <button onClick={() => setEditingEntry(null)} className="text-zinc-500 hover:text-white transition-colors">← Cancelar</button>
          <button 
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-xl font-bold transition-all"
          >
            Sincronizar Memória
          </button>
        </div>
        <input 
          type="text"
          placeholder="Título da Entrada..."
          className="w-full bg-transparent text-3xl font-black outline-none placeholder-zinc-800"
          value={editingEntry.title || ''}
          onChange={(e) => setEditingEntry({...editingEntry, title: e.target.value})}
        />
        <textarea 
          placeholder="Comece a registrar seus pensamentos..."
          className="w-full h-[50vh] bg-transparent resize-none outline-none text-lg text-zinc-400 leading-relaxed"
          value={editingEntry.content || ''}
          onChange={(e) => setEditingEntry({...editingEntry, content: e.target.value})}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Logs de Consciência</h2>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Registros de Memória Localizados</p>
        </div>
        <button 
          onClick={() => setEditingEntry({ title: '', content: '' })}
          className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-bold flex items-center gap-2"
        >
          <span>✍️</span> Novo Registro
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {entries.map(entry => (
          <div 
            key={entry.id} 
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all group flex flex-col h-64"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                {new Date(entry.created_at).toLocaleDateString()}
              </span>
              <button 
                onClick={() => handleDelete(entry.id)}
                className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-500 transition-all"
              >
                🗑️
              </button>
            </div>
            <h3 className="text-xl font-bold mb-3 text-zinc-200 line-clamp-2">{entry.title || 'Sem Título'}</h3>
            <p className="text-zinc-500 text-sm line-clamp-4 flex-1">{entry.content}</p>
          </div>
        ))}
        {entries.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-800 rounded-3xl">
            <p className="text-zinc-600 font-mono text-xs uppercase tracking-widest">Aguardando entrada de dados...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Diary;
