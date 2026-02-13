
export interface Profile {
  id: string;
  name: string;
  email: string;
  xp: number;
  level: number;
  streak: number;
  last_active: string;
  avatar_url?: string;
  // Added missing properties for gamification and security
  unlockedFeatures: string[];
  diaryPinHash?: string;
}

export type User = Profile;

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  frequency: 'daily' | 'weekly';
  category: string;
  created_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  date: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  due_date: string;
  completed: boolean;
  completed_at?: string;
  created_at: string;
}

export interface FinancialEntry {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
  // Added missing attachments property
  attachments?: string[];
}

export interface WorkoutPlan {
  id: string;
  user_id: string;
  name: string;
  description: string;
  exercises: Array<{
    name: string;
    sets: number;
    reps: string;
    weight?: string;
  }>;
  created_at: string;
}

export interface UserFile {
  id: string;
  user_id: string;
  file_name: string;
  data: string;
  mime_type: string;
  created_at: string;
  // Added missing linkedEntity property
  linkedEntity?: { type: string; id: string };
}

export interface UserSettings {
  waterGoal: number;
  notificationsEnabled: boolean;
  theme: 'dark' | 'light';
}

export enum XPRewards {
  HABIT = 10,
  TASK = 15,
  DIARY = 20,
  FINANCE = 8
}

// Added missing interfaces for Water, XP and Diary
export interface WaterLog {
  id: string;
  user_id: string;
  amount: number;
  date: string;
}

export interface XPLog {
  id: string;
  user_id: string;
  amount: number;
  source: string;
  timestamp: string;
}

export interface DiaryEntry {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}
