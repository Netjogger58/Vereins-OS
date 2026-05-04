import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { 
  Trophy, 
  Calendar, 
  MapPin, 
  Plus, 
  Trash2, 
  Edit2,
  ExternalLink,
  Play,
  TrendingUp,
  Users,
  Download,
  Link2
} from "lucide-react";
import type { Match, Team } from "@shared/schema";

const COMPETITIONS = [
  { value: "H-PRO", label: "Herren PRO" },
  { value: "D-PRO", label: "Damen PRO" },
  { value: "U15", label: "U15" },
  { value: "U13", label: "U13" },
  { value: "U11", label: "U11" },
  { value: "U9", label: "U9" },
  { value: "U7", label: "U7" },
  { value: "Pokal", label: "Pokal" },
];

const STATUS_OPTIONS = [
  { value: "scheduled", label: "Geplant", color: "bg-blue-500" },
  { value: "live", label: "Live", color: "bg-green-500" },
  { value: "finished", label: "Beendet", color: "bg-gray-500" },
  { value: "cancelled", label: "Abgesagt", color: "bg-red-500" },
];

export default function Matches() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [openNew, setOpenNew] = useState(false);
  const [openImport, setOpenImport] = useState(false);
  const [importProgress, setImportProgress] = useState<{ current: number; total: number; message: string } | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [selectedSeason, setSelectedSeason] = useState("2025-2026");
  const [selectedCompetition, setSelectedCompetition] = useState<string>("");
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [flhUrl, setFlhUrl] = useState("");

  const canManage = !!(user && ["präsident", "admin", "trainer", "secretaire"].includes(user.role));

  const { data: matches = [] } = useQuery<Match[]>({
    queryKey: ["/api/matches", { teamId: selectedTeam, season: selectedSeason, competition: selectedCompetition }],
    queryFn: async () => {
      let url = "/api/matches?";
      if (selectedTeam) url += `teamId=${selectedTeam}&`;
      if (selectedSeason) url += `season=${selectedSeason}&`;
      if (selectedCompetition) url += `competition=${selectedCompetition}&`;
      return (await apiRequest("GET", url)).json();
    },
  });

  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  const createMut = useMutation({
    mutationFn: async (data: any) => {
      return (await apiRequest("POST", "/api/matches", data)).json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
      setOpenNew(false);
      toast({ title: "Spiel erstellt" });
    },
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return (await apiRequest("PATCH", `/api/matches/${id}`, data)).json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
      setEditingMatch(null);
      toast({ title: "Spiel aktualisiert" });
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => {
      return (await apiRequest("DELETE", `/api/matches/${id}`)).json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
      toast({ title: "Spiel gelöscht" });
    },
  });

  const calculateStandingsMut = useMutation({
    mutationFn: async ({ competition, season }: { competition: string; season: string }) => {
      return (await apiRequest("POST", "/api/standings/calculate", { competition, season })).json();
    },
    onSuccess: (data) => {
      toast({ 
        title: "Tabelle berechnet", 
        description: `${data.standings.length} Teams aktualisiert` 
      });
    },
  });

  // Group matches by status
  const upcoming = matches.filter(m => m.status === "scheduled").sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime());
  const finished = matches.filter(m => m.status === "finished").sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime());
  const live = matches.filter(m => m.status === "live");

  const getStatusBadge = (status: string) => {
    const statusOption = STATUS_OPTIONS.find(s => s.value === status);
    return (
      <Badge className={statusOption?.color || "bg-gray-500"}>
        {statusOption?.label || status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Spiele & Ergebnisse</h1>
          <p className="text-sm text-muted-foreground">
            {matches.length} Spiele in der Saison {selectedSeason}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedSeason} onValueChange={setSelectedSeason}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024-2025">2024-2025</SelectItem>
              <SelectItem value="2025-2026">2025-2026</SelectItem>
              <SelectItem value="2026-2027">2026-2027</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedCompetition} onValueChange={setSelectedCompetition}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Alle Ligen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Alle Ligen</SelectItem>
              {COMPETITIONS.map(c => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {canManage && (
            <Button onClick={() => setOpenNew(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Neues Spiel
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">
            Kommend ({upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="live">
            Live ({live.length})
          </TabsTrigger>
          <TabsTrigger value="finished">
            Ergebnisse ({finished.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcoming.map((match) => (
            <MatchCard 
              key={match.id} 
              match={match} 
              canManage={canManage} 
              onEdit={() => setEditingMatch(match)}
              onDelete={() => deleteMut.mutate(match.id)}
            />
          ))}
          {upcoming.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Keine geplanten Spiele</p>
          )}
        </TabsContent>

        <TabsContent value="live" className="space-y-4">
          {live.map((match) => (
            <MatchCard 
              key={match.id} 
              match={match} 
              canManage={canManage} 
              onEdit={() => setEditingMatch(match)}
              onDelete={() => deleteMut.mutate(match.id)}
              isLive
            />
          ))}
          {live.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Keine Live-Spiele</p>
          )}
        </TabsContent>

        <TabsContent value="finished" className="space-y-4">
          {finished.map((match) => (
            <MatchCard 
              key={match.id} 
              match={match} 
              canManage={canManage} 
              onEdit={() => setEditingMatch(match)}
              onDelete={() => deleteMut.mutate(match.id)}
            />
          ))}
          {finished.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Keine Ergebnisse</p>
          )}
        </TabsContent>
      </Tabs>

      {/* Standings Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Tabelle
            </CardTitle>
            {canManage && selectedCompetition && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => calculateStandingsMut.mutate({ competition: selectedCompetition, season: selectedSeason })}
                disabled={calculateStandingsMut.isPending}
              >
                <Play className="w-4 h-4 mr-1" />
                Berechnen
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!selectedCompetition ? (
            <p className="text-center text-muted-foreground py-8">
              Wähle eine Liga aus, um die Tabelle zu sehen
            </p>
          ) : (
            <StandingsTable competition={selectedCompetition} season={selectedSeason} />
          )}
        </CardContent>
      </Card>

      {/* New Match Dialog */}
      <Dialog open={openNew} onOpenChange={setOpenNew}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Neues Spiel</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const formData = new FormData(form);
              createMut.mutate({
                teamId: parseInt(formData.get("teamId") as string),
                competition: formData.get("competition"),
                matchDate: formData.get("matchDate"),
                matchTime: formData.get("matchTime"),
                homeTeam: formData.get("homeTeam"),
                awayTeam: formData.get("awayTeam"),
                venue: formData.get("venue"),
                season: selectedSeason,
                isHome: formData.get("homeTeam")?.toString().includes("Mersch75") || false,
                status: "scheduled",
              });
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Team *</label>
                <Select name="teamId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Team wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map(team => (
                      <SelectItem key={team.id} value={String(team.id)}>{team.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Liga *</label>
                <Select name="competition" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Liga wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPETITIONS.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Datum *</label>
                <Input name="matchDate" type="date" required />
              </div>
              <div>
                <label className="text-sm font-medium">Uhrzeit</label>
                <Input name="matchTime" type="time" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Heimmannschaft *</label>
              <Input name="homeTeam" placeholder="z.B. Mersch75" required />
            </div>

            <div>
              <label className="text-sm font-medium">Gastmannschaft *</label>
              <Input name="awayTeam" placeholder="z.B. HB Esch" required />
            </div>

            <div>
              <label className="text-sm font-medium">Spielort</label>
              <Input name="venue" placeholder="z.B. Omnisport Mersch" />
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpenNew(false)}>
                Abbrechen
              </Button>
              <Button type="submit" disabled={createMut.isPending}>
                Erstellen
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Match Dialog */}
      {editingMatch && (
        <Dialog open={!!editingMatch} onOpenChange={() => setEditingMatch(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Spiel bearbeiten</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                updateMut.mutate({
                  id: editingMatch.id,
                  data: {
                    homeScore: formData.get("homeScore") ? parseInt(formData.get("homeScore") as string) : null,
                    awayScore: formData.get("awayScore") ? parseInt(formData.get("awayScore") as string) : null,
                    status: formData.get("status"),
                    sboUrl: formData.get("sboUrl"),
                    rtlUrl: formData.get("rtlUrl"),
                  },
                });
              }}
              className="space-y-4"
            >
              <div className="text-center py-4 bg-muted rounded">
                <p className="font-medium">{editingMatch.homeTeam} vs {editingMatch.awayTeam}</p>
                <p className="text-sm text-muted-foreground">{editingMatch.matchDate} | {editingMatch.competition}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">{editingMatch.homeTeam} Tore</label>
                  <Input name="homeScore" type="number" defaultValue={editingMatch.homeScore || ""} />
                </div>
                <div>
                  <label className="text-sm font-medium">{editingMatch.awayTeam} Tore</label>
                  <Input name="awayScore" type="number" defaultValue={editingMatch.awayScore || ""} />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Status</label>
                <Select name="status" defaultValue={editingMatch.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">SBO Link (handball4all)</label>
                <Input name="sboUrl" defaultValue={editingMatch.sboUrl || ""} placeholder="https://spo.handball4all.de/..." />
              </div>

              <div>
                <label className="text-sm font-medium">RTL Link</label>
                <Input name="rtlUrl" defaultValue={editingMatch.rtlUrl || ""} placeholder="https://play.rtl.lu/..." />
              </div>

              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setEditingMatch(null)}>
                  Abbrechen
                </Button>
                <Button type="submit" disabled={updateMut.isPending}>
                  Speichern
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function MatchCard({ 
  match, 
  canManage, 
  onEdit, 
  onDelete, 
  isLive = false 
}: { 
  match: Match; 
  canManage: boolean; 
  onEdit: () => void; 
  onDelete: () => void;
  isLive?: boolean;
}) {
  const statusColor = {
    scheduled: "border-l-blue-500",
    live: "border-l-green-500",
    finished: "border-l-gray-500",
    cancelled: "border-l-red-500",
  }[match.status] || "border-l-gray-300";

  return (
    <Card className={`border-l-4 ${statusColor}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{match.competition}</Badge>
              <span className="text-sm text-muted-foreground">
                <Calendar className="w-3 h-3 inline mr-1" />
                {new Date(match.matchDate).toLocaleDateString("de-DE")}
                {match.matchTime && ` ${match.matchTime}`}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right flex-1">
                <p className="font-semibold">{match.homeTeam}</p>
              </div>
              <div className="px-4 py-2 bg-muted rounded-lg font-bold text-lg">
                {match.status === "finished" ? (
                  `${match.homeScore}:${match.awayScore}`
                ) : match.status === "live" ? (
                  <span className="text-green-600 animate-pulse">LIVE</span>
                ) : (
                  "vs"
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{match.awayTeam}</p>
              </div>
            </div>

            {match.venue && (
              <p className="text-sm text-muted-foreground mt-2">
                <MapPin className="w-3 h-3 inline mr-1" />
                {match.venue}
              </p>
            )}

            {(match.sboUrl || match.rtlUrl) && (
              <div className="flex items-center gap-2 mt-2">
                {match.sboUrl && (
                  <a href={match.sboUrl} target="_blank" rel="noopener" className="text-xs flex items-center gap-1 text-blue-600 hover:underline">
                    <ExternalLink className="w-3 h-3" />
                    SBO Report
                  </a>
                )}
                {match.rtlUrl && (
                  <a href={match.rtlUrl} target="_blank" rel="noopener" className="text-xs flex items-center gap-1 text-orange-600 hover:underline">
                    <Play className="w-3 h-3" />
                    RTL Live/Replay
                  </a>
                )}
              </div>
            )}
          </div>

          {canManage && (
            <div className="flex items-center gap-1 ml-4">
              <Button variant="ghost" size="icon" onClick={onEdit}>
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onDelete}>
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StandingsTable({ competition, season }: { competition: string; season: string }) {
  const { data: standings = [] } = useQuery({
    queryKey: ["/api/standings", competition, season],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/standings?competition=${competition}&season=${season}`);
      return res.json();
    },
    enabled: !!competition && !!season,
  });

  if (standings.length === 0) {
    return <p className="text-center text-muted-foreground py-8">Keine Tabellendaten. Klicke "Berechnen" um die Tabelle zu erstellen.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 px-2">#</th>
            <th className="text-left py-2 px-2">Team</th>
            <th className="text-center py-2 px-2">Sp</th>
            <th className="text-center py-2 px-2">S</th>
            <th className="text-center py-2 px-2">U</th>
            <th className="text-center py-2 px-2">N</th>
            <th className="text-center py-2 px-2">Tore</th>
            <th className="text-center py-2 px-2">Diff</th>
            <th className="text-center py-2 px-2 font-bold">Pkt</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((team: any) => (
            <tr key={team.id} className={`border-b hover:bg-muted/50 ${team.teamName.includes("Mersch") ? "bg-primary/5 font-medium" : ""}`}>
              <td className="py-2 px-2">{team.position}</td>
              <td className="py-2 px-2">{team.teamName}</td>
              <td className="text-center py-2 px-2">{team.played}</td>
              <td className="text-center py-2 px-2 text-green-600">{team.won}</td>
              <td className="text-center py-2 px-2">{team.drawn}</td>
              <td className="text-center py-2 px-2 text-red-600">{team.lost}</td>
              <td className="text-center py-2 px-2">{team.goalsFor}:{team.goalsAgainst}</td>
              <td className="text-center py-2 px-2">{team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}</td>
              <td className="text-center py-2 px-2 font-bold">{team.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
