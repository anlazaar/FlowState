import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface TimerState {
  isActive: boolean;
  taskTitle: string;
  duration: number; // original duration in minutes
  timeRemaining: number; // in seconds
  startedAt: string | null;
  startTimer: (title: string, durationMin: number) => void;
  tick: () => void;
  stopTimer: () => void;
  syncTime: () => void;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      isActive: false,
      taskTitle: '',
      duration: 25,
      timeRemaining: 25 * 60,
      startedAt: null,

      startTimer: (title, durationMin) => set({
        isActive: true,
        taskTitle: title,
        duration: durationMin,
        timeRemaining: durationMin * 60,
        startedAt: new Date().toISOString(),
      }),

      tick: () => set((state) => {
        if (!state.isActive || state.timeRemaining <= 0) return state;
        return { timeRemaining: state.timeRemaining - 1 };
      }),

      stopTimer: () => set({
        isActive: false,
        taskTitle: '',
        duration: 25,
        timeRemaining: 25 * 60,
        startedAt: null,
      }),

      syncTime: () => set((state) => {
        if (!state.isActive || !state.startedAt) return state;
        
        const now = new Date().getTime();
        const start = new Date(state.startedAt).getTime();
        const elapsedSeconds = Math.floor((now - start) / 1000);
        const newRemaining = Math.max(0, (state.duration * 60) - elapsedSeconds);
        
        return { timeRemaining: newRemaining };
      })
    }),
    {
      name: 'flowstate-timer',
    }
  )
)
