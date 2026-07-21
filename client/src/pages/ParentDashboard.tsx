import { useState } from "react";
import { useQuery, useQueries, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { initials, formatMemberName, isoToday } from "@/lib/utils";
import type { Event, Member } from "@shared/schema";
import { CalendarDays, MapPin, CheckCircle, XCircle } from "lucide-react";

const typeLabel: Record<string, string> = {
  training: "Training",
  spiel: "Spiel",
  meeting: "Meeting",
  event: "Event",
};

const typeColor: Record<string, string> = {
  training: "bg-blue-100 text-blue-700",
  spiel: "bg-emerald-100 text-emerald-700",
  event: "bg-purple-100 text-purple-700",
  meeting: "bg-slate-100 text-slate-700",
};

type Availability = { id: number; memberId: number; eventId: number; available: boolean; note?: string | null };

export default function ParentDashboard() {
  const { toast } = useToast();
  const [openChild, setOpenChild] = useState<number | null>(null);

  const { data: children = [] } = useQuery<Member[]>({ queryKey: ["/api/members/children"] });
  const { data: events = [] } = useQuery<Event[]>({ queryKey: ["/api/events"] });

  const availabilityQueries = useQueries({
    queries: children.map(c => ({
      queryKey: ["/api/availability/member", c.id],
      queryFn: () => apiRequest("GET", `/api/availability/member/${c.id}`).then(r => r.json() as Promise<Availability[]>),
      enabled: !!c.id,
    })),
  });

  const setAvail = useMutation({
    mutationFn: ({ memberId, eventId, available }: { memberId: number; eventId: number; available: boolean }) =>
      apiRequest("POST", "/api/availability", { memberId, eventId, available }).then(r => r.json()),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["/api/availability/member", vars.memberId] });
      toast({ title: "Verfügbarkeit gespeichert" });
    },
    onError: () => toast({ title: "Fehler", variant: "destructive" }),
  });

  const availabilityIndex = (childId: number) => children.findIndex(c => c.id === childId);
  const availabilityFor = (childId: number) => availabilityQueries[availabilityIndex(childId)]?.data || [];
  const getAvailability = (childId: number, eventId: number) => availabilityFor(childId).find(a => a.eventId === eventId);

  const childEvents = (child: Member) => {
    const extras = child.extraTeamIds ? (JSON.parse(child.extraTeamIds) as number[]) : [];
    const teamIds = new Set(([child.teamId, ...extras]).filter((id): id is number => typeof id === "number"));
    return events
      .filter(e => e.date >= isoToday() && teamIds.has(e.teamId ?? -1))
      .sort((a, b) => a.date.localeCompare(b.date) || (a.time || "").localeCompare(b.time || ""));
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight">Elteren-Dashboard</h1>
        <p className="text-sm text-muted-foreground">Terminen a Verfügbarkeet vun dengen Kanner</p>
      </div>

      {children.length === 0 && (
        <Card className="rounded-2xl shadow-sm border-none p-8 text-center text-muted-foreground">
          Keng Kanner verlinkt.
        </Card>
      )}

      <div className="space-y-3">
        {children.map(child => {
          const evs = childEvents(child);
          const isOpen = openChild === child.id;
          return (
            <Card
              key={child.id}
              className={`rounded-2xl shadow-sm border-none overflow-hidden transition-all ${isOpen ? "ring-2 ring-primary/20" : ""}`}
            >
              <CardHeader
                className="p-4 bg-gradient-to-r from-primary to-[#001A3A] text-primary-foreground cursor-pointer"
                onClick={() => setOpenChild(isOpen ? null : child.id)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarImage src={child.photoUrl || undefined} />
                    <AvatarFallback className="text-sm font-bold bg-white/20 text-white">
                      {initials(child.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base font-extrabold">{formatMemberName(child)}</CardTitle>
                    <div className="text-xs text-white/80">{evs.length} kommenden Terminen</div>
                  </div>
                </div>
              </CardHeader>

              {isOpen && (
                <CardContent className="p-4 space-y-3">
                  {evs.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Keng kommenden Terminen.</p>
                  ) : evs.map(ev => {
                    const avail = getAvailability(child.id, ev.id);
                    const st = avail ? (avail.available ? "yes" : "no") : "open";
                    return (
                      <div
                        key={ev.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          st === "yes" ? "border-emerald-200 bg-emerald-50/50" : st === "no" ? "border-red-200 bg-red-50/50" : "border-border bg-card"
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{ev.title}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
                            <Badge className={`${typeColor[ev.type] || "bg-muted"} text-[9px]`}>
                              {typeLabel[ev.type] || ev.type}
                            </Badge>
                            <span className="flex items-center gap-0.5"><CalendarDays className="size-3" /> {ev.date} {ev.time}</span>
                            {ev.location && <span className="flex items-center gap-0.5"><MapPin className="size-3" /> {ev.location}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant={st === "yes" ? "default" : "outline"}
                            className={`size-7 ${st === "yes" ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                            onClick={() => setAvail.mutate({ memberId: child.id, eventId: ev.id, available: true })}
                            disabled={setAvail.isPending}
                            title="Da"
                          >
                            <CheckCircle className="size-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant={st === "no" ? "default" : "outline"}
                            className={`size-7 ${st === "no" ? "bg-red-600 hover:bg-red-700" : ""}`}
                            onClick={() => setAvail.mutate({ memberId: child.id, eventId: ev.id, available: false })}
                            disabled={setAvail.isPending}
                            title="Nee"
                          >
                            <XCircle className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
