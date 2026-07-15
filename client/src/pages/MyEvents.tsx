import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CalendarDays, CheckCircle, XCircle, Clock, MapPin, Shield } from "lucide-react";
import type { Event, Nomination, Team, Member } from "@shared/schema";

type Availability = { id: number; memberId: number; eventId: number; available: boolean; note?: string | null };

const typeLabel: Record<string, string> = {
  training: "Training",
  spiel: "Spiel",
  meeting: "Meeting",
  event: "Event",
};

export default function MyEvents() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [responseDialog, setResponseDialog] = useState<{ open: boolean; nominationId: number; value: "ja" | "nein" } | null>(null);
  const [reasonText, setReasonText] = useState("");

  const { data: me } = useQuery<{ id: number; name: string; role: string }>({ queryKey: ["/api/auth/me"] });
  const { data: member } = useQuery<Member>({ queryKey: ["/api/members/me"], enabled: !!me });
  const { data: teams = [] } = useQuery<Team[]>({ queryKey: ["/api/teams"] });
  const { data: events = [] } = useQuery<Event[]>({ queryKey: ["/api/events"] });
  const { data: nominations = [] } = useQuery<Nomination[]>({
    queryKey: ["/api/nominations/member", member?.id],
    queryFn: () => member ? apiRequest("GET", `/api/nominations/member/${member.id}`).then(r => r.json()) : Promise.resolve([]),
    enabled: !!member,
  });
  const { data: availability = [] } = useQuery<Availability[]>({
    queryKey: ["/api/availability/member", member?.id],
    queryFn: async () => {
      if (!member) return [];
      const all: Availability[] = [];
      for (const e of events) {
        const list: Availability[] = await apiRequest("GET", `/api/availability/event/${e.id}`).then(r => r.json());
        all.push(...list.filter(a => a.memberId === member.id));
      }
      return all;
    },
    enabled: !!member && events.length > 0,
  });

  const today = new Date().toISOString().slice(0, 10);
  const myTeamIds = member
    ? ([member.teamId, ...(member.extraTeamIds ? JSON.parse(member.extraTeamIds) : [])]
        .filter((id): id is number => typeof id === "number") as number[])
    : [];
  const myEvents = events
    .filter(e => e.date >= today && myTeamIds.includes(e.teamId ?? -1))
    .sort((a, b) => a.date.localeCompare(b.date) || (a.time || "").localeCompare(b.time || ""));

  const pendingNominations = nominations.filter(n => !n.response);
  const answeredNominations = nominations.filter(n => n.response);

  const responseMutation = useMutation({
    mutationFn: ({ id, response, reason }: { id: number; response: string; reason?: string }) =>
      apiRequest("PATCH", `/api/nominations/${id}/response`, { response, reason }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/nominations/member", member?.id] });
      setResponseDialog(null);
      setReasonText("");
      toast({ title: responseDialog?.value === "ja" ? "Zugesagt ✓" : "Abgesagt" });
    },
    onError: () => toast({ title: "Fehler", description: "Antwort konnte nicht gespeichert werden", variant: "destructive" }),
  });

  const availabilityMutation = useMutation({
    mutationFn: ({ eventId, available, note }: { eventId: number; available: boolean; note?: string }) =>
      apiRequest("POST", "/api/availability", { memberId: member?.id, eventId, available, note }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/availability/member", member?.id] });
      toast({ title: "Verfügbarkeit gespeichert" });
    },
    onError: () => toast({ title: "Fehler", description: "Verfügbarkeit konnte nicht gespeichert werden", variant: "destructive" }),
  });

  const getEvent = (eventId?: number) => events.find(e => e.id === eventId);
  const getTeam = (teamId?: number | null) => teams.find(t => t.id === (teamId ?? undefined));
  const getAvailability = (eventId?: number) => availability.find(a => a.eventId === eventId);

  const openResponse = (nominationId: number, value: "ja" | "nein") => {
    setResponseDialog({ open: true, nominationId, value });
    setReasonText("");
  };

  const submitResponse = () => {
    if (!responseDialog) return;
    responseMutation.mutate({ id: responseDialog.nominationId, response: responseDialog.value, reason: reasonText || undefined });
  };

  if (!me) return <p className="p-4">Lade Benutzer...</p>;
  if (!member) return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-primary mb-4">Meine Termine</h1>
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Deinem Benutzerkonto ist noch kein Mitgliedsprofil zugeordnet. Bitte das Sekretariat, den Link herzustellen.
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary">Meine Termine</h1>
        <span className="text-sm text-muted-foreground">{member.name}</span>
      </div>

      {/* Pending nominations */}
      {pendingNominations.length > 0 && (
        <Card className="border-l-4 border-l-amber-400">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="size-4" /> Nominierungen – bitte bestätigen</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {pendingNominations.map(nom => {
              const ev = getEvent(nom.eventId);
              return (
                <div key={nom.id} className="p-3 rounded-xl border bg-card">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{ev?.title || "Termin"}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{ev?.date} {ev?.time}</p>
                      {ev?.location && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="size-3" /> {ev.location}</p>}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8" onClick={() => openResponse(nom.id, "ja")}>Ja</Button>
                      <Button size="sm" variant="destructive" className="h-8" onClick={() => openResponse(nom.id, "nein")}>Nein</Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* My upcoming team events */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><CalendarDays className="size-4" /> Kommende Mannschafts-Termine</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {myEvents.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Keine kommenden Termine für deine Mannschaft.</p>}
          {myEvents.map(ev => {
            const team = getTeam(ev.teamId);
            const avail = getAvailability(ev.id);
            return (
              <div key={ev.id} className="p-3 rounded-xl border bg-card">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-[10px] h-5">{typeLabel[ev.type] || ev.type}</Badge>
                      {team && <Badge variant="outline" className="text-[10px] h-5 flex items-center gap-1"><Shield className="size-3" /> {team.name}</Badge>}
                    </div>
                    <p className="text-sm font-semibold mt-1 truncate">{ev.title}</p>
                    <p className="text-xs text-muted-foreground">{ev.date} {ev.time}{ev.location ? ` · ${ev.location}` : ""}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    {avail ? (
                      <Badge className={avail.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {avail.available ? "Da" : "Abwesend"}
                      </Badge>
                    ) : (
                      <Badge variant="outline">Noch offen</Badge>
                    )}
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={() => availabilityMutation.mutate({ eventId: ev.id, available: true })}>
                        <CheckCircle className="size-3 mr-1" /> Da
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={() => availabilityMutation.mutate({ eventId: ev.id, available: false })}>
                        <XCircle className="size-3 mr-1" /> Nein
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Already answered nominations */}
      {answeredNominations.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Meine Antworten</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {answeredNominations.map(nom => {
              const ev = getEvent(nom.eventId);
              return (
                <div key={nom.id} className="flex items-center justify-between p-3 rounded-xl border bg-card">
                  <div>
                    <p className="text-sm font-medium">{ev?.title || "Termin"}</p>
                    <p className="text-xs text-muted-foreground">{ev?.date}</p>
                    {nom.reason && <p className="text-xs text-muted-foreground mt-0.5">„{nom.reason}"</p>}
                  </div>
                  <Badge className={nom.response === "ja" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {nom.response === "ja" ? "Zugesagt" : "Abgesagt"}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Response dialog */}
      <Dialog open={!!responseDialog?.open} onOpenChange={() => setResponseDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{responseDialog?.value === "ja" ? "Zusagen" : "Absagen"}</DialogTitle>
          </DialogHeader>
          {responseDialog?.value === "nein" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Begründung (Pflicht bei Absage)</label>
              <Textarea placeholder="z. B. Verletzung, beruflich verhindert..." value={reasonText} onChange={e => setReasonText(e.target.value)} />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setResponseDialog(null)}>Abbrechen</Button>
            <Button
              disabled={responseDialog?.value === "nein" && !reasonText.trim()}
              className={responseDialog?.value === "ja" ? "bg-green-600 hover:bg-green-700" : ""}
              variant={responseDialog?.value === "nein" ? "destructive" : "default"}
              onClick={submitResponse}
            >
              {responseDialog?.value === "ja" ? "Zusagen ✓" : "Absagen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
