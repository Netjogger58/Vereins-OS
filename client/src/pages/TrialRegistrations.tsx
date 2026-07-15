import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import type { TrialRegistration } from "@shared/schema";

const STATUSES = ["pending", "contacted", "converted", "cancelled"];

export default function TrialRegistrations() {
  const queryClient = useQueryClient();
  const { data: list = [] } = useQuery<TrialRegistration[]>({ queryKey: ["/api/trial-registrations"] });

  const update = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => apiRequest("PATCH", `/api/trial-registrations/${id}`, { status }).then((r) => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/trial-registrations"] }),
  });

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Probéieren-Ufroe</h1>
      <div className="grid gap-3">
        {list.map((r) => (
          <Card key={r.id}>
            <CardContent className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="font-semibold">{r.childName} {r.birthdate ? `(${r.birthdate})` : ""}</div>
                <div className="text-sm text-muted-foreground">{r.parentName} · {r.email} · {r.phone || "-"}</div>
                <div className="text-sm">{[r.teamCategory, r.gender].filter(Boolean).join(" · ") || "-"}</div>
                {r.note && <div className="text-sm text-muted-foreground">{r.note}</div>}
                <div className="text-xs text-muted-foreground mt-1">{new Date(r.createdAt).toLocaleString("de-LU")}</div>
              </div>
              <Select value={r.status} onValueChange={(v) => update.mutate({ id: r.id!, status: v })}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
