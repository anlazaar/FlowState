"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Loader2, Palette, Type, Image as ImageIcon, Award, Sparkles } from "lucide-react";
import { toast } from "sonner";

const SHOP_ITEMS = [
  { id: "font-inter", type: "font", name: "Inter (Default)", price: 0, category: "Fonts" },
  { id: "font-serif", type: "font", name: "Elegant Serif", price: 100, category: "Fonts" },
  { id: "font-mono", type: "font", name: "Hacker Mono", price: 150, category: "Fonts" },
  { id: "theme-violet", type: "color", name: "Violet (Default)", price: 0, category: "Colors" },
  { id: "theme-rose", type: "color", name: "Rose Quartz", price: 200, category: "Colors" },
  { id: "theme-emerald", type: "color", name: "Emerald City", price: 200, category: "Colors" },
  { id: "theme-amber", type: "color", name: "Cyber Amber", price: 250, category: "Colors" },
  { id: "theme-neon-pink", type: "color", name: "Neon Pink", price: 400, category: "Colors", premium: true },
  { id: "bg-none", type: "background", name: "Solid Dark (Default)", price: 0, category: "Backgrounds" },
  { id: "bg-grid", type: "background", name: "Cyber Grid", price: 300, category: "Backgrounds" },
  { id: "bg-noise", type: "background", name: "Retro Noise", price: 400, category: "Backgrounds" },
  { id: "bg-gradient-animated", type: "background", name: "Pulse Gradient", price: 800, category: "Backgrounds", premium: true },
  { id: "badge-gold", type: "badge", name: "Golden Aura", price: 1000, category: "Badges", premium: true },
  { id: "feature-pro-stats", type: "feature", name: "Pro Analytics", price: 1500, category: "Features", premium: true },
  { id: "feature-goals", type: "feature", name: "Goal Tracking", price: 2000, category: "Features", premium: true },
];

export default function ShopPage() {
  const { user, setUser } = useStore();
  const [activeTab, setActiveTab] = useState("Colors");
  const [unlocks, setUnlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    fetchUnlocks();
  }, [user?.id]);

  const fetchUnlocks = async () => {
    try {
      const res = await fetch("/api/shop");
      if (res.ok) {
        const data = await res.json();
        setUnlocks(data.unlocks || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (item: typeof SHOP_ITEMS[0]) => {
    if (!user) return toast.error("Please login first");
    if ((user.tokens || 0) < item.price) {
      return toast.error("Not enough FlowTokens!");
    }

    setPurchasing(item.id);
    try {
      const res = await fetch("/api/shop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: item.type, itemId: item.id, price: item.price }),
      });

      if (res.ok) {
        toast.success(`Unlocked ${item.name}!`);
        // Optimistic UI update
        setUser({ ...user, tokens: (user.tokens || 0) - item.price });
        setUnlocks([...unlocks, { itemId: item.id, type: item.type }]);
      } else {
        const data = await res.json();
        toast.error(data.error || "Purchase failed");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  const checkUnlocked = (item: typeof SHOP_ITEMS[0]) => {
    if (item.price === 0) return true;
    return unlocks.some((u) => u.itemId === item.id);
  };

  const categories = Array.from(new Set(SHOP_ITEMS.map((item) => item.category)));

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto max-w-5xl px-4 py-8">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-blue-500" /> Customization Store
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Unlock premium styles and features using your focus tokens.
            </p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 px-6 py-3 rounded-2xl flex items-center gap-3">
            <span className="text-blue-400 font-bold text-xl">{user?.tokens || 0}</span>
            <span className="text-blue-400/70 text-sm tracking-wider uppercase">FlowTokens</span>
          </div>
        </header>

        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                activeTab === cat
                  ? "bg-primary text-primary-foreground shadow-lg scale-105"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {SHOP_ITEMS.filter((i) => i.category === activeTab).map((item) => {
            const isUnlocked = checkUnlocked(item);
            return (
              <div
                key={item.id}
                className={`group relative rounded-3xl border p-6 flex flex-col transition-all duration-300 hover:shadow-xl ${
                  item.premium
                    ? "border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent hover:border-amber-500/50"
                    : "border-white/10 bg-secondary/20 hover:border-white/20 hover:bg-secondary/40"
                }`}
              >
                {item.premium && (
                  <div className="absolute top-0 right-8 -translate-y-1/2 bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                    PREMIUM
                  </div>
                )}
                <div className="mb-4 text-3xl">
                  {item.category === "Fonts" && <Type className="h-8 w-8 text-blue-400" />}
                  {item.category === "Colors" && <Palette className="h-8 w-8 text-rose-400" />}
                  {item.category === "Backgrounds" && <ImageIcon className="h-8 w-8 text-emerald-400" />}
                  {item.category === "Badges" && <Award className="h-8 w-8 text-amber-400" />}
                  {item.category === "Features" && <Sparkles className="h-8 w-8 text-violet-400" />}
                </div>
                
                <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                
                {/* Visual Preview Stub based on item ID */}
                <div className="h-20 w-full rounded-xl mb-4 overflow-hidden border border-white/5 flex items-center justify-center text-sm font-medium" 
                     style={{
                       background: item.type === "color" && item.id.includes("theme-rose") ? "#fda4af" : 
                                   item.type === "color" && item.id.includes("emerald") ? "#34d399" :
                                   item.type === "color" && item.id.includes("amber") ? "#fbbf24" :
                                   item.type === "color" && item.id.includes("neon-pink") ? "#f472b6" :
                                   item.type === "background" && item.id.includes("grid") ? "linear-gradient(to right, #ffffff15 1px, transparent 1px), linear-gradient(to bottom, #ffffff15 1px, transparent 1px)" :
                                   item.type === "background" && item.id.includes("noise") ? "url('https://grainy-gradients.vercel.app/noise.svg')" :
                                   "rgba(255,255,255,0.05)",
                       backgroundSize: item.type === "background" && item.id.includes("grid") ? "24px 24px" : "auto",
                       color: item.type === "color" && item.price > 0 ? "#000" : "inherit"
                     }}>
                  {item.type === "font" ? "A" : ""}
                </div>

                <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5">
                  <div className="flex font-bold text-blue-400">
                    {item.price === 0 ? "Free" : `${item.price} FT`}
                  </div>
                  <Button
                    variant={isUnlocked ? "secondary" : "default"}
                    disabled={isUnlocked || purchasing === item.id || (user?.tokens || 0) < item.price}
                    onClick={() => handlePurchase(item)}
                    className={
                      !isUnlocked && item.premium 
                        ? "bg-amber-500 hover:bg-amber-600 text-black font-bold"
                        : ""
                    }
                  >
                    {purchasing === item.id && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {isUnlocked ? "Unlocked" : "Unlock"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
