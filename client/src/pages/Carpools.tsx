import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { Plus, Trash2, Users } from "lucide-react";
import type { Carpool, CarpoolPassenger, Event, User } from "@shared/schema";

type CarpoolWithPassengers = Carpool & { passengers: CarpoolPassenger[] };

export default function Carpools() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const { data: events = [] } = useQuery<Event[]>({ queryKey: ["/api/events"] });
  const { data: carpools = [] } = useQuery<CarpoolWithPassengers[]>({ queryKey: ["/api/carpools"] });
  const { data: users = [] } = useQuery<User[]>({ queryKey: ["/api/users"] });

  const futureEvents = events
    .filter((e) => e.date >= new Date().toISOString().slice(0, 10))
    .sort((a, b) => a.date.localeCompare(b.date) || (a.time || "").localeCompare(b.time || ""));

  const createCarpool = useMutation({
    mutationFn: (body: any) => apiRequest("POST", "/api/carpools", body).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/carpools"] });
      setOpen(false);
      toast({ title: "Fahrgemeinschaft erstellt" });
    },
    onError: (e: any) => toast({ title: "Fehler", description: e.message, variant: "destructive" }),
  });

  const join = useMutation({
    mutationFn: (id: number) => apiRequest("POST", `/api/carpools/${id}/join`, {}).then((r) => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/carpools"] }),
  });

  const leave = useMutation({
    mutationFn: (id: number) => apiRequest("POST", `/api/carpools/${id}/leave`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/carpools"] }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/carpools/${id}`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/carpools"] }),
  });

  const getUser = (id?: number) => users.find((u) => u.id === id);

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Fahrgemeinschaften</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="size-4 mr-2" /> Mitfahrgelegenheit anbieten</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Neue Fahrgemeinschaft</DialogTitle></DialogHeader>
            <CarpoolForm events={futureEvents} onSubmit={(data) => createCarpool.mutate(data)} loading={createCarpool.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {carpools.map((c) => {
          const event = events.find((e) => e.id === c.eventId);
          const taken = c.passengers?.length || 0;
          const isDriver = c.driverId === user?.id;
          const isPassenger = c.passengers?.some((p) => p.passengerId === user?.id);
          return (
            <Card key={c.id}>
              <CardHeader>
                <CardTitle className="text-base flex justify-between items-center">
                  <span>{event?.title || `Event #${c.eventId}`}</span>
                  {isDriver && <Button variant="ghost" size="icon" onClick={() => c.id && remove.mutate(c.id)}><Trash2 className="size-4" /></Button>}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                <p className="text-muted-foreground">{event?.date} {event?.time} · {event?.location}</p>
                <div className="flex items-center gap-2">
                  <Users className="size-4" />
                  <span>{taken + 1} / {c.availableSeats + 1} Plätze belegt</span>
                </div>
                <p><span className="font-medium">Fahrer:</span> {getUser(c.driverId)?.name || `User #${c.driverId}`}</p>
                <p><span className="font-medium">Abfahrt:</span> {c.departureTime} · {c.departureLocation}</p>
                {c.notes && <p className="text-muted-foreground">{c.notes}</p>}
                {c.passengers && c.passengers.length > 0 && (
                  <div className="text-muted-foreground">
                    <span className="font-medium text-foreground">Mitfahrer:</span>{" "}
                    {c.passengers.map((p) => getUser(p.passengerId)?.name || `User #${p.passengerId}`).join(", ")}
                  </div>
                )}
                <div className="flex gap-2">
                  {isDriver ? null : isPassenger ? (
                    <Button size="sm" variant="outline" onClick={() => c.id && leave.mutate(c.id)}>Austragen</Button>
                  ) : (
                    <Button size="sm" onClick={() => c.id && join.mutate(c.id)} disabled={taken >= c.availableSeats}>Einsteigen</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function CarpoolForm({ events, onSubmit, loading }: { events: Event[]; onSubmit: (data: any) => void; loading: boolean }) {
  const { register, handleSubmit, watch, setValue } = useForm({ defaultValues: { eventId: "", departureTime: "", departureLocation: "", availableSeats: "4", notes: "" } });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Termin</Label>
        <Select value={watch("eventId")} onValueChange={(v) => setValue("eventId", v)}>
          <SelectTrigger><SelectValue placeholder="Termin wählen" /></SelectTrigger>
          <SelectContent>
            {events.map((e) => <SelectItem key={e.id} value={String(e.id)}>{e.title} ({e.date})</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Abfahrtszeit</Label><Input type="time" {...register("departureTime", { required: true })} /></div>
        <div className="space-y-2"><Label>Freie Plätze</Label><Input type="number" {...register("availableSeats", { required: true })} /></div>
      </div>
      <div className="space-y-2"><Label>Abfahrtsort</Label><Input {...register("departureLocation", { required: true })} placeholder="z. B. Sporthalle" /></div>
      <div className="space-y-2"><Label>Notiz</Label><Textarea {...register("notes")} /></div>
      <Button type="submit" disabled={loading || !watch("eventId")} className="w-full">Erstellen</Button>
    </form>
  );
}
