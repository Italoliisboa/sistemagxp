
import React from 'react';
import { User } from '../types';
import { DB } from '../db';

interface WaterProps {
  user: User;
  refreshUser: () => void;
}

const Water: React.FC<WaterProps> = ({ user, refreshUser }) => {
  const today = new Date().toISOString().split('T')[0];
  const logs = DB.getWaterLogs(user.id, today);
  const totalDrunk = logs.reduce((acc, l) => acc + l.amount, 0);
  const goal = 2500; // ml

  const handleDrink = (amount: number) => {
    DB.addWater(user.id, amount);
    refreshUser();
  };

  const percentage = Math.min(100, (totalDrunk / goal) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-10 pb-20">
      <div className="bg-slate-900 rounded-3xl p-10 border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.1)] flex flex-col items-center text-center space-y-8">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full transform -rotate-90">
            <circle 
              cx="96" cy="96" r="88" 
              className="stroke-slate-800" strokeWidth="12" fill="none" 
            />
            <circle 
              cx="96" cy="96" r="88" 
              className="stroke-cyan-500 transition-all duration-500" 
              strokeWidth="12" fill="none" 
              strokeDasharray={552.92}
              strokeDashoffset={552.92 - (552.92 * percentage) / 100}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl">💧</span>
            <span className="text-2xl font-rpg font-bold text-white mt-1">{totalDrunk}ml</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase">Meta: {goal}ml</span>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold">Poção de Mana (Hidratação)</h2>
          <p className="text-slate-400 text-sm mt-2">Mantenha seu foco e energia alta bebendo água regularmente.</p>
        </div>

        <div className="grid grid-cols-3 gap-4 w-full">
          {[200, 350, 500].map(amount => (
            <button 
              key={amount}
              onClick={() => handleDrink(amount)}
              className="bg-slate-800 hover:bg-cyan-600/20 border border-slate-700 hover:border-cyan-500 p-4 rounded-2xl transition-all group"
            >
              <div className="text-xl mb-1 group-hover:scale-110 transition-transform">🥤</div>
              <div className="text-xs font-bold text-slate-400 group-hover:text-cyan-400">+{amount}ml</div>
            </button>
          ))}
        </div>
        
        {totalDrunk >= goal && (
          <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-xs font-bold animate-bounce">
            🎉 Meta de Hidratação Atingida! (+25 XP Diário)
          </div>
        )}
      </div>
    </div>
  );
};

export default Water;
