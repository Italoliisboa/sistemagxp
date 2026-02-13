
import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { Profile } from './types';
import { API } from './api';
import Dashboard from './modules/Dashboard';
import Habits from './modules/Habits';
import Tasks from './modules/Tasks';
import Finance from './modules/Finance';
import Fitness from './modules/Fitness';
import Diary from './modules/Diary';
import Water from './modules/Water';
import Attachments from './modules/Attachments';
import Settings from './modules/Settings';
import Auth from './modules/Auth';
import Navbar from './components/Navbar';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [view, setView] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Inicializa sessão
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      setLoading(false);
    });

    // Escuta mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const data = await API.getProfile(userId);
      setProfile(data);
    } catch (e) {
      console.error("Erro ao carregar perfil:", e);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  };

  if (loading) return (
    <div className="h-screen bg-[#09090b] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-zinc-500 font-mono text-xs animate-pulse">SINCRONIZANDO PROTOCOLO...</p>
      </div>
    </div>
  );

  if (!session || !profile) {
    return <Auth />;
  }

  const renderView = () => {
    const commonProps = { user: profile, refreshUser: () => fetchProfile(session.user.id) };
    
    switch (view) {
      case 'dashboard': 
        return <Dashboard profile={profile} setView={setView} refresh={() => fetchProfile(session.user.id)} />;
      case 'habits': 
        return <Habits {...commonProps} />;
      case 'tasks': 
        return <Tasks {...commonProps} />;
      case 'finance':
        return <Finance {...commonProps} />;
      case 'fitness':
        return <Fitness {...commonProps} />;
      case 'diary':
        return <Diary {...commonProps} />;
      case 'water':
        return <Water {...commonProps} />;
      case 'attachments':
        return <Attachments {...commonProps} />;
      case 'settings':
        return <Settings user={profile} refreshUser={() => fetchProfile(session.user.id)} onLogout={handleLogout} />;
      default: 
        return <Dashboard profile={profile} setView={setView} refresh={() => fetchProfile(session.user.id)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-blue-500/30 font-sans">
      <Navbar 
        user={profile} 
        currentView={view} 
        setView={setView} 
        onLogout={handleLogout} 
      />
      
      <main className="pt-24 pb-12 px-4 max-w-6xl mx-auto transition-all duration-300">
        {renderView()}
      </main>

      {/* Footer Industrial Decorativo */}
      <footer className="py-8 border-t border-zinc-900 mt-20 opacity-30 text-center">
        <p className="text-[10px] font-mono tracking-widest text-zinc-500">
          LIFE RPG OPERATIONAL INTERFACE // ENCRYPTED_SESSION_ID: {session.user.id.substring(0, 8)}
        </p>
      </footer>
    </div>
  );
};

export default App;
