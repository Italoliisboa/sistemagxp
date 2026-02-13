
import React, { useState } from 'react';
import { User, Task } from '../types';
import { DB } from '../db';

interface TasksProps {
  user: User;
  refreshUser: () => void;
}

const Tasks: React.FC<TasksProps> = ({ user, refreshUser }) => {
  const allTasks = DB.getTasks(user.id);
  const pendingTasks = allTasks.filter(t => !t.completed);
  const completedTasks = allTasks.filter(t => t.completed);

  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAddTask = () => {
    if (!title.trim()) return;
    DB.addTask(user.id, title, priority, dueDate);
    setTitle('');
    refreshUser();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span className="text-purple-400">📜</span> Registrar Nova Missão
        </h3>
        <div className="space-y-4">
          <input 
            type="text" 
            placeholder="Título da missão..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 ring-purple-500 outline-none transition-all"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="flex flex-col md:flex-row gap-4">
            <select 
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 ring-purple-500 outline-none"
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
            >
              <option value="low">Prioridade Baixa</option>
              <option value="medium">Prioridade Média</option>
              <option value="high">Prioridade Alta</option>
            </select>
            <input 
              type="date"
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 ring-purple-500 outline-none"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            <button 
              onClick={handleAddTask}
              className="bg-purple-600 hover:bg-purple-500 px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-purple-900/20"
            >
              Lançar Missão
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">🎯 Ativas ({pendingTasks.length})</h3>
          <div className="space-y-3">
            {pendingTasks.map(task => (
              <div key={task.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between group hover:border-slate-700 transition-all">
                <div>
                  <h4 className="font-bold text-slate-200">{task.title}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${
                      task.priority === 'high' ? 'bg-red-500/20 text-red-500' : 
                      task.priority === 'medium' ? 'bg-amber-500/20 text-amber-500' : 'bg-green-500/20 text-green-500'
                    }`}>
                      {task.priority}
                    </span>
                    {/* Correcting task.dueDate to task.due_date */}
                    <span className="text-[10px] text-slate-500 font-bold uppercase">📅 {task.due_date}</span>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    DB.completeTask(user.id, task.id);
                    refreshUser();
                  }}
                  className="w-10 h-10 rounded-full border-2 border-slate-700 flex items-center justify-center hover:bg-purple-600 hover:border-purple-600 transition-all text-transparent hover:text-white"
                >
                  ✓
                </button>
              </div>
            ))}
            {pendingTasks.length === 0 && <p className="text-slate-500 text-sm text-center py-10">Nenhuma missão no mural.</p>}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">✅ Concluídas ({completedTasks.length})</h3>
          <div className="space-y-3 opacity-60">
            {completedTasks.map(task => (
              <div key={task.id} className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                <div className="line-through text-slate-400">
                  <h4 className="font-bold">{task.title}</h4>
                  {/* Correcting task.completedAt to task.completed_at */}
                  <p className="text-[10px] uppercase font-bold text-slate-600">Completada em {task.completed_at ? new Date(task.completed_at).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="text-green-500 font-bold text-xs">+15 XP</div>
              </div>
            ))}
            {completedTasks.length === 0 && <p className="text-slate-500 text-sm text-center py-10">Nenhuma glória registrada ainda.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
