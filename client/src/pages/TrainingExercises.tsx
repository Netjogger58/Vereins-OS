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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Trash2, Clock, Users } from "lucide-react";
import type { Exercise, ExerciseMedia } from "@shared/schema";

type ExerciseDetail = Exercise & { media: ExerciseMedia[] };

const CATEGORIES = ["technique", "tactics", "fitness", "goalkeeping", "warmup", "game"];

export default function TrainingExercises() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");

  const { data: exercises = [] } = useQuery<ExerciseDetail[]>({ queryKey: ["/api/exercises"] });
  const create = useMutation({
    mutationFn: (body: any) => apiRequest("POST", "/api/exercises", body).then((r) => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/exercises"] }); setOpen(false); toast({ title: "Übung erstellt" }); },
  });
  const remove = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/exercises/${id}`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/exercises"] }),
  });

  const filtered = exercises.filter((e) =>
    e.title.toLowerCase().includes(filter.toLowerCase()) ||
    (e.tags || "").toLowerCase().includes(filter.toLowerCase()) ||
    e.category.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Übungsdatenbank</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="size-4 mr-2" /> Übung hinzufügen</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Neue Übung</DialogTitle></DialogHeader>
            <ExerciseForm onSubmit={(data) => create.mutate(data)} loading={create.isPending} />
          </DialogContent>
        </Dialog>
      </div>
      <Input placeholder="Suche nach Titel, Tags oder Kategorie" value={filter} onChange={(e) => setFilter(e.target.value)} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((ex) => (
          <Card key={ex.id}>
            <CardHeader>
              <CardTitle className="text-base flex justify-between items-start">
                <span>{ex.title}</span>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => remove.mutate(ex.id!)}><Trash2 className="size-4" /></Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary">{ex.category}</Badge>
                {(ex.tags || "").split(",").filter(Boolean).map((t) => <Badge key={t} variant="outline">{t.trim()}</Badge>)}
              </div>
              {ex.description && <p className="text-muted-foreground">{ex.description}</p>}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {ex.durationMinutes && <span><Clock className="size-3 inline" /> {ex.durationMinutes} min</span>}
                {ex.minAge && <span><Users className="size-3 inline" /> {ex.minAge}-{ex.maxAge || "∞"} J.</span>}
              </div>
              {ex.media?.length > 0 && <div className="grid grid-cols-3 gap-2 mt-2">
                {ex.media.map((m) => <a key={m.id} href={m.fileUrl} target="_blank" rel="noreferrer" className="text-xs underline truncate">{m.fileName || "Anhang"}</a>)}
              </div>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ExerciseForm({ onSubmit, loading }: { onSubmit: (data: any) => void; loading: boolean }) {
  const { register, handleSubmit, watch, setValue } = useForm({ defaultValues: { title: "", description: "", category: "technique", tags: "", minAge: "", maxAge: "", durationMinutes: "" } });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1"><Label>Titel</Label><Input {...register("title", { required: true })} /></div>
      <div className="space-y-1"><Label>Kategorie</Label>
        <Select value={watch("category")} onValueChange={(v) => setValue("category", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-1"><Label>Beschreibung</Label><Textarea {...register("description")} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1"><Label>Tags (kommagetrennt)</Label><Input {...register("tags")} /></div>
        <div className="space-y-1"><Label>Dauer (Min.)</Label><Input type="number" {...register("durationMinutes")} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1"><Label>Min. Alter</Label><Input type="number" {...register("minAge")} /></div>
        <div className="space-y-1"><Label>Max. Alter</Label><Input type="number" {...register("maxAge")} /></div>
      </div>
      <Button type="submit" disabled={loading} className="w-full">Speichern</Button>
    </form>
  );
}
