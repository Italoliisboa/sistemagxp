
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { API } from '../api';

interface WaterProps {
  user: User;
  refreshUser: () => void;
}

const Water: React.FC<WaterProps> = ({ user, refreshUser }) => {
  const [totalDrunk, setTotalDrunk] = useState(0);
  const today = new Date().toISOString().split('T')[0];
  const goal = 2500;

  useEffect(() => {
    loadWater();
  }, [user.id]);

  const loadWater = async () => {
    const data = await API.getWater(user.id, today);
    const total = data.reduce((acc: number, l: any) => acc + l.amount, 0);
    setTotalDrunk(total);
  };

  const handleDrink = async (amount: number) => {
    await API.addWater(user.id, amount, user.xp);
    loadWater();
    refreshUser();
  };

  const percentage = Math.min(100, (totalDrunk / goal) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-10 pb-20">
      <div className="bg-zinc-900 rounded-3xl p-10 border border-zinc-800 shadow-2xl flex flex-col items-center text-center space-y-8">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full transform -rotate-90">
            <circle 
              cx="96" cy="96" r="88" 
              className="stroke-zinc-800" strokeWidth="12" fill="none" 
            />
            <circle 
              cx="96" cy="96" r="88" 
              className="stroke-blue-500 transition-all duration-1000" 
              strokeWidth="12" fill="none" 
              strokeDasharray={552.92}
              strokeDashoffset={552.92 - (552.92 * percentage) / 100}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl">💧</span>
            <span className="text-2xl font-black text-white mt-1">{totalDrunk}ml</span>
            <span className="text-[10px] text-zinc-500 font-bold uppercase">Meta: {goal}ml</span>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold">Protocolo de Hidratação</h2>
          <p className="text-zinc-500 text-sm mt-2">Mantenha a performance cognitiva estável.</p>
        </div>

        <div className="grid grid-cols-3 gap-4 w-full">
          {[250, 500, 750].map(amount => (
            <button 
              key={amount}
              onClick={() => handleDrink(amount)}
              className="bg-zinc-950 hover:bg-blue-600/10 border border-zinc-800 hover:border-blue-500 p-4 rounded-2xl transition-all"
            >
              <div className="text-xl mb-1">🥤</div>
              <div className="text-xs font-black text-zinc-400">+{amount}ml</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Water;
