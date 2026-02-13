
import { supabase } from './supabase';
import { Habit, Task, FinancialEntry, XPRewards } from './types';

export const API = {
  // Auth
  getSession: () => supabase.auth.getSession(),
  onAuthStateChange: (callback: any) => supabase.auth.onAuthStateChange(callback),
  
  // Profile
  getProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  updateXP: async (userId: string, currentXP: number, amount: number) => {
    const newXP = currentXP + amount;
    const newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1;
    await supabase.from('profiles').update({ xp: newXP, level: newLevel }).eq('id', userId);
  },

  // Habits
  getHabits: async (userId: string) => {
    const habits = await supabase.from('habits').select('*').eq('user_id', userId);
    const logs = await supabase.from('habit_logs').select('*').eq('user_id', userId);
    return { habits: habits.data || [], logs: logs.data || [] };
  },

  createHabit: async (userId: string, title: string, frequency: string) => {
    return supabase.from('habits').insert({ user_id: userId, title, frequency }).select().single();
  },

  toggleHabit: async (userId: string, habitId: string, date: string, currentXP: number) => {
    const { data: existing } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('habit_id', habitId)
      .eq('date', date)
      .single();

    if (existing) {
      await supabase.from('habit_logs').delete().eq('id', existing.id);
      return false;
    } else {
      await supabase.from('habit_logs').insert({ habit_id: habitId, user_id: userId, date });
      await API.updateXP(userId, currentXP, XPRewards.HABIT);
      return true;
    }
  },

  // Tasks
  getTasks: async (userId: string) => {
    const { data } = await supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    return data || [];
  },

  createTask: async (userId: string, task: Partial<Task>) => {
    return supabase.from('tasks').insert({ user_id: userId, ...task }).select().single();
  },

  completeTask: async (userId: string, taskId: string, currentXP: number) => {
    await supabase.from('tasks').update({ completed: true, completed_at: new Date().toISOString() }).eq('id', taskId);
    await API.updateXP(userId, currentXP, XPRewards.TASK);
  }
};
