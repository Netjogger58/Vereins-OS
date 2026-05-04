import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Plus, MapPin, Clock, Video, Check, X } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { Event, Team } from "@shared/schema";

const EVENT_STYLES: Record<string, { bg: string; dot: string; label: string; text: string }> = {
  training: { bg: "bg-chart-1/15", dot: "bg-chart-1", label: "Training", text: "text-chart-1" },
  spiel: { bg: "bg-emerald-500/15", dot: "bg-emerald-500", label: "Spiel", text: "text-emerald-700 dark:text-emerald-400" },
  meeting: { bg: "bg-primary/15", dot: "bg-primary", label: "Meeting", text: "text-primary" },
  event: { bg: "bg-secondary/25", dot: "bg-secondary", label: "Event", text: "text-secondary-foreground" },
};

export default function Calendar() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [month, setMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    title: "", type: "training", teamId: "", date: "", time: "", location: "", description: "",
  });

  const { data: events = [] } = useQuery<Event[]>({ queryKey: ["/api/events"] });
  const { data: teams = [] } = useQuery<Team[]>({ queryKey: ["/api/teams"] });

  const createMut = useMutation({
    mutationFn: async (data: any) => (await apiRequest("POST", "/api/events", {
      ...data, teamId: data.teamId ? Number(data.teamId) : null,
    })).json(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setCreateOpen(false);
      toast({ title: "Termin erstellt" });
    },
  });

  const availMut = useMutation({
    mutationFn: async (d: { eventId: number; available: boolean }) =>
      (await apiRequest("POST", "/api/availability", {
        memberId: user?.id || 0,
        eventId: d.eventId,
        available: d.available,
      })).json(),
    onSuccess: () => toast({ title: "Verfügbarkeit gespeichert" }),
  });

  const grid = useMemo(() => {
    const first = new Date(month);
    first.setDate(1);
    const startDow = (first.getDay() + 6) % 7; // Mon-based
    const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    const days: { date: Date; inMonth: boolean }[] = [];
    const startDay = new Date(first);
    startDay.setDate(1 - startDow);
    for (let i = 0; i < 42; i++) {
      const d = new Date(startDay);
      d.setDate(startDay.getDate() + i);
      days.push({ date: d, inMonth: d.getMonth() === first.getMonth() });
    }
    return days;
  }, [month]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, Event[]>();
    for (const e of events) {
      const key = e.date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return map;
  }, [events]);

  const canCreate = user && ["präsident", "admin", "trainer"].includes(user.role);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight">Kalender</h1>
          <p className="text-sm text-muted-foreground">Trainings, Spiele, Meetings & Events</p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => {
            const d = new Date(month);
            d.setMonth(d.getMonth() - 1);
            setMonth(d);
          }} data-testid="button-prev-month">
            <ChevronLeft className="size-4" />
          </Button>
          <span className="px-3 text-sm font-semibold min-w-[140px] text-center">
            {month.toLocaleDateString("de-DE", { month: "long", year: "numeric" })}
          </span>
          <Button variant="ghost" size="icon" onClick={() => {
            const d = new Date(month);
            d.setMonth(d.getMonth() + 1);
            setMonth(d);
          }} data-testid="button-next-month">
            <ChevronRight className="size-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            const d = new Date();
            d.setDate(1);
            setMonth(d);
          }} className="ml-2 text-xs">
            Heute
          </Button>
          {canCreate && (
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="ml-2" data-testid="button-new-event">
                  <Plus className="size-4 mr-1" /> Termin
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Neuer Termin</DialogTitle></DialogHeader>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 space-y-1.5">
                    <Label>Titel</Label>
                    <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Typ</Label>
                    <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="training">Training</SelectItem>
                        <SelectItem value="spiel">Spiel</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Team</Label>
                    <Select value={form.teamId} onValueChange={v => setForm(f => ({ ...f, teamId: v }))}>
                      <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Kein Team</SelectItem>
                        {teams.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Datum</Label>
                    <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Uhrzeit</Label>
                    <Input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label>Ort</Label>
                    <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label>Beschreibung</Label>
                    <Textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setCreateOpen(false)}>Abbrechen</Button>
                  <Button
                    onClick={() => createMut.mutate({ ...form, teamId: form.teamId === "none" ? "" : form.teamId })}
                    disabled={!form.title || !form.date}
                  >
                    Speichern
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Calendar grid */}
      <Card>
        <CardContent className="p-2 md:p-4">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map(d => (
              <div key={d} className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-center py-1">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {grid.map((g, i) => {
              const key = g.date.toISOString().slice(0, 10);
              const evts = eventsByDate.get(key) || [];
              const isToday = key === new Date().toISOString().slice(0, 10);
              return (
                <button
                  key={i}
                  onClick={() => evts[0] && setSelectedEvent(evts[0])}
                  disabled={evts.length === 0}
                  className={cn(
                    "min-h-[70px] md:min-h-[90px] p-1.5 rounded-md border text-left transition-colors",
                    g.inMonth ? "border-border" : "border-transparent opacity-40",
                    isToday && "border-primary ring-1 ring-primary",
                    evts.length > 0 && "hover-elevate cursor-pointer"
                  )}
                >
                  <div className={cn(
                    "text-xs font-semibold mb-1",
                    isToday && "text-primary"
                  )}>
                    {g.date.getDate()}
                  </div>
                  <div className="space-y-0.5">
                    {evts.slice(0, 2).map(e => {
                      const s = EVENT_STYLES[e.type] || EVENT_STYLES.event;
                      return (
                        <div
                          key={e.id}
                          onClick={ev => { ev.stopPropagation(); setSelectedEvent(e); }}
                          className={`${s.bg} ${s.text} text-[10px] rounded px-1 py-0.5 truncate font-medium`}
                        >
                          {e.time && <span className="opacity-70 mr-1">{e.time.slice(0, 5)}</span>}
                          {e.title}
                        </div>
                      );
                    })}
                    {evts.length > 2 && (
                      <div className="text-[10px] text-muted-foreground px-1">+{evts.length - 2} mehr</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming list */}
      <Card>
        <CardHeader><CardTitle className="text-base">Nächste Termine</CardTitle></CardHeader>
        <CardContent className="space-y-2 p-4 pt-0">
          {events.filter(e => e.date >= new Date().toISOString().slice(0, 10)).slice(0, 10).map(e => {
            const s = EVENT_STYLES[e.type] || EVENT_STYLES.event;
            const team = teams.find(t => t.id === e.teamId);
            return (
              <div
                key={e.id}
                className="flex items-center gap-3 p-3 rounded-md border border-border hover-elevate cursor-pointer"
                onClick={() => setSelectedEvent(e)}
              >
                <div className={`size-10 rounded-md ${s.bg} flex items-center justify-center flex-shrink-0`}>
                  <div className={`size-2.5 rounded-full ${s.dot}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{e.title}</span>
                    {team && <Badge variant="outline" className="text-[10px]">{team.name}</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-3 mt-0.5">
                    <span>{new Date(e.date).toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "short" })}</span>
                    {e.time && <span className="flex items-center gap-1"><Clock className="size-3" />{e.time}</span>}
                    {e.location && <span className="flex items-center gap-1 truncate"><MapPin className="size-3" />{e.location}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Event detail */}
      <Dialog open={!!selectedEvent} onOpenChange={v => !v && setSelectedEvent(null)}>
        <DialogContent>
          {selectedEvent && (() => {
            const s = EVENT_STYLES[selectedEvent.type] || EVENT_STYLES.event;
            const team = teams.find(t => t.id === selectedEvent.teamId);
            return (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`size-2 rounded-full ${s.dot}`} />
                    <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                      {s.label}
                    </span>
                  </div>
                  <DialogTitle>{selectedEvent.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-muted-foreground" />
                    {new Date(selectedEvent.date).toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
                    {selectedEvent.time && <span>· {selectedEvent.time}</span>}
                  </div>
                  {selectedEvent.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4 text-muted-foreground" />
                      {selectedEvent.location}
                    </div>
                  )}
                  {team && <Badge variant="outline">{team.name}</Badge>}
                  {selectedEvent.description && (
                    <p className="text-muted-foreground whitespace-pre-wrap">{selectedEvent.description}</p>
                  )}
                  {selectedEvent.jitsiRoom && (
                    <a
                      href={`https://meet.jit.si/${selectedEvent.jitsiRoom}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
                    >
                      <Video className="size-4" /> Jitsi-Meeting beitreten
                    </a>
                  )}

                  {user?.role === "spieler" && (
                    <div className="pt-3 border-t border-border">
                      <p className="text-xs font-semibold mb-2">Deine Verfügbarkeit</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => availMut.mutate({ eventId: selectedEvent.id, available: true })}
                        >
                          <Check className="size-3.5 mr-1" /> Ich kann
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => availMut.mutate({ eventId: selectedEvent.id, available: false })}
                        >
                          <X className="size-3.5 mr-1" /> Ich kann nicht
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
