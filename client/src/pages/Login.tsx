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
import { Mail, Smartphone, Lock, ArrowLeft, CheckCircle, CreditCard, ShieldCheck, UserCircle2, KeyRound, User } from "lucide-react";

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
  const { login, cardLogin, adminLogin, verifyTwoFactor, identifyMember, registerOtp, registerComplete, pinLogin, pinResetRequest, pinResetComplete } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("card");
  
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

  // Card-ID (card) login state
  const [cardId, setCardId] = useState("");
  const [cardLoading, setCardLoading] = useState(false);
  const [identity, setIdentity] = useState<{ name: string; clubFunction?: string; teamCategory?: string | null } | null>(null);

  // PIN registration/login state
  const [pinStep, setPinStep] = useState<"identify" | "otp" | "setPin" | "login" | "resetIdentify" | "resetOtp" | "resetPin">("identify");
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regBirthdate, setRegBirthdate] = useState("");
  const [regMemberId, setRegMemberId] = useState<number | null>(null);
  const [regMemberName, setRegMemberName] = useState("");
  const [regOtpMethod, setRegOtpMethod] = useState<"sms" | "email">("sms");
  const [regOtpMasked, setRegOtpMasked] = useState("");
  const [regOtpCode, setRegOtpCode] = useState("");
  const [regPin, setRegPin] = useState("");
  const [regPinConfirm, setRegPinConfirm] = useState("");
  const [pinLoading, setPinLoading] = useState(false);
  const [loginPin, setLoginPin] = useState("");

  // Admin login (logo ball)
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPw, setAdminPw] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);

  // 2FA state
  const [twoFa, setTwoFa] = useState<{ challenge: string; maskedEmail: string } | null>(null);
  const [twoFaCode, setTwoFaCode] = useState("");
  const [twoFaTrust, setTwoFaTrust] = useState(true);
  const [twoFaLoading, setTwoFaLoading] = useState(false);

  const handleMaybeTwoFa = (r: unknown): boolean => {
    if (r && typeof r === "object" && (r as any).twoFactorRequired) {
      setTwoFa({ challenge: (r as any).challenge, maskedEmail: (r as any).maskedEmail });
      setTwoFaCode("");
      setAdminOpen(false);
      return true;
    }
    return false;
  };

  const onTwoFaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFa) return;
    setTwoFaLoading(true);
    try {
      await verifyTwoFactor(twoFa.challenge, twoFaCode.trim(), twoFaTrust);
    } catch (err: any) {
      toast({ title: "Bestätigung fehlgeschlagen", description: err?.message?.replace(/^\d+:\s*/, "") || "Falscher Code", variant: "destructive" });
    } finally {
      setTwoFaLoading(false);
    }
  };

  const identifyCard = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = cardId.trim();
    if (!id) return;
    setCardLoading(true);
    try {
      const res = await apiRequest("POST", "/api/auth/identify-card", { cardId: id });
      const data = await res.json();
      if (!data.found) {
        setIdentity(null);
        toast({ title: "Nicht gefunden", description: "Diese Card-ID ist unbekannt.", variant: "destructive" });
        return;
      }
      setIdentity({ name: data.name, clubFunction: data.clubFunction, teamCategory: data.teamCategory });
    } catch (err: any) {
      toast({ title: "Fehler", description: err?.message?.replace(/^\d+:\s*/, "") || "Bitte erneut versuchen", variant: "destructive" });
    } finally {
      setCardLoading(false);
    }
  };

  const confirmCardLogin = async () => {
    setCardLoading(true);
    try {
      const r = await cardLogin(cardId.trim());
      handleMaybeTwoFa(r);
    } catch (err: any) {
      toast({ title: "Anmeldung fehlgeschlagen", description: err?.message?.replace(/^\d+:\s*/, "") || "Bitte erneut versuchen", variant: "destructive" });
    } finally {
      setCardLoading(false);
    }
  };

  const onAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoading(true);
    try {
      const r = await adminLogin(adminEmail, adminPw);
      handleMaybeTwoFa(r);
    } catch (err: any) {
      toast({ title: "Admin-Login fehlgeschlagen", description: err?.message?.replace(/^\d+:\s*/, "") || "Ungültige Anmeldedaten", variant: "destructive" });
    } finally {
      setAdminLoading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await login(email, password);
      handleMaybeTwoFa(r);
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

  // ─── PIN Handlers ───────────────────────────────────────
  const resetPinState = () => {
    setPinStep("identify");
    setRegFirstName("");
    setRegLastName("");
    setRegBirthdate("");
    setRegMemberId(null);
    setRegMemberName("");
    setRegOtpCode("");
    setRegPin("");
    setRegPinConfirm("");
    setLoginPin("");
  };

  const onIdentifyMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFirstName.trim() || !regLastName.trim() || !regBirthdate) return;
    setPinLoading(true);
    try {
      const data = await identifyMember(regFirstName.trim(), regLastName.trim(), regBirthdate);
      if (!data.found) {
        toast({ title: "Nicht gefunden", description: data.reason === "inactive" ? "Mitglied ist nicht mehr aktiv." : "Kein Mitglied mit diesen Daten gefunden.", variant: "destructive" });
        return;
      }
      setRegMemberId(data.memberId!);
      setRegMemberName(data.name!);
      setPinStep("otp");
    } catch (err: any) {
      toast({ title: "Fehler", description: err?.message?.replace(/^\d+:\s*/, "") || "Bitte erneut versuchen", variant: "destructive" });
    } finally {
      setPinLoading(false);
    }
  };

  const onRegisterOtp = async () => {
    if (!regMemberId) return;
    setPinLoading(true);
    try {
      const data = await registerOtp(regMemberId, countryCode);
      setRegOtpMethod(data.method as "sms" | "email");
      setRegOtpMasked(data.masked);
      if (data.fallback) {
        toast({ title: "Dev-Modus", description: "Code wurde in der Console ausgegeben (kein SMS Provider konfiguriert).", variant: "default" });
      } else {
        toast({ title: "Code gesendet", description: `Code an ${data.masked} gesendet.` });
      }
    } catch (err: any) {
      toast({ title: "Fehler", description: err?.message?.replace(/^\d+:\s*/, "") || "Code konnte nicht gesendet werden", variant: "destructive" });
    } finally {
      setPinLoading(false);
    }
  };

  const onRegisterComplete = async () => {
    if (!regMemberId || !regOtpCode.trim() || !regPin) return;
    if (regPin !== regPinConfirm) {
      toast({ title: "Fehler", description: "PINs stimmen nicht überein", variant: "destructive" });
      return;
    }
    if (!/^\d{6}$/.test(regPin)) {
      toast({ title: "Fehler", description: "PIN muss genau 6 Ziffern haben", variant: "destructive" });
      return;
    }
    setPinLoading(true);
    try {
      const r = await registerComplete(regMemberId, regOtpCode.trim(), regPin, regOtpMethod, countryCode);
      handleMaybeTwoFa(r);
    } catch (err: any) {
      toast({ title: "Registrierung fehlgeschlagen", description: err?.message?.replace(/^\d+:\s*/, "") || "Bitte erneut versuchen", variant: "destructive" });
    } finally {
      setPinLoading(false);
    }
  };

  const onPinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFirstName.trim() || !regLastName.trim() || !regBirthdate || !loginPin) return;
    setPinLoading(true);
    try {
      const r = await pinLogin(regFirstName.trim(), regLastName.trim(), regBirthdate, loginPin);
      handleMaybeTwoFa(r);
    } catch (err: any) {
      toast({ title: "Anmeldung fehlgeschlagen", description: err?.message?.replace(/^\d+:\s*/, "") || "Falscher PIN oder Mitglied nicht gefunden", variant: "destructive" });
    } finally {
      setPinLoading(false);
    }
  };

  const onPinResetRequest = async () => {
    if (!regFirstName.trim() || !regLastName.trim() || !regBirthdate) return;
    setPinLoading(true);
    try {
      const data = await pinResetRequest(regFirstName.trim(), regLastName.trim(), regBirthdate, countryCode);
      setRegMemberId(data.memberId);
      setRegOtpMethod(data.method as "sms" | "email");
      setRegOtpMasked(data.masked);
      setPinStep("resetOtp");
      if (data.fallback) {
        toast({ title: "Dev-Modus", description: "Code wurde in der Console ausgegeben.", variant: "default" });
      } else {
        toast({ title: "Code gesendet", description: `Code an ${data.masked} gesendet.` });
      }
    } catch (err: any) {
      toast({ title: "Fehler", description: err?.message?.replace(/^\d+:\s*/, "") || "Bitte erneut versuchen", variant: "destructive" });
    } finally {
      setPinLoading(false);
    }
  };

  const onPinResetComplete = async () => {
    if (!regMemberId || !regOtpCode.trim() || !regPin) return;
    if (regPin !== regPinConfirm) {
      toast({ title: "Fehler", description: "PINs stimmen nicht überein", variant: "destructive" });
      return;
    }
    if (!/^\d{6}$/.test(regPin)) {
      toast({ title: "Fehler", description: "PIN muss genau 6 Ziffern haben", variant: "destructive" });
      return;
    }
    setPinLoading(true);
    try {
      const r = await pinResetComplete(regMemberId, regOtpCode.trim(), regPin, regOtpMethod, countryCode);
      handleMaybeTwoFa(r);
    } catch (err: any) {
      toast({ title: "Reset fehlgeschlagen", description: err?.message?.replace(/^\d+:\s*/, "") || "Bitte erneut versuchen", variant: "destructive" });
    } finally {
      setPinLoading(false);
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
          <div className="relative" style={{ width: 56, height: 56 }}>
            <Logo size={56} />
            {/* Versteckter Admin-Zugang: der Handball-Punkt im Logo */}
            <button
              type="button"
              aria-label="Admin"
              title="Admin"
              onClick={() => setAdminOpen(true)}
              className="absolute rounded-full hover:ring-2 hover:ring-[#FFDE00]/60 transition"
              style={{ width: 14, height: 14, right: 4, bottom: 9 }}
            />
          </div>
          <h1 className="mt-5 text-[22px] font-bold tracking-tight text-white">M75 Manager</h1>
          <p className="text-[13px] text-white/50 mt-1">Mersch75 Handball Club</p>
        </div>

        {/* Login Card */}
        <div className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/[0.08]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-5 h-9 rounded-lg bg-muted/60">
              <TabsTrigger value="card" className="text-[11px] rounded-md data-[state=active]:shadow-sm">
                Card-ID
              </TabsTrigger>
              <TabsTrigger value="pin" className="text-[11px] rounded-md data-[state=active]:shadow-sm">
                PIN
              </TabsTrigger>
              <TabsTrigger value="password" className="text-[11px] rounded-md data-[state=active]:shadow-sm">
                Passwort
              </TabsTrigger>
              <TabsTrigger value="magic" className="text-[11px] rounded-md data-[state=active]:shadow-sm">
                Magic
              </TabsTrigger>
            </TabsList>

            {/* Card-ID Login */}
            <TabsContent value="card">
              {identity ? (
                <div className="space-y-4">
                  <div className="flex flex-col items-center text-center py-2">
                    <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      <UserCircle2 className="size-8 text-primary" />
                    </div>
                    <div className="text-[16px] font-semibold">{identity.name}</div>
                    <div className="text-[12px] text-muted-foreground mt-0.5">
                      {identity.clubFunction || "Mitglied"}
                      {identity.teamCategory ? ` · ${identity.teamCategory}` : ""}
                    </div>
                  </div>
                  <Button onClick={confirmCardLogin} className="w-full h-10 rounded-xl text-[13px] font-semibold" disabled={cardLoading}>
                    {cardLoading ? "Anmeldung …" : `Als ${identity.name.split(" ")[0]} anmelden`}
                  </Button>
                  <Button variant="ghost" onClick={() => { setIdentity(null); setCardId(""); }} className="w-full text-[12px]">
                    <ArrowLeft className="size-3.5 mr-1.5" /> Andere Card-ID
                  </Button>
                </div>
              ) : (
                <form onSubmit={identifyCard} className="space-y-3.5">
                  <div className="space-y-1.5">
                    <Label htmlFor="cardId" className="text-[12px] font-medium flex items-center gap-1.5">
                      <CreditCard className="size-3.5" /> Card-ID (Mitgliedskarte)
                    </Label>
                    <Input
                      id="cardId"
                      value={cardId}
                      onChange={e => setCardId(e.target.value.toUpperCase())}
                      placeholder="z.B. ABCDEFG4"
                      autoComplete="off"
                      className="h-10 rounded-xl bg-muted/40 border-border/50 text-[13px] tracking-widest font-mono"
                      required
                    />
                    <p className="text-[11px] text-muted-foreground">Die 8-stellige Nummer auf deiner Mitgliedskarte.</p>
                  </div>
                  <Button type="submit" className="w-full h-10 rounded-xl text-[13px] font-semibold" disabled={cardLoading}>
                    {cardLoading ? "Prüfen …" : "Weiter"}
                  </Button>
                </form>
              )}
            </TabsContent>

            {/* PIN Login / Registration */}
            <TabsContent value="pin">
              {/* Sub-tabs: Login vs Registrieren */}
              <Tabs value={pinStep === "identify" || pinStep === "otp" || pinStep === "setPin" ? "register" : "login"} onValueChange={(v) => { resetPinState(); setPinStep(v === "login" ? "login" : "identify"); }} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4 h-8 rounded-lg bg-muted/60">
                  <TabsTrigger value="login" className="text-[11px] rounded-md data-[state=active]:shadow-sm">
                    Einloggen
                  </TabsTrigger>
                  <TabsTrigger value="register" className="text-[11px] rounded-md data-[state=active]:shadow-sm">
                    Registrieren
                  </TabsTrigger>
                </TabsList>

                {/* PIN Login */}
                <TabsContent value="login" className="mt-0">
                  <form onSubmit={onPinLogin} className="space-y-3.5">
                    <div className="space-y-1.5">
                      <Label htmlFor="pin-firstName" className="text-[12px] font-medium flex items-center gap-1.5">
                        <User className="size-3.5" /> Vorname
                      </Label>
                      <Input id="pin-firstName" value={regFirstName} onChange={e => setRegFirstName(e.target.value)} placeholder="Max" className="h-10 rounded-xl bg-muted/40 border-border/50 text-[13px]" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="pin-lastName" className="text-[12px] font-medium">Nachname</Label>
                      <Input id="pin-lastName" value={regLastName} onChange={e => setRegLastName(e.target.value)} placeholder="Mustermann" className="h-10 rounded-xl bg-muted/40 border-border/50 text-[13px]" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="pin-birthdate" className="text-[12px] font-medium">Geburtsdatum</Label>
                      <Input id="pin-birthdate" type="date" value={regBirthdate} onChange={e => setRegBirthdate(e.target.value)} className="h-10 rounded-xl bg-muted/40 border-border/50 text-[13px]" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="login-pin" className="text-[12px] font-medium flex items-center gap-1.5">
                        <KeyRound className="size-3.5" /> PIN (6 Ziffern)
                      </Label>
                      <Input id="login-pin" inputMode="numeric" maxLength={6} value={loginPin} onChange={e => setLoginPin(e.target.value.replace(/\D/g, ""))} placeholder="000000" className="h-10 rounded-xl bg-muted/40 border-border/50 text-[13px] text-center tracking-[4px] font-mono" required />
                    </div>
                    <Button type="submit" className="w-full h-10 rounded-xl text-[13px] font-semibold" disabled={pinLoading}>
                      {pinLoading ? "Anmeldung …" : "Anmelden"}
                    </Button>
                    <button type="button" onClick={() => { resetPinState(); setPinStep("resetIdentify"); }} className="w-full text-[11px] text-muted-foreground hover:text-foreground transition">
                      PIN vergessen?
                    </button>
                  </form>
                </TabsContent>

                {/* PIN Registrierung */}
                <TabsContent value="register" className="mt-0">
                  {pinStep === "identify" && (
                    <form onSubmit={onIdentifyMember} className="space-y-3.5">
                      <div className="space-y-1.5">
                        <Label htmlFor="reg-firstName" className="text-[12px] font-medium flex items-center gap-1.5">
                          <User className="size-3.5" /> Vorname
                        </Label>
                        <Input id="reg-firstName" value={regFirstName} onChange={e => setRegFirstName(e.target.value)} placeholder="Max" className="h-10 rounded-xl bg-muted/40 border-border/50 text-[13px]" required />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="reg-lastName" className="text-[12px] font-medium">Nachname</Label>
                        <Input id="reg-lastName" value={regLastName} onChange={e => setRegLastName(e.target.value)} placeholder="Mustermann" className="h-10 rounded-xl bg-muted/40 border-border/50 text-[13px]" required />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="reg-birthdate" className="text-[12px] font-medium">Geburtsdatum</Label>
                        <Input id="reg-birthdate" type="date" value={regBirthdate} onChange={e => setRegBirthdate(e.target.value)} className="h-10 rounded-xl bg-muted/40 border-border/50 text-[13px]" required />
                      </div>
                      <Button type="submit" className="w-full h-10 rounded-xl text-[13px] font-semibold" disabled={pinLoading}>
                        {pinLoading ? "Prüfen …" : "Identifizieren"}
                      </Button>
                    </form>
                  )}

                  {pinStep === "otp" && (
                    <div className="space-y-4">
                      <div className="flex flex-col items-center text-center py-2">
                        <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                          <UserCircle2 className="size-8 text-primary" />
                        </div>
                        <div className="text-[16px] font-semibold">{regMemberName}</div>
                        <p className="text-[12px] text-muted-foreground mt-1">Bestätige deine Identität mit einem Code.</p>
                      </div>
                      <Button onClick={onRegisterOtp} className="w-full h-10 rounded-xl text-[13px] font-semibold" disabled={pinLoading}>
                        {pinLoading ? "Wird gesendet …" : "Code senden"}
                      </Button>
                      {regOtpMasked && (
                        <div className="space-y-3">
                          <p className="text-[11px] text-muted-foreground text-center">Code wurde gesendet an: {regOtpMasked}</p>
                          <div className="space-y-1.5">
                            <Label htmlFor="reg-otp" className="text-[12px] font-medium">Bestätigungscode</Label>
                            <Input id="reg-otp" inputMode="numeric" maxLength={6} value={regOtpCode} onChange={e => setRegOtpCode(e.target.value.replace(/\D/g, ""))} placeholder="000000" className="h-12 rounded-xl bg-muted/40 border-border/50 text-center text-[20px] tracking-[8px] font-mono" />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="reg-pin" className="text-[12px] font-medium flex items-center gap-1.5">
                              <KeyRound className="size-3.5" /> Neuer PIN (6 Ziffern)
                            </Label>
                            <Input id="reg-pin" inputMode="numeric" maxLength={6} value={regPin} onChange={e => setRegPin(e.target.value.replace(/\D/g, ""))} placeholder="000000" className="h-10 rounded-xl bg-muted/40 border-border/50 text-[13px] text-center tracking-[4px] font-mono" />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="reg-pin-confirm" className="text-[12px] font-medium">PIN bestätigen</Label>
                            <Input id="reg-pin-confirm" inputMode="numeric" maxLength={6} value={regPinConfirm} onChange={e => setRegPinConfirm(e.target.value.replace(/\D/g, ""))} placeholder="000000" className="h-10 rounded-xl bg-muted/40 border-border/50 text-[13px] text-center tracking-[4px] font-mono" />
                          </div>
                          <Button onClick={onRegisterComplete} className="w-full h-10 rounded-xl text-[13px] font-semibold" disabled={pinLoading || regOtpCode.length !== 6 || regPin.length !== 6}>
                            {pinLoading ? "Registrierung …" : "Registrieren & Anmelden"}
                          </Button>
                        </div>
                      )}
                      <Button variant="ghost" onClick={() => setPinStep("identify")} className="w-full text-[12px]">
                        <ArrowLeft className="size-3.5 mr-1.5" /> Zurück
                      </Button>
                    </div>
                  )}

                  {/* PIN Reset Flow */}
                  {pinStep === "resetIdentify" && (
                    <form onSubmit={(e) => { e.preventDefault(); onPinResetRequest(); }} className="space-y-3.5">
                      <div className="text-center mb-2">
                        <KeyRound className="size-8 text-primary mx-auto mb-2" />
                        <h3 className="text-[15px] font-semibold">PIN zurücksetzen</h3>
                        <p className="text-[12px] text-muted-foreground mt-1">Gib deine Daten ein, um einen Code zu erhalten.</p>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[12px] font-medium">Vorname</Label>
                        <Input value={regFirstName} onChange={e => setRegFirstName(e.target.value)} placeholder="Max" className="h-10 rounded-xl bg-muted/40 border-border/50 text-[13px]" required />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[12px] font-medium">Nachname</Label>
                        <Input value={regLastName} onChange={e => setRegLastName(e.target.value)} placeholder="Mustermann" className="h-10 rounded-xl bg-muted/40 border-border/50 text-[13px]" required />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[12px] font-medium">Geburtsdatum</Label>
                        <Input type="date" value={regBirthdate} onChange={e => setRegBirthdate(e.target.value)} className="h-10 rounded-xl bg-muted/40 border-border/50 text-[13px]" required />
                      </div>
                      <Button type="submit" className="w-full h-10 rounded-xl text-[13px] font-semibold" disabled={pinLoading}>
                        {pinLoading ? "Wird gesendet …" : "Code senden"}
                      </Button>
                      <Button variant="ghost" onClick={() => { resetPinState(); setPinStep("login"); }} className="w-full text-[12px]">
                        <ArrowLeft className="size-3.5 mr-1.5" /> Zurück zum Login
                      </Button>
                    </form>
                  )}

                  {pinStep === "resetOtp" && (
                    <div className="space-y-4">
                      <p className="text-[11px] text-muted-foreground text-center">Code gesendet an: {regOtpMasked}</p>
                      <div className="space-y-1.5">
                        <Label htmlFor="reset-otp" className="text-[12px] font-medium">Bestätigungscode</Label>
                        <Input id="reset-otp" inputMode="numeric" maxLength={6} value={regOtpCode} onChange={e => setRegOtpCode(e.target.value.replace(/\D/g, ""))} placeholder="000000" className="h-12 rounded-xl bg-muted/40 border-border/50 text-center text-[20px] tracking-[8px] font-mono" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="reset-pin" className="text-[12px] font-medium flex items-center gap-1.5">
                          <KeyRound className="size-3.5" /> Neuer PIN (6 Ziffern)
                        </Label>
                        <Input id="reset-pin" inputMode="numeric" maxLength={6} value={regPin} onChange={e => setRegPin(e.target.value.replace(/\D/g, ""))} placeholder="000000" className="h-10 rounded-xl bg-muted/40 border-border/50 text-[13px] text-center tracking-[4px] font-mono" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="reset-pin-confirm" className="text-[12px] font-medium">PIN bestätigen</Label>
                        <Input id="reset-pin-confirm" inputMode="numeric" maxLength={6} value={regPinConfirm} onChange={e => setRegPinConfirm(e.target.value.replace(/\D/g, ""))} placeholder="000000" className="h-10 rounded-xl bg-muted/40 border-border/50 text-[13px] text-center tracking-[4px] font-mono" />
                      </div>
                      <Button onClick={onPinResetComplete} className="w-full h-10 rounded-xl text-[13px] font-semibold" disabled={pinLoading || regOtpCode.length !== 6 || regPin.length !== 6}>
                        {pinLoading ? "Wird gesetzt …" : "PIN zurücksetzen & Anmelden"}
                      </Button>
                      <Button variant="ghost" onClick={() => { resetPinState(); setPinStep("login"); }} className="w-full text-[12px]">
                        <ArrowLeft className="size-3.5 mr-1.5" /> Abbrechen
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </TabsContent>

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

        {/* 2FA Code-Eingabe Overlay */}
        {twoFa && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-[340px] bg-card rounded-2xl shadow-2xl p-6 border border-white/[0.08]">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="size-5 text-primary" />
                <h3 className="text-[15px] font-semibold">Bestätigungscode</h3>
              </div>
              <p className="text-[12px] text-muted-foreground mb-4">
                Ein 6-stelliger Code wurde gesendet an: <span className="font-medium">{twoFa.maskedEmail}</span>
              </p>
              <form onSubmit={onTwoFaSubmit} className="space-y-3.5">
                <Input
                  autoFocus
                  inputMode="numeric"
                  maxLength={6}
                  value={twoFaCode}
                  onChange={e => setTwoFaCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="h-12 rounded-xl bg-muted/40 border-border/50 text-center text-[20px] tracking-[8px] font-mono"
                  required
                />
                <label className="flex items-center gap-2 text-[12px] text-muted-foreground cursor-pointer">
                  <input type="checkbox" checked={twoFaTrust} onChange={e => setTwoFaTrust(e.target.checked)} className="rounded" />
                  Diesem Gerät 30 Tage vertrauen
                </label>
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" onClick={() => setTwoFa(null)} className="flex-1 h-10 rounded-xl text-[13px]">Abbrechen</Button>
                  <Button type="submit" className="flex-1 h-10 rounded-xl text-[13px] font-semibold" disabled={twoFaLoading || twoFaCode.length !== 6}>
                    {twoFaLoading ? "Prüfen …" : "Bestätigen"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Admin-Login Overlay (über den Logo-Punkt) */}
        {adminOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setAdminOpen(false)}>
            <div className="w-full max-w-[340px] bg-card rounded-2xl shadow-2xl p-6 border border-white/[0.08]" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="size-5 text-primary" />
                <h3 className="text-[15px] font-semibold">Admin-Anmeldung</h3>
              </div>
              <form onSubmit={onAdminSubmit} className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="adminEmail" className="text-[12px] font-medium">E-Mail</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    autoFocus
                    value={adminEmail}
                    onChange={e => setAdminEmail(e.target.value)}
                    className="h-10 rounded-xl bg-muted/40 border-border/50 text-[13px]"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="adminPw" className="text-[12px] font-medium">Passwort</Label>
                  <Input
                    id="adminPw"
                    type="password"
                    value={adminPw}
                    onChange={e => setAdminPw(e.target.value)}
                    className="h-10 rounded-xl bg-muted/40 border-border/50 text-[13px]"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" onClick={() => setAdminOpen(false)} className="flex-1 h-10 rounded-xl text-[13px]">Abbrechen</Button>
                  <Button type="submit" className="flex-1 h-10 rounded-xl text-[13px] font-semibold" disabled={adminLoading}>
                    {adminLoading ? "…" : "Anmelden"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

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
