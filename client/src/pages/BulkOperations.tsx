import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Member, Team } from "@shared/schema";

const FILTER_FIELDS: { key: string; label: string }[] = [
  { key: "teamId", label: "Team" },
  { key: "membershipStatus", label: "Mitgliedschaftsstatus" },
  { key: "memberType", label: "Mitgliedertyp" },
  { key: "clubFunction", label: "Vereinsfunktion" },
  { key: "internalCategory", label: "Interne Kategorie" },
  { key: "flhCategory", label: "FLH-Kategorie" },
  { key: "teamCategory", label: "Team-Kategorie" },
  { key: "nationality", label: "Nationalität" },
  { key: "licenceStatus", label: "Lizenzstatus" },
  { key: "transferStatus", label: "Transferstatus" },
  { key: "medicoResult", label: "Médico-Resultat" },
];

const UPDATE_FIELDS: { key: string; label: string }[] = [
  { key: "membershipStatus", label: "Mitgliedschaftsstatus" },
  { key: "memberType", label: "Mitgliedertyp" },
  { key: "clubFunction", label: "Vereinsfunktion" },
  { key: "internalCategory", label: "Interne Kategorie" },
  { key: "flhCategory", label: "FLH-Kategorie" },
  { key: "teamCategory", label: "Team-Kategorie" },
  { key: "nationality", label: "Nationalität" },
  { key: "licenceStatus", label: "Lizenzstatus" },
  { key: "transferStatus", label: "Transferstatus" },
  { key: "medicoResult", label: "Médico-Resultat" },
  { key: "teamId", label: "Team" },
];

export default function BulkOperations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [updateField, setUpdateField] = useState("");
  const [updateValue, setUpdateValue] = useState("");

  const { data: members = [] } = useQuery<Member[]>({ queryKey: ["/api/members"] });
  const { data: teams = [] } = useQuery<Team[]>({ queryKey: ["/api/teams"] });

  const matched = useMemo(() => {
    return members.filter((m: any) => {
      for (const [key, value] of Object.entries(filters)) {
        if (!value) continue;
        if (key === "teamId" && String(m.teamId) !== value) return false;
        if (key !== "teamId" && String(m[key as keyof Member] || "") !== value) return false;
      }
      return true;
    });
  }, [members, filters]);

  const mutation = useMutation({
    mutationFn: () =>
      apiRequest("POST", "/api/bulk/members", {
        filters,
        updates: { field: updateField, value: updateValue },
      }).then((r) => r.json()),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      toast({ title: `${data.updated} Mitglieder aktualisiert` });
    },
    onError: (e: any) => toast({ title: "Fehler", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Massendatenänderungen</h1>

      <Card>
        <CardHeader><CardTitle>1. Filter wählen</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {FILTER_FIELDS.map((f) => (
            <div key={f.key} className="space-y-1">
              <Label>{f.label}</Label>
              {f.key === "teamId" ? (
                <Select value={filters[f.key] || ""} onValueChange={(v) => setFilters((p) => ({ ...p, [f.key]: v }))}>
                  <SelectTrigger><SelectValue placeholder="Alle" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Alle</SelectItem>
                    {teams.map((t) => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={filters[f.key] || ""}
                  onChange={(e) => setFilters((p) => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.label}
                />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>2. Feld ändern</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1 md:col-span-1">
            <Label>Feld</Label>
            <Select value={updateField} onValueChange={setUpdateField}>
              <SelectTrigger><SelectValue placeholder="Feld wählen" /></SelectTrigger>
              <SelectContent>
                {UPDATE_FIELDS.map((f) => <SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label>Neuer Wert</Label>
            <Input value={updateValue} onChange={(e) => setUpdateValue(e.target.value)} placeholder="z. B. aktiv" />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">{matched.length} Mitglieder treffen zu</p>
        <Button
          onClick={() => mutation.mutate()}
          disabled={!updateField || updateValue === "" || matched.length === 0 || mutation.isPending}
        >
          {mutation.isPending ? "Wird aktualisiert..." : "Massenänderung ausführen"}
        </Button>
      </div>
    </div>
  );
}
