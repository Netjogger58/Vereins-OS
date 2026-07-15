import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Trash2 } from "lucide-react";
import type { Facility, FacilityBooking } from "@shared/schema";

export default function FacilityBookings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("bookings");

  const { data: facilities = [] } = useQuery<Facility[]>({ queryKey: ["/api/facilities"] });
  const { data: bookings = [] } = useQuery<FacilityBooking[]>({ queryKey: ["/api/facility-bookings"] });

  const createFacility = useMutation({
    mutationFn: (body: any) => apiRequest("POST", "/api/facilities", body).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/facilities"] });
      toast({ title: "Halle erstellt" });
    },
    onError: (e: any) => toast({ title: "Fehler", description: e.message, variant: "destructive" }),
  });

  const createBooking = useMutation({
    mutationFn: (body: any) => apiRequest("POST", "/api/facility-bookings", body).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/facility-bookings"] });
      toast({ title: "Buchung erstellt" });
    },
    onError: (e: any) => toast({ title: "Fehler", description: e.message, variant: "destructive" }),
  });

  const deleteBooking = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/facility-bookings/${id}`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/facility-bookings"] }),
  });

  const sortedBookings = [...bookings].sort((a, b) => (a.date || "").localeCompare(b.date || "") || (a.startTime || "").localeCompare(b.startTime || ""));

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Hallenzuteilung / Raumreservierung</h1>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="bookings">Buchungen</TabsTrigger>
          <TabsTrigger value="facilities">Hallene/Plätze</TabsTrigger>
        </TabsList>
        <TabsContent value="bookings" className="space-y-4">
          <BookingForm facilities={facilities} onSubmit={(data) => createBooking.mutate(data)} loading={createBooking.isPending} />
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {sortedBookings.map((b) => {
              const f = facilities.find((x) => x.id === b.facilityId);
              return (
                <Card key={b.id}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>{f?.name || `Halle #${b.facilityId}`}</span>
                      <Button variant="ghost" size="icon" onClick={() => b.id && deleteBooking.mutate(b.id)}><Trash2 className="size-4" /></Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p><span className="font-medium">Datum:</span> {b.date}</p>
                    <p><span className="font-medium">Zeit:</span> {b.startTime} – {b.endTime}</p>
                    {b.purpose && <p><span className="font-medium">Zweck:</span> {b.purpose}</p>}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
        <TabsContent value="facilities" className="space-y-4">
          <FacilityForm onSubmit={(data) => createFacility.mutate(data)} loading={createFacility.isPending} />
          <div className="grid gap-3 md:grid-cols-2">
            {facilities.map((f) => (
              <Card key={f.id}>
                <CardHeader><CardTitle className="text-base">{f.name}</CardTitle></CardHeader>
                <CardContent className="text-sm space-y-1">
                  {f.location && <p><span className="font-medium">Ort:</span> {f.location}</p>}
                  {f.capacity && <p><span className="font-medium">Kapazität:</span> {f.capacity}</p>}
                  {f.description && <p className="text-muted-foreground">{f.description}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BookingForm({ facilities, onSubmit, loading }: { facilities: Facility[]; onSubmit: (data: any) => void; loading: boolean }) {
  const { register, handleSubmit, control, setValue, watch } = useForm({ defaultValues: { facilityId: "", date: "", startTime: "", endTime: "", purpose: "" } });
  const facilityId = watch("facilityId");
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-6 items-end">
      <div className="md:col-span-2 space-y-2">
        <Label>Halle/Platz</Label>
        <Select value={facilityId} onValueChange={(v) => setValue("facilityId", v)}>
          <SelectTrigger><SelectValue placeholder="Wählen..." /></SelectTrigger>
          <SelectContent>
            {facilities.map((f) => <SelectItem key={f.id} value={String(f.id)}>{f.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2"><Label>Datum</Label><Input type="date" {...register("date", { required: true })} /></div>
      <div className="space-y-2"><Label>Von</Label><Input type="time" {...register("startTime", { required: true })} /></div>
      <div className="space-y-2"><Label>Bis</Label><Input type="time" {...register("endTime", { required: true })} /></div>
      <div className="md:col-span-5 space-y-2"><Label>Zweck</Label><Input {...register("purpose")} placeholder="z. B. Training, Spiel, Versammlung" /></div>
      <Button type="submit" disabled={loading || !facilityId}><Plus className="size-4 mr-2" /> Buchen</Button>
    </form>
  );
}

function FacilityForm({ onSubmit, loading }: { onSubmit: (data: any) => void; loading: boolean }) {
  const { register, handleSubmit } = useForm({ defaultValues: { name: "", description: "", location: "", capacity: "" } });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-4 items-end">
      <div className="md:col-span-2 space-y-2"><Label>Name</Label><Input {...register("name", { required: true })} placeholder="Halle A / Platz 1" /></div>
      <div className="space-y-2"><Label>Ort</Label><Input {...register("location")} /></div>
      <div className="space-y-2"><Label>Kapazität</Label><Input type="number" {...register("capacity")} /></div>
      <div className="md:col-span-4 space-y-2"><Label>Beschreibung</Label><Input {...register("description")} /></div>
      <Button type="submit" disabled={loading}>Hinzufügen</Button>
    </form>
  );
}
