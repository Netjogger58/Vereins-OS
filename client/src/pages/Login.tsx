import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Smartphone, Lock, ArrowLeft, CheckCircle } from "lucide-react";

const DEMO = [
  { label: "Präsident", email: "praesident@mersch75.lu", pw: "demo123" },
  { label: "Trainer (Seniors)", email: "trainer@mersch75.lu", pw: "demo123" },
  { label: "Spieler", email: "spieler@mersch75.lu", pw: "demo123" },
];

const COUNTRY_CODES = [
  { code: "+352", label: "🇱🇺 Luxemburg (+352)" },
  { code: "+49", label: "🇩🇪 Deutschland (+49)" },
  { code: "+33", label: "🇫🇷 Frankreich (+33)" },
  { code: "+32", label: "🇧🇪 Belgien (+32)" },
];

export default function Login() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("password");
  
  // Password login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Magic link state
  const [magicEmail, setMagicEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+352");
  const [magicMethod, setMagicMethod] = useState<"email" | "sms">("email");
  const [magicLoading, setMagicLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      toast({ title: "Anmeldung fehlgeschlagen", description: err?.message?.replace(/^\d+:\s*/, "") || "Bitte erneut versuchen", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const requestMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setMagicLoading(true);
    
    try {
      const body = magicMethod === "email" 
        ? { email: magicEmail, method: "email", action: "login" }
        : { phone, countryCode, method: "sms", action: "login" };
      
      const res = await apiRequest("POST", "/api/auth/magic-link", body);
      const data = await res.json();
      
      if (data.success) {
        setMagicSent(true);
        toast({ 
          title: "Magic Link gesendet!", 
          description: magicMethod === "email" 
            ? `Prüfe deine E-Mails (${magicEmail})` 
            : `SMS wird an ${countryCode} ${phone} gesendet (Mixvoip erforderlich)` 
        });
      } else {
        toast({ title: "Fehler", description: data.message, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Fehler", description: err?.message || "Anfrage fehlgeschlagen", variant: "destructive" });
    } finally {
      setMagicLoading(false);
    }
  };

  const fillDemo = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
    setActiveTab("password");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-[#002F65] to-[#001028] relative overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FFDE00]/[0.04] rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[380px] relative z-10">
        {/* Logo + Title */}
        <div className="flex flex-col items-center mb-8">
          <Logo size={56} />
          <h1 className="mt-5 text-[22px] font-bold tracking-tight text-white">M75 Manager</h1>
          <p className="text-[13px] text-white/50 mt-1">Mersch75 Handball Club</p>
        </div>

        {/* Login Card */}
        <div className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/[0.08]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-5 h-9 rounded-lg bg-muted/60">
              <TabsTrigger value="password" className="text-[12px] rounded-md data-[state=active]:shadow-sm">
                Passwort
              </TabsTrigger>
              <TabsTrigger value="magic" className="text-[12px] rounded-md data-[state=active]:shadow-sm">
                Magic Link
              </TabsTrigger>
            </TabsList>

            {/* Passwort Login */}
            <TabsContent value="password">
              <form onSubmit={onSubmit} className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-[12px] font-medium">E-Mail</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@mersch75.lu"
                    className="h-10 rounded-xl bg-muted/40 border-border/50 text-[13px]"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-[12px] font-medium">Passwort</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="h-10 rounded-xl bg-muted/40 border-border/50 text-[13px]"
                    required
                  />
                </div>
                <Button type="submit" className="w-full h-10 rounded-xl text-[13px] font-semibold mt-1" disabled={loading}>
                  {loading ? "Anmeldung …" : "Anmelden"}
                </Button>
              </form>
            </TabsContent>

            {/* Magic Link Login */}
            <TabsContent value="magic">
              {magicSent ? (
                <div className="text-center py-6 space-y-3">
                  <div className="size-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
                    <CheckCircle className="size-7 text-emerald-500" />
                  </div>
                  <h3 className="text-[15px] font-semibold">Link gesendet!</h3>
                  <p className="text-[12px] text-muted-foreground leading-relaxed max-w-[260px] mx-auto">
                    {magicMethod === "email" 
                      ? `Prüfe deine E-Mails (${magicEmail}) und klicke auf den Link.`
                      : `Eine SMS wurde an ${countryCode} ${phone} gesendet.`
                    }
                  </p>
                  <Button 
                    variant="ghost" 
                    onClick={() => setMagicSent(false)}
                    className="mt-2 text-[12px]"
                  >
                    <ArrowLeft className="size-3.5 mr-1.5" />
                    Zurück
                  </Button>
                </div>
              ) : (
                <form onSubmit={requestMagicLink} className="space-y-3.5">
                  <Tabs value={magicMethod} onValueChange={(v) => setMagicMethod(v as "email" | "sms")} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-3 h-9 rounded-lg bg-muted/60">
                      <TabsTrigger value="email" className="text-[12px] rounded-md data-[state=active]:shadow-sm">
                        E-Mail
                      </TabsTrigger>
                      <TabsTrigger value="sms" className="text-[12px] rounded-md data-[state=active]:shadow-sm">
                        SMS
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="email" className="mt-0">
                      <div className="space-y-1.5">
                        <Label htmlFor="magic-email" className="text-[12px] font-medium">E-Mail Adresse</Label>
                        <Input
                          id="magic-email"
                          type="email"
                          value={magicEmail}
                          onChange={e => setMagicEmail(e.target.value)}
                          placeholder="name@mersch75.lu"
                          className="h-10 rounded-xl bg-muted/40 border-border/50 text-[13px]"
                          required={magicMethod === "email"}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="sms" className="mt-0 space-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-[12px] font-medium">Ländercode</Label>
                        <Select value={countryCode} onValueChange={setCountryCode}>
                          <SelectTrigger className="h-10 rounded-xl bg-muted/40 border-border/50 text-[13px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {COUNTRY_CODES.map(c => (
                              <SelectItem key={c.code} value={c.code}>
                                {c.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="phone" className="text-[12px] font-medium">Telefonnummer</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
                          placeholder="621 123 456"
                          className="h-10 rounded-xl bg-muted/40 border-border/50 text-[13px]"
                          required={magicMethod === "sms"}
                        />
                        <p className="text-[11px] text-muted-foreground">Ohne Ländercode</p>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <Button type="submit" className="w-full h-10 rounded-xl text-[13px] font-semibold" disabled={magicLoading}>
                    {magicLoading ? "Wird gesendet…" : "Link senden"}
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Demo accounts */}
        <div className="mt-6 px-1">
          <p className="text-[10px] uppercase tracking-[0.1em] text-white/30 font-semibold mb-2.5 text-center">
            Demo-Zugänge
          </p>
          <div className="grid gap-1.5">
            {DEMO.map(d => (
              <button
                key={d.email}
                onClick={() => fillDemo(d.email, d.pw)}
                className="text-left w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.06] transition-all text-[12px] group"
              >
                <div className="font-medium text-white/80 group-hover:text-white">{d.label}</div>
                <div className="text-white/30 text-[11px]">{d.email}</div>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-[11px] text-white/25 mt-6">
          © {new Date().getFullYear()} Mersch75 Handball · Luxembourg
        </p>
      </div>
    </div>
  );
}
