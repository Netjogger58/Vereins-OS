import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { Plus, Trash2, Save, UserPlus, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { WaitlistEntry, Team } from "@shared/schema";

const STATUS_LABELS: Record<string, string> = {
  waiting: "Wartend",
  invited: "Zum Probetraining eingeladen",
  converted: "Als Mitglied übernommen",
  rejected: "Abgelehnt",
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  waiting: "default",
  invited: "secondary",
  converted: "outline",
  rejected: "destructive",
};

export default function Waitlist() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<WaitlistEntry>>({ status: "waiting" });
  const { data: items = [], isLoading } = useQuery<WaitlistEntry[]>({ queryKey: ["/api/waitlist"] });
  const { data: teams = [] } = useQuery<Team[]>({ queryKey: ["/api/teams"] });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<WaitlistEntry>) => {
      const res = await fetch("/api/waitlist", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/waitlist"] }); setShowForm(false); setForm({ status: "waiting" }); toast({ title: t("common.saved") }); },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<WaitlistEntry> }) => {
      const res = await fetch(`/api/waitlist/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/waitlist"] }); toast({ title: t("common.saved") }); },
  });

  const convertMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/waitlist/${id}/convert`, { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/waitlist"] });
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      toast({ title: "Als Mitglied übernommen" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await fetch(`/api/waitlist/${id}`, { method: "DELETE" }); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/waitlist"] }); toast({ title: t("common.deleted") }); },
  });

  const teamName = (id?: number) => teams.find(t => t.id === id)?.name || "—";

  const canSubmit = form.memberName && form.teamId;

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">{t("common.loading")}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("nav.waitlist")}</h1>
          <p className="text-muted-foreground mt-1">Warteliste für volle Teams</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="size-4" /> {t("common.create")}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>{t("common.create")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Name *</Label>
                <Input placeholder="Vor- und Nachname" value={form.memberName || ""} onChange={e => setForm({ ...form, memberName: e.target.value })} />
              </div>
              <div>
                <Label>Geburtsdatum</Label>
                <Input type="date" value={form.birthdate || ""} onChange={e => setForm({ ...form, birthdate: e.target.value })} />
              </div>
              <div>
                <Label>Telefon</Label>
                <Input type="tel" value={form.phone || ""} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <Label>E-Mail</Label>
                <Input type="email" value={form.email || ""} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <Label>Gewünschtes Team *</Label>
                <Select value={form.teamId ? String(form.teamId) : ""} onValueChange={v => setForm({ ...form, teamId: Number(v) })}>
                  <SelectTrigger><SelectValue placeholder="Team wählen…" /></SelectTrigger>
                  <SelectContent>
                    {teams.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Position</Label>
                <Input placeholder="z.B. TW, LW" value={form.position || ""} onChange={e => setForm({ ...form, position: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Label>Notiz</Label>
                <Input value={form.notes || ""} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <Button onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending || !canSubmit} className="gap-2">
              <Save className="size-4" /> {t("common.save")}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3">
        {items.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">{t("common.no_data")}</CardContent></Card>
        ) : items.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{item.memberName}</div>
                <div className="text-sm text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 mt-0.5">
                  <span>{teamName(item.teamId)}</span>
                  {item.position && <span>Position: {item.position}</span>}
                  {item.birthdate && <span>Geb.: {item.birthdate}</span>}
                  {item.phone && <span>Tel.: {item.phone}</span>}
                  {item.email && <span>{item.email}</span>}
                </div>
                {item.notes && <div className="text-sm text-muted-foreground mt-1">{item.notes}</div>}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={STATUS_VARIANTS[item.status || "waiting"] || "default"}>{STATUS_LABELS[item.status || "waiting"]}</Badge>
                <Select value={item.status || "waiting"} onValueChange={v => updateMutation.mutate({ id: item.id, data: { status: v } })}>
                  <SelectTrigger className="h-8 w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABELS).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
                {item.status !== "converted" && (
                  <Button size="sm" variant="outline" className="gap-1.5" disabled={convertMutation.isPending} onClick={() => convertMutation.mutate(item.id)}>
                    {convertMutation.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <UserPlus className="size-3.5" />} Mitglied
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(item.id)} className="text-destructive">
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
