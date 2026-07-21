import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Team } from "@shared/schema";
import { Upload, Eye, Play } from "lucide-react";

export default function ScheduleImport() {
  const { toast } = useToast();
  const [teamId, setTeamId] = useState<string>("");
  const [season, setSeason] = useState("2025-2026");
  const [competition, setCompetition] = useState("H-PRO");
  const [type, setType] = useState<string>("csv");
  const [content, setContent] = useState("");
  const [preview, setPreview] = useState<any[] | null>(null);

  const { data: teams = [] } = useQuery<Team[]>({ queryKey: ["/api/teams"] });

  const previewMut = useMutation({
    mutationFn: async () =>
      (await apiRequest("POST", "/api/matches/import/preview", { teamId: Number(teamId), season, competition, type, content })).json() as Promise<{ rows: any[] }>,
    onSuccess: (data) => { setPreview(data.rows); },
    onError: (e: any) => toast({ title: "Vorschau fehlgeschlagen", description: String(e?.message || e), variant: "destructive" }),
  });

  const importMut = useMutation({
    mutationFn: async () =>
      (await apiRequest("POST", "/api/matches/import", { teamId: Number(teamId), season, competition, type, content })).json() as Promise<{ created: number }>,
    onSuccess: (data) => {
      toast({ title: `${data.created} Spiele importiert` });
      setContent("");
      setPreview(null);
    },
    onError: (e: any) => toast({ title: "Import fehlgeschlagen", description: String(e?.message || e), variant: "destructive" }),
  });

  return (
    <div className="space-y-5 max-w-5xl">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight">Spielplan Import</h1>
        <p className="text-sm text-muted-foreground">.ics oder .csv vrbereeden a Spiller an Lageren</p>
      </div>

      <Card className="rounded-2xl shadow-sm border-none overflow-hidden">
        <CardHeader className="bg-gradient-to-br from-primary to-[#001A3A] text-primary-foreground py-4">
          <CardTitle className="text-base font-bold flex items-center gap-2"><Upload className="size-4" /> Import virbereeden</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Mannschaft</Label>
              <Select value={teamId} onValueChange={setTeamId}>
                <SelectTrigger><SelectValue placeholder="Team wählen" /></SelectTrigger>
                <SelectContent>
                  {teams.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Format</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV / Excel (Text)</SelectItem>
                  <SelectItem value="ics">ICS Kalender</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Saison</Label>
              <Input value={season} onChange={e => setSeason(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Wettbewerb (Fallback)</Label>
              <Input value={competition} onChange={e => setCompetition(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Datei-Inhalt (heihannen drécken)</Label>
            <Textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={type === "ics" ? "BEGIN:VCALENDAR..." : "Datum;Zeit;Heim;Gast;Halle\n21.09.2025;15:00;Mersch 75;Red Boys;Sporthalle"}
              rows={10}
              className="text-xs font-mono"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => previewMut.mutate()} disabled={!teamId || !content || previewMut.isPending} className="gap-1">
              <Eye className="size-4" /> Vorschau
            </Button>
            <Button variant="default" onClick={() => importMut.mutate()} disabled={!teamId || !content || importMut.isPending || preview === null} className="gap-1">
              <Play className="size-4" /> Importéieren
            </Button>
          </div>
        </CardContent>
      </Card>

      {preview !== null && (
        <Card className="rounded-2xl shadow-sm border-none overflow-hidden">
          <CardHeader className="py-4">
            <CardTitle className="text-base flex items-center gap-2"><Eye className="size-4" /> Vorschau ({preview.length} Spiller)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {preview.length === 0 ? (
              <p className="p-8 text-center text-sm text-muted-foreground">Keng Spiller erkannt.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-primary to-[#001A3A] hover:from-primary hover:to-[#001A3A] border-none">
                      <TableHead className="text-primary-foreground">Datum</TableHead>
                      <TableHead className="text-primary-foreground">Zäit</TableHead>
                      <TableHead className="text-primary-foreground">Heem</TableHead>
                      <TableHead className="text-primary-foreground">Gäscht</TableHead>
                      <TableHead className="text-primary-foreground">Halle</TableHead>
                      <TableHead className="text-primary-foreground">Wettbewerb</TableHead>
                      <TableHead className="text-primary-foreground">Heemspill</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell>{row.matchDate}</TableCell>
                        <TableCell>{row.matchTime || "—"}</TableCell>
                        <TableCell className="font-medium">{row.homeTeam}</TableCell>
                        <TableCell>{row.awayTeam}</TableCell>
                        <TableCell>{row.venue || "—"}</TableCell>
                        <TableCell>{row.competition}</TableCell>
                        <TableCell>
                          {row.isHome ? <Badge className="bg-emerald-100 text-emerald-700">Jo</Badge> : <Badge variant="outline">Nee</Badge>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
