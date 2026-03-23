import { create } from 'zustand'

export type UserLink = {
  id: string;
  type: string;
  url: string;
}

export type User = {
  id: string;
  email: string;
  username?: string;
  profileImageUrl?: string;
  themeColor?: string;
  backgroundGradient?: string;
  textColor?: string;
  usernameFont?: string;
  backgroundStyle?: string;
  links?: UserLink[];
}

export type Stats = {
  level: number;
  totalXP: number;
  currentStreak: number;
  bestStreak: number;
  focusScore?: number;
}

export type DailyStat = { date: string, totalFocusMinutes: number, sessionsCount: number };
export type Mission = { id: string, type: string, target: number, progress: number, completed: boolean };

interface AppState {
  user: User | null;
  stats: Stats | null;
  dailyStats: DailyStat[];
  missions: Mission[];
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setStats: (stats: Stats | null) => void;
  setDailyStats: (ds: DailyStat[]) => void;
  setMissions: (m: Mission[]) => void;
  logout: () => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  stats: null,
  dailyStats: [],
  missions: [],
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setStats: (stats) => set({ stats }),
  setDailyStats: (dailyStats) => set({ dailyStats }),
  setMissions: (missions) => set({ missions }),
  logout: () => set({ user: null, stats: null, dailyStats: [], missions: [], isAuthenticated: false }),
}))
