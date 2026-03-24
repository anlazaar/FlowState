"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Loader2, Palette, Type, Image as ImageIcon, Award, Sparkles } from "lucide-react";
import { toast } from "sonner";

const SHOP_ITEMS =[
  // Fonts expanded
  { id: "font-inter", type: "font", name: "Inter (Default)", price: 0, category: "Fonts" },
  { id: "font-outfit", type: "font", name: "Outfit (Modern)", price: 100, category: "Fonts" },
  { id: "font-jakarta", type: "font", name: "Plus Jakarta", price: 150, category: "Fonts" },
  { id: "font-serif-elegant", type: "font", name: "Playfair", price: 100, category: "Fonts" },
  { id: "font-lora", type: "font", name: "Lora (Classic)", price: 150, category: "Fonts" },
  { id: "font-mono-dev", type: "font", name: "Fira Code", price: 150, category: "Fonts" },
  { id: "font-jetbrains", type: "font", name: "JetBrains", price: 200, category: "Fonts" },
  { id: "font-space", type: "font", name: "Space Grotesk", price: 200, category: "Fonts", premium: true },
  { id: "font-syne", type: "font", name: "Syne (Display)", price: 300, category: "Fonts", premium: true },

  // Colors expanded with Pro variants
  { id: "theme-violet", type: "color", name: "Violet (Default)", price: 0, category: "Colors" },
  { id: "theme-violet-pro", type: "color", name: "Deep Violet", price: 150, category: "Colors" },
  { id: "theme-blue", type: "color", name: "Ocean Blue", price: 100, category: "Colors" },
  { id: "theme-emerald-soft", type: "color", name: "Soft Emerald", price: 200, category: "Colors" },
  { id: "theme-rose-quartz", type: "color", name: "Rose Quartz", price: 200, category: "Colors" },
  { id: "theme-amber", type: "color", name: "Cyber Amber", price: 250, category: "Colors" },
  { id: "theme-neon-pink", type: "color", name: "Neon Pink", price: 400, category: "Colors", premium: true },
  { id: "theme-monochrome", type: "color", name: "Monochrome", price: 500, category: "Colors", premium: true },

  // Backgrounds expanded with variations
  { id: "bg-none", type: "background", name: "Solid Dark (Default)", price: 0, category: "Backgrounds" },
  { id: "bg-grid-thin", type: "background", name: "Thin Grid", price: 100, category: "Backgrounds" },
  { id: "bg-grid-dense", type: "background", name: "Dense Grid", price: 300, category: "Backgrounds" },
  { id: "bg-noise-light", type: "background", name: "Light Noise", price: 200, category: "Backgrounds" },
  { id: "bg-noise-strong", type: "background", name: "Strong Noise", price: 400, category: "Backgrounds" },
  { id: "bg-gradient-pulse-slow", type: "background", name: "Slow Pulse", price: 800, category: "Backgrounds", premium: true },

  // Badges (Status Icons)
  { id: "badge-gold", type: "badge", name: "Gold Badge", price: 1000, category: "Badges", premium: true },
  { id: "badge-elite-ring", type: "badge", name: "Elite Ring", price: 1200, category: "Badges", premium: true },
  { id: "badge-focus-master", type: "badge", name: "Focus Master", price: 1500, category: "Badges", premium: true },
];

