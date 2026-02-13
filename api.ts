
import { supabase } from './supabase';
import { Profile, Habit, Task, FinancialEntry, WorkoutPlan, UserFile, UserSettings, XPRewards, DiaryEntry } from './types';

export const API = {
  // PROFILE
  getProfile: async (userId: string): Promise<Profile> => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) throw error;
    return data;
  },

  updateProfile: async (userId: string, updates: Partial<Profile>) => {
    return supabase.from('profiles').update(updates).eq('id', userId);
  },

  addXP: async (userId: string, currentXP: number, amount: number) => {
    const newXP = currentXP + amount;
    const newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1;
    return supabase.from('profiles').update({ xp: newXP, level: newLevel }).eq('id', userId);
  },

  // HABITS
  getHabits: async (userId: string) => {
    const { data: habits } = await supabase.from('habits').select('*').eq('user_id', userId);
    const { data: logs } = await supabase.from('habit_logs').select('*').eq('user_id', userId);
    return { habits: habits || [], logs: logs || [] };
  },

  createHabit: async (userId: string, title: string, frequency: string, category: string) => {
    return supabase.from('habits').insert({ user_id: userId, title, frequency, category });
  },

  updateHabit: async (habitId: string, updates: Partial<Habit>) => {
    return supabase.from('habits').update(updates).eq('id', habitId);
  },

  deleteHabit: async (habitId: string) => {
    return supabase.from('habits').delete().eq('id', habitId);
  },

  toggleHabit: async (userId: string, habitId: string, date: string, currentXP: number) => {
    const { data: existing } = await supabase.from('habit_logs').select('*').eq('habit_id', habitId).eq('date', date).single();
    if (existing) {
      await supabase.from('habit_logs').delete().eq('id', existing.id);
      return false;
    } else {
      await supabase.from('habit_logs').insert({ habit_id: habitId, user_id: userId, date });
      await API.addXP(userId, currentXP, XPRewards.HABIT);
      return true;
    }
  },

  // TASKS
  getTasks: async (userId: string): Promise<Task[]> => {
    const { data } = await supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    return data || [];
  },

  createTask: async (userId: string, title: string, priority: string, dueDate: string) => {
    return supabase.from('tasks').insert({ user_id: userId, title, priority, due_date: dueDate, completed: false });
  },

  completeTask: async (userId: string, taskId: string, currentXP: number) => {
    await supabase.from('tasks').update({ completed: true, completed_at: new Date().toISOString() }).eq('id', taskId);
    await API.addXP(userId, currentXP, XPRewards.TASK);
  },

  // FINANCE
  getFinance: async (userId: string): Promise<FinancialEntry[]> => {
    const { data } = await supabase.from('financial_entries').select('*').eq('user_id', userId).order('date', { ascending: false });
    return data || [];
  },

  addFinance: async (userId: string, entry: any, currentXP: number) => {
    await supabase.from('financial_entries').insert({ ...entry, user_id: userId });
    await API.addXP(userId, currentXP, XPRewards.FINANCE);
  },

  // FITNESS
  getWorkouts: async (userId: string): Promise<WorkoutPlan[]> => {
    const { data } = await supabase.from('workout_plans').select('*').eq('user_id', userId);
    return data || [];
  },

  addWorkoutPlan: async (userId: string, plan: any) => {
    return supabase.from('workout_plans').insert({ ...plan, user_id: userId });
  },

  // WATER
  getWater: async (userId: string, date: string) => {
    const { data } = await supabase.from('water_logs').select('*').eq('user_id', userId).eq('date', date);
    return data || [];
  },

  addWater: async (userId: string, amount: number, currentXP: number) => {
    const date = new Date().toISOString().split('T')[0];
    await supabase.from('water_logs').insert({ user_id: userId, amount, date });
    await API.addXP(userId, currentXP, 2);
  },

  // DIARY
  getDiary: async (userId: string): Promise<DiaryEntry[]> => {
    const { data } = await supabase.from('diary').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    return data || [];
  },

  addDiary: async (userId: string, title: string, content: string, currentXP: number) => {
    await supabase.from('diary').insert({ 
      user_id: userId, 
      title, 
      content, 
      created_at: new Date().toISOString(), 
      updated_at: new Date().toISOString() 
    });
    await API.addXP(userId, currentXP, XPRewards.DIARY);
  },

  deleteDiary: async (id: string) => {
    return supabase.from('diary').delete().eq('id', id);
  },

  // FILES
  getFiles: async (userId: string): Promise<UserFile[]> => {
    const { data } = await supabase.from('files').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    return data || [];
  },

  uploadFile: async (userId: string, fileName: string, data: string, mimeType: string) => {
    return supabase.from('files').insert({ 
      user_id: userId, 
      file_name: fileName, 
      data, 
      mime_type: mimeType, 
      created_at: new Date().toISOString() 
    });
  },

  deleteFile: async (id: string) => {
    return supabase.from('files').delete().eq('id', id);
  },

  // SETTINGS
  getSettings: async (userId: string): Promise<UserSettings> => {
    const { data } = await supabase.from('user_settings').select('*').eq('user_id', userId).single();
    return data || { waterGoal: 2500, notificationsEnabled: true, theme: 'dark' };
  },

  updateSettings: async (userId: string, settings: UserSettings) => {
    const { data: existing } = await supabase.from('user_settings').select('id').eq('user_id', userId).single();
    if (existing) {
      return supabase.from('user_settings').update(settings).eq('user_id', userId);
    } else {
      return supabase.from('user_settings').insert({ ...settings, user_id: userId });
    }
  },

  // ADMIN
  getGlobalStats: async () => {
    const { count: u } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: h } = await supabase.from('habits').select('*', { count: 'exact', head: true });
    const { count: t } = await supabase.from('tasks').select('*', { count: 'exact', head: true });
    return { totalUsers: u || 0, totalHabits: h || 0, totalTasks: t || 0 };
  },

  getAllUsers: async () => {
    const { data } = await supabase.from('profiles').select('*').order('xp', { ascending: false });
    return data || [];
  }
};
