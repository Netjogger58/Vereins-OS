import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Trash2, Check, X } from "lucide-react";
import type { Donation } from "@shared/schema";

export default function Donations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: donations = [] } = useQuery<Donation[]>({ queryKey: ["/api/donations"] });
  const total = donations.reduce((sum, d) => sum + Number(d.amount), 0);

  const create = useMutation({
    mutationFn: (body: any) => apiRequest("POST", "/api/donations", body).then((r) => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/donations"] }); setOpen(false); toast({ title: "Spende erfasst" }); },
  });

  const receipt = useMutation({
    mutationFn: (id: number) => apiRequest("PATCH", `/api/donations/${id}/receipt`, {}).then((r) => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/donations"] }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/donations/${id}`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/donations"] }),
  });

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Spenden</h1>
          <p className="text-muted-foreground">Gesamt: {total.toFixed(2)} €</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="size-4 mr-2" /> Spende erfassen</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Neue Spende</DialogTitle></DialogHeader>
            <DonationForm onSubmit={(data) => create.mutate(data)} loading={create.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {donations.map((d) => (
          <Card key={d.id}>
            <CardHeader>
              <CardTitle className="text-base flex justify-between items-center">
                <span>{d.donorName}</span>
                <span className="text-sm font-normal">{Number(d.amount).toFixed(2)} €</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              {d.campaign && <p><span className="font-medium">Kampagne:</span> {d.campaign}</p>}
              <p><span className="font-medium">Datum:</span> {d.date.slice(0, 10)}</p>
              {d.note && <p className="text-muted-foreground">{d.note}</p>}
              <div className="flex items-center gap-2">
                <span className={d.receiptSent ? "text-green-600" : "text-muted-foreground"}>{d.receiptSent ? <Check className="size-4 inline" /> : <X className="size-4 inline" />} Quittung</span>
                {!d.receiptSent && <Button variant="outline" size="sm" onClick={() => receipt.mutate(d.id!)}>Quittung</Button>}
                <Button variant="ghost" size="icon" onClick={() => remove.mutate(d.id!)} className="text-destructive ml-auto"><Trash2 className="size-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function DonationForm({ onSubmit, loading }: { onSubmit: (data: any) => void; loading: boolean }) {
  const { register, handleSubmit } = useForm({ defaultValues: { donorName: "", donorEmail: "", amount: "", campaign: "", note: "", date: new Date().toISOString().slice(0, 10) } });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1"><Label>Name des Spenders</Label><Input {...register("donorName", { required: true })} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1"><Label>Betrag (€)</Label><Input type="number" step="0.01" {...register("amount", { required: true })} /></div>
        <div className="space-y-1"><Label>Datum</Label><Input type="date" {...register("date", { required: true })} /></div>
      </div>
      <div className="space-y-1"><Label>E-Mail</Label><Input type="email" {...register("donorEmail")} /></div>
      <div className="space-y-1"><Label>Kampagne</Label><Input {...register("campaign")} /></div>
      <div className="space-y-1"><Label>Notiz</Label><Textarea {...register("note")} /></div>
      <Button type="submit" disabled={loading} className="w-full">Speichern</Button>
    </form>
  );
}
