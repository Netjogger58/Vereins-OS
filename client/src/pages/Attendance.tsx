import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Camera, Upload, Check, X, Sparkles, Info, Clock, Minus } from "lucide-react";
import { apiRequest, queryClient, getAuthToken } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { initials, isoToday, formatMemberName } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { Team, Member, Attendance } from "@shared/schema";
import { isActiveClubMember } from "@shared/memberStatus";

// ─── Anwesenheits-Status ────────────────────────────────
type AttStatus = "present" | "absent" | "excused" | "unexcused";

const STATUS_OPTS: { key: AttStatus; label: string; icon: typeof Check; active: string }[] = [
  { key: "present",   label: "Anwesend",       icon: Check, active: "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600" },
  { key: "excused",   label: "Entschuldigt",   icon: Clock, active: "bg-amber-500 hover:bg-amber-600 text-white border-amber-500" },
  { key: "unexcused", label: "Unentschuldigt", icon: X,     active: "bg-destructive hover:bg-destructive/90 text-white border-destructive" },
  { key: "absent",    label: "Abwesend",       icon: Minus, active: "bg-slate-500 hover:bg-slate-600 text-white border-slate-500" },
];

// Sortier-Priorität: Anwesende oben, unmarkierte in der Mitte, "kommt nicht" ganz unten
const STATUS_ORDER: Record<string, number> = { present: 0, excused: 3, unexcused: 4, absent: 5 };
const UNMARKED_ORDER = 1;

// Load face-api.js dynamically
let faceapi: any = null;
let modelsLoaded = false;

