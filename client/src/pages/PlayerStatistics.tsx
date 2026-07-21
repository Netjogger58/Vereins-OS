import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { 
  Trophy, 
  Target, 
  Users, 
  TrendingUp,
  Award,
  Activity,
  Download,
  Filter
} from "lucide-react";

const COMPETITIONS = [
  { value: "", label: "Alle Ligen" },
  { value: "H-PRO", label: "Herren PRO" },
  { value: "D-PRO", label: "Damen PRO" },
  { value: "U15", label: "U15" },
  { value: "U13", label: "U13" },
  { value: "U11", label: "U11" },
  { value: "U9", label: "U9" },
  { value: "U7", label: "U7" },
  { value: "Pokal", label: "Pokal" },
];

interface TopScorer {
  playerId: number | null;
  playerName: string;
  teamName: string;
  goals: number;
  assists: number;
  matches: number;
}

export default function PlayerStatistics() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedSeason, setSelectedSeason] = useState("2025-2026");
  const [selectedCompetition, setSelectedCompetition] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: topScorers = [], isLoading } = useQuery<TopScorer[]>({
    queryKey: ["/api/top-scorers", selectedCompetition, selectedSeason],
    queryFn: async () => {
      let url = `/api/top-scorers?season=${selectedSeason}&limit=50`;
      if (selectedCompetition) url += `&competition=${selectedCompetition}`;
      const res = await apiRequest("GET", url);
      return res.json();
    },
  });

  // Filter by search term
  const filteredScorers = topScorers.filter(player => 
    player.playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.teamName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const totalGoals = filteredScorers.reduce((sum, p) => sum + p.goals, 0);
  const totalAssists = filteredScorers.reduce((sum, p) => sum + p.assists, 0);
  const totalPlayers = filteredScorers.length;

  const exportToCSV = () => {
    const headers = ["Rang", "Spieler", "Team", "Tore", "Vorlagen", "Spiele"];
    const rows = filteredScorers.map((p, i) => [
      i + 1,
      p.playerName,
      p.teamName,
      p.goals,
      p.assists,
      p.matches
    ]);
    
    const csv = [headers, ...rows]
      .map(row => row.join(";"))
      .join("\n");
    
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `spielerstatistiken_${selectedSeason}.csv`;
    link.click();
    
    toast({ title: "CSV exportiert" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            Spielerstatistiken
          </h1>
          <p className="text-sm text-muted-foreground">
            Tore, Vorlagen und mehr aus allen Spielen
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-1" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Tore</p>
                <p className="text-2xl font-bold">{totalGoals}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Vorlagen</p>
                <p className="text-2xl font-bold">{totalAssists}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Spieler</p>
                <p className="text-2xl font-bold">{totalPlayers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Ø Tore/Spiel</p>
                <p className="text-2xl font-bold">
                  {totalPlayers > 0 ? (totalGoals / totalPlayers).toFixed(1) : "0.0"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filter:</span>
            </div>
            
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
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Alle Ligen" />
              </SelectTrigger>
              <SelectContent>
                {COMPETITIONS.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input 
              placeholder="Spieler suchen..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-[200px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Top Scorers — SpielerPlus-Styl */}
      <Card className="rounded-2xl shadow-sm border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Award className="w-5 h-5" />
            Torschützen-Rangliste
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8">Lade Statistiken...</p>
          ) : filteredScorers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Keine Spielerstatistiken vorhanden
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredScorers.map((player, index) => {
                const avg = player.matches > 0 ? (player.goals / player.matches).toFixed(2) : "0.00";
                const gradient =
                  index === 0 ? "from-yellow-500 to-amber-600" :
                  index === 1 ? "from-slate-400 to-slate-500" :
                  index === 2 ? "from-amber-600 to-orange-700" :
                  "from-primary to-[#001A3A]";

                return (
                  <Card
                    key={`${player.playerId || 'guest'}-${player.playerName}`}
                    className="rounded-2xl overflow-hidden border-none shadow-sm"
                  >
                    <div className={`bg-gradient-to-br ${gradient} p-4 text-primary-foreground`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-bold truncate max-w-[160px]">{player.playerName}</div>
                            <div className="text-xs text-white/80">{player.teamName}</div>
                          </div>
                        </div>
                        <Trophy className="size-5 text-white/70" />
                      </div>
                    </div>
                    <CardContent className="p-4 grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-lg font-extrabold text-blue-600">{player.goals}</div>
                        <div className="text-[10px] text-muted-foreground uppercase">Tore</div>
                      </div>
                      <div>
                        <div className="text-lg font-extrabold text-green-600">{player.assists}</div>
                        <div className="text-[10px] text-muted-foreground uppercase">Vorlagen</div>
                      </div>
                      <div>
                        <div className="text-lg font-extrabold text-purple-600">{player.matches}</div>
                        <div className="text-[10px] text-muted-foreground uppercase">Spiele</div>
                      </div>
                      <div className="col-span-3 pt-2 border-t">
                        <div className="text-sm font-medium">Ø {avg} Tore/Spiel</div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Award className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Hinweis zur Datenquelle</p>
              <p className="text-sm text-muted-foreground">
                Die Statistiken werden automatisch aus den FLH Spielberichten (handball4all.de) importiert. 
                Sie können unter "Spiele" → "FLH Import" manuell aktualisiert werden.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
