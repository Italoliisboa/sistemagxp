
import React, { useState } from 'react';
import { supabase } from '../supabase';

const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } }
        });
        if (error) throw error;
        alert('Confirme seu e-mail para ativar a conta!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-2xl shadow-blue-900/40">
            🧠
          </div>
          <div>
            <h1 className="text-3xl font-rpg font-bold tracking-tighter text-white uppercase">Life RPG</h1>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Sincronização de Consciência</p>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl shadow-2xl backdrop-blur-sm">
          <form onSubmit={handleAuth} className="space-y-5">
            {isSignUp && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Nome do Operador</label>
                <input 
                  type="text" required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors text-white"
                  value={name} onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">E-mail de Acesso</label>
              <input 
                type="email" required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors text-white"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Chave de Segurança</label>
              <input 
                type="password" required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors text-white"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold text-white transition-all active:scale-[0.98] shadow-lg shadow-blue-900/20 disabled:opacity-50 uppercase tracking-widest text-xs"
            >
              {loading ? 'Sincronizando...' : isSignUp ? 'Iniciar Recrutamento' : 'Autenticar Protocolo'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-zinc-500 text-[10px] font-bold uppercase hover:text-blue-400 transition-colors tracking-widest"
            >
              {isSignUp ? 'Já possui protocolo? Login' : 'Novo operador? Solicitar acesso'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
