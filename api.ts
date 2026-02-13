
import { supabase } from './supabase';
import { Habit, Task, XPRewards, Profile, FinancialEntry, DiaryEntry } from './types';

export const API = {
  // PROFILE
  getProfile: async (userId: string): Promise<Profile> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  addXP: async (userId: string, currentXP: number, amount: number) => {
    const newXP = currentXP + amount;
    const newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1;
    await supabase
      .from('profiles')
      .update({ 
        xp: newXP, 
        level: newLevel, 
        last_active: new Date().toISOString() 
      })
      .eq('id', userId);
  },

  // HABITS
  getHabits: async (userId: string) => {
    const { data: habits } = await supabase.from('habits').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    const { data: logs } = await supabase.from('habit_logs').select('*').eq('user_id', userId);
    return { habits: habits || [], logs: logs || [] };
  },

  createHabit: async (userId: string, title: string, frequency: string, category: string = 'Geral') => {
    return supabase.from('habits').insert({ user_id: userId, title, frequency, category }).select().single();
  },

  updateHabit: async (habitId: string, updates: Partial<Habit>) => {
    return supabase.from('habits').update(updates).eq('id', habitId);
  },

  deleteHabit: async (habitId: string) => {
    return supabase.from('habits').delete().eq('id', habitId);
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
      await API.addXP(userId, currentXP, XPRewards.HABIT);
      return true;
    }
  },

  // TASKS (Mantendo as existentes...)
  getTasks: async (userId: string): Promise<Task[]> => {
    const { data } = await supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    return data || [];
  },

  createTask: async (userId: string, title: string, priority: string, dueDate: string) => {
    return supabase.from('tasks').insert({ user_id: userId, title, priority, due_date: dueDate }).select().single();
  },

  completeTask: async (userId: string, taskId: string, currentXP: number) => {
    await supabase.from('tasks').update({ completed: true, completed_at: new Date().toISOString() }).eq('id', taskId);
    await API.addXP(userId, currentXP, XPRewards.TASK);
  },

  // FINANCE, DIARY, WATER (Mantendo as existentes...)
  getFinance: async (userId: string): Promise<FinancialEntry[]> => {
    const { data } = await supabase.from('financial_entries').select('*').eq('user_id', userId).order('date', { ascending: false });
    return data || [];
  },

  addFinance: async (userId: string, entry: any, currentXP: number) => {
    const { data, error } = await supabase.from('financial_entries').insert({ ...entry, user_id: userId }).select().single();
    if (!error) await API.addXP(userId, currentXP, XPRewards.FINANCE);
    return data;
  },

  getDiary: async (userId: string): Promise<DiaryEntry[]> => {
    const { data } = await supabase.from('diary_entries').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    return data || [];
  },

  addDiary: async (userId: string, title: string, content: string, currentXP: number) => {
    const { data, error } = await supabase.from('diary_entries').insert({ user_id: userId, title, content }).select().single();
    if (!error) await API.addXP(userId, currentXP, XPRewards.DIARY);
    return data;
  },

  deleteDiary: async (id: string) => {
    return supabase.from('diary_entries').delete().eq('id', id);
  },

  getWater: async (userId: string, date: string) => {
    const { data } = await supabase.from('water_logs').select('*').eq('user_id', userId).eq('date', date);
    return data || [];
  },

  addWater: async (userId: string, amount: number, currentXP: number) => {
    const date = new Date().toISOString().split('T')[0];
    await supabase.from('water_logs').insert({ user_id: userId, amount, date });
    await API.addXP(userId, currentXP, 2);
  }
};
