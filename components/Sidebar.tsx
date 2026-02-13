
import React from 'react';
import { User } from '../types';

interface SidebarProps {
  currentView: string;
  setView: (view: string) => void;
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, user, isOpen, onClose, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'habits', label: 'Hábitos', icon: '🔁' },
    { id: 'tasks', label: 'Tarefas', icon: '📜' },
    { id: 'finance', label: 'Finanças', icon: '💰' },
    { id: 'fitness', label: 'Fitness', icon: '⚔️' },
    { id: 'water', label: 'Água', icon: '💧', locked: !user.unlockedFeatures.includes('water') },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={onClose} />}

      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-800 z-40 transition-transform duration-300 transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:block
      `}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="p-2 bg-cyan-600 rounded-lg shadow-lg shadow-cyan-900/20">
              <span className="text-2xl">🧠</span>
            </div>
            <span className="font-rpg font-bold text-xl tracking-tighter text-white">LIFE RPG</span>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                disabled={item.locked}
                onClick={() => {
                  setView(item.id);
                  onClose();
                }}
                className={`
                  w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group
                  ${currentView === item.id ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 shadow-[inset_0_0_12px_rgba(34,211,238,0.1)]' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                  ${item.locked ? 'opacity-40 cursor-not-allowed grayscale' : ''}
                `}
              >
                <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
                {item.locked && <span className="ml-auto text-xs font-bold text-amber-500">LEVEL 5+</span>}
              </button>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 w-full p-6 border-t border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
             <div className="flex-1">
                <p className="text-sm font-bold text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
             </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full py-2 bg-slate-800 hover:bg-red-900/30 hover:text-red-400 text-slate-400 rounded-lg text-sm transition-all border border-slate-700"
          >
            Sair do Jogo
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
