
import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { Profile } from './types';
import { API } from './api';
import Dashboard from './modules/Dashboard';
import Habits from './modules/Habits';
import Tasks from './modules/Tasks';
import Auth from './modules/Auth';
import Navbar from './components/Navbar';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [view, setView] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      setLoading(false);
    });

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
      console.error(e);
    }
  };

  if (loading) return (
    <div className="h-screen bg-[#09090b] flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!session || !profile) {
    return <Auth />;
  }

  // Fixing prop name mismatches for child components
  const renderView = () => {
    switch (view) {
      case 'dashboard': return <Dashboard profile={profile} setView={setView} refresh={() => fetchProfile(session.user.id)} />;
      case 'habits': return <Habits user={profile} refreshUser={() => fetchProfile(session.user.id)} />;
      case 'tasks': return <Tasks user={profile} refreshUser={() => fetchProfile(session.user.id)} />;
      default: return <Dashboard profile={profile} setView={setView} refresh={() => fetchProfile(session.user.id)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-blue-500/30">
      {/* Correcting Navbar props to use 'user' and 'currentView' as defined in Navbar.tsx */}
      <Navbar user={profile} currentView={view} setView={setView} onLogout={() => supabase.auth.signOut()} />
      <main className="pt-24 pb-12 px-4 max-w-6xl mx-auto">
        {renderView()}
      </main>
    </div>
  );
};

export default App;