async function loadFaceApi() {
  if (faceapi) return faceapi;
  await new Promise<void>((resolve, reject) => {
    const existing = document.getElementById("faceapi-script");
    if (existing) { resolve(); return; }
    const script = document.createElement("script");
    script.id = "faceapi-script";
    script.src = "https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js";
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
  faceapi = (window as any).faceapi;
  return faceapi;
}

async function ensureModels() {
  if (modelsLoaded) return;
  const api = await loadFaceApi();
  const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/";
  await api.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
  await api.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
  await api.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
  modelsLoaded = true;
}

export default function AttendancePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [teamId, setTeamId] = useState<string>("");
  const [date, setDate] = useState<string>(isoToday());

  const { data: teams = [] } = useQuery<Team[]>({ queryKey: ["/api/teams"] });
  const { data: members = [] } = useQuery<Member[]>({ queryKey: ["/api/members"] });

  // Default team for trainer
  useEffect(() => {
    if (!teamId && user?.teamId) setTeamId(String(user.teamId));
    else if (!teamId && teams[0]) setTeamId(String(teams[0].id));
  }, [teams, user, teamId]);

  const selTeamId = teamId ? Number(teamId) : 0;
  const teamMembers = members.filter(m => m.teamId === selTeamId && isActiveClubMember(m));

  const { data: attendance = [] } = useQuery<Attendance[]>({
    queryKey: ["/api/attendance", { teamId: selTeamId, date }],
    queryFn: async () => {
      if (!selTeamId) return [];
      const API_BASE = "__PORT_5000__".startsWith("__") ? "" : "__PORT_5000__";
      const token = getAuthToken();
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(
        API_BASE + `/api/attendance?teamId=${selTeamId}&date=${date}`,
        { headers, credentials: "include" }
      );
      if (!res.ok) return [];
      return res.json();
    },
  });

  // Zähler pro Mitglied über alle erfassten Einheiten (present/total), startet bei 0/0
  const { data: summary = [] } = useQuery<{ memberId: number; present: number; total: number }[]>({
    queryKey: ["/api/attendance/summary", { teamId: selTeamId }],
    queryFn: async () => {
      if (!selTeamId) return [];
      const API_BASE = "__PORT_5000__".startsWith("__") ? "" : "__PORT_5000__";
      const token = getAuthToken();
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(API_BASE + `/api/attendance/summary?teamId=${selTeamId}`, { headers, credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
    queryClient.invalidateQueries({ queryKey: ["/api/attendance/summary"] });
  };

  const saveBulk = useMutation({
    mutationFn: async (items: any[]) =>
      (await apiRequest("POST", "/api/attendance/bulk", { items })).json(),
    onSuccess: invalidateAll,
    onError: (e: any) =>
      toast({ title: "Speichern fehlgeschlagen", description: String(e?.message || e), variant: "destructive" }),
  });

  const clearMut = useMutation({
    mutationFn: async (memberId: number) =>
      apiRequest("DELETE", `/api/attendance?memberId=${memberId}&date=${date}`),
    onSuccess: invalidateAll,
    onError: (e: any) =>
      toast({ title: "Löschen fehlgeschlagen", description: String(e?.message || e), variant: "destructive" }),
  });

  // Status ableiten (Altdaten ohne status aus present ableiten)
  const statusByMember = (memberId: number): AttStatus | undefined => {
    const rec = attendance.find(a => a.memberId === memberId);
    if (!rec) return undefined;
    return ((rec as any).status as AttStatus) ?? (rec.present ? "present" : "unexcused");
  };

  // Setzt Status – erneuter Klick auf denselben Status entfernt den Marker (neutral)
  const setStatus = (memberId: number, status: AttStatus) => {
    if (statusByMember(memberId) === status) {
      clearMut.mutate(memberId);
    } else {
      saveBulk.mutate([{ memberId, teamId: selTeamId, date, present: status === "present", status }]);
    }
  };

  const summaryByMember = (memberId: number) =>
    summary.find(s => s.memberId === memberId) ?? { present: 0, total: 0 };

  const presentCount = teamMembers.filter(m => statusByMember(m.id) === "present").length;

  // Anwesende oben, unmarkierte in der Mitte, "kommt nicht" (absent/entsch./unentsch.) ganz unten.
  // Innerhalb einer Gruppe alphabetisch. Wer als anwesend markiert wird, springt sofort nach oben.
  const sortedMembers = [...teamMembers].sort((a, b) => {
    const oa = STATUS_ORDER[statusByMember(a.id) ?? ""] ?? UNMARKED_ORDER;
    const ob = STATUS_ORDER[statusByMember(b.id) ?? ""] ?? UNMARKED_ORDER;
    if (oa !== ob) return oa - ob;
    return formatMemberName(a).localeCompare(formatMemberName(b));
  });

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight">Anwesenheit</h1>
        <p className="text-sm text-muted-foreground">Training, Spiele & Events dokumentieren</p>
      </div>

      <Card>
        <CardContent className="p-4 grid md:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Team</Label>
            <Select value={teamId} onValueChange={setTeamId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {teams.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Datum</Label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} data-testid="input-date" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Anwesend</Label>
            <div className="h-9 flex items-center gap-2">
              <span className="text-2xl font-extrabold text-primary">{presentCount}</span>
              <span className="text-sm text-muted-foreground">/ {teamMembers.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="manual">
        <TabsList>
          <TabsTrigger value="manual" data-testid="tab-manual">Manuell</TabsTrigger>
          <TabsTrigger value="photo" data-testid="tab-photo">
            <Sparkles className="size-3.5 mr-1" />
            Gruppenfoto
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual">
          <Card>
            <CardContent className="p-0 divide-y divide-border">
              {teamMembers.length === 0 && (
                <p className="p-8 text-center text-sm text-muted-foreground">
                  Keine Mitglieder in diesem Team
                </p>
              )}
              {sortedMembers.map(m => {
                const st = statusByMember(m.id);
                const s = summaryByMember(m.id);
                const parked = st === "absent" || st === "excused" || st === "unexcused";
                return (
                  <div key={m.id} className={`flex items-center gap-3 p-3 transition-colors ${parked ? "opacity-60" : ""}`}>
                    <Avatar className="size-9">
                      <AvatarImage src={m.photoUrl || undefined} />
                      <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                        {initials(m.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{formatMemberName(m)}</div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                        <span className="tabular-nums font-semibold text-foreground/70" title="Anwesend / erfasste Einheiten">
                          {s.present}/{s.total}
                        </span>
                        {m.licenseNumber && <span className="truncate">{m.licenseNumber}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {STATUS_OPTS.map(opt => {
                        const Icon = opt.icon;
                        const active = st === opt.key;
                        return (
                          <Button
                            key={opt.key}
                            size="icon"
                            variant={active ? "default" : "outline"}
                            onClick={() => setStatus(m.id, opt.key)}
                            className={`size-8 ${active ? opt.active : "text-muted-foreground"}`}
                            title={active ? `${opt.label} (nochmals klicken = entfernen)` : opt.label}
                            data-testid={`button-${opt.key}-${m.id}`}
                          >
                            <Icon className="size-3.5" />
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="photo">
          <GroupPhotoTab
            teamMembers={teamMembers}
            onResult={(matchedIds) => {
              const items = teamMembers.map(m => {
                const isPresent = matchedIds.includes(m.id);
                return {
                  memberId: m.id,
                  teamId: selTeamId,
                  date,
                  present: isPresent,
                  status: isPresent ? "present" : "absent",
                };
              });
              saveBulk.mutate(items);
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function GroupPhotoTab({
  teamMembers,
  onResult,
}: {
  teamMembers: Member[];
  onResult: (matchedIds: number[]) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [preview, setPreview] = useState<string | null>(null);
  const [matches, setMatches] = useState<{ member: Member; distance: number }[] | null>(null);
  const [unknownFaces, setUnknownFaces] = useState(0);
  const fileInput = useRef<HTMLInputElement>(null);

  const membersWithPhotos = teamMembers.filter(m => m.photoUrl);

  async function handleFile(file: File) {
    setLoading(true);
    setStatus("Modelle werden geladen...");
    setMatches(null);
    try {
      await ensureModels();
      setStatus("Foto wird analysiert...");
      const imgUrl = URL.createObjectURL(file);
      setPreview(imgUrl);
      const img = new Image();
      img.src = imgUrl;
      await new Promise(r => { img.onload = r; });

      const detections = await faceapi
        .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      setStatus("Mitglieder werden verglichen...");

      // Build labeled descriptors from member photos
      const labeledDescriptors: any[] = [];
      for (const m of membersWithPhotos) {
        const memberImg = new Image();
        memberImg.crossOrigin = "anonymous";
        memberImg.src = m.photoUrl!;
        try {
          await new Promise((r, rj) => { memberImg.onload = r; memberImg.onerror = rj; });
          const det = await faceapi
            .detectSingleFace(memberImg, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor();
          if (det) {
            labeledDescriptors.push(new faceapi.LabeledFaceDescriptors(
              String(m.id),
              [det.descriptor]
            ));
          }
        } catch {}
      }

      if (labeledDescriptors.length === 0) {
        setStatus("Keine vergleichbaren Spielerfotos gefunden.");
        setLoading(false);
        return;
      }

      const matcher = new faceapi.FaceMatcher(labeledDescriptors, 0.55);
      const matched: { member: Member; distance: number }[] = [];
      const seen = new Set<number>();
      let unknown = 0;
      for (const d of detections) {
        const best = matcher.findBestMatch(d.descriptor);
        if (best.label === "unknown") unknown++;
        else {
          const memId = Number(best.label);
          if (!seen.has(memId)) {
            const m = teamMembers.find(mm => mm.id === memId);
            if (m) { matched.push({ member: m, distance: best.distance }); seen.add(memId); }
          }
        }
      }
      setMatches(matched);
      setUnknownFaces(unknown);
      setStatus(`${detections.length} Gesichter erkannt, ${matched.length} zugeordnet.`);
    } catch (e: any) {
      setStatus("Fehler: " + (e.message || "Erkennung fehlgeschlagen"));
    } finally {
      setLoading(false);
    }
  }

  const confirmAttendance = () => {
    if (matches) onResult(matches.map(m => m.member.id));
  };

  if (membersWithPhotos.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Info className="size-10 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-sm font-semibold">Bitte zuerst Spielerfotos in den Profilen hochladen</p>
          <p className="text-xs text-muted-foreground mt-1">
            Die Gesichtserkennung benötigt Referenzfotos der Spieler.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="size-4 text-secondary" />
          Gruppenfoto-Erkennung
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          <Button onClick={() => fileInput.current?.click()} disabled={loading} data-testid="button-upload-group-photo">
            <Camera className="size-4 mr-1" /> Foto aufnehmen / hochladen
          </Button>
        </div>

        {status && (
          <div className="text-xs text-muted-foreground">{status}</div>
        )}

        {preview && (
          <div className="rounded-lg overflow-hidden border border-border">
            <img src={preview} alt="Gruppenfoto" className="w-full max-h-[400px] object-contain bg-muted" />
          </div>
        )}

        {matches && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">{matches.length}</span> erkannt
                {unknownFaces > 0 && <> · <span className="text-muted-foreground">{unknownFaces} unbekannte Gesichter</span></>}
              </div>
              <Button size="sm" onClick={confirmAttendance} disabled={matches.length === 0}>
                <Check className="size-3.5 mr-1" /> Anwesenheit übernehmen
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {matches.map(m => (
                <div key={m.member.id} className="flex items-center gap-2 p-2 rounded-md border border-emerald-500/30 bg-emerald-500/10">
                  <Avatar className="size-8"><AvatarImage src={m.member.photoUrl || undefined} /><AvatarFallback>{initials(m.member.name)}</AvatarFallback></Avatar>
                  <div className="text-xs">
                    <div className="font-semibold truncate">{formatMemberName(m.member)}</div>
                    <div className="text-muted-foreground">{Math.round((1 - m.distance) * 100)}%</div>
                  </div>
                </div>
              ))}
              {teamMembers.filter(m => !matches.find(x => x.member.id === m.id)).map(m => (
                <div key={m.id} className="flex items-center gap-2 p-2 rounded-md border border-border opacity-60">
                  <Avatar className="size-8"><AvatarImage src={m.photoUrl || undefined} /><AvatarFallback>{initials(m.name)}</AvatarFallback></Avatar>
                  <div className="text-xs">
                    <div className="truncate">{formatMemberName(m)}</div>
                    <div className="text-muted-foreground">nicht erkannt</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
