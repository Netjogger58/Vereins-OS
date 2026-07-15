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
import { Plus, Trash2, Euro, Bell } from "lucide-react";
import type { Member, Invoice } from "@shared/schema";

type InvoiceDetail = Invoice & { member?: Member; payments?: any[]; openAmount?: number };

export default function Invoices() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: invoices = [] } = useQuery<InvoiceDetail[]>({ queryKey: ["/api/invoices"] });
  const { data: members = [] } = useQuery<Member[]>({ queryKey: ["/api/members"] });

  const create = useMutation({
    mutationFn: (body: any) => apiRequest("POST", "/api/invoices", body).then((r) => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/invoices"] }); setOpen(false); toast({ title: "Rechnung erstellt" }); },
  });

  const pay = useMutation({
    mutationFn: ({ id, amount }: { id: number; amount: number }) => apiRequest("POST", `/api/invoices/${id}/payments`, { amount }).then((r) => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/invoices"] }),
  });

  const remind = useMutation({
    mutationFn: (id: number) => apiRequest("POST", `/api/invoices/${id}/remind`, {}).then((r) => r.json()),
    onSuccess: (data) => toast({ title: data.success ? "Erinnerung gesendet" : "Fehler", description: data.error, variant: data.success ? "default" : "destructive" }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/invoices/${id}`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/invoices"] }),
  });

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Rechnungen & offene Posten</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="size-4 mr-2" /> Rechnung erstellen</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Neue Rechnung</DialogTitle></DialogHeader>
            <InvoiceForm members={members} onSubmit={(data) => create.mutate(data)} loading={create.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3">
        {invoices.map((inv) => (
          <Card key={inv.id}>
            <CardContent className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="font-semibold">{inv.description}</div>
                <div className="text-sm text-muted-foreground">{inv.member?.name || `Mitglied #${inv.memberId}`} · Fällig: {inv.dueDate || "-"}</div>
                <div className="text-sm mt-1"><Euro className="size-3 inline" /> {inv.openAmount?.toFixed(2)} offen / {Number(inv.amount).toFixed(2)} €</div>
                <div className="text-xs mt-1">Status: <span className="font-medium">{inv.status}</span></div>
              </div>
              <div className="flex items-center gap-2">
                <PaymentDialog invoice={inv} onPay={(amount) => pay.mutate({ id: inv.id!, amount })} />
                <Button variant="outline" size="sm" onClick={() => remind.mutate(inv.id!)} disabled={inv.status === "paid"}><Bell className="size-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove.mutate(inv.id!)} className="text-destructive"><Trash2 className="size-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function InvoiceForm({ members, onSubmit, loading }: { members: Member[]; onSubmit: (data: any) => void; loading: boolean }) {
  const { register, handleSubmit, watch, setValue } = useForm({ defaultValues: { memberId: "", amount: "", description: "", season: "", dueDate: "" } });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label>Mitglied</Label>
        <Select value={watch("memberId")} onValueChange={(v) => setValue("memberId", v)}>
          <SelectTrigger><SelectValue placeholder="Wählen" /></SelectTrigger>
          <SelectContent>{members.map((m) => <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1"><Label>Betrag (€)</Label><Input type="number" step="0.01" {...register("amount", { required: true })} /></div>
        <div className="space-y-1"><Label>Fälligkeitsdatum</Label><Input type="date" {...register("dueDate")} /></div>
      </div>
      <div className="space-y-1"><Label>Beschreibung</Label><Textarea {...register("description", { required: true })} /></div>
      <div className="space-y-1"><Label>Saison</Label><Input {...register("season")} placeholder="2026-27" /></div>
      <Button type="submit" disabled={loading || !watch("memberId")} className="w-full">Erstellen</Button>
    </form>
  );
}

function PaymentDialog({ invoice, onPay }: { invoice: InvoiceDetail; onPay: (amount: number) => void }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(invoice.openAmount ?? ""));
  const handle = () => { onPay(Number(amount)); setOpen(false); };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="outline" size="sm" disabled={invoice.status === "paid"}><Euro className="size-4 mr-1" /> Zahlen</Button></DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Zahlung erfassen</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1"><Label>Betrag</Label><Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
          <Button onClick={handle} disabled={!amount} className="w-full">Zahlung speichern</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
