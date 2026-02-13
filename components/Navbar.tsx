
import React, { useState } from 'react';
import { User } from '../types';

interface NavbarProps {
  user: User;
  currentView: string;
  setView: (view: string) => void;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, currentView, setView, onLogout }) => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'habits', label: 'Hábitos', icon: '🔁' },
    { id: 'tasks', label: 'Missões', icon: '📜' },
    { id: 'finance', label: 'Tesouraria', icon: '💰' },
    { id: 'fitness', label: 'Treino', icon: '⚔️' },
    { id: 'diary', label: 'Diário', icon: '📔' },
    { id: 'attachments', label: 'Arquivos', icon: '📂' },
    { id: 'settings', label: 'Ajustes', icon: '⚙️' },
  ];

  const handleNav = (id: string) => {
    setView(id);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-1.5 bg-cyan-600 rounded-lg hidden md:block">
            <span className="text-xl">🧠</span>
          </div>
          <span 
            className="font-rpg font-bold text-lg md:text-xl text-white cursor-pointer hover:text-cyan-400 transition-colors"
            onClick={() => handleNav('dashboard')}
          >
            LIFE RPG
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-1">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`
                px-3 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2
                ${currentView === item.id ? 'bg-cyan-600/20 text-cyan-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}
              `}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end mr-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-cyan-500 uppercase">Lvl {user.level}</span>
              <span className="text-[10px] font-bold text-slate-500">{user.xp % 100}/100</span>
            </div>
            <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700 mt-0.5">
              <div 
                className="h-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)] transition-all duration-500" 
                style={{ width: `${Math.min(100, (user.xp % 100))}%` }} 
              />
            </div>
          </div>

          <button 
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>

          <div 
            onClick={() => handleNav('settings')}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center border-2 border-slate-700 font-bold cursor-pointer hover:scale-105 transition-transform"
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 animate-in slide-in-from-top duration-300">
          <div className="p-4 space-y-1">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`
                  w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left
                  ${currentView === item.id ? 'bg-cyan-600/20 text-cyan-400' : 'text-slate-400'}
                `}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-bold">{item.label}</span>
              </button>
            ))}
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10"
            >
              <span>🚪</span>
              <span className="font-bold">Sair do Jogo</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
