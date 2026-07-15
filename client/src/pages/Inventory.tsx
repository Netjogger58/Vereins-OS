import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Package, Plus, RotateCcw, HandHelping, Search } from "lucide-react";
import type { InventoryItem, InventoryLoan, Member, User } from "@shared/schema";

const conditions: Record<string, string> = {
  neu: "Neu",
  good: "Gut",
  worn: "Abgenutzt",
  damaged: "Defekt",
  lost: "Verloren",
};

export default function Inventory() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [itemDialog, setItemDialog] = useState<Partial<InventoryItem> | null>(null);
  const [loanDialog, setLoanDialog] = useState<{ item: InventoryItem } | null>(null);

  const { data: items = [] } = useQuery<InventoryItem[]>({ queryKey: ["/api/inventory"] });
  const { data: loans = [] } = useQuery<InventoryLoan[]>({ queryKey: ["/api/inventory/loans"] });
  const { data: members = [] } = useQuery<Member[]>({ queryKey: ["/api/members"] });
  const { data: users = [] } = useQuery<User[]>({ queryKey: ["/api/users"] });

  const saveItem = useMutation({
    mutationFn: (item: Partial<InventoryItem>) =>
      item.id ? apiRequest("PATCH", `/api/inventory/${item.id}`, item).then(r => r.json()) : apiRequest("POST", "/api/inventory", item).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/inventory"] }); setItemDialog(null); toast({ title: "Gespeichert" }); },
    onError: () => toast({ title: "Fehler", variant: "destructive" }),
  });

  const deleteItem = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/inventory/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/inventory"] }); toast({ title: "Gelöscht" }); },
  });

  const createLoan = useMutation({
    mutationFn: (loan: Partial<InventoryLoan>) => apiRequest("POST", "/api/inventory/loans", loan).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/inventory"] });
      setLoanDialog(null);
      toast({ title: "Ausleihe erstellt" });
    },
    onError: (e: any) => toast({ title: "Fehler", description: e?.message || "Ausleihe nicht möglich", variant: "destructive" }),
  });

  const returnLoan = useMutation({
    mutationFn: (id: number) => apiRequest("PATCH", `/api/inventory/loans/${id}/return`, {}).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/inventory"] }); toast({ title: "Zurückgegeben" }); },
  });

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.category.toLowerCase().includes(search.toLowerCase()) ||
    (i.location || "").toLowerCase().includes(search.toLowerCase())
  );

  const activeLoans = (itemId: number) => loans.filter(l => l.itemId === itemId && !l.returnedAt);
  const allLoans = (itemId: number) => loans.filter(l => l.itemId === itemId);

  const [loanForm, setLoanForm] = useState<Partial<InventoryLoan>>({});

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-primary flex items-center gap-2"><Package className="size-5" /> Inventar</h1>
        <Button size="sm" onClick={() => setItemDialog({ condition: "good", totalQuantity: 1, availableQuantity: 1 })}><Plus className="size-4 mr-1" /> Gegenstand</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Suche nach Name, Kategorie oder Lagerort..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {filtered.length === 0 && <p className="text-sm text-muted-foreground md:col-span-2 text-center py-8">Keine Gegenstände gefunden.</p>}
        {filtered.map(item => {
          const out = activeLoans(item.id!).length;
          return (
            <Card key={item.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{item.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{item.category}{item.location ? ` · ${item.location}` : ""}</p>
                  </div>
                  <Badge variant={item.availableQuantity === 0 ? "destructive" : item.availableQuantity! < item.totalQuantity! ? "secondary" : "default"}>
                    {item.availableQuantity} / {item.totalQuantity} verfügbar
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {item.condition && <Badge variant="outline">{conditions[item.condition] || item.condition}</Badge>}
                  {item.qrCode && <Badge variant="outline">QR: {item.qrCode}</Badge>}
                </div>
                {item.description && <p className="text-sm">{item.description}</p>}
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => setItemDialog(item)}>Bearbeiten</Button>
                  {item.availableQuantity! > 0 && <Button size="sm" variant="outline" onClick={() => { setLoanDialog({ item }); setLoanForm({ itemId: item.id, quantity: 1 }); }}><HandHelping className="size-3.5 mr-1" /> Ausleihen</Button>}
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteItem.mutate(item.id!)}>Löschen</Button>
                </div>
                {out > 0 && (
                  <div className="border-t pt-2 space-y-1">
                    <p className="text-xs font-medium">Aktive Ausleihen</p>
                    {activeLoans(item.id!).slice(0, 3).map(l => {
                      const u = users.find(user => user.id === l.userId);
                      const m = members.find(member => member.userId === l.userId);
                      return (
                        <div key={l.id} className="flex items-center justify-between text-xs p-1.5 rounded bg-muted/50">
                          <span>{u?.name || m?.name || `User #${l.userId}`} ({l.quantity}x) {l.dueDate && <span className="text-muted-foreground">bis {l.dueDate}</span>}</span>
                          <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => returnLoan.mutate(l.id!)}><RotateCcw className="size-3 mr-1" /> Zurück</Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Item dialog */}
      <Dialog open={!!itemDialog} onOpenChange={() => setItemDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{itemDialog?.id ? "Gegenstand bearbeiten" : "Gegenstand anlegen"}</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <Label>Name<Input value={itemDialog?.name || ""} onChange={e => setItemDialog(prev => ({ ...prev!, name: e.target.value }))} /></Label>
            <div className="grid grid-cols-2 gap-3">
              <Label>Kategorie<Input value={itemDialog?.category || ""} onChange={e => setItemDialog(prev => ({ ...prev!, category: e.target.value }))} /></Label>
              <Label>Zustand
                <Select value={itemDialog?.condition || "good"} onValueChange={v => setItemDialog(prev => ({ ...prev!, condition: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(conditions).map(([k, label]) => <SelectItem key={k} value={k}>{label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Label>Gesamtanzahl<Input type="number" value={itemDialog?.totalQuantity ?? 1} onChange={e => setItemDialog(prev => ({ ...prev!, totalQuantity: Number(e.target.value) }))} /></Label>
              <Label>Lagerort<Input value={itemDialog?.location || ""} onChange={e => setItemDialog(prev => ({ ...prev!, location: e.target.value }))} /></Label>
            </div>
            <Label>QR-Code (optional)<Input value={itemDialog?.qrCode || ""} onChange={e => setItemDialog(prev => ({ ...prev!, qrCode: e.target.value }))} /></Label>
            <Label>Beschreibung<Input value={itemDialog?.description || ""} onChange={e => setItemDialog(prev => ({ ...prev!, description: e.target.value }))} /></Label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemDialog(null)}>Abbrechen</Button>
            <Button onClick={() => saveItem.mutate(itemDialog!)} disabled={!itemDialog?.name || !itemDialog?.category}>Speichern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Loan dialog */}
      <Dialog open={!!loanDialog} onOpenChange={() => setLoanDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{loanDialog?.item.name} ausleihen</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <Label>Verleihen an
              <Select value={loanForm.userId ? String(loanForm.userId) : undefined} onValueChange={v => setLoanForm(prev => ({ ...prev!, userId: Number(v) }))}>
                <SelectTrigger><SelectValue placeholder="Mitglied/Benutzer wählen" /></SelectTrigger>
                <SelectContent>
                  {users.map(u => (
                    <SelectItem key={u.id} value={String(u.id)}>{u.name || u.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <Label>Anzahl<Input type="number" min={1} max={loanDialog?.item.availableQuantity} value={loanForm.quantity || 1} onChange={e => setLoanForm(prev => ({ ...prev!, quantity: Number(e.target.value) }))} /></Label>
              <Label>Rückgabe bis<Input type="date" value={loanForm.dueDate || ""} onChange={e => setLoanForm(prev => ({ ...prev!, dueDate: e.target.value }))} /></Label>
            </div>
            <Label>Notiz<Input value={loanForm.notes || ""} onChange={e => setLoanForm(prev => ({ ...prev!, notes: e.target.value }))} /></Label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLoanDialog(null)}>Abbrechen</Button>
            <Button onClick={() => createLoan.mutate(loanForm)} disabled={!loanForm.userId || !loanForm.quantity}>Ausleihen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
