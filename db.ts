
import { User, Habit, HabitLog, Task, FinancialEntry, WorkoutPlan, WaterLog, XPLog, XPRewards, DiaryEntry, UserFile, UserSettings } from './types';

const STORAGE_KEY = 'LIFE_RPG_DATA_V2';

interface DBStore {
  users: User[];
  habits: Habit[];
  habitLogs: HabitLog[];
  tasks: Task[];
  finance: FinancialEntry[];
  workouts: WorkoutPlan[];
  water: WaterLog[];
  xpLogs: XPLog[];
  diary: DiaryEntry[];
  files: UserFile[];
  settings: Record<string, UserSettings>;
}

const getStore = (): DBStore => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return { 
    users: [], habits: [], habitLogs: [], tasks: [], 
    finance: [], workouts: [], water: [], xpLogs: [], 
    diary: [], files: [], settings: {} 
  };
  return JSON.parse(data);
};

const saveStore = (store: DBStore) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

// Simple pseudo-hash for simulation
const hashPin = (pin: string) => `rpg_hash_${pin.split('').reverse().join('')}`;

export const DB = {
  // Auth
  getUser: (userId: string) => getStore().users.find(u => u.id === userId),
  
  createUser: (name: string, email: string, diaryPin: string): User => {
    const store = getStore();
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      xp: 0,
      level: 1,
      streak: 0,
      lastActive: new Date().toISOString(),
      unlockedFeatures: [],
      diaryPinHash: hashPin(diaryPin)
    };
    store.users.push(newUser);
    store.settings[newUser.id] = { waterGoal: 2500, notificationsEnabled: true, theme: 'dark' };
    saveStore(store);
    return newUser;
  },

  updateUser: (userId: string, updates: Partial<User>) => {
    const store = getStore();
    const idx = store.users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      if (updates.diaryPinHash) updates.diaryPinHash = hashPin(updates.diaryPinHash);
      store.users[idx] = { ...store.users[idx], ...updates };
      saveStore(store);
    }
  },

  verifyDiaryPin: (userId: string, pin: string) => {
    const user = DB.getUser(userId);
    return user?.diaryPinHash === hashPin(pin);
  },

  // Settings
  getSettings: (userId: string): UserSettings => getStore().settings[userId] || { waterGoal: 2500, notificationsEnabled: true, theme: 'dark' },
  updateSettings: (userId: string, settings: UserSettings) => {
    const store = getStore();
    store.settings[userId] = settings;
    saveStore(store);
  },

  // Diary
  getDiaryEntries: (userId: string) => getStore().diary.filter(d => d.userId === userId),
  addDiaryEntry: (userId: string, title: string, content: string) => {
    const store = getStore();
    const newEntry: DiaryEntry = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      title,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    store.diary.push(newEntry);
    saveStore(store);
    DB.addXP(userId, XPRewards.DIARY, 'Registro no Diário');
    return newEntry;
  },
  updateDiaryEntry: (userId: string, id: string, title: string, content: string) => {
    const store = getStore();
    const entry = store.diary.find(d => d.id === id && d.userId === userId);
    if (entry) {
      entry.title = title;
      entry.content = content;
      entry.updatedAt = new Date().toISOString();
      saveStore(store);
    }
  },
  deleteDiaryEntry: (userId: string, id: string) => {
    const store = getStore();
    store.diary = store.diary.filter(d => !(d.id === id && d.userId === userId));
    saveStore(store);
  },

  // Files
  getUserFiles: (userId: string) => getStore().files.filter(f => f.userId === userId),
  uploadFile: (userId: string, fileName: string, data: string, mimeType: string, linkedEntity?: UserFile['linkedEntity']) => {
    const store = getStore();
    const newFile: UserFile = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      fileName,
      data,
      mimeType,
      createdAt: new Date().toISOString(),
      linkedEntity
    };
    store.files.push(newFile);
    saveStore(store);
    return newFile;
  },
  deleteFile: (userId: string, id: string) => {
    const store = getStore();
    store.files = store.files.filter(f => !(f.id === id && f.userId === userId));
    saveStore(store);
  },

  // Gamification
  addXP: (userId: string, amount: number, source: string) => {
    const store = getStore();
    const user = store.users.find(u => u.id === userId);
    if (user) {
      user.xp += amount;
      user.level = Math.floor(Math.sqrt(user.xp / 100)) + 1;
      const log: XPLog = {
        id: Math.random().toString(36).substr(2, 9),
        userId,
        amount,
        source,
        timestamp: new Date().toISOString()
      };
      store.xpLogs.push(log);
      saveStore(store);
    }
  },

  // Habits
  getHabits: (userId: string) => getStore().habits.filter(h => h.userId === userId),
  addHabit: (userId: string, title: string, frequency: 'daily' | 'weekly') => {
    const store = getStore();
    const newHabit: Habit = {
      id: Math.random().toString(36).substr(2, 9),
      userId, title, frequency, createdAt: new Date().toISOString()
    };
    store.habits.push(newHabit);
    saveStore(store);
    return newHabit;
  },
  toggleHabit: (userId: string, habitId: string, date: string) => {
    const store = getStore();
    const existingIndex = store.habitLogs.findIndex(l => l.habitId === habitId && l.date === date);
    if (existingIndex > -1) {
      store.habitLogs.splice(existingIndex, 1);
      saveStore(store);
      return false;
    } else {
      store.habitLogs.push({ id: Math.random().toString(36).substr(2, 9), habitId, userId, date });
      saveStore(store);
      DB.addXP(userId, XPRewards.HABIT, 'Hábito Concluído');
      return true;
    }
  },
  getHabitLogs: (userId: string) => getStore().habitLogs.filter(l => l.userId === userId),

  // Tasks
  getTasks: (userId: string) => getStore().tasks.filter(t => t.userId === userId),
  addTask: (userId: string, title: string, priority: 'low' | 'medium' | 'high', dueDate: string) => {
    const store = getStore();
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      userId, title, priority, dueDate, completed: false
    };
    store.tasks.push(newTask);
    saveStore(store);
    return newTask;
  },
  completeTask: (userId: string, taskId: string) => {
    const store = getStore();
    const task = store.tasks.find(t => t.id === taskId);
    if (task && !task.completed) {
      task.completed = true;
      task.completedAt = new Date().toISOString();
      saveStore(store);
      DB.addXP(userId, XPRewards.TASK, 'Tarefa Finalizada');
    }
  },

  // Finance
  getFinance: (userId: string) => getStore().finance.filter(f => f.userId === userId),
  addFinance: (userId: string, entry: Omit<FinancialEntry, 'id' | 'userId'>) => {
    const store = getStore();
    const newEntry: FinancialEntry = {
      ...entry,
      id: Math.random().toString(36).substr(2, 9),
      userId
    };
    store.finance.push(newEntry);
    saveStore(store);
    DB.addXP(userId, XPRewards.FINANCE, 'Registro Financeiro');
    return newEntry;
  },
  attachFileToFinance: (entryId: string, fileId: string) => {
    const store = getStore();
    const entry = store.finance.find(f => f.id === entryId);
    if (entry) {
      entry.attachments = entry.attachments ? [...entry.attachments, fileId] : [fileId];
      saveStore(store);
    }
  },

  // Fitness
  getWorkouts: (userId: string) => getStore().workouts.filter(w => w.userId === userId),
  addWorkoutPlan: (userId: string, plan: Omit<WorkoutPlan, 'id' | 'userId'>) => {
    const store = getStore();
    const newPlan: WorkoutPlan = {
      ...plan,
      id: Math.random().toString(36).substr(2, 9),
      userId
    };
    store.workouts.push(newPlan);
    saveStore(store);
    return newPlan;
  },

  // Water
  getWaterLogs: (userId: string, date: string) => getStore().water.filter(w => w.userId === userId && w.date === date),
  addWater: (userId: string, amount: number) => {
    const store = getStore();
    const date = new Date().toISOString().split('T')[0];
    const log: WaterLog = {
      id: Math.random().toString(36).substr(2, 9),
      userId, amount, date
    };
    store.water.push(log);
    saveStore(store);
    DB.addXP(userId, 2, 'Consumo de Água');
  },

  unlockFeature: (userId: string, feature: string) => {
    const store = getStore();
    const user = store.users.find(u => u.id === userId);
    if (user && !user.unlockedFeatures.includes(feature)) {
      user.unlockedFeatures.push(feature);
      saveStore(store);
    }
  },

  // Admin
  getAllUsers: () => getStore().users,
  getStats: () => {
    const store = getStore();
    return {
      totalUsers: store.users.length,
      totalHabits: store.habits.length,
      totalTasks: store.tasks.length,
      totalXP: store.xpLogs.reduce((acc, log) => acc + log.amount, 0)
    };
  }
};
