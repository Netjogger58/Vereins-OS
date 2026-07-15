import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Account } from "@shared/schema";

export default function BankImport() {
  const { toast } = useToast();
  const [accountId, setAccountId] = useState("");
  const [season, setSeason] = useState("");
  const [csv, setCsv] = useState("");

  const { data: accounts = [] } = useQuery<Account[]>({ queryKey: ["/api/accounts"] });

  const mutation = useMutation({
    mutationFn: () =>
      apiRequest("POST", "/api/finance/import", { accountId: Number(accountId), csv, season }).then((r) => r.json()),
    onSuccess: (data) => {
      toast({ title: `${data.created} Buchungen importiert`, description: data.skipped > 0 ? `${data.skipped} übersprungen` : undefined });
    },
    onError: (e: any) => toast({ title: "Fehler", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Bankimport (CSV)</h1>

      <Card>
        <CardHeader><CardTitle>Import-Einstellungen</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label>Konto</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger><SelectValue placeholder="Konto wählen" /></SelectTrigger>
              <SelectContent>
                {accounts.map((a) => <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Saison (optional)</Label>
            <Input value={season} onChange={(e) => setSeason(e.target.value)} placeholder="z. B. 2026-27" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>CSV einfügen</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Textarea value={csv} onChange={(e) => setCsv(e.target.value)} rows={12} placeholder="date;description;amount" />
          <p className="text-xs text-muted-foreground">
            Erwartete Spalten: <code>date</code>, <code>description</code>, <code>amount</code> (oder deutsch: Datum, Verwendungszweck, Betrag).
            Positive Beträge = Einnahmen, negative = Ausgaben.
          </p>
        </CardContent>
      </Card>

      <Button
        onClick={() => mutation.mutate()}
        disabled={!accountId || !csv || mutation.isPending}
      >
        {mutation.isPending ? "Import läuft..." : "Buchungen importieren"}
      </Button>
    </div>
  );
}
