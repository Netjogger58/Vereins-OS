import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import { Plus, TrendingUp, TrendingDown, Wallet, Trash2, Eye, EyeOff } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { euro, formatDate, isoToday } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { Account, Transaction } from "@shared/schema";

export default function Finance() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    accountId: "",
    amount: "",
    description: "",
    date: isoToday(),
    type: "income",
    visibility: "intern",
  });
  const [filter, setFilter] = useState<string>("all");

  const { data: accounts = [] } = useQuery<Account[]>({ queryKey: ["/api/accounts"] });
  const { data: transactions = [] } = useQuery<Transaction[]>({ queryKey: ["/api/transactions"] });

  const createMut = useMutation({
    mutationFn: async (data: any) => (await apiRequest("POST", "/api/transactions", {
      ...data,
      accountId: Number(data.accountId),
      amount: Number(data.amount),
    })).json(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      setOpen(false);
      setForm({ accountId: "", amount: "", description: "", date: isoToday(), type: "income", visibility: "intern" });
      toast({ title: "Buchung erfasst" });
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => (await apiRequest("DELETE", `/api/transactions/${id}`)).json(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
    },
  });

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const monthly = useMemo(() => {
    const now = new Date();
    const thisMonth = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const income = thisMonth.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = thisMonth.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { income, expense };
  }, [transactions]);

  const filtered = transactions.filter(t => filter === "all" || t.visibility === filter);

  // Mini bar chart: last 6 months income/expense
  const chart = useMemo(() => {
    const months: { label: string; income: number; expense: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const y = d.getFullYear();
      const m = d.getMonth();
      const label = d.toLocaleDateString("de-DE", { month: "short" });
      const inThisMonth = transactions.filter(t => {
        const td = new Date(t.date);
        return td.getFullYear() === y && td.getMonth() === m;
      });
      months.push({
        label,
        income: inThisMonth.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0),
        expense: inThisMonth.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0),
      });
    }
    return months;
  }, [transactions]);
  const maxBar = Math.max(1, ...chart.flatMap(c => [c.income, c.expense]));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight">Kassenwart</h1>
          <p className="text-sm text-muted-foreground">Konten, Buchungen & Finanzen</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-transaction"><Plus className="size-4 mr-1" /> Buchung</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Neue Buchung</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label>Konto</Label>
                <Select value={form.accountId} onValueChange={v => setForm(f => ({ ...f, accountId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Konto wählen" /></SelectTrigger>
                  <SelectContent>
                    {accounts.map(a => <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Typ</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Einnahme</SelectItem>
                    <SelectItem value="expense">Ausgabe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Betrag (€)</Label>
                <Input type="number" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} data-testid="input-amount" />
              </div>
              <div className="space-y-1.5">
                <Label>Datum</Label>
                <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Sichtbarkeit</Label>
                <Select value={form.visibility} onValueChange={v => setForm(f => ({ ...f, visibility: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="intern">Intern</SelectItem>
                    <SelectItem value="öffentlich">Öffentlich</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Beschreibung</Label>
                <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>Abbrechen</Button>
              <Button
                onClick={() => createMut.mutate(form)}
                disabled={!form.accountId || !form.amount || !form.description}
              >
                Speichern
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard label="Gesamtvermögen" value={euro(totalBalance)} icon={Wallet} />
        <SummaryCard label="Einnahmen (Monat)" value={euro(monthly.income)} icon={TrendingUp} tone="emerald" />
        <SummaryCard label="Ausgaben (Monat)" value={euro(monthly.expense)} icon={TrendingDown} tone="red" />
        <SummaryCard label="Konten" value={String(accounts.length)} icon={Wallet} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Accounts */}
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-base">Konten</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {accounts.map(a => (
              <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div>
                  <div className="font-semibold text-sm">{a.name}</div>
                  <div className="text-xs text-muted-foreground">Konto #{a.id}</div>
                </div>
                <div className={`text-base font-extrabold ${a.balance < 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}`}>
                  {euro(a.balance)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Chart */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Verlauf (6 Monate)</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 h-40">
              {chart.map(c => (
                <div key={c.label} className="flex-1 flex flex-col items-center gap-1">
                  <div className="flex items-end gap-0.5 flex-1 w-full">
                    <div
                      className="flex-1 bg-emerald-500/80 rounded-t"
                      style={{ height: `${(c.income / maxBar) * 100}%` }}
                      title={`Einnahmen: ${euro(c.income)}`}
                    />
                    <div
                      className="flex-1 bg-destructive/70 rounded-t"
                      style={{ height: `${(c.expense / maxBar) * 100}%` }}
                      title={`Ausgaben: ${euro(c.expense)}`}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{c.label}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-emerald-500" />Einnahmen</span>
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-destructive/70" />Ausgaben</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Buchungen</CardTitle>
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList>
              <TabsTrigger value="all">Alle</TabsTrigger>
              <TabsTrigger value="öffentlich"><Eye className="size-3.5 mr-1" />Öffentlich</TabsTrigger>
              <TabsTrigger value="intern"><EyeOff className="size-3.5 mr-1" />Intern</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-border">
          {filtered.length === 0 && <p className="p-6 text-sm text-muted-foreground text-center">Keine Buchungen</p>}
          {filtered.map(t => {
            const acc = accounts.find(a => a.id === t.accountId);
            return (
              <div key={t.id} className="flex items-center gap-3 p-3">
                <div className={`size-9 rounded-full flex items-center justify-center ${t.type === "income" ? "bg-emerald-500/15 text-emerald-600" : "bg-destructive/15 text-destructive"}`}>
                  {t.type === "income" ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{t.description}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    {acc?.name || "Konto"} · {formatDate(t.date)}
                    <Badge variant="outline" className="text-[9px]">{t.visibility}</Badge>
                  </div>
                </div>
                <div className={`text-sm font-bold ${t.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
                  {t.type === "income" ? "+" : "−"} {euro(t.amount)}
                </div>
                <button
                  onClick={() => deleteMut.mutate(t.id)}
                  className="p-1.5 text-muted-foreground hover:text-destructive rounded-md hover:bg-destructive/10"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({
  label, value, icon: Icon, tone,
}: {
  label: string;
  value: string;
  icon: any;
  tone?: "emerald" | "red";
}) {
  const toneClass = tone === "emerald"
    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
    : tone === "red"
    ? "bg-destructive/10 text-destructive"
    : "bg-primary/10 text-primary";
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
            <p className="text-xl font-extrabold mt-1">{value}</p>
          </div>
          <div className={`size-10 rounded-lg flex items-center justify-center ${toneClass}`}>
            <Icon className="size-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