export default function ShopPage() {
  const { user, setUser } = useStore();
  const [activeTab, setActiveTab] = useState("Colors");
  const [unlocks, setUnlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const[purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    fetchUnlocks();
  }, [user?.id]);

  const fetchUnlocks = async () => {
    try {
      const res = await fetch("/api/shop");
      if (res.ok) {
        const data = await res.json();
        setUnlocks(data.unlocks ||[]);
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
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const checkUnlocked = (item: typeof SHOP_ITEMS[0]) => {
    if (item.price === 0) return true;
    return unlocks.some((u) => u.itemId === item.id);
  };

  const categories = Array.from(new Set(SHOP_ITEMS.map((item) => item.category)));

  return (
    <div className="min-h-screen bg-[#030305] text-white flex flex-col selection:bg-primary/30">
      <Navbar />
      <main className="flex-1 container mx-auto max-w-5xl px-4 py-12 relative">
        <div className="absolute top-[-10%] left-[50%] -translate-x-1/2 w-[40vw] h-[40vw] rounded-full bg-primary/5 blur-[120px] mix-blend-screen pointer-events-none z-0" />
        
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between border-b border-white/5 pb-8 gap-6 relative z-10">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-primary" /> The Store
            </h1>
            <p className="text-white/50 mt-2 text-lg font-medium">
              Unlock premium configurations, deep focus aesthetics, and statuses.
            </p>
          </div>
          <div className="bg-primary/10 border border-primary/20 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-[0_0_30px_rgba(139,92,246,0.1)]">
            <span className="text-primary font-black text-2xl tracking-tighter">{user?.tokens || 0}</span>
            <span className="text-primary/70 text-sm tracking-widest uppercase font-bold">Tokens</span>
          </div>
        </header>

        <div className="flex flex-wrap gap-3 mb-10 relative z-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                activeTab === cat
                  ? "bg-primary text-white shadow-[0_0_20px_var(--color-primary)] scale-105"
                  : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-white/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
          {SHOP_ITEMS.filter((i) => i.category === activeTab).map((item) => {
            const isUnlocked = checkUnlocked(item);
            return (
              <div
                key={item.id}
                className={`group relative rounded-[2rem] border p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                  item.premium
                    ? "border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent hover:border-amber-500/50 hover:shadow-[0_10px_40px_rgba(245,158,11,0.1)]"
                    : "border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10 hover:shadow-xl"
                }`}
              >
                {item.premium && (
                  <div className="absolute top-0 right-6 -translate-y-1/2 bg-amber-500 text-black text-[10px] font-black tracking-widest px-3 py-1 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.6)] uppercase">
                    Premium
                  </div>
                )}
                
                <div className="mb-5 text-3xl">
                  {item.category === "Fonts" && <Type className="h-6 w-6 text-white/40 group-hover:text-primary transition-colors" />}
                  {item.category === "Colors" && <Palette className="h-6 w-6 text-white/40 group-hover:text-primary transition-colors" />}
                  {item.category === "Backgrounds" && <ImageIcon className="h-6 w-6 text-white/40 group-hover:text-primary transition-colors" />}
                  {item.category === "Badges" && <Award className="h-6 w-6 text-white/40 group-hover:text-primary transition-colors" />}
                </div>
                
                <h3 className="font-bold text-lg mb-1 tracking-tight">{item.name}</h3>
                
                {/* Clean CSS-based Preview Block */}
                <div className="h-24 w-full rounded-2xl mb-5 overflow-hidden border border-white/5 flex items-center justify-center transition-transform group-hover:scale-[1.03]" 
                     style={{
                       background: item.type === "color" && item.id.includes("rose") ? "#fb7185" : 
                                   item.type === "color" && item.id.includes("emerald") ? "#34d399" :
                                   item.type === "color" && item.id.includes("amber") ? "#fbbf24" :
                                   item.type === "color" && item.id.includes("neon-pink") ? "#ff1493" :
                                   item.type === "color" && item.id.includes("violet-pro") ? "#5b21b6" :
                                   item.type === "color" && item.id.includes("blue") ? "#3b82f6" :
                                   item.type === "color" && item.id.includes("monochrome") ? "#e5e5e5" :
                                   item.type === "background" && item.id.includes("grid-thin") ? "linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)" :
                                   item.type === "background" && item.id.includes("grid-dense") ? "linear-gradient(to right, rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.2) 1px, transparent 1px)" :
                                   item.type === "background" && item.id.includes("noise") ? "url('https://grainy-gradients.vercel.app/noise.svg')" :
                                   item.type === "background" && item.id.includes("pulse") ? "linear-gradient(-45deg, rgba(139,92,246,0.3), rgba(59,130,246,0.3), rgba(16,185,129,0.3))" :
                                   "rgba(255,255,255,0.02)",
                       backgroundSize: item.type === "background" && item.id.includes("grid-thin") ? "24px 24px" : 
                                       item.type === "background" && item.id.includes("grid-dense") ? "12px 12px" : "400% 400%",
                       color: item.type === "color" && item.price > 0 ? "#000" : "inherit"
                     }}>
                  {item.type === "font" && <span className={`text-4xl font-medium tracking-tight ${item.id}`}>Ag</span>}
                  {item.type === "badge" && <Award className="w-10 h-10 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]" />}
                </div>

                <div className="mt-auto pt-5 flex items-center justify-between border-t border-white/5">
                  <div className="flex font-extrabold text-primary text-sm tracking-wider uppercase">
                    {item.price === 0 ? "Default" : `${item.price} FT`}
                  </div>
                  <Button
                    variant={isUnlocked ? "secondary" : "default"}
                    disabled={isUnlocked || purchasing === item.id || (user?.tokens || 0) < item.price}
                    onClick={() => handlePurchase(item)}
                    className={`rounded-xl h-9 text-xs font-bold px-4 ${
                      !isUnlocked && item.premium 
                        ? "bg-amber-500 hover:bg-amber-600 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                        : !isUnlocked ? "bg-white text-black hover:bg-white/90" : "bg-white/10 text-white/50 border-0"
                    }`}
                  >
                    {purchasing === item.id && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
                    {isUnlocked ? "Acquired" : "Unlock"}
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