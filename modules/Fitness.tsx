
import React, { useState } from 'react';
import { User, WorkoutPlan } from '../types';
import { DB } from '../db';
import { generateWorkout } from '../services/gemini';

interface FitnessProps {
  user: User;
  refreshUser: () => void;
}

const Fitness: React.FC<FitnessProps> = ({ user, refreshUser }) => {
  const plans = DB.getWorkouts(user.id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [goal, setGoal] = useState('Hipertrofia');

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const planData = await generateWorkout(goal, user.level);
      if (planData) {
        DB.addWorkoutPlan(user.id, {
          name: planData.name,
          description: planData.description,
          exercises: planData.exercises
        });
        refreshUser();
      }
    } catch (error) {
      alert("Falha ao invocar o Oráculo do Treino. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCompleteWorkout = () => {
    DB.addXP(user.id, 20, 'Treino Finalizado');
    refreshUser();
    alert("Treino concluído! +20 XP de força ganhos.");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 p-8 rounded-3xl border border-indigo-500/30 text-center space-y-6">
        <div className="text-5xl">⚔️</div>
        <div>
          <h2 className="text-2xl font-rpg font-bold">Oráculo de Treino (IA)</h2>
          <p className="text-slate-400 mt-2">Peça para a IA gerar um treino personalizado baseado no seu nível atual.</p>
        </div>
        
        <div className="max-w-md mx-auto flex gap-4">
          <input 
            type="text" 
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none"
            placeholder="Qual seu objetivo? (Ex: Emagrecer, Força...)"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
          <button 
            disabled={isGenerating}
            onClick={handleGenerateAI}
            className={`
              bg-indigo-600 hover:bg-indigo-500 px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-900/40
              ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {isGenerating ? 'Invocando...' : 'Gerar Treino'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold">Planos de Treino Salvos</h3>
        <div className="grid grid-cols-1 gap-6">
          {plans.map(plan => (
            <div key={plan.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-6 bg-slate-800/50 border-b border-slate-800 flex justify-between items-center">
                <div>
                  <h4 className="font-rpg font-bold text-lg text-indigo-400">{plan.name}</h4>
                  <p className="text-xs text-slate-400">{plan.description}</p>
                </div>
                <button 
                  onClick={handleCompleteWorkout}
                  className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest shadow-lg shadow-green-900/20"
                >
                  Finalizar Treino
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {plan.exercises.map((ex, idx) => (
                    <div key={idx} className="bg-slate-800/40 p-4 rounded-xl border border-slate-800/60">
                      <div className="text-indigo-400 font-bold mb-1">{ex.name}</div>
                      <div className="text-xs text-slate-500 font-bold uppercase">
                        {ex.sets} Séries × {ex.reps}
                      </div>
                      {ex.weight && <div className="text-[10px] text-slate-600 font-bold uppercase mt-1">Peso: {ex.weight}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {plans.length === 0 && !isGenerating && (
            <div className="text-center py-20 bg-slate-900/30 rounded-3xl border-2 border-dashed border-slate-800">
               <p className="text-slate-500 italic">Nenhum plano de treino na sua estante de armas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Fitness;
