
import React, { useState, useEffect } from 'react';
import { User, Habit, HabitLog } from '../types';
import { API } from '../api';

interface HabitsProps {
  user: User;
  refreshUser: () => void;
}

const Habits: React.FC<HabitsProps> = ({ user, refreshUser }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Partial<Habit> | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [freq, setFreq] = useState<'daily' | 'weekly'>('daily');
  const [category, setCategory] = useState('Saúde');

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadData();
  }, [user.id]);

  const loadData = async () => {
    setLoading(true);
    const data = await API.getHabits(user.id);
    setHabits(data.habits);
    setLogs(data.logs);
    setLoading(false);
  };

  const openAddModal = () => {
    setEditingHabit(null);
    setTitle('');
    setFreq('daily');
    setCategory('Saúde');
    setIsModalOpen(true);
  };

  const openEditModal = (habit: Habit) => {
    setEditingHabit(habit);
    setTitle(habit.title);
    setFreq(habit.frequency);
    setCategory((habit as any).category || 'Geral');
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    
    if (editingHabit?.id) {
      await API.updateHabit(editingHabit.id, { title, frequency: freq, category } as any);
    } else {
      await API.createHabit(user.id, title, freq, category);
    }
    
    setIsModalOpen(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este protocolo de hábito permanentemente?")) return;
    await API.deleteHabit(id);
    loadData();
  };

  const handleToggle = async (habitId: string) => {
    await API.toggleHabit(user.id, habitId, today, user.xp);
    loadData();
    refreshUser();
  };

  const getStreak = (habitId: string) => {
    const habitLogs = logs
      .filter(l => l.habit_id === habitId)
      .map(l => l.date)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    let streak = 0;
    let curr = new Date();
    // Simplified streak calculation for UI
    return habitLogs.length; // Retornando total de vezes por enquanto para simplicidade visual
  };

  const isCompletedToday = (habitId: string) => {
    return logs.some(l => l.habit_id === habitId && l.date === today);
  };

  const todayCompletedCount = habits.filter(h => isCompletedToday(h.id)).length;
  const dailyProgress = habits.length > 0 ? (todayCompletedCount / habits.length) * 100 : 0;

  if (loading) return <div className="text-center py-20 animate-pulse text-zinc-500 font-mono">[ ACESSANDO BANCO DE DADOS... ]</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-black text-white">Protocolos de Hábito</h2>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Sincronização Diária do Operador</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-blue-500">{Math.round(dailyProgress)}%</span>
              <p className="text-[9px] text-zinc-600 font-bold uppercase">Progresso Hoje</p>
            </div>
          </div>
          <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
            <div 
              className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)] transition-all duration-700"
              style={{ width: `${dailyProgress}%` }}
            />
          </div>
        </div>

        <button 
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-500 transition-all rounded-2xl p-6 flex flex-col items-center justify-center group shadow-xl shadow-blue-900/10"
        >
          <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">➕</span>
          <span className="font-black text-xs uppercase tracking-widest">Novo Protocolo</span>
        </button>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 gap-4">
        {habits.map(habit => {
          const completed = isCompletedToday(habit.id);
          const habitCategory = (habit as any).category || 'Geral';
          
          return (
            <div 
              key={habit.id} 
              className={`
                group relative overflow-hidden p-1 rounded-2xl border transition-all
                ${completed ? 'bg-green-500/5 border-green-500/30' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'}
              `}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between p-4 gap-4">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => handleToggle(habit.id)}
                    className={`
                      w-14 h-14 rounded-xl flex items-center justify-center text-2xl transition-all
                      ${completed ? 'bg-green-600 text-white rotate-12' : 'bg-zinc-800 text-zinc-600 hover:bg-zinc-700 hover:text-zinc-300'}
                    `}
                  >
                    {completed ? '⚔️' : '🛡️'}
                  </button>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className={`font-black tracking-tight ${completed ? 'text-green-400 line-through opacity-50' : 'text-zinc-100'}`}>
                        {habit.title}
                      </h4>
                      <span className="text-[9px] px-1.5 py-0.5 bg-zinc-800 text-zinc-500 rounded font-black uppercase tracking-tighter">
                        {habitCategory}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1">
                        <span className="text-blue-500">●</span> {habit.frequency}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1">
                        <span className="text-amber-500">★</span> {getStreak(habit.id)} TOTAL
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => openEditModal(habit)}
                    className="p-2.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                  >
                    ⚙️
                  </button>
                  <button 
                    onClick={() => handleDelete(habit.id)}
                    className="p-2.5 rounded-lg bg-zinc-800/50 hover:bg-red-900/20 text-zinc-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                  >
                    🗑️
                  </button>
                  <button 
                    onClick={() => handleToggle(habit.id)}
                    className={`
                      ml-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all
                      ${completed ? 'bg-green-600/10 text-green-500 cursor-default' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'}
                    `}
                  >
                    {completed ? 'Protocolo Concluído' : 'Executar Ação'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {habits.length === 0 && (
          <div className="text-center py-32 border-2 border-dashed border-zinc-900 rounded-3xl bg-zinc-950/50">
            <div className="text-4xl mb-4 grayscale">🛰️</div>
            <p className="text-zinc-600 font-mono text-xs uppercase tracking-[0.2em]">Aguardando definição de protocolos...</p>
            <button 
              onClick={openAddModal}
              className="mt-6 text-blue-500 text-[10px] font-black uppercase tracking-widest hover:underline"
            >
              + Iniciar Primeiro Hábito
            </button>
          </div>
        )}
      </div>

      {/* Modal - Edit/Add */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-3xl p-8 shadow-2xl space-y-6">
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                {editingHabit ? 'Ajustar Protocolo' : 'Novo Hábito Operacional'}
              </h3>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Configuração de Rotina</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Identificação do Hábito</label>
                <input 
                  type="text" 
                  autoFocus
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors text-white"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Treino de Força, Meditação..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Frequência</label>
                  <select 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors text-white"
                    value={freq}
                    onChange={(e) => setFreq(e.target.value as any)}
                  >
                    <option value="daily">Diário</option>
                    <option value="weekly">Semanal</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Categoria</label>
                  <select 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors text-white"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="Saúde">Saúde</option>
                    <option value="Trabalho">Trabalho</option>
                    <option value="Mente">Mente</option>
                    <option value="Estudo">Estudo</option>
                    <option value="Social">Social</option>
                    <option value="Geral">Geral</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
              >
                Abortar
              </button>
              <button 
                onClick={handleSave}
                className="flex-[2] bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20"
              >
                {editingHabit ? 'Sincronizar Alterações' : 'Confirmar Protocolo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Habits;
