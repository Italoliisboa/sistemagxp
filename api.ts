
import { supabase } from './supabase';
import { Habit, Task, XPRewards, Profile, FinancialEntry, DiaryEntry, WorkoutPlan, UserFile, UserSettings } from './types';

export const API = {
  // PROFILE & SETTINGS
  getProfile: async (userId: string): Promise<Profile> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  updateProfile: async (userId: string, updates: Partial<Profile>) => {
    return supabase.from('profiles').update(updates).eq('id', userId);
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
    return supabase.from('tasks').insert({ user_id: userId, title, priority, due_date: dueDate, completed: false }).select().single();
  },

  completeTask: async (userId: string, taskId: string, currentXP: number) => {
    await supabase.from('tasks').update({ completed: true, completed_at: new Date().toISOString() }).eq('id', taskId);
    await API.addXP(userId, currentXP, XPRewards.TASK);
  },

  deleteTask: async (taskId: string) => {
    return supabase.from('tasks').delete().eq('id', taskId);
  },

  // FINANCE
  getFinance: async (userId: string): Promise<FinancialEntry[]> => {
    const { data } = await supabase.from('financial_entries').select('*').eq('user_id', userId).order('date', { ascending: false });
    return data || [];
  },

  addFinance: async (userId: string, entry: any, currentXP: number) => {
    const { data, error } = await supabase.from('financial_entries').insert({ ...entry, user_id: userId }).select().single();
    if (!error) await API.addXP(userId, currentXP, XPRewards.FINANCE);
    return data;
  },

  // FITNESS
  getWorkouts: async (userId: string): Promise<WorkoutPlan[]> => {
    const { data } = await supabase.from('workout_plans').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    return data || [];
  },

  addWorkoutPlan: async (userId: string, plan: any) => {
    return supabase.from('workout_plans').insert({ ...plan, user_id: userId }).select().single();
  },

  // DIARY
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

  // FILES
  getFiles: async (userId: string): Promise<UserFile[]> => {
    const { data } = await supabase.from('user_files').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    return data || [];
  },

  uploadFile: async (userId: string, fileName: string, data: string, mimeType: string) => {
    return supabase.from('user_files').insert({ user_id: userId, file_name: fileName, data, mime_type: mimeType }).select().single();
  },

  deleteFile: async (id: string) => {
    return supabase.from('user_files').delete().eq('id', id);
  },

  // ADMIN (Global Stats from Supabase)
  getGlobalStats: async () => {
    const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: habitsCount } = await supabase.from('habits').select('*', { count: 'exact', head: true });
    const { count: tasksCount } = await supabase.from('tasks').select('*', { count: 'exact', head: true });
    return {
      totalUsers: usersCount || 0,
      totalHabits: habitsCount || 0,
      totalTasks: tasksCount || 0,
    };
  },

  getAllUsers: async () => {
    const { data } = await supabase.from('profiles').select('*').order('xp', { ascending: false });
    return data || [];
  }
};
