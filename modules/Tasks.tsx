
import React, { useState, useEffect } from 'react';
import { User, Task } from '../types';
import { API } from '../api';

interface TasksProps {
  user: User;
  refreshUser: () => void;
}

const Tasks: React.FC<TasksProps> = ({ user, refreshUser }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadTasks(); }, [user.id]);

  const loadTasks = async () => {
    setLoading(true);
    const data = await API.getTasks(user.id);
    setTasks(data);
    setLoading(false);
  };

  const handleAddTask = async () => {
    if (!title.trim()) return;
    await API.createTask(user.id, title, priority, dueDate);
    setTitle('');
    loadTasks();
    refreshUser();
  };

  const handleComplete = async (taskId: string) => {
    await API.completeTask(user.id, taskId, user.xp);
    loadTasks();
    refreshUser();
  };

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 animate-in fade-in duration-500">
      <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 shadow-xl">
        <h3 className="text-xl font-black mb-6 flex items-center gap-2 uppercase tracking-tighter">
          <span className="text-blue-500">📜</span> Lançar Nova Missão
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input 
            type="text" 
            placeholder="Objetivo da missão..."
            className="md:col-span-2 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all text-white"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <select 
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none text-white"
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
          >
            <option value="low">Prioridade Baixa</option>
            <option value="medium">Prioridade Média</option>
            <option value="high">Prioridade Alta</option>
          </select>
          <button 
            onClick={handleAddTask}
            className="bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20"
          >
            Publicar Édito
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-sm font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-2">
            🎯 Missões Ativas ({pendingTasks.length})
          </h3>
          <div className="space-y-3">
            {pendingTasks.map(task => (
              <div key={task.id} className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between group hover:border-zinc-700 transition-all">
                <div>
                  <h4 className="font-bold text-zinc-100">{task.title}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${
                      task.priority === 'high' ? 'bg-red-500/20 text-red-500' : 
                      task.priority === 'medium' ? 'bg-amber-500/20 text-amber-500' : 'bg-green-500/20 text-green-500'
                    }`}>
                      {task.priority}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">Vence em {task.due_date}</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleComplete(task.id)}
                  className="w-10 h-10 rounded-xl border border-zinc-800 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 transition-all text-zinc-600 hover:text-white"
                >
                  ✓
                </button>
              </div>
            ))}
            {!loading && pendingTasks.length === 0 && (
              <p className="text-zinc-600 text-xs font-mono py-10 text-center uppercase tracking-widest">[ Mural de Missões Limpo ]</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-2">
            ✅ Conquistas Recentes ({completedTasks.length})
          </h3>
          <div className="space-y-3 opacity-60">
            {completedTasks.slice(0, 5).map(task => (
              <div key={task.id} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
                <div className="line-through text-zinc-500">
                  <h4 className="font-bold text-sm">{task.title}</h4>
                  <p className="text-[9px] uppercase font-bold text-zinc-600">Concluído em {new Date(task.completed_at!).toLocaleDateString()}</p>
                </div>
                <div className="text-blue-500 font-black text-xs">+15 XP</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
