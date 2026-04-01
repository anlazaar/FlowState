"use client";

import { useState, useRef, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNotificationStore } from "@/store/useNotificationStore";
import { Camera, Plus, Trash2, Link as LinkIcon, Github, Linkedin, Globe, Lock } from "lucide-react";

const THEME_OPTIONS =[
  { id: 'theme-violet', color: 'bg-[#8b5cf6]' },
  { id: 'theme-violet-deep', color: 'bg-[#4c1d95]' },
  { id: 'theme-violet-soft', color: 'bg-[#a78bfa]' },
  { id: 'theme-blue-contrast', color: 'bg-[#2563eb]' },
  { id: 'theme-emerald', color: 'bg-[#10b981]' },
  { id: 'theme-emerald-deep', color: 'bg-[#047857]' },
  { id: 'theme-emerald-soft', color: 'bg-[#6ee7b7]' },
  { id: 'theme-rose', color: 'bg-[#f43f5e]' },
  { id: 'theme-rose-deep', color: 'bg-[#be123c]' },
  { id: 'theme-rose-soft', color: 'bg-[#fda4af]' },
  { id: 'theme-amber', color: 'bg-[#fbbf24]' },
  { id: 'theme-amber-deep', color: 'bg-[#b45309]' },
  { id: 'theme-neon-pink', color: 'bg-[#ff1493]' },
  { id: 'theme-monochrome', color: 'bg-[#e5e5e5]' }
];

const FONT_OPTIONS =[
  { id: "font-inter", name: "Inter" },
  { id: "font-roboto", name: "Roboto" },
  { id: "font-outfit", name: "Outfit" },
  { id: "font-jakarta", name: "Jakarta" },
  { id: "font-merriweather", name: "Merriweather" },
  { id: "font-playfair", name: "Playfair" },
  { id: "font-fira", name: "Fira Code" },
  { id: "font-jetbrains", name: "JetBrains" },
  { id: "font-space", name: "Space" },
  { id: "font-syne", name: "Syne" },
];

const BG_OPTIONS =[
  { id: "bg-none", name: "Solid Dark" },
  { id: "bg-grid-thin", name: "Thin Grid" },
  { id: "bg-grid-dense", name: "Dense Grid" },
  { id: "bg-noise-light", name: "Light Noise" },
  { id: "bg-noise-strong", name: "Strong Noise" },
  { id: "bg-gradient-pulse-slow", name: "Pulse" },
];

const BADGE_OPTIONS =[
  { id: "badge-none", name: "None", icon: null },
  { id: "badge-gold", name: "Gold Badge", icon: "⭐" },
  { id: "badge-elite-ring", name: "Elite Ring", icon: "🔥" },
  { id: "badge-focus-master", name: "Focus Master", icon: "⚡" },
];

