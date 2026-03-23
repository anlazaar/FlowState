import { create } from 'zustand'

export type Notification = {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'destructive' | 'gamification';
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  addNotification: (notif) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({ notifications: [...state.notifications, { ...notif, id }] }));
    setTimeout(() => {
      set((state) => ({ notifications: state.notifications.filter((n) => n.id !== id) }));
    }, 5000); // auto remove after 5s
  },
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter((n) => n.id !== id)
  })),
}))
