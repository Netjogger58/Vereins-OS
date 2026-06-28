import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import jsQR from "jsqr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Camera, CameraOff, ScanLine, QrCode, CheckCircle2, XCircle,
  AlertTriangle, CopyCheck, Download, IdCard, Users as UsersIcon,
} from "lucide-react";
import { apiRequest, queryClient, getAuthToken } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Event } from "@shared/schema";

const API_BASE = "__PORT_5000__".startsWith("__") ? "" : "__PORT_5000__";

type ScanStatus = "valid" | "duplicate" | "unknown" | "blocked" | "expired" | "invalid";

interface ScanResult {
  status: ScanStatus;
  message: string;
  name?: string | null;
  cardNumber?: string | null;
  at: number;
}

interface MemberCard {
  id: number;
  userId: number;
  cardNumber: string;
  cardNumberDisplay?: string;
  qrCodeData: string;
  validFrom: string;
  validUntil: string | null;
  active: boolean;
  userName?: string | null;
  userRole?: string | null;
  userEmail?: string | null;
}

interface AppUser {
  id: number;
  name: string;
  email?: string | null;
  role: string;
}

const STATUS_META: Record<ScanStatus, { label: string; icon: typeof CheckCircle2; cls: string }> = {
  valid:     { label: "Gültig",        icon: CheckCircle2,  cls: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" },
  duplicate: { label: "Bereits da",    icon: CopyCheck,     cls: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
  blocked:   { label: "Gesperrt",      icon: XCircle,       cls: "bg-red-500/15 text-red-600 border-red-500/30" },
  expired:   { label: "Abgelaufen",    icon: AlertTriangle, cls: "bg-orange-500/15 text-orange-600 border-orange-500/30" },
  unknown:   { label: "Unbekannt",     icon: AlertTriangle, cls: "bg-slate-500/15 text-slate-600 border-slate-500/30" },
  invalid:   { label: "Ungültig",      icon: XCircle,       cls: "bg-red-500/15 text-red-600 border-red-500/30" },
};

export default function CheckIn() {
  const { toast } = useToast();
  const [tab, setTab] = useState("scan");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <QrCode className="size-6 text-primary" /> Mitgliedsausweis &amp; Check-in
        </h1>
        <p className="text-muted-foreground mt-1">
          QR-Code Reader &amp; Creator – vollständig lokal, ohne externe Dienste.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="scan" className="gap-2"><ScanLine className="size-4" /> Check-in Scanner</TabsTrigger>
          <TabsTrigger value="cards" className="gap-2"><IdCard className="size-4" /> Ausweise &amp; QR-Codes</TabsTrigger>
        </TabsList>

        <TabsContent value="scan" className="mt-4">
          <ScannerTab toast={toast} />
        </TabsContent>
        <TabsContent value="cards" className="mt-4">
          <CardsTab toast={toast} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ─────────────────────────── Scanner (QR Reader) ─────────────────────────── */

function ScannerTab({ toast }: { toast: ReturnType<typeof useToast>["toast"] }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTextRef = useRef<string>("");
  const lastAtRef = useRef<number>(0);

  const [scanning, setScanning] = useState(false);
  const [camError, setCamError] = useState<string>("");
  const [eventId, setEventId] = useState<string>("");
  const [manual, setManual] = useState("");
  const [results, setResults] = useState<ScanResult[]>([]);

  const { data: events = [] } = useQuery<Event[]>({ queryKey: ["/api/events"] });

  const eventNum = eventId ? Number(eventId) : 0;

  const { data: checkins = [], refetch: refetchCheckins } = useQuery<any[]>({
    queryKey: ["/api/qr/checkin", eventNum],
    queryFn: async () => {
      if (!eventNum) return [];
      const token = getAuthToken();
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/api/qr/checkin/${eventNum}`, { headers, credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!eventNum,
  });

  useEffect(() => {
    if (events.length && !eventId) setEventId(String(events[0].id));
  }, [events, eventId]);

  const submitCard = useCallback(async (rawText: string) => {
    if (!eventNum) {
      toast({ title: "Bitte zuerst einen Termin wählen", variant: "destructive" });
      return;
    }

    try {
      // Send the raw QR payload — the server extracts the canonical 8-char Card-ID
      const res = await apiRequest("POST", "/api/qr/checkin", {
        eventId: eventNum,
        raw: rawText,
        method: "qr",
      });
      const data = await res.json();
      pushResult({
        status: (data.status as ScanStatus) || "valid",
        message: data.message || "Eingecheckt",
        name: data.name,
        cardNumber: data.cardNumberDisplay,
        at: Date.now(),
      });
      refetchCheckins();
    } catch (e: any) {
      // apiRequest throws "<status>: <body>" — try to parse the JSON body
      let status: ScanStatus = "unknown";
      let message = "Fehler beim Check-in";
      const txt = String(e?.message || "");
      const jsonStart = txt.indexOf("{");
      if (jsonStart >= 0) {
        try {
          const body = JSON.parse(txt.slice(jsonStart));
          status = (body.status as ScanStatus) || "unknown";
          message = body.message || message;
        } catch { /* ignore */ }
      }
      pushResult({ status, message, at: Date.now() });
    }
  }, [eventNum, toast, refetchCheckins]);

  function pushResult(r: ScanResult) {
    setResults(prev => [r, ...prev].slice(0, 30));
  }

  const tick = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(img.data, img.width, img.height, { inversionAttempts: "dontInvert" });
        if (code && code.data) {
          const now = Date.now();
          if (code.data !== lastTextRef.current || now - lastAtRef.current > 2500) {
            lastTextRef.current = code.data;
            lastAtRef.current = now;
            submitCard(code.data);
          }
        }
      }
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [submitCard]);

  const startCamera = useCallback(async () => {
    setCamError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanning(true);
      rafRef.current = requestAnimationFrame(tick);
    } catch (e: any) {
      setCamError("Kamera konnte nicht gestartet werden: " + (e?.message || e));
    }
  }, [tick]);

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setScanning(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const kpis = {
    total: checkins.length,
    valid: results.filter(r => r.status === "valid").length,
    duplicate: results.filter(r => r.status === "duplicate").length,
    rejected: results.filter(r => ["unknown", "blocked", "expired", "invalid"].includes(r.status)).length,
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left: camera + controls */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><ScanLine className="size-4" /> Scanner</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Termin / Event</Label>
              <Select value={eventId} onValueChange={setEventId}>
                <SelectTrigger><SelectValue placeholder="Termin wählen" /></SelectTrigger>
                <SelectContent>
                  {events.map(ev => (
                    <SelectItem key={ev.id} value={String(ev.id)}>
                      {ev.date} · {ev.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
              <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
              <canvas ref={canvasRef} className="hidden" />
              {!scanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/70 gap-2">
                  <Camera className="size-10" />
                  <span className="text-sm">Kamera aus</span>
                </div>
              )}
              {scanning && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-48 border-2 border-[#FFDE00] rounded-2xl" />
                </div>
              )}
            </div>

            {camError && <p className="text-sm text-destructive">{camError}</p>}

            <div className="flex gap-2">
              {!scanning ? (
                <Button onClick={startCamera} className="gap-2 flex-1"><Camera className="size-4" /> Kamera starten</Button>
              ) : (
                <Button onClick={stopCamera} variant="secondary" className="gap-2 flex-1"><CameraOff className="size-4" /> Stoppen</Button>
              )}
            </div>

            <div className="border-t pt-3">
              <Label>Karten-Nr. manuell (z.B. M75-2026-0001)</Label>
              <div className="flex gap-2 mt-1">
                <Input value={manual} onChange={e => setManual(e.target.value)} placeholder="M75-2026-0001"
                  onKeyDown={e => { if (e.key === "Enter" && manual.trim()) { submitCard(manual.trim()); setManual(""); } }} />
                <Button variant="outline" disabled={!manual.trim()}
                  onClick={() => { submitCard(manual.trim()); setManual(""); }}>Check-in</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-4 gap-3">
          <KpiBox label="Eingecheckt" value={kpis.total} />
          <KpiBox label="Gültig" value={kpis.valid} />
          <KpiBox label="Doppelt" value={kpis.duplicate} />
          <KpiBox label="Abgelehnt" value={kpis.rejected} />
        </div>
      </div>

      {/* Right: live results + list */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Letzte Scans</CardTitle></CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">Noch keine Scans.</p>
            ) : (
              <div className="space-y-2">
                {results.map((r, i) => {
                  const meta = STATUS_META[r.status];
                  const Icon = meta.icon;
                  return (
                    <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg border ${meta.cls}`}>
                      <Icon className="size-5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{r.name || r.cardNumber || "—"}</div>
                        <div className="text-xs opacity-80 truncate">{r.message}</div>
                      </div>
                      <Badge variant="outline" className={meta.cls}>{meta.label}</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Anwesend bei diesem Termin ({checkins.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {checkins.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Noch niemand eingecheckt.</p>
            ) : (
              <div className="space-y-1.5 max-h-72 overflow-y-auto">
                {checkins.map((c: any) => (
                  <div key={c.id} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0">
                    <span>Mitglied #{c.memberId ?? "?"}</span>
                    <span className="text-muted-foreground text-xs">{(c.checkinTime || "").slice(11, 16)} · {c.method}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-card p-3 text-center">
      <div className="text-xl font-bold">{value}</div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}

/* ─────────────────────────── Cards (QR Creator) ─────────────────────────── */

function CardsTab({ toast }: { toast: ReturnType<typeof useToast>["toast"] }) {
  const [userId, setUserId] = useState<string>("");
  const [validUntil, setValidUntil] = useState<string>("");
  const [issuing, setIssuing] = useState(false);
  const [preview, setPreview] = useState<{ card: MemberCard; dataUrl: string } | null>(null);

  const { data: users = [] } = useQuery<AppUser[]>({ queryKey: ["/api/users"] });
  const { data: cards = [], refetch } = useQuery<MemberCard[]>({ queryKey: ["/api/member-cards"] });

  const generateDataUrl = useCallback(async (text: string): Promise<string> => {
    const QRCode: any = await import("qrcode");
    return QRCode.toDataURL(text, { width: 320, margin: 1, color: { dark: "#002F65", light: "#ffffff" } });
  }, []);

  async function issueCard() {
    if (!userId) { toast({ title: "Bitte ein Mitglied wählen", variant: "destructive" }); return; }
    setIssuing(true);
    try {
      const res = await apiRequest("POST", "/api/member-cards", {
        userId: Number(userId),
        validUntil: validUntil || null,
      });
      const card: MemberCard = await res.json();
      const dataUrl = await generateDataUrl(card.qrCodeData);
      setPreview({ card, dataUrl });
      toast({ title: "Ausweis erstellt", description: card.cardNumber });
      queryClient.invalidateQueries({ queryKey: ["/api/member-cards"] });
      refetch();
    } catch (e: any) {
      toast({ title: "Fehler", description: String(e?.message || e), variant: "destructive" });
    } finally {
      setIssuing(false);
    }
  }

  async function showCard(card: MemberCard) {
    const dataUrl = await generateDataUrl(card.qrCodeData);
    setPreview({ card, dataUrl });
  }

  function downloadPreview() {
    if (!preview) return;
    const a = document.createElement("a");
    a.href = preview.dataUrl;
    a.download = `${preview.card.cardNumber}.png`;
    a.click();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><QrCode className="size-4" /> Neuen Ausweis erstellen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Mitglied (Benutzer)</Label>
              <Select value={userId} onValueChange={setUserId}>
                <SelectTrigger><SelectValue placeholder="Benutzer wählen" /></SelectTrigger>
                <SelectContent>
                  {users.map(u => (
                    <SelectItem key={u.id} value={String(u.id)}>{u.name} · {u.role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Gültig bis (optional)</Label>
              <Input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} />
            </div>
            <Button onClick={issueCard} disabled={issuing} className="gap-2">
              <QrCode className="size-4" /> {issuing ? "Erstelle…" : "Ausweis + QR erstellen"}
            </Button>
          </CardContent>
        </Card>

        {preview && (
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">QR-Code Vorschau</CardTitle></CardHeader>
            <CardContent className="flex flex-col items-center gap-3">
              <img src={preview.dataUrl} alt="QR" className="w-56 h-56 rounded-xl border" />
              <div className="text-center">
                <div className="font-semibold">{preview.card.cardNumberDisplay || preview.card.cardNumber}</div>
                <div className="text-sm text-muted-foreground">{preview.card.userName || `Benutzer #${preview.card.userId}`}</div>
              </div>
              <Button variant="outline" onClick={downloadPreview} className="gap-2"><Download className="size-4" /> PNG herunterladen</Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><UsersIcon className="size-4" /> Ausgestellte Ausweise ({cards.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {cards.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Noch keine Ausweise erstellt.</p>
          ) : (
            <div className="space-y-1.5 max-h-[28rem] overflow-y-auto">
              {cards.map(card => (
                <button key={card.id} onClick={() => showCard(card)}
                  className="w-full flex items-center justify-between gap-3 p-2.5 rounded-lg border hover:bg-muted/50 transition-colors text-left">
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate">{card.userName || `Benutzer #${card.userId}`}</div>
                    <div className="text-xs text-muted-foreground">{card.cardNumberDisplay || card.cardNumber}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {card.active
                      ? <Badge variant="outline" className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30">Aktiv</Badge>
                      : <Badge variant="outline" className="bg-red-500/15 text-red-600 border-red-500/30">Inaktiv</Badge>}
                    <QrCode className="size-4 text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
