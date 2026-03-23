"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser, setStats, isAuthenticated } = useStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      const meRes = await fetch("/api/auth/me");
      if (meRes.ok) {
        const meData = await meRes.json();
        setUser(meData.user);
        setStats(meData.stats);
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#030305] px-4 relative overflow-hidden">
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-violet-600/20 blur-[120px] mix-blend-screen float-anim" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-indigo-600/20 blur-[130px] mix-blend-screen float-anim-delayed" />
        <div className="absolute top-[40%] left-[60%] w-[30vw] h-[30vw] rounded-full bg-fuchsia-600/10 blur-[100px] mix-blend-screen float-anim" style={{ animationDuration: '15s' }} />
      </div>
      
      <div className="absolute inset-0 z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="z-10 w-full max-w-md"
      >
        <div className="mb-10 text-center">
          <motion.div
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gradient-to-br from-violet-500 to-indigo-600 shadow-[0_0_40px_rgba(139,92,246,0.4)] border border-white/20 backdrop-blur-md"
          >
            <span className="text-4xl font-extrabold tracking-tighter text-white">FS</span>
          </motion.div>
          <h1 className="text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50">FlowState</h1>
          <p className="mt-3 text-lg text-white/60 font-medium tracking-wide">Enter the zone. Gamify your deep work.</p>
        </div>

        <Card className="glass relative overflow-hidden p-2">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          <CardHeader>
            <CardTitle className="text-2xl">{isLogin ? "Welcome back" : "Create an account"}</CardTitle>
            <CardDescription className="text-base">
              {isLogin ? "Enter your credentials to continue" : "Join us and boost your productivity"}
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/80">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-black/20 border-white/10 focus:border-violet-500/50 focus:ring-violet-500/30 transition-all h-12 text-base px-4"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/80">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-black/20 border-white/10 focus:border-violet-500/50 focus:ring-violet-500/30 transition-all h-12 text-base px-4"
                  required
                />
              </div>
              
              <AnimatePresence>
                {error && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-sm font-medium text-destructive flex items-center gap-2"
                  >
                    <AlertTriangle className="w-4 h-4" /> {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <Button type="submit" className="w-full h-12 text-base font-semibold bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.2)]" disabled={loading}>
                {loading ? "Please wait..." : (isLogin ? "Sign In" : "Sign Up")}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-white/5 pt-6 pb-2 relative z-10">
            <Button
              variant="ghost"
              className="text-sm text-white/50 hover:text-white"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
