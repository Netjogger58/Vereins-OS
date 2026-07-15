import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Trash2, Save, TrendingUp } from "lucide-react";
import type { Opponent, OpponentHistory, Match } from "@shared/schema";

type OpponentDetail = Opponent & { history: OpponentHistory[]; stats: { wins: number; losses: number; draws: number } };

export default function Opponents() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<OpponentDetail | null>(null);

  const { data: opponents = [] } = useQuery<OpponentDetail[]>({ queryKey: ["/api/opponents"] });

  const createOpponent = useMutation({
    mutationFn: (body: any) => apiRequest("POST", "/api/opponents", body).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/opponents"] });
      toast({ title: "Gegner erstellt" });
    },
    onError: (e: any) => toast({ title: "Fehler", description: e.message, variant: "destructive" }),
  });

  const deleteOpponent = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/opponents/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/opponents"] });
      setSelected(null);
      toast({ title: "Gegner gelöscht" });
    },
  });

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Gegner-Scouting</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button><Plus className="size-4 mr-2" /> Gegner hinzufügen</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Neuer Gegner</DialogTitle></DialogHeader>
            <OpponentForm onSubmit={(data) => createOpponent.mutate(data)} loading={createOpponent.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {opponents.map((o) => (
          <Card key={o.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelected(o)}>
            <CardHeader>
              <CardTitle className="text-base flex justify-between items-center">
                <span>{o.name}</span>
                <span className="text-xs font-normal text-muted-foreground">{o.stats.wins}S {o.stats.draws}U {o.stats.losses}N</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              {o.venue && <p><span className="font-medium">Halle:</span> {o.venue}</p>}
              {o.contactPerson && <p><span className="font-medium">Kontakt:</span> {o.contactPerson}</p>}
              {o.strengths && <p className="text-muted-foreground line-clamp-2"><span className="font-medium text-foreground">Stärken:</span> {o.strengths}</p>}
              {o.weaknesses && <p className="text-muted-foreground line-clamp-2"><span className="font-medium text-foreground">Schwächen:</span> {o.weaknesses}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {selected && (
        <OpponentDetailDialog opponent={selected} onClose={() => setSelected(null)} onDelete={() => selected.id && deleteOpponent.mutate(selected.id)} />
      )}
    </div>
  );
}

function OpponentForm({ onSubmit, loading, defaultValues }: { onSubmit: (data: any) => void; loading: boolean; defaultValues?: any }) {
  const { register, handleSubmit } = useForm({ defaultValues });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2"><Label>Name</Label><Input {...register("name", { required: true })} /></div>
      <div className="space-y-2"><Label>Kurzname</Label><Input {...register("shortName")} /></div>
      <div className="space-y-2"><Label>Halle / Ort</Label><Input {...register("venue")} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Kontakt</Label><Input {...register("contactPerson")} /></div>
        <div className="space-y-2"><Label>Telefon</Label><Input {...register("contactPhone")} /></div>
      </div>
      <div className="space-y-2"><Label>E-Mail</Label><Input type="email" {...register("contactEmail")} /></div>
      <div className="space-y-2"><Label>Stärken</Label><Textarea {...register("strengths")} /></div>
      <div className="space-y-2"><Label>Schwächen</Label><Textarea {...register("weaknesses")} /></div>
      <div className="space-y-2"><Label>Notizen</Label><Textarea {...register("notes")} /></div>
      <Button type="submit" disabled={loading} className="w-full"><Save className="size-4 mr-2" /> {loading ? "Speichern..." : "Speichern"}</Button>
    </form>
  );
}

function OpponentDetailDialog({ opponent, onClose, onDelete }: { opponent: OpponentDetail; onClose: () => void; onDelete: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showEdit, setShowEdit] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const { data: matches = [] } = useQuery<Match[]>({ queryKey: ["/api/opponents/matches"] });

  const updateOpponent = useMutation({
    mutationFn: (body: any) => apiRequest("PUT", `/api/opponents/${opponent.id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/opponents"] });
      setShowEdit(false);
      toast({ title: "Gegner aktualisiert" });
    },
    onError: (e: any) => toast({ title: "Fehler", description: e.message, variant: "destructive" }),
  });

  const addHistory = useMutation({
    mutationFn: (body: any) => apiRequest("POST", `/api/opponents/${opponent.id}/history`, body).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/opponents"] });
      setShowHistory(false);
      toast({ title: "Historie hinzugefügt" });
    },
    onError: (e: any) => toast({ title: "Fehler", description: e.message, variant: "destructive" }),
  });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {opponent.name}
            <span className="text-sm font-normal text-muted-foreground">{opponent.stats.wins} Siege · {opponent.stats.draws} Remis · {opponent.stats.losses} Niederlagen</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {showEdit ? (
            <OpponentForm defaultValues={opponent} onSubmit={(data) => updateOpponent.mutate(data)} loading={updateOpponent.isPending} />
          ) : (
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              {opponent.venue && <p><span className="font-medium">Halle:</span> {opponent.venue}</p>}
              {opponent.contactPerson && <p><span className="font-medium">Kontakt:</span> {opponent.contactPerson}</p>}
              {opponent.contactPhone && <p><span className="font-medium">Tel:</span> {opponent.contactPhone}</p>}
              {opponent.contactEmail && <p><span className="font-medium">Mail:</span> {opponent.contactEmail}</p>}
              {opponent.strengths && <div className="md:col-span-2"><span className="font-medium">Stärken:</span> {opponent.strengths}</div>}
              {opponent.weaknesses && <div className="md:col-span-2"><span className="font-medium">Schwächen:</span> {opponent.weaknesses}</div>}
              {opponent.notes && <div className="md:col-span-2"><span className="font-medium">Notizen:</span> {opponent.notes}</div>}
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowEdit(!showEdit)}><Save className="size-4 mr-1" /> {showEdit ? "Abbrechen" : "Bearbeiten"}</Button>
            <Button variant="outline" size="sm" onClick={() => setShowHistory(!showHistory)}><TrendingUp className="size-4 mr-1" /> Ergebnis erfassen</Button>
            <Button variant="destructive" size="sm" onClick={onDelete} className="ml-auto"><Trash2 className="size-4 mr-1" /> Löschen</Button>
          </div>

          {showHistory && (
            <HistoryForm matches={matches} onSubmit={(data) => addHistory.mutate(data)} loading={addHistory.isPending} />
          )}

          {opponent.history.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Bisherige Spiele</h3>
              {opponent.history.map((h) => (
                <Card key={h.id}>
                  <CardContent className="p-3 text-sm flex justify-between">
                    <span>Spiel-ID {h.matchId}</span>
                    <span className="font-semibold">{h.ourScore} : {h.theirScore}</span>
                    <span className="text-muted-foreground capitalize">{h.result}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function HistoryForm({ matches, onSubmit, loading }: { matches: Match[]; onSubmit: (data: any) => void; loading: boolean }) {
  const { register, handleSubmit, watch, setValue } = useForm({ defaultValues: { matchId: "", ourScore: "", theirScore: "", result: "win", matchNotes: "", keyPlayers: "", tactics: "" } });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 border rounded p-4 bg-muted/30">
      <div className="space-y-2">
        <Label>Spiel</Label>
        <Select value={watch("matchId")} onValueChange={(v) => setValue("matchId", v)}>
          <SelectTrigger><SelectValue placeholder="Spiel wählen" /></SelectTrigger>
          <SelectContent>
            {matches.map((m) => <SelectItem key={m.id} value={String(m.id)}>{m.homeTeam} vs {m.awayTeam} ({m.matchDate})</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2"><Label>Unsere Tore</Label><Input type="number" {...register("ourScore", { required: true })} /></div>
        <div className="space-y-2"><Label>Gegner-Tore</Label><Input type="number" {...register("theirScore", { required: true })} /></div>
        <div className="space-y-2"><Label>Ergebnis</Label>
          <select {...register("result")} className="w-full border rounded p-2 h-10">
            <option value="win">Sieg</option>
            <option value="draw">Remis</option>
            <option value="loss">Niederlage</option>
          </select>
        </div>
      </div>
      <div className="space-y-2"><Label>Notizen</Label><Textarea {...register("matchNotes")} /></div>
      <div className="space-y-2"><Label>Wichtige Spieler (kommasepariert)</Label><Input {...register("keyPlayers")} /></div>
      <div className="space-y-2"><Label>Taktik</Label><Textarea {...register("tactics")} /></div>
      <Button type="submit" disabled={loading || !watch("matchId")}>Ergebnis speichern</Button>
    </form>
  );
}
