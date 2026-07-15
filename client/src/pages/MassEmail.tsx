import { useState, useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Member, Team, Document } from "@shared/schema";

export default function MassEmail() {
  const { toast } = useToast();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [documentId, setDocumentId] = useState("");

  const { data: members = [] } = useQuery<Member[]>({ queryKey: ["/api/members"] });
  const { data: teams = [] } = useQuery<Team[]>({ queryKey: ["/api/teams"] });
  const { data: docs = [] } = useQuery<Document[]>({ queryKey: ["/api/documents"] });

  const recipients = useMemo(() => {
    return members.filter((m: any) => {
      if (!m.email) return false;
      if (filters.teamId && String(m.teamId) !== filters.teamId) return false;
      if (filters.membershipStatus && m.membershipStatus !== filters.membershipStatus) return false;
      if (filters.memberType && m.memberType !== filters.memberType) return false;
      if (filters.clubFunction && m.clubFunction !== filters.clubFunction) return false;
      return true;
    });
  }, [members, filters]);

  const send = useMutation({
    mutationFn: () =>
      apiRequest("POST", "/api/mass-email/send", {
        filters,
        subject,
        body,
        documentId: documentId ? Number(documentId) : undefined,
      }).then((r) => r.json()),
    onSuccess: (data) => {
      toast({ title: `${data.sent} E-Mails gesendet`, description: data.failed > 0 ? `${data.failed} fehlgeschlagen` : undefined });
    },
    onError: (e: any) => toast({ title: "Fehler", description: e.message, variant: "destructive" }),
  });

  const preview = body
    .replace(/\{\{firstName\}\}/g, "Max")
    .replace(/\{\{lastName\}\}/g, "Mustermann")
    .replace(/\{\{name\}\}/g, "Max Mustermann");

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Serien-E-Mail</h1>

      <Card>
        <CardHeader><CardTitle>Empfänger filtern</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <Label>Team</Label>
            <Select value={filters.teamId || ""} onValueChange={(v) => setFilters((p) => ({ ...p, teamId: v }))}>
              <SelectTrigger><SelectValue placeholder="Alle" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Alle</SelectItem>
                {teams.map((t) => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Mitgliedschaftsstatus</Label>
            <Input value={filters.membershipStatus || ""} onChange={(e) => setFilters((p) => ({ ...p, membershipStatus: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <Label>Mitgliedertyp</Label>
            <Input value={filters.memberType || ""} onChange={(e) => setFilters((p) => ({ ...p, memberType: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <Label>Vereinsfunktion</Label>
            <Input value={filters.clubFunction || ""} onChange={(e) => setFilters((p) => ({ ...p, clubFunction: e.target.value }))} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Nachricht</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>Betreff</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Text (HTML erlaubt)</Label>
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} />
            <p className="text-xs text-muted-foreground">Platzhalter: {"{{firstName}}"}, {"{{lastName}}"}, {"{{name}}"}</p>
          </div>
          <div className="space-y-1">
            <Label>Anhang (optional)</Label>
            <Select value={documentId} onValueChange={setDocumentId}>
              <SelectTrigger><SelectValue placeholder="Dokument wählen" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Kein Anhang</SelectItem>
                {docs.map((d) => <SelectItem key={d.id} value={String(d.id)}>{d.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Vorschau</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <p><span className="font-medium">Empfänger:</span> {recipients.length}</p>
          <div className="border rounded p-3 bg-muted/30 text-sm" dangerouslySetInnerHTML={{ __html: preview }} />
        </CardContent>
      </Card>

      <Button
        onClick={() => send.mutate()}
        disabled={!subject || !body || recipients.length === 0 || send.isPending}
      >
        {send.isPending ? "Wird gesendet..." : "E-Mails versenden"}
      </Button>
    </div>
  );
}
