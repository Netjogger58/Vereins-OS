import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Upload, Lock, User as UserIcon, Bell, LogOut, Sun, Moon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { initials } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

async function downscaleImage(file: File, max = 400): Promise<string> {
  const dataUrl = await new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.src = dataUrl;
  });
}

export default function Profile() {
  const { user, logout, setUser } = useAuth();
  const { toast } = useToast();
  const { theme, toggle } = useTheme();
  const fileInput = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(user?.name || "");
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [notif, setNotif] = useState({ email: true, push: true, announcements: true });

  if (!user) return null;

  const saveProfile = useMutation({
    mutationFn: async (data: any) => (await apiRequest("PATCH", "/api/auth/profile", data)).json(),
    onSuccess: (u) => {
      setUser(u);
      toast({ title: "Profil aktualisiert" });
    },
  });

  const changePw = useMutation({
    mutationFn: async (data: any) => (await apiRequest("PATCH", "/api/auth/password", data)).json(),
    onSuccess: () => {
      setPw({ current: "", next: "", confirm: "" });
      toast({ title: "Passwort geändert" });
    },
    onError: (err: any) => {
      toast({
        title: "Fehler",
        description: err.message?.replace(/^\d+:\s*/, ""),
        variant: "destructive",
      });
    },
  });

  const onUploadPhoto = async (f: File) => {
    const dataUrl = await downscaleImage(f);
    saveProfile.mutate({ photoUrl: dataUrl });
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight">Profil</h1>
        <p className="text-sm text-muted-foreground">Persönliche Einstellungen</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="relative">
              <Avatar className="size-24 ring-4 ring-secondary/30">
                <AvatarImage src={user.photoUrl || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
              <input
                ref={fileInput}
                type="file"
                hidden
                accept="image/*"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) onUploadPhoto(f);
                }}
              />
              <Button
                size="sm"
                variant="secondary"
                onClick={() => fileInput.current?.click()}
                className="absolute -bottom-2 -right-2 h-8 px-2"
              >
                <Upload className="size-3.5" />
              </Button>
            </div>
            <div className="flex-1 space-y-3 w-full">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">{user.name}</h2>
                <Badge className="bg-primary text-primary-foreground text-[10px] uppercase tracking-wider">
                  {user.role}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="space-y-1.5">
                <Label className="text-xs">Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} />
              </div>
              <Button
                size="sm"
                onClick={() => saveProfile.mutate({ name })}
                disabled={name === user.name || saveProfile.isPending}
              >
                Speichern
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Lock className="size-4" />Passwort ändern</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Aktuelles Passwort</Label>
            <Input type="password" value={pw.current} onChange={e => setPw(p => ({ ...p, current: e.target.value }))} />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Neues Passwort</Label>
              <Input type="password" value={pw.next} onChange={e => setPw(p => ({ ...p, next: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Bestätigen</Label>
              <Input type="password" value={pw.confirm} onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))} />
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => {
              if (pw.next !== pw.confirm) return toast({ title: "Passwörter stimmen nicht überein", variant: "destructive" });
              changePw.mutate({ current: pw.current, next: pw.next });
            }}
            disabled={!pw.current || !pw.next || pw.next.length < 4}
          >
            Passwort ändern
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bell className="size-4" />Benachrichtigungen</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[
            { key: "email", label: "E-Mail-Benachrichtigungen" },
            { key: "push", label: "Push-Benachrichtigungen" },
            { key: "announcements", label: "Neue Ankündigungen" },
          ].map(opt => (
            <div key={opt.key} className="flex items-center justify-between py-1.5">
              <Label htmlFor={opt.key} className="cursor-pointer text-sm">{opt.label}</Label>
              <Switch
                id={opt.key}
                checked={(notif as any)[opt.key]}
                onCheckedChange={v => setNotif(n => ({ ...n, [opt.key]: v }))}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-2">
          <Button variant="outline" onClick={toggle} className="w-full justify-start">
            {theme === "dark" ? <Sun className="size-4 mr-2" /> : <Moon className="size-4 mr-2" />}
            Theme: {theme === "dark" ? "Dunkel" : "Hell"}
          </Button>
          <Button variant="outline" onClick={logout} className="w-full justify-start text-destructive hover:text-destructive">
            <LogOut className="size-4 mr-2" /> Abmelden
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
