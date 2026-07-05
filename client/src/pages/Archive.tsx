import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useState, useMemo } from "react";
import { Archive as ArchiveIcon, AlertTriangle, CheckCircle2, Users, Download, ChevronDown, ChevronRight } from "lucide-react";
import { CAT_CODE_LABELS } from "@shared/schema";

interface ArchiveSeason {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  active: boolean;
  archivedAt?: string;
}

const ADMIN_ROLES = ["präsident", "admin", "secretaire"];

const FUNCTION_LABELS: Record<string, string> = {
  joueur: "Spieler", comite: "Comité", officiel: "Officiel", arbitre: "Arbitre",
  coach: "Trainer", coach_backup: "Co-Trainer", teamchef: "Teamchef",
  teambegleeder: "Teambegleeder", supervisor: "Supervisor", benevole: "Bénévole",
  benevole_licence: "Bénévole (Lizenz)", contact_famille: "Kontakt (Familie)", mere_accueil: "Mère d'accueil",
};
const TYPE_LABELS: Record<string, string> = {
  spieler: "Spieler", donateur: "Donateur", donateur_lizenz: "Donateur (Lizenz)",
  honoraire: "Ehrenmitglied", sponsor: "Sponsor", contact: "Kontakt",
};
const STATUS_LABELS: Record<string, string> = {
  aktiv: "Aktiv", inaktiv: "Inaktiv", arret_temporaire: "Temporär pausiert",
  pausiert_verletzung: "Pausiert (Verletzung)", abbruch: "Abbruch", abbruch_jung: "Abbruch (Jugend)",
  ehemalig: "Ehemalig", intern_gesperrt: "Intern gesperrt", gesperrt: "Gesperrt",
};

interface ArchiveTeam { id: number; name: string; category: string; finalRank?: number | null; }
interface ArchiveMember {
  id: number; seasonId: number; teamId: number; name: string;
  birthdate?: string | null; licenseNumber?: string | null; catCode?: number | null;
  functions?: string | null; membershipStatus?: string | null; memberType?: string | null;
  matchesPlayed?: number | null; goals?: number | null; assists?: number | null;
}

function parseFns(s?: string | null): { function: string; qualification?: string | null }[] {
  if (!s) return [];
  try {
    const arr = JSON.parse(s);
    if (!Array.isArray(arr)) return [];
    const seen = new Set<string>();
    const out: { function: string; qualification?: string | null }[] = [];
    for (const r of arr) {
      const fn = r?.function;
      if (!fn || seen.has(fn)) continue;
      seen.add(fn);
      out.push({ function: fn, qualification: r?.qualification || null });
    }
    return out;
  } catch { return []; }
}

