import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Trash2 } from "lucide-react";
import type { Match, Member, MatchEvent } from "@shared/schema";

type MatchEventDetail = MatchEvent & { player?: Member };

const EVENT_TYPES: Record<string, string> = {
  goal: "Tor",
  assist: "Vorlage",
  shot: "Wurf",
  save: "Parade",
  turnover: "Ballverlust",
  timeout: "Auszeit",
  foul_yellow: "Gelbe Karte",
  foul_red: "Rote Karte",
  seven_meters: "7m",
  substitution: "Wechsel",
  other: "Sonstiges",
};

export default function LiveMatch() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [matchId, setMatchId] = useState<string>("");
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const [side, setSide] = useState<"home" | "opponent">("home");

  const { data: matches = [] } = useQuery<Match[]>({ queryKey: ["/api/matches"] });
  const { data: members = [] } = useQuery<Member[]>({ queryKey: ["/api/members"] });
  const { data: events = [] } = useQuery<MatchEventDetail[]>({
    queryKey: ["/api/matches", matchId, "events"],
    enabled: !!matchId,
  });

  const selectedMatch = matches.find((m) => String(m.id) === matchId);

  const addEvent = useMutation({
    mutationFn: (type: string) => {
      const minute = selectedMatch?.matchDate && selectedMatch?.matchTime
        ? Math.max(0, Math.floor((Date.now() - new Date(`${selectedMatch.matchDate}T${selectedMatch.matchTime}`).getTime()) / 60000))
        : undefined;
      return apiRequest("POST", `/api/matches/${matchId}/events`, {
        type,
        minute,
        playerId: selectedPlayerId ? Number(selectedPlayerId) : undefined,
        teamSide: side,
      }).then((r) => r.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/matches", matchId, "events"] }),
  });

  const deleteEvent = useMutation({
    mutationFn: (eventId: number) => apiRequest("DELETE", `/api/matches/${matchId}/events/${eventId}`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/matches", matchId, "events"] }),
  });

  const stats = useMemo(() => {
    const s: Record<string, number> = {};
    for (const e of events) s[e.type] = (s[e.type] || 0) + 1;
    return s;
  }, [events]);

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Live-Spielanalyse</h1>
      <Select value={matchId} onValueChange={setMatchId}>
        <SelectTrigger className="w-full md:w-80"><SelectValue placeholder="Spiel wählen" /></SelectTrigger>
        <SelectContent>
          {matches.map((m) => <SelectItem key={m.id} value={String(m.id)}>{m.homeTeam || "Mersch 75"} vs {m.awayTeam || "Gegner"} ({m.matchDate})</SelectItem>)}
        </SelectContent>
      </Select>

      {selectedMatch && (
        <>
          <div className="flex flex-wrap gap-3 items-center">
            <Select value={side} onValueChange={(v) => setSide(v as any)}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="home">Mersch 75</SelectItem>
                <SelectItem value="opponent">Gegner</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
              <SelectTrigger className="w-56"><SelectValue placeholder="Spieler (optional)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Kein Spieler</SelectItem>
                {members.map((m) => <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {Object.entries(EVENT_TYPES).map(([key, label]) => (
              <Button key={key} variant="outline" onClick={() => { addEvent.mutate(key); toast({ title: label + " erfasst" }); }} disabled={addEvent.isPending}>
                {label}
              </Button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>Statistik</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {Object.entries(stats).map(([type, count]) => (
                  <Badge key={type} variant="secondary">{EVENT_TYPES[type]}: {count}</Badge>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Zeitlinie</CardTitle></CardHeader>
              <CardContent className="space-y-2 max-h-80 overflow-y-auto">
                {events.map((ev) => (
                  <div key={ev.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <div className="font-medium">{EVENT_TYPES[ev.type]} {ev.minute !== undefined && <span className="text-xs text-muted-foreground">({ev.minute}')</span>}</div>
                      <div className="text-sm text-muted-foreground">{ev.teamSide === "home" ? "Mersch 75" : "Gegner"}{ev.player ? ` · ${ev.player.name}` : ""}</div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteEvent.mutate(ev.id!)} className="text-destructive"><Trash2 className="size-4" /></Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
