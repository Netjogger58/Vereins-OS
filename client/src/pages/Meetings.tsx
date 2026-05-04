import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Video, Plus, ExternalLink, Copy, Calendar, Clock } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import type { Meeting } from "@shared/schema";

export default function Meetings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", date: "", time: "", agenda: "" });

  const { data: meetings = [] } = useQuery<Meeting[]>({ queryKey: ["/api/meetings"] });

  const createMut = useMutation({
    mutationFn: async (data: any) => (await apiRequest("POST", "/api/meetings", data)).json(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meetings"] });
      setOpen(false);
      setForm({ title: "", date: "", time: "", agenda: "" });
      toast({ title: "Meeting erstellt", description: "Jitsi-Raum wurde generiert." });
    },
  });

  const canCreate = user && ["präsident", "admin", "trainer"].includes(user.role);

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight">Video-Meetings</h1>
          <p className="text-sm text-muted-foreground">Vorstand · Trainer · Teams</p>
        </div>
        {canCreate && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-new-meeting"><Plus className="size-4 mr-1" /> Meeting</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Neues Video-Meeting</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Titel</Label>
                  <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Datum</Label>
                    <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Uhrzeit</Label>
                    <Input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Agenda</Label>
                  <Textarea rows={4} value={form.agenda} onChange={e => setForm(f => ({ ...f, agenda: e.target.value }))} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Abbrechen</Button>
                <Button onClick={() => createMut.mutate(form)} disabled={!form.title || !form.date || !form.time}>
                  Erstellen
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-3">
        {meetings.length === 0 && (
          <Card><CardContent className="p-12 text-center">
            <Video className="size-10 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Noch keine Meetings geplant</p>
          </CardContent></Card>
        )}
        {meetings.map(m => {
          const url = `https://meet.jit.si/${m.jitsiRoom}`;
          const isPast = new Date(m.date) < new Date(new Date().toISOString().slice(0, 10));
          return (
            <Card key={m.id} className={isPast ? "opacity-70" : ""}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center justify-center size-14 rounded-lg bg-primary text-primary-foreground flex-shrink-0">
                    <Video className="size-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">{m.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><Calendar className="size-3" />
                        {new Date(m.date).toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "short" })}
                      </span>
                      <span className="flex items-center gap-1"><Clock className="size-3" />{m.time}</span>
                    </div>
                    {m.agenda && (
                      <p className="text-xs text-muted-foreground mt-2 whitespace-pre-wrap line-clamp-3">{m.agenda}</p>
                    )}
                    <div className="mt-2 flex items-center gap-2 text-[11px]">
                      <span className="text-muted-foreground">Raum:</span>
                      <code className="px-1.5 py-0.5 rounded bg-muted font-mono">{m.jitsiRoom}</code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(url);
                          toast({ title: "Link kopiert" });
                        }}
                        className="text-muted-foreground hover:text-foreground"
                        title="Link kopieren"
                      >
                        <Copy className="size-3" />
                      </button>
                    </div>
                  </div>
                  <a href={url} target="_blank" rel="noreferrer">
                    <Button size="sm" disabled={isPast} data-testid={`button-join-${m.id}`}>
                      <ExternalLink className="size-3.5 mr-1" /> Beitreten
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
