
// Consolidation of User and Profile types to maintain consistency across the app
export interface User {
  id: string;
  name: string;
  email: string;
  xp: number;
  level: number;
  streak: number;
  lastActive: string;
  unlockedFeatures: string[];
  diaryPinHash: string;
  avatarUrl?: string;
}

// Alias for components that still use 'Profile'
export type Profile = User;

export interface Habit {
  id: string;
  userId: string;
  title: string;
  frequency: 'daily' | 'weekly';
  createdAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  userId: string;
  date: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  completed: boolean;
  completedAt?: string;
}

export interface FinancialEntry {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  attachments?: string[];
}

export interface WorkoutPlan {
  id: string;
  userId: string;
  name: string;
  description: string;
  exercises: {
    name: string;
    sets: number;
    reps: string;
    weight?: string;
  }[];
}

export interface WaterLog {
  id: string;
  userId: string;
  amount: number;
  date: string;
}

export interface XPLog {
  id: string;
  userId: string;
  amount: number;
  source: string;
  timestamp: string;
}

export interface DiaryEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserFile {
  id: string;
  userId: string;
  fileName: string;
  data: string;
  mimeType: string;
  createdAt: string;
  linkedEntity?: {
    type: string;
    id: string;
  };
}

export interface UserSettings {
  waterGoal: number;
  notificationsEnabled: boolean;
  theme: 'light' | 'dark';
}

export enum XPRewards {
  HABIT = 10,
  TASK = 15,
  FINANCE = 8,
  WORKOUT = 20,
  DIARY = 12
}