export default function Archive() {
  const { toast } = useToast();
  const { user } = useAuth();
  const canRollover = !!user && ADMIN_ROLES.includes(user.role);

  const { data: seasons = [], isLoading } = useQuery<ArchiveSeason[]>({ queryKey: ["/api/archive/seasons"] });

  const [form, setForm] = useState<Record<string, string>>({});
  const [resetLiveData, setResetLiveData] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [openSeason, setOpenSeason] = useState<number | null>(null);

  const rollover = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/archive/rollover", {
        newSeasonName: form.newSeasonName,
        newSeasonStart: form.newSeasonStart,
        newSeasonEnd: form.newSeasonEnd,
        finishedSeasonName: form.finishedSeasonName || undefined,
        resetLiveData,
      });
      return res.json();
    },
    onSuccess: (r: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/archive/seasons"] });
      setForm({});
      setConfirmed(false);
      toast({
        title: "Saison archiviert",
        description: `Teams: ${r.counts?.teams}, Mitglieder: ${r.counts?.members}, Spiele: ${r.counts?.matches}, Events: ${r.counts?.events}. Neue Saison angelegt.`,
      });
    },
    onError: (e: any) => {
      toast({ title: "Fehler", description: String(e?.message || e), variant: "destructive" });
    },
  });

  const canSubmit = confirmed && form.newSeasonName && form.newSeasonStart && form.newSeasonEnd && !rollover.isPending;

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Lädt…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <ArchiveIcon className="size-6" /> Saison-Archiv
        </h1>
        <p className="text-muted-foreground mt-1">
          Vergangene Saisons ansehen und die aktuelle Saison abschließen.
        </p>
      </div>

      {canRollover && (
        <Card className="border-amber-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="size-5" /> Saison abschließen &amp; neue Saison starten
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Die aktuelle Saison wird ins Archiv verschoben (Teams, Mitglieder inkl. Funktionen &amp;
              Kategorien, Spiele, Events). Danach wird eine neue, leere Saison angelegt.
              Stammdaten der Mitglieder und die Karten-Nr. (card_id) bleiben erhalten.
              <strong> Bitte vorher ein Backup der Datenbank erstellen.</strong>
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Name der abzuschließenden Saison (optional)</Label>
                <Input placeholder="z.B. 2025/26" value={form.finishedSeasonName || ""}
                  onChange={e => setForm({ ...form, finishedSeasonName: e.target.value })} />
              </div>
              <div>
                <Label>Name der neuen Saison *</Label>
                <Input placeholder="z.B. 2026/27" value={form.newSeasonName || ""}
                  onChange={e => setForm({ ...form, newSeasonName: e.target.value })} />
              </div>
              <div>
                <Label>Neue Saison – Start *</Label>
                <Input type="date" value={form.newSeasonStart || ""}
                  onChange={e => setForm({ ...form, newSeasonStart: e.target.value })} />
              </div>
              <div>
                <Label>Neue Saison – Ende *</Label>
                <Input type="date" value={form.newSeasonEnd || ""}
                  onChange={e => setForm({ ...form, newSeasonEnd: e.target.value })} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={resetLiveData}
                onChange={e => setResetLiveData(e.target.checked)} />
              Saisonabhängige Daten zurücksetzen (Spiele, Tabelle, Nominierungen, Anwesenheit,
              Surclassement) — empfohlen
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={confirmed}
                onChange={e => setConfirmed(e.target.checked)} />
              Ich habe ein Backup erstellt und möchte die Saison jetzt abschließen.
            </label>
            <Button disabled={!canSubmit} onClick={() => rollover.mutate()} className="gap-2">
              <CheckCircle2 className="size-4" />
              {rollover.isPending ? "Wird archiviert…" : "Saison abschließen"}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3">
        <h2 className="text-lg font-semibold">Archivierte &amp; aktuelle Saisons</h2>
        {seasons.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">Keine Saisons vorhanden</CardContent></Card>
        ) : seasons.map(s => (
          <Card key={s.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setOpenSeason(openSeason === s.id ? null : s.id)}
                  className="flex items-center gap-2 text-left"
                >
                  {openSeason === s.id ? <ChevronDown className="size-4 shrink-0" /> : <ChevronRight className="size-4 shrink-0" />}
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      {s.name}
                      {s.active && <Badge>aktuell</Badge>}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {s.startDate} – {s.endDate}
                    </div>
                  </div>
                </button>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="gap-1.5"
                    onClick={() => setOpenSeason(openSeason === s.id ? null : s.id)}>
                    <Users className="size-4" /> Mitglieder
                  </Button>
                  {!s.active && (
                    <a href={`/api/archive/export/${s.id}`} target="_blank" rel="noreferrer">
                      <Button variant="outline" size="sm">Export (JSON)</Button>
                    </a>
                  )}
                </div>
              </div>
              {openSeason === s.id && <SeasonRoster seasonId={s.id} seasonName={s.name} />}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SeasonRoster({ seasonId, seasonName }: { seasonId: number; seasonName: string }) {
  const { data: members = [], isLoading: mLoading } = useQuery<ArchiveMember[]>({ queryKey: [`/api/archive/members/${seasonId}`] });
  const { data: teams = [] } = useQuery<ArchiveTeam[]>({ queryKey: [`/api/archive/teams/${seasonId}`] });
  const [q, setQ] = useState("");

  const teamName = (id: number) => teams.find(t => t.id === id)?.name || "Ohne Team";

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = term ? members.filter(m => m.name.toLowerCase().includes(term)) : members;
    return [...list].sort((a, b) => teamName(a.teamId).localeCompare(teamName(b.teamId)) || a.name.localeCompare(b.name));
  }, [members, teams, q]);

  // nach Team gruppieren (Reihenfolge = gefilterte, sortierte Liste)
  const groups = useMemo(() => {
    const map = new Map<number, ArchiveMember[]>();
    for (const m of filtered) {
      const arr = map.get(m.teamId) || [];
      arr.push(m);
      map.set(m.teamId, arr);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const exportCsv = () => {
    const head = ["Team", "Name", "Kategorie", "Typ", "Funktionen", "Status", "Lizenz", "Spiele", "Tore"];
    const rows = filtered.map(m => [
      teamName(m.teamId),
      m.name,
      m.catCode != null ? (CAT_CODE_LABELS[m.catCode] || String(m.catCode)) : "",
      TYPE_LABELS[m.memberType || ""] || m.memberType || "",
      parseFns(m.functions).map(f => FUNCTION_LABELS[f.function] || f.function).join("; "),
      STATUS_LABELS[m.membershipStatus || ""] || m.membershipStatus || "",
      m.licenseNumber || "",
      m.matchesPlayed ?? "",
      m.goals ?? "",
    ]);
    const csv = [head, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `archiv_${seasonName.replace(/[^\w-]+/g, "_")}_mitglieder.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (mLoading) return <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">Lädt Mitglieder…</div>;

  return (
    <div className="mt-4 pt-4 border-t space-y-3">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="text-sm text-muted-foreground">{filtered.length} von {members.length} Mitgliedern</div>
        <div className="flex items-center gap-2">
          <Input placeholder="Name suchen…" value={q} onChange={e => setQ(e.target.value)} className="h-8 w-48" />
          <Button variant="outline" size="sm" className="gap-1.5" onClick={exportCsv} disabled={filtered.length === 0}>
            <Download className="size-4" /> CSV
          </Button>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="text-sm text-muted-foreground py-4 text-center">Keine Mitglieder gefunden.</div>
      ) : groups.map(([teamId, list]) => (
        <div key={teamId} className="rounded-md border overflow-hidden">
          <div className="bg-muted/50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide">
            {teamName(teamId)} <span className="text-muted-foreground font-normal">· {list.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wide text-muted-foreground border-b">
                  <th className="px-3 py-1.5">Name</th>
                  <th className="px-3 py-1.5">Kategorie</th>
                  <th className="px-3 py-1.5">Typ</th>
                  <th className="px-3 py-1.5">Funktionen</th>
                  <th className="px-3 py-1.5">Status</th>
                  <th className="px-3 py-1.5 text-right">Spiele</th>
                  <th className="px-3 py-1.5 text-right">Tore</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {list.map(m => (
                  <tr key={m.id}>
                    <td className="px-3 py-1.5 whitespace-nowrap font-medium">{m.name}</td>
                    <td className="px-3 py-1.5 whitespace-nowrap">{m.catCode != null ? (CAT_CODE_LABELS[m.catCode] || m.catCode) : "—"}</td>
                    <td className="px-3 py-1.5 whitespace-nowrap">{TYPE_LABELS[m.memberType || ""] || m.memberType || "—"}</td>
                    <td className="px-3 py-1.5">
                      <div className="flex flex-wrap gap-1">
                        {parseFns(m.functions).length === 0 ? <span className="text-muted-foreground">—</span> :
                          parseFns(m.functions).map(f => (
                            <Badge key={f.function} variant="secondary" className="text-[10px]">
                              {FUNCTION_LABELS[f.function] || f.function}{f.qualification ? ` · ${f.qualification}` : ""}
                            </Badge>
                          ))}
                      </div>
                    </td>
                    <td className="px-3 py-1.5 whitespace-nowrap">{STATUS_LABELS[m.membershipStatus || ""] || m.membershipStatus || "—"}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{m.matchesPlayed ?? "—"}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{m.goals ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
