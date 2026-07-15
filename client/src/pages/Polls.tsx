import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, BarChart3, XCircle } from "lucide-react";
import type { Poll, PollOption } from "@shared/schema";

type PollDetail = Poll & { options: PollOption[]; results: { optionId: number; count: number }[] };

export default function Polls() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: polls = [] } = useQuery<Poll[]>({ queryKey: ["/api/polls"] });

  const createPoll = useMutation({
    mutationFn: (body: any) => apiRequest("POST", "/api/polls", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/polls"] });
      setOpen(false);
      toast({ title: "Umfrage erstellt" });
    },
    onError: (e: any) => toast({ title: "Fehler", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Umfragen</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="size-4 mr-2" /> Neue Umfrage</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Neue Umfrage</DialogTitle></DialogHeader>
            <PollForm onSubmit={(data) => createPoll.mutate(data)} loading={createPoll.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {polls.map((poll) => (
          <PollCard key={poll.id} poll={poll} />
        ))}
      </div>
    </div>
  );
}

function PollForm({ onSubmit, loading }: { onSubmit: (data: any) => void; loading: boolean }) {
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: { title: "", description: "", type: "single", anonymous: false, options: ["", ""] },
  });
  const type = watch("type");
  const options: string[] = watch("options") || [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Titel</Label>
        <Input id="title" {...register("title", { required: true })} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Beschreibung</Label>
        <Textarea id="description" {...register("description")} />
      </div>
      <div className="space-y-2">
        <Label>Art</Label>
        <select {...register("type")} value={type} onChange={(e) => setValue("type", e.target.value)} className="w-full border rounded p-2">
          <option value="single">Eine Antwort</option>
          <option value="multiple">Mehrere Antworten</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="anonymous" {...register("anonymous")} />
        <Label htmlFor="anonymous" className="font-normal">Anonyme Abstimmung</Label>
      </div>
      <div className="space-y-2">
        <Label>Antwortmöglichkeiten</Label>
        {options.map((opt, i) => (
          <div key={i} className="flex gap-2">
            <Input value={opt} onChange={(e) => {
              const next = [...options];
              next[i] = e.target.value;
              setValue("options", next);
            }} placeholder={`Option ${i + 1}`} />
            {options.length > 2 && (
              <Button type="button" variant="ghost" size="icon" onClick={() => setValue("options", options.filter((_, idx) => idx !== i))}><XCircle className="size-4" /></Button>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" onClick={() => setValue("options", [...options, ""])}>Option hinzufügen</Button>
      </div>
      <Button type="submit" disabled={loading} className="w-full">{loading ? "Speichern..." : "Erstellen"}</Button>
    </form>
  );
}

function PollCard({ poll }: { poll: Poll }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: detail } = useQuery<PollDetail>({
    queryKey: ["/api/polls", poll.id],
    enabled: !!poll.id,
  });

  const vote = useMutation({
    mutationFn: (optionIds: number[]) => apiRequest("POST", `/api/polls/${poll.id}/vote`, { optionIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/polls"] });
      queryClient.invalidateQueries({ queryKey: ["/api/polls", poll.id] });
      toast({ title: "Abgestimmt" });
    },
    onError: (e: any) => toast({ title: "Fehler", description: e.message, variant: "destructive" }),
  });

  const closePoll = useMutation({
    mutationFn: () => apiRequest("PATCH", `/api/polls/${poll.id}/close`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/polls"] });
      toast({ title: "Umfrage geschlossen" });
    },
  });

  const [selected, setSelected] = useState<number[]>([]);
  const options = detail?.options || [];
  const results = detail?.results || [];
  const totalVotes = results.reduce((sum, r) => sum + r.count, 0);
  const isSingle = poll.type !== "multiple";
  const closed = poll.status === "closed";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-start justify-between">
          <span>{poll.title}</span>
          {closed ? <span className="text-xs bg-muted px-2 py-1 rounded">Geschlossen</span> : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {poll.description && <p className="text-sm text-muted-foreground">{poll.description}</p>}
        {closed ? (
          <div className="space-y-2">
            {options.map((opt) => {
              const count = results.find((r) => r.optionId === opt.id)?.count || 0;
              const pct = totalVotes ? Math.round((count / totalVotes) * 100) : 0;
              return (
                <div key={opt.id} className="space-y-1">
                  <div className="flex justify-between text-sm"><span>{opt.optionText}</span><span>{count} ({pct}%)</span></div>
                  <div className="h-2 bg-muted rounded"><div className="h-2 bg-primary rounded" style={{ width: `${pct}%` }} /></div>
                </div>
              );
            })}
          </div>
        ) : (
          <>
            {isSingle ? (
              <RadioGroup value={String(selected[0] || "")} onValueChange={(v) => setSelected([Number(v)])}>
                {options.map((opt) => (
                  <div key={opt.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={String(opt.id)} id={`opt-${opt.id}`} />
                    <Label htmlFor={`opt-${opt.id}`} className="font-normal">{opt.optionText}</Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="space-y-2">
                {options.map((opt) => (
                  <div key={opt.id} className="flex items-center gap-2">
                    <Checkbox id={`opt-${opt.id}`} checked={selected.includes(opt.id!)} onCheckedChange={(checked) => setSelected(prev => checked ? [...prev, opt.id!] : prev.filter(id => id !== opt.id))} />
                    <Label htmlFor={`opt-${opt.id}`} className="font-normal">{opt.optionText}</Label>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Button size="sm" onClick={() => vote.mutate(selected)} disabled={selected.length === 0 || vote.isPending}>Abstimmen</Button>
              <Button size="sm" variant="outline" onClick={() => closePoll.mutate()}><BarChart3 className="size-4 mr-1" /> Schließen</Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
