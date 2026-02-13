
import React, { useState } from 'react';
import { User, Habit } from '../types';
import { DB } from '../db';

interface HabitsProps {
  user: User;
  refreshUser: () => void;
}

const Habits: React.FC<HabitsProps> = ({ user, refreshUser }) => {
  const habits = DB.getHabits(user.id);
  const logs = DB.getHabitLogs(user.id);
  const today = new Date().toISOString().split('T')[0];
  
  const [newTitle, setNewTitle] = useState('');
  const [newFreq, setNewFreq] = useState<'daily' | 'weekly'>('daily');

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    DB.addHabit(user.id, newTitle, newFreq);
    setNewTitle('');
    refreshUser();
  };

  const isCompletedToday = (habitId: string) => {
    return logs.some(l => l.habitId === habitId && l.date === today);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span className="text-cyan-400">✨</span> Criar Novo Hábito
        </h3>
        <div className="flex flex-col md:flex-row gap-4">
          <input 
            type="text" 
            placeholder="Ex: Ler 20 páginas, Meditar, Estudar Inglês..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 ring-cyan-500 outline-none transition-all"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <select 
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 ring-cyan-500 outline-none"
            value={newFreq}
            onChange={(e) => setNewFreq(e.target.value as any)}
          >
            <option value="daily">Diário</option>
            <option value="weekly">Semanal</option>
          </select>
          <button 
            onClick={handleAdd}
            className="bg-cyan-600 hover:bg-cyan-500 px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-cyan-900/20"
          >
            Adicionar
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-rpg font-bold">Hábitos Ativos</h3>
        <div className="grid grid-cols-1 gap-4">
          {habits.map(habit => {
            const completed = isCompletedToday(habit.id);
            return (
              <div 
                key={habit.id} 
                className={`
                  p-4 rounded-2xl border transition-all flex items-center justify-between
                  ${completed ? 'bg-green-500/10 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'bg-slate-900 border-slate-800'}
                `}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${completed ? 'bg-green-600' : 'bg-slate-800'}`}>
                    {completed ? '⚔️' : '🛡️'}
                  </div>
                  <div>
                    <h4 className={`font-bold ${completed ? 'text-green-400' : 'text-slate-200'}`}>{habit.title}</h4>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">{habit.frequency}</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    DB.toggleHabit(user.id, habit.id, today);
                    refreshUser();
                  }}
                  className={`
                    px-6 py-2 rounded-xl font-bold text-sm transition-all
                    ${completed ? 'bg-green-600/20 text-green-500 hover:bg-green-600/30' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}
                  `}
                >
                  {completed ? 'CONCLUÍDO (+10 XP)' : 'MARCAR'}
                </button>
              </div>
            );
          })}
          {habits.length === 0 && (
            <div className="text-center py-20 bg-slate-900/30 rounded-3xl border-2 border-dashed border-slate-800">
               <p className="text-slate-500">Sua jornada começa com o primeiro hábito. Adicione um acima!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Habits;
