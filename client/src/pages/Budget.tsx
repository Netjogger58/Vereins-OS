import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useState, useMemo } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import type { Budget } from "@shared/schema";

export default function Budget() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ season: "2026-27", category: "", type: "expense", amount: "" });
  const { data: items = [], isLoading } = useQuery<Budget[]>({ queryKey: ["/api/season-budgets"] });
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/season-budgets", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/season-budgets"] }); setShowForm(false); setForm({ season: "2026-27", category: "", type: "expense", amount: "" }); toast({ title: t("common.saved") }); },
  });
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await fetch(`/api/season-budgets/${id}`, { method: "DELETE" }); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/season-budgets"] }); toast({ title: t("common.deleted") }); },
  });

  const charges = useMemo(() => items.filter(b => b.type === "expense"), [items]);
  const produits = useMemo(() => items.filter(b => b.type === "income"), [items]);
  const totalCharges = useMemo(() => charges.reduce((s, b) => s + b.amount, 0), [charges]);
  const totalProduits = useMemo(() => produits.reduce((s, b) => s + b.amount, 0), [produits]);

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">{t("common.loading")}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("nav.budget")}</h1>
          <p className="text-muted-foreground mt-1">Budget-Planung und Prognosen</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="size-4" /> {t("common.create")}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>{t("common.create")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Saison</Label>
                <Input value={form.season} onChange={e => setForm({...form, season: e.target.value})} />
              </div>
              <div>
                <Label>Typ</Label>
                <Select value={form.type} onValueChange={v => setForm({...form, type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Charge</SelectItem>
                    <SelectItem value="income">Produit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Kategorie</Label>
                <Input value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
              </div>
              <div className="col-span-2">
                <Label>Betrag (€)</Label>
                <Input type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
              </div>
            </div>
            <Button onClick={() => createMutation.mutate({ ...form, amount: Number(form.amount) })} disabled={createMutation.isPending || !form.category || !form.amount} className="gap-2">
              <Save className="size-4" /> {t("common.save")}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-5">
        <Card>
          <CardHeader><CardTitle className="text-base text-destructive">Charges</CardTitle></CardHeader>
          <CardContent>
            {charges.length === 0 ? <p className="text-sm text-muted-foreground">{t("common.no_data")}</p> : (
              <div className="space-y-1">
                {charges.map(b => (
                  <div key={b.id} className="flex items-center justify-between text-sm py-1 border-b border-border/50">
                    <span>{b.category}</span>
                    <span className="font-semibold tabular-nums">{b.amount.toFixed(2)} €</span>
                  </div>
                ))}
                <div className="flex items-center justify-between text-sm font-bold pt-2">
                  <span>Total Charges</span>
                  <span className="tabular-nums">{totalCharges.toFixed(2)} €</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base text-emerald-600 dark:text-emerald-400">Produits</CardTitle></CardHeader>
          <CardContent>
            {produits.length === 0 ? <p className="text-sm text-muted-foreground">{t("common.no_data")}</p> : (
              <div className="space-y-1">
                {produits.map(b => (
                  <div key={b.id} className="flex items-center justify-between text-sm py-1 border-b border-border/50">
                    <span>{b.category}</span>
                    <span className="font-semibold tabular-nums">{b.amount.toFixed(2)} €</span>
                  </div>
                ))}
                <div className="flex items-center justify-between text-sm font-bold pt-2">
                  <span>Total Produits</span>
                  <span className="tabular-nums">{totalProduits.toFixed(2)} €</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between font-bold">
            <span>Geplangt Resultat 2026-27</span>
            <span className={`tabular-nums ${totalProduits - totalCharges < 0 ? "text-destructive" : "text-emerald-600"}`}>
              {(totalProduits - totalCharges).toFixed(2)} €
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {items.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">{t("common.no_data")}</CardContent></Card>
        ) : items.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold">{item.category}</div>
                <div className="text-sm text-muted-foreground">{item.season} · {item.type === "expense" ? "Charge" : "Produit"}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`font-bold tabular-nums ${item.type === "expense" ? "text-destructive" : "text-emerald-600"}`}>
                  {item.type === "expense" ? "−" : "+"} {item.amount.toFixed(2)} €
                </div>
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
