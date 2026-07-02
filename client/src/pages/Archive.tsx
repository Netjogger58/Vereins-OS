import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { Archive as ArchiveIcon, AlertTriangle, CheckCircle2 } from "lucide-react";

interface ArchiveSeason {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  active: boolean;
  archivedAt?: string;
}

const ADMIN_ROLES = ["präsident", "admin", "secretaire"];

export default function Archive() {
  const { toast } = useToast();
  const { user } = useAuth();
  const canRollover = !!user && ADMIN_ROLES.includes(user.role);

  const { data: seasons = [], isLoading } = useQuery<ArchiveSeason[]>({ queryKey: ["/api/archive/seasons"] });

  const [form, setForm] = useState<Record<string, string>>({});
  const [resetLiveData, setResetLiveData] = useState(true);
  const [confirmed, setConfirmed] = useState(false);

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
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold flex items-center gap-2">
                  {s.name}
                  {s.active && <Badge>aktuell</Badge>}
                </div>
                <div className="text-sm text-muted-foreground">
                  {s.startDate} – {s.endDate}
                </div>
              </div>
              {!s.active && (
                <a href={`/api/archive/export/${s.id}`} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm">Export (JSON)</Button>
                </a>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