export default function SettingsPage() {
  const { user, setUser } = useStore();
  const { addNotification } = useNotificationStore();
  const router = useRouter();
  
  const [username, setUsername] = useState(user?.username || "");
  const[profileImage, setProfileImage] = useState(user?.profileImageUrl || "");
  const[links, setLinks] = useState<{ id?: string; type: string; url: string }[]>(user?.links ||[]);
  const [themeColor, setThemeColor] = useState(user?.themeColor || "theme-violet");
  const [usernameFont, setUsernameFont] = useState(user?.usernameFont || "font-inter");
  const [backgroundStyle, setBackgroundStyle] = useState(user?.backgroundStyle || "bg-none");
  const [activeBadge, setActiveBadge] = useState(user?.activeBadge || "badge-none");
  const [loading, setLoading] = useState(false);
  const [unlocks, setUnlocks] = useState<any[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/shop").then(r => r.json()).then(d => setUnlocks(d.unlocks || []));
  },[]);

  const hasUnlock = (id: string, defaultItems: string[]) => {
    if (defaultItems.includes(id)) return true;
    
    const checkId = (targetId: string) => {
      return user?.unlocks?.some((u: any) => u.itemId === targetId) || unlocks.some(u => u.itemId === targetId);
    };

    if (checkId(id)) return true;

    // Legacy migration mappings
    if (id === 'bg-grid-thin' && checkId('bg-grid')) return true;
    if (id === 'bg-noise-light' && checkId('bg-noise')) return true;
    if (id === 'theme-rose-quartz' && checkId('theme-rose')) return true;
    if (id === 'theme-emerald-soft' && checkId('theme-emerald')) return true;
    if (id === 'font-mono-dev' && checkId('font-mono')) return true;
    if (id === 'font-serif-elegant' && checkId('font-serif')) return true;

    return false;
  };

  useEffect(() => {
    if (user) {
      if (user.username) setUsername(user.username);
      if (user.profileImageUrl) setProfileImage(user.profileImageUrl);
      if (user.links) setLinks(user.links);
      if (user.themeColor) setThemeColor(user.themeColor);
      if (user.usernameFont) setUsernameFont(user.usernameFont === "font-sans" ? "font-inter" : user.usernameFont);
      if (user.backgroundStyle) setBackgroundStyle(user.backgroundStyle === "bg-grid" ? "bg-grid-thin" : user.backgroundStyle === "bg-noise" ? "bg-noise-light" : user.backgroundStyle);
      if (user.activeBadge) setActiveBadge(user.activeBadge);
    }
  }, [user]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        
        const size = 200;
        canvas.width = size;
        canvas.height = size;
        
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;
        
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
        setProfileImage(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const addLink = () => setLinks([...links, { type: "custom", url: "" }]);
  const updateLink = (index: number, key: string, value: string) => {
    const newLinks =[...links];
    newLinks[index] = { ...newLinks[index], [key]: value };
    setLinks(newLinks);
  };
  const removeLink = (index: number) => setLinks(links.filter((_, i) => i !== index));

  const handleThemeChange = (color: string) => {
    setThemeColor(color);
    if (typeof window !== "undefined") {
      const currentClasses = document.body.className.split(" ").filter(c => !c.startsWith("theme-"));
      document.body.className = [...currentClasses, color].join(" ");
    }
  };

  const handleSave = async () => {
    if (!username || username.length < 3) {
      addNotification({ title: "Error", description: "Username must be at least 3 characters.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          profileImageUrl: profileImage,
          links,
          themeColor,
          usernameFont,
          backgroundStyle,
          activeBadge: activeBadge === "badge-none" ? null : activeBadge,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save profile");

      const meRes = await fetch("/api/auth/me");
      if (meRes.ok) {
        const meData = await meRes.json();
        setUser(meData.user);
      }

      addNotification({
        title: "Profile Saved",
        description: "Your public profile has been updated.",
        variant: "success",
      });
      
      router.push(`/u/${username}`);

    } catch (e: any) {
      addNotification({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto max-w-3xl p-4 md:p-8 space-y-8 animate-in fade-in duration-700 pb-24">
      <div className="flex items-end justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Profile Settings</h1>
          <p className="text-white/50 mt-1">Customize your public FlowState identity</p>
        </div>
        <Button onClick={handleSave} disabled={loading} className="bg-white text-black font-bold hover:bg-white/90">
          {loading ? "Saving..." : "Save & View Profile"}
        </Button>
      </div>

      <div className="space-y-6">
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle>Avatar</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div 
              className="w-40 h-40 rounded-full border-2 border-white/20 bg-black overflow-hidden relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/5">
                  <Camera className="w-12 h-12 text-white/20" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                <Camera className="w-8 h-8 text-white mb-2" />
                <span className="text-xs font-bold uppercase tracking-wider">Change</span>
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/png, image/jpeg, image/webp" 
              className="hidden" 
            />
            <p className="text-xs text-center text-white/50">JPG, PNG or WebP. <br/> Resized to 200x200px square.</p>
          </CardContent>
        </Card>

        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle>Basic Details</CardTitle>
            <CardDescription>Your unique identity on FlowState.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-white/40 font-bold">@</span>
                <Input 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} 
                  placeholder="alanturing"
                  maxLength={20}
                  className="pl-8 bg-black/20 border-white/10 text-lg h-12"
                />
              </div>
              <p className="text-xs text-white/40">Only letters, numbers, and underscores (3-20 chars).</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Social Links</CardTitle>
                <CardDescription>Add links to your public profile.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={addLink} className="border-white/10 hover:bg-white/10 gap-2">
                <Plus className="w-4 h-4" /> Add Link
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {links.map((link, i) => (
              <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-black/20 p-3 rounded-lg border border-white/5">
                <select 
                  value={link.type} 
                  onChange={(e) => updateLink(i, "type", e.target.value)}
                  className="bg-black/40 border border-white/10 text-white text-sm rounded-md h-12 px-3 outline-none focus:border-primary shrink-0 w-full sm:w-auto"
                >
                  <option className="bg-[#030305] text-white" value="github">GitHub</option>
                  <option className="bg-[#030305] text-white" value="linkedin">LinkedIn</option>
                  <option className="bg-[#030305] text-white" value="website">Website</option>
                  <option className="bg-[#030305] text-white" value="custom">Custom</option>
                </select>
                <div className="relative flex-1 w-full sm:w-auto">
                  <div className="absolute left-3 top-3 text-white/40">
                    {link.type === 'github' ? <Github className="w-5 h-5"/> : 
                     link.type === 'linkedin' ? <Linkedin className="w-5 h-5"/> : 
                     <Globe className="w-5 h-5"/>}
                  </div>
                  <Input 
                    value={link.url}
                    onChange={(e) => updateLink(i, "url", e.target.value)}
                    placeholder="https://"
                    className="pl-10 bg-black/40 border-white/10 h-12"
                  />
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeLink(i)} className="text-destructive hover:text-red-400 hover:bg-destructive/20 shrink-0 self-end sm:self-auto h-12 w-12">
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            ))}
            {links.length === 0 && (
              <div className="text-center py-6 text-white/30 border border-dashed border-white/10 rounded-xl">
                <LinkIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No links added yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle>Theme Settings</CardTitle>
            <CardDescription>Personalize your FlowState accent color.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {THEME_OPTIONS.map(theme => {
                const isUnlocked = hasUnlock(theme.id, ['theme-violet']);
                return (
                  <button 
                    key={theme.id}
                    disabled={!isUnlocked}
                    onClick={() => handleThemeChange(theme.id)} 
                    style={{ backgroundColor: theme.color.replace('bg-', '').replace('[', '').replace(']', '') }}
                    className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all ${themeColor === theme.id ? `ring-2 ring-offset-2 ring-offset-[#030305] ring-white scale-110 shadow-[0_0_20px_rgba(255,255,255,0.3)]` : 'shadow-lg shadow-black/50 border border-white/10'} ${!isUnlocked ? 'opacity-30 cursor-not-allowed grayscale' : 'hover:scale-105 hover:border-white/30'}`}
                  >
                    {!isUnlocked && <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full"><Lock className="w-3 h-3 text-white/80" /></div>}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle>Profile Badges</CardTitle>
            <CardDescription>Display an exclusive status symbol next to your name or avatar.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {BADGE_OPTIONS.map(badge => {
                const isUnlocked = hasUnlock(badge.id, ['badge-none']);
                return (
                  <Button 
                    key={badge.id} 
                    variant="outline" 
                    disabled={!isUnlocked}
                    className={`h-auto py-4 flex-col gap-2 border-white/10 transition-all ${activeBadge === badge.id ? 'bg-amber-500/20 text-amber-50 border-amber-500 ring-2 ring-amber-500' : 'glass text-white/70 hover:bg-white/10'}`}
                    onClick={() => setActiveBadge(badge.id)}
                  >
                    {!isUnlocked && <Lock className="absolute top-2 right-2 w-3 h-3 text-white/30" />}
                    <span className="text-2xl">{badge.icon}</span>
                    <span className="text-sm font-medium">{badge.name}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass border-white/10">
          <CardHeader><CardTitle>Typography</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {FONT_OPTIONS.map(font => {
                const isUnlocked = hasUnlock(font.id,['font-inter', 'font-sans']);
                return (
                  <Button 
                    key={font.id} 
                    variant="outline" 
                    disabled={!isUnlocked}
                    className={`h-auto py-4 px-2 text-sm md:text-base whitespace-normal relative ${font.id} ${usernameFont === font.id ? 'border-primary bg-primary/20 text-white hover:bg-primary/20 hover:text-white ring-2 ring-primary shadow-[0_0_15px_rgba(139,92,246,0.3)]' : 'border-white/10 glass text-white/70 hover:bg-white/10 hover:text-white'}`}
                    onClick={() => setUsernameFont(font.id)}
                  >
                    {!isUnlocked && <Lock className="absolute top-2 right-2 w-3 h-3 text-white/30" />}
                    {font.name}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/10">
          <CardHeader><CardTitle>Background Style</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {BG_OPTIONS.map(bg => {
                const isUnlocked = hasUnlock(bg.id,['bg-none']);
                return (
                  <Button 
                    key={bg.id} 
                    variant="outline"
                    disabled={!isUnlocked}
                    className={`group h-24 flex flex-col items-center justify-center p-0 overflow-hidden relative ${backgroundStyle === bg.id ? 'border-primary ring-2 ring-primary text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]' : 'border-white/10 text-white/70 glass hover:bg-white/5'}`}
                    onClick={() => setBackgroundStyle(bg.id)}
                  >
                    {!isUnlocked && (
                      <div className="absolute top-2 right-2 z-20 bg-black/60 p-1.5 rounded-md backdrop-blur-md">
                        <Lock className="w-3 h-3 text-white/80" />
                      </div>
                    )}
                    
                    {/* Fixed robust pure CSS class render */}
                    <div className="absolute inset-0 bg-[#030305]" />
                    <div className={`absolute inset-0 transition-opacity duration-300 ${backgroundStyle === bg.id ? 'opacity-100' : 'opacity-40 group-hover:opacity-70'}`}>
                      <div className={`absolute inset-0 pointer-events-none ${bg.id !== 'bg-none' ? bg.id : ''}`} />
                    </div>
                    
                    <span className="relative z-10 text-xs font-bold bg-black/80 px-3 py-1.5 rounded-md backdrop-blur-md shadow-xl border border-white/5">
                      {bg.name}
                    </span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}