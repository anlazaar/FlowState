"use client";

import { useNotificationStore } from "@/store/useNotificationStore";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Trophy, X } from "lucide-react";

export function Notifications() {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {notifications.map((notif) => {
          const isGamification = notif.variant === "gamification";

          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`pointer-events-auto flex items-start gap-4 p-4 rounded-xl shadow-2xl border backdrop-blur-md relative overflow-hidden ${
                notif.variant === "destructive"
                  ? "bg-red-500/20 border-red-500/50 text-red-50"
                  : isGamification
                  ? "bg-violet-900/60 border-violet-500/50 text-violet-50 p-6 shadow-[0_0_30px_rgba(139,92,246,0.3)]"
                  : "bg-black/80 border-white/10 text-white"
              }`}
            >
              {isGamification && (
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-violet-600/30 to-fuchsia-600/30 z-0"
                  animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              )}
              
              <div className="mt-1 relative z-10">
                {notif.variant === "destructive" && <AlertCircle className="w-5 h-5 text-red-400" />}
                {notif.variant === "success" && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                {isGamification && (
                  <motion.div
                    animate={{ rotate: [0, -15, 15, -15, 15, 0], scale: [1, 1.3, 1] }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <Trophy className="w-8 h-8 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,1)]" />
                  </motion.div>
                )}
              </div>
              <div className="flex-1 relative z-10">
                <h3 className={`font-bold ${isGamification ? "text-xl text-yellow-400" : "text-sm"}`}>{notif.title}</h3>
                {notif.description && (
                  <p className={`mt-1 ${isGamification ? "text-base font-medium text-white/90" : "text-sm opacity-80"}`}>
                    {notif.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeNotification(notif.id)}
                className="opacity-50 hover:opacity-100 transition-opacity relative z-10"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
