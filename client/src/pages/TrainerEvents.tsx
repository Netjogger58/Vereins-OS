import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { initials, formatMemberName, isoToday } from "@/lib/utils";
import { isActiveClubMember } from "@shared/memberStatus";
import type { Event, Team, Member, Availability } from "@shared/schema";
import { CalendarDays, MapPin, CheckCircle, XCircle, Users, ChevronDown, ChevronUp } from "lucide-react";

const typeLabel: Record<string, string> = {
  training: "Training",
  spiel: "Spiel",
  event: "Event",
  meeting: "Meeting",
};

const typeColor: Record<string, string> = {
  training: "bg-blue-100 text-blue-700",
  spiel: "bg-emerald-100 text-emerald-700",
  event: "bg-purple-100 text-purple-700",
  meeting: "bg-slate-100 text-slate-700",
};

export default function TrainerEvents() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [teamId, setTeamId] = useState<string>(String(user?.teamId || ""));
  const [openEvent, setOpenEvent] = useState<number | null>(null);

  const { data: teams = [] } = useQuery<Team[]>({ queryKey: ["/api/teams"] });
  const { data: members = [] } = useQuery<Member[]>({ queryKey: ["/api/members"] });
  const { data: events = [] } = useQuery<Event[]>({ queryKey: ["/api/events"] });

  const selectedTeam = teams.find(t => String(t.id) === teamId);

  const teamMembers = members.filter(m => {
    if (!isActiveClubMember(m)) return false;
    const main = m.teamId === Number(teamId);
    if (main) return true;
    const extras = m.extraTeamIds ? (JSON.parse(m.extraTeamIds) as number[]) : [];
    return extras.includes(Number(teamId));
  });

  const futureEvents = events
    .filter(e => e.teamId === Number(teamId) && e.date >= isoToday())
    .sort((a, b) => a.date.localeCompare(b.date) || (a.time || "").localeCompare(b.time || ""));

  const availabilityQueries = useQuery<Availability[][]>({
    queryKey: ["/api/availability/events", futureEvents.map(e => e.id)],
    queryFn: async () =>
      Promise.all(futureEvents.map(e => apiRequest("GET", `/api/availability/event/${e.id}`).then(r => r.json()))),
    enabled: futureEvents.length > 0,
  });

  const availabilityByEvent = new Map<number, Availability[]>();
  (availabilityQueries.data || []).forEach((list, idx) => {
    availabilityByEvent.set(futureEvents[idx].id, list);
  });

  const setAvail = useMutation({
    mutationFn: async (payload: { eventId: number; memberId: number; available: boolean }) =>
      (await apiRequest("POST", "/api/availability", payload)).json(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/availability"] });
      toast({ title: "Verfügbarkeit gespeichert" });
    },
    onError: () => toast({ title: "Fehler", variant: "destructive" }),
  });

  const getAvailability = (eventId: number, memberId: number) =>
    (availabilityByEvent.get(eventId) || []).find(a => a.memberId === memberId);

  const countAvail = (eventId: number, available: boolean) =>
    (availabilityByEvent.get(eventId) || []).filter(a => a.available === available).length;

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight">Trainer Termine</h1>
        <p className="text-sm text-muted-foreground">Uneroff vun Training, Spiller & Events</p>
      </div>

      <Card className="rounded-2xl shadow-sm border-none">
        <CardContent className="p-4 grid md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Mannschaft</label>
            <Select value={teamId} onValueChange={setTeamId}>
              <SelectTrigger>
                <SelectValue placeholder="Team wählen" />
              </SelectTrigger>
              <SelectContent>
                {teams.map(t => (
                  <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <div className="text-sm text-muted-foreground">
              {futureEvents.length} kommende Termine · {teamMembers.length} aktive Spieler
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {futureEvents.length === 0 && (
          <Card className="rounded-2xl shadow-sm border-none p-8 text-center text-sm text-muted-foreground">
            Keng kommende Termine fir {selectedTeam?.name || "dëst Team"}.
          </Card>
        )}

        {futureEvents.map(ev => {
          const isOpen = openEvent === ev.id;
          const yes = countAvail(ev.id, true);
          const no = countAvail(ev.id, false);
          const open = teamMembers.length - yes - no;

          return (
            <Card
              key={ev.id}
              className={`rounded-2xl shadow-sm border-none overflow-hidden transition-all ${isOpen ? "ring-2 ring-primary/20" : ""}`}
            >
              <CardHeader
                className="p-4 cursor-pointer bg-gradient-to-r from-primary to-[#001A3A] text-primary-foreground"
                onClick={() => setOpenEvent(isOpen ? null : ev.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={`${typeColor[ev.type] || "bg-white/20 text-white"} text-[10px]`}>
                        {typeLabel[ev.type] || ev.type}
                      </Badge>
                      <span className="text-xs text-primary-foreground/80 flex items-center gap-1">
                        <CalendarDays className="size-3" /> {ev.date} {ev.time ? `· ${ev.time}` : ""}
                      </span>
                      {ev.location && (
                        <span className="text-xs text-primary-foreground/80 flex items-center gap-1">
                          <MapPin className="size-3" /> {ev.location}
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-base font-extrabold mt-1">{ev.title}</CardTitle>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <div className="flex items-center gap-2 text-xs font-medium">
                      <span className="flex items-center gap-1 text-emerald-300"><CheckCircle className="size-3" /> {yes}</span>
                      <span className="flex items-center gap-1 text-red-300"><XCircle className="size-3" /> {no}</span>
                      <span className="flex items-center gap-1 text-white/70"><Users className="size-3" /> {open}</span>
                    </div>
                    {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                  </div>
                </div>
              </CardHeader>

              {isOpen && (
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {teamMembers.map(m => {
                      const avail = getAvailability(ev.id, m.id);
                      const st = avail === undefined ? "open" : avail.available ? "yes" : "no";

                      return (
                        <div
                          key={m.id}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                            st === "yes" ? "border-emerald-200 bg-emerald-50/50" : st === "no" ? "border-red-200 bg-red-50/50" : "border-border bg-card"
                          }`}
                        >
                          <Avatar className="size-10">
                            <AvatarImage src={m.photoUrl || undefined} />
                            <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                              {initials(m.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{formatMemberName(m)}</div>
                            <div className="text-[10px] text-muted-foreground">{m.licenseNumber || "—"}</div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant={st === "yes" ? "default" : "outline"}
                              className={`size-7 ${st === "yes" ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                              onClick={() => setAvail.mutate({ eventId: ev.id, memberId: m.id, available: true })}
                              disabled={setAvail.isPending}
                              title="Da"
                            >
                              <CheckCircle className="size-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant={st === "no" ? "default" : "outline"}
                              className={`size-7 ${st === "no" ? "bg-red-600 hover:bg-red-700" : ""}`}
                              onClick={() => setAvail.mutate({ eventId: ev.id, memberId: m.id, available: false })}
                              disabled={setAvail.isPending}
                              title="Nee"
                            >
                              <XCircle className="size-3.5" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
