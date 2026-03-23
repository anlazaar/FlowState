import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface TimerState {
  isActive: boolean;
  taskTitle: string;
  duration: number; // in minutes
  timeRemaining: number; // in seconds
  startedAt: string | null;
  distractionCount: number;
  hiddenAt: number | null;
  inactiveDuration: number; // in seconds
  startTimer: (title: string, durationMin: number) => void;
  tick: () => void;
  stopTimer: () => void;
  syncTime: () => void;
  addDistraction: () => void;
  setHiddenAt: (time: number | null) => void;
  addInactiveDuration: (seconds: number) => void;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      isActive: false,
      taskTitle: '',
      duration: 25,
      timeRemaining: 25 * 60,
      startedAt: null,
      distractionCount: 0,
      hiddenAt: null,
      inactiveDuration: 0,

      startTimer: (title, durationMin) => set({
        isActive: true,
        taskTitle: title,
        duration: durationMin,
        timeRemaining: durationMin * 60,
        startedAt: new Date().toISOString(),
        distractionCount: 0,
        hiddenAt: null,
        inactiveDuration: 0,
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
        distractionCount: 0,
        hiddenAt: null,
        inactiveDuration: 0,
      }),

      syncTime: () => set((state) => {
        if (!state.isActive || !state.startedAt) return state;
        
        const now = new Date().getTime();
        const start = new Date(state.startedAt).getTime();
        const elapsedSeconds = Math.floor((now - start) / 1000);
        const newRemaining = Math.max(0, (state.duration * 60) - elapsedSeconds);
        
        return { timeRemaining: newRemaining };
      }),

      addDistraction: () => set((state) => ({ distractionCount: state.distractionCount + 1 })),
      setHiddenAt: (time) => set({ hiddenAt: time }),
      addInactiveDuration: (seconds) => set((state) => ({ inactiveDuration: state.inactiveDuration + seconds }))
    }),
    {
      name: 'flowstate-timer',
    }
  )
)
