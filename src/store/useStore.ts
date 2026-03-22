import { create } from 'zustand'

export type User = {
  id: string;
  email: string;
}

export type Stats = {
  level: number;
  totalXP: number;
  currentStreak: number;
}

interface AppState {
  user: User | null;
  stats: Stats | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setStats: (stats: Stats | null) => void;
  logout: () => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  stats: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setStats: (stats) => set({ stats }),
  logout: () => set({ user: null, stats: null, isAuthenticated: false }),
}))
