"use client";

import { useState, useRef, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNotificationStore } from "@/store/useNotificationStore";
import { Camera, Plus, Trash2, Link as LinkIcon, Github, Linkedin, Globe } from "lucide-react";

export default function SettingsPage() {
  const { user, setUser } = useStore();
  const { addNotification } = useNotificationStore();
  
  const [username, setUsername] = useState(user?.username || "");
  const [profileImage, setProfileImage] = useState(user?.profileImageUrl || "");
  const [links, setLinks] = useState<{ type: string; url: string }[]>(user?.links || []);
  const [themeColor, setThemeColor] = useState(user?.themeColor || "theme-violet");
  const [loading, setLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      if (user.username) setUsername(user.username);
      if (user.profileImageUrl) setProfileImage(user.profileImageUrl);
      if (user.links) setLinks(user.links);
      if (user.themeColor) setThemeColor(user.themeColor);
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
        
        // crop to center square
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

  const addLink = () => {
    setLinks([...links, { type: "custom", url: "" }]);
  };

  const updateLink = (index: number, key: string, value: string) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [key]: value };
    setLinks(newLinks);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleThemeChange = (color: string) => {
    setThemeColor(color);
    if (typeof window !== "undefined") {
      const currentClasses = document.body.className.split(" ").filter(c => !c.startsWith("theme-"));
      document.body.className = [...currentClasses, color].join(" ");
    }
  };

  const handleSave = async () => {
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
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save profile");

      // Refetch user to get the full updated object
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
    } catch (e: any) {
      addNotification({
        title: "Error",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8 space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Profile Settings</h1>
          <p className="text-white/50 mt-1">Customize your public FlowState identity</p>
        </div>
        <Button onClick={handleSave} disabled={loading} className="bg-white text-black font-bold hover:bg-white/90">
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
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
        </div>

        <div className="md:col-span-2 space-y-6">
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
                <div key={i} className="flex items-center gap-3">
                  <select 
                    value={link.type} 
                    onChange={(e) => updateLink(i, "type", e.target.value)}
                    className="bg-black/40 border border-white/10 text-white text-sm rounded-md h-12 px-3 outline-none focus:border-primary shrink-0"
                  >
                    <option className="bg-[#030305] text-white" value="github">GitHub</option>
                    <option className="bg-[#030305] text-white" value="linkedin">LinkedIn</option>
                    <option className="bg-[#030305] text-white" value="website">Website</option>
                    <option className="bg-[#030305] text-white" value="custom">Custom</option>
                  </select>
                  <div className="relative flex-1">
                    <div className="absolute left-3 top-3 text-white/40">
                      {link.type === 'github' ? <Github className="w-5 h-5"/> : 
                       link.type === 'linkedin' ? <Linkedin className="w-5 h-5"/> : 
                       <Globe className="w-5 h-5"/>}
                    </div>
                    <Input 
                      value={link.url}
                      onChange={(e) => updateLink(i, "url", e.target.value)}
                      placeholder="https://"
                      className="pl-10 bg-black/20 border-white/10 h-12"
                    />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeLink(i)} className="text-destructive hover:text-red-400 hover:bg-destructive/20 shrink-0">
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
              <div className="flex gap-4">
                <button 
                  onClick={() => handleThemeChange('theme-violet')}
                  className={`w-12 h-12 rounded-full bg-violet-500 hover:scale-110 transition-transform ${themeColor === 'theme-violet' ? 'ring-4 ring-white shadow-[0_0_15px_rgba(139,92,246,0.8)]' : 'shadow-lg shadow-black'}`} 
                />
                <button 
                  onClick={() => handleThemeChange('theme-blue')}
                  className={`w-12 h-12 rounded-full bg-blue-500 hover:scale-110 transition-transform ${themeColor === 'theme-blue' ? 'ring-4 ring-white shadow-[0_0_15px_rgba(59,130,246,0.8)]' : 'shadow-lg shadow-black'}`} 
                />
                <button 
                  onClick={() => handleThemeChange('theme-green')}
                  className={`w-12 h-12 rounded-full bg-emerald-500 hover:scale-110 transition-transform ${themeColor === 'theme-green' ? 'ring-4 ring-white shadow-[0_0_15px_rgba(16,185,129,0.8)]' : 'shadow-lg shadow-black'}`} 
                />
                <button 
                  onClick={() => handleThemeChange('theme-orange')}
                  className={`w-12 h-12 rounded-full bg-orange-500 hover:scale-110 transition-transform ${themeColor === 'theme-orange' ? 'ring-4 ring-white shadow-[0_0_15px_rgba(249,115,22,0.8)]' : 'shadow-lg shadow-black'}`} 
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
