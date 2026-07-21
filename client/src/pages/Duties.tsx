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
import { Plus, Trash2, Edit3, Save } from "lucide-react";

export default function Duties() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Record<string,string>>({});
  const { data: items = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/duties"] });
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/duties", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/duties"] }); setShowForm(false); setForm({}); toast({ title: t("common.saved") }); },
  });
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await fetch(`/api/duties/${id}`, { method: "DELETE" }); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/duties"] }); toast({ title: t("common.deleted") }); },
  });

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">{t("common.loading")}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("nav.duties")}</h1>
          <p className="text-muted-foreground mt-1">Diensteinteilung und Helfer</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="size-4" /> {t("common.create")}
        </Button>
      </div>

      {showForm && (
        <Card className="rounded-2xl shadow-sm border-none">
          <CardHeader className="bg-gradient-to-br from-primary to-[#001A3A] text-primary-foreground rounded-t-2xl">
            <CardTitle className="text-base">{t("common.create")}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="grid gap-3">
              <div>
                <Label>{t("common.name")}</Label>
                <Input value={form.name || ""} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div>
                <Label>{t("common.description")}</Label>
                <Input value={form.description || ""} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
            </div>
            <Button onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending} className="gap-2">
              <Save className="size-4" /> {t("common.save")}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {items.length === 0 ? (
          <Card className="rounded-2xl shadow-sm border-none p-8 text-center text-muted-foreground">{t("common.no_data")}</Card>
        ) : items.map((item: any) => (
          <Card key={item.id} className="rounded-2xl shadow-sm border-none overflow-hidden">
            <div className="bg-gradient-to-br from-primary to-[#001A3A] p-4 text-primary-foreground flex items-center justify-between">
              <div className="font-bold truncate pr-2">{item.title || item.name}</div>
              {item.date && <Badge className="bg-white/20 text-white text-[10px]">{item.date}</Badge>}
            </div>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">{item.description || "—"}</div>
              <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(item.id)} className="text-destructive">
                <Trash2 className="size-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
