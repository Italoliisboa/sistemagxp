
import React, { useState, useEffect } from 'react';
import { User, WorkoutPlan } from '../types';
import { API } from '../api';
import { generateWorkout } from '../services/gemini';

interface FitnessProps {
  user: User;
  refreshUser: () => void;
}

const Fitness: React.FC<FitnessProps> = ({ user, refreshUser }) => {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [goal, setGoal] = useState('Hipertrofia');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadPlans(); }, [user.id]);

  const loadPlans = async () => {
    setLoading(true);
    const data = await API.getWorkouts(user.id);
    setPlans(data);
    setLoading(false);
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const planData = await generateWorkout(goal, user.level);
      if (planData) {
        await API.addWorkoutPlan(user.id, {
          name: planData.name,
          description: planData.description,
          exercises: planData.exercises,
          created_at: new Date().toISOString()
        });
        loadPlans();
        refreshUser();
      }
    } catch (error) {
      alert("Falha ao invocar o Oráculo do Treino.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCompleteWorkout = async () => {
    await API.addXP(user.id, user.xp, 20);
    refreshUser();
    alert("Treino concluído! +20 XP de força ganhos.");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      <div className="bg-zinc-900 p-10 rounded-3xl border border-zinc-800 text-center space-y-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-50"></div>
        <div className="text-5xl">⚔️</div>
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Oráculo de Treino</h2>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mt-2">Gere protocolos de força via Inteligência Artificial</p>
        </div>
        
        <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
          <input 
            type="text" 
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 outline-none focus:border-blue-500 text-white"
            placeholder="Qual seu objetivo?"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
          <button 
            disabled={isGenerating}
            onClick={handleGenerateAI}
            className={`
              bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-900/20
              ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {isGenerating ? 'Calculando...' : 'Invocar Plano'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-sm font-black text-zinc-500 uppercase tracking-[0.3em]">Protocolos Salvos</h3>
        <div className="grid grid-cols-1 gap-6">
          {plans.map(plan => (
            <div key={plan.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl group hover:border-zinc-700 transition-all">
              <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/30">
                <div>
                  <h4 className="font-black text-xl text-blue-400 uppercase tracking-tighter">{plan.name}</h4>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1">{plan.description}</p>
                </div>
                <button 
                  onClick={handleCompleteWorkout}
                  className="bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white border border-blue-500/30 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Finalizar Sessão
                </button>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {plan.exercises.map((ex, idx) => (
                  <div key={idx} className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl">
                    <div className="text-zinc-200 font-bold text-sm mb-1">{ex.name}</div>
                    <div className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                      {ex.sets} Séries × {ex.reps}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {!loading && plans.length === 0 && (
            <div className="text-center py-24 bg-zinc-900/30 rounded-3xl border-2 border-dashed border-zinc-800">
               <p className="text-zinc-600 font-mono text-xs uppercase tracking-widest">Aguardando definição de protocolo de treino...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Fitness;
