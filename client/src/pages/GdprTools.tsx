import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { Download, Trash2, Save, Shield, UserX, FileDown, Loader2 } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { Member, GdprConsent, GdprDeletionRequest } from "@shared/schema";

const CONSENT_TYPES: Record<string, string> = {
  data_processing: "Datenverarbeitung (Mitgliedschaft)",
  photos: "Fotos / Videos bei Veranstaltungen",
  newsletter: "Newsletter / Werbung",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Offen",
  approved: "Genehmigt",
  rejected: "Abgelehnt",
};

const ADMIN_ROLES = ["präsident", "admin", "secretaire"];

export default function GdprTools() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = !!user && ADMIN_ROLES.includes(user.role);

  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [consentType, setConsentType] = useState<string>("data_processing");
  const [consented, setConsented] = useState(true);
  const [deleteReason, setDeleteReason] = useState("");
  const [reviewNotes, setReviewNotes] = useState<Record<number, string>>({});

  const { data: members = [] } = useQuery<Member[]>({ queryKey: ["/api/members"], enabled: isAdmin });
  const { data: consents = [], isLoading: consentsLoading } = useQuery<GdprConsent[]>({
    queryKey: [isAdmin ? "/api/admin/gdpr/consents" : "/api/gdpr"],
  });
  const { data: deletionRequests = [], isLoading: delLoading } = useQuery<GdprDeletionRequest[]>({
    queryKey: ["/api/admin/gdpr/deletion-requests"],
    enabled: isAdmin,
  });

  const consentMutation = useMutation({
    mutationFn: async (data: { userId: number; consentType: string; consented: boolean }) => {
      const res = await apiRequest("POST", "/api/admin/gdpr/consents", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gdpr/consents"] });
      toast({ title: "Einwilligung gespeichert" });
    },
  });

  const deleteRequestMutation = useMutation({
    mutationFn: async (reason: string) => {
      const res = await apiRequest("POST", "/api/gdpr/deletion-request", { reason });
      return res.json();
    },
    onSuccess: () => {
      setDeleteReason("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gdpr/deletion-requests"] });
      toast({ title: "Löschantrag eingereicht" });
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/gdpr/deletion-requests/${id}`, {
        status,
        notes: reviewNotes[id] || "",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gdpr/deletion-requests"] });
      toast({ title: "Antrag aktualisiert" });
    },
  });

  const exportOwnData = async () => {
    const res = await fetch("/api/gdpr/export", { credentials: "include" });
    if (!res.ok) { toast({ title: "Fehler", variant: "destructive" }); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meine-daten-${user?.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportMemberData = async (memberId: string) => {
    const member = members.find(m => String(m.id) === memberId);
    if (!member?.userId) { toast({ title: "Kein Benutzerkonto verknüpft", variant: "destructive" }); return; }
    const res = await fetch(`/api/admin/gdpr/export/${member.userId}`, { credentials: "include" });
    if (!res.ok) { toast({ title: "Fehler", variant: "destructive" }); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `datenexport-${memberId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (consentsLoading || (isAdmin && delLoading)) return <div className="p-8 text-center text-muted-foreground">{t("common.loading")}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("nav.gdpr")}</h1>
        <p className="text-muted-foreground mt-1">DSGVO Datenschutz-Tools</p>
      </div>

      <Tabs defaultValue="consents">
        <TabsList>
          <TabsTrigger value="consents" className="gap-1"><Shield className="size-4" /> Einwilligungen</TabsTrigger>
          <TabsTrigger value="export" className="gap-1"><FileDown className="size-4" /> Datenauszug</TabsTrigger>
          <TabsTrigger value="delete" className="gap-1"><UserX className="size-4" /> Lösch-Antrag</TabsTrigger>
        </TabsList>

        <TabsContent value="consents" className="space-y-4">
          {isAdmin && (
            <Card>
              <CardHeader><CardTitle className="text-base">Einwilligung für Mitglied erfassen / ändern</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Mitglied</Label>
                    <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                      <SelectTrigger><SelectValue placeholder="Mitglied wählen…" /></SelectTrigger>
                      <SelectContent>
                        {members.map(m => <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Zweck</Label>
                    <Select value={consentType} onValueChange={setConsentType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(CONSENT_TYPES).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={consented} onCheckedChange={v => setConsented(v === true)} />
                  Einwilligung erteilt
                </label>
                <Button
                  disabled={!selectedMemberId || consentMutation.isPending}
                  onClick={() => {
                    const member = members.find(m => String(m.id) === selectedMemberId);
                    if (member?.userId) consentMutation.mutate({ userId: member.userId, consentType, consented });
                  }}
                  className="gap-2"
                >
                  {consentMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Speichern
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-3">
            {consents.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">Keine Einwilligungen vorhanden</CardContent></Card>
            ) : consents.map(c => (
              <Card key={c.id}>
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold">{CONSENT_TYPES[c.consentType] || c.consentType}</div>
                    <div className="text-sm text-muted-foreground">
                      User #{c.userId} · {c.consented ? "Einwilligt" : "Widerrufen"} · {new Date(c.consentedAt).toLocaleString("de-DE")}
                    </div>
                  </div>
                  <Badge variant={c.consented ? "default" : "destructive"}>{c.consented ? "ja" : "nein"}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Eigene Daten herunterladen</CardTitle></CardHeader>
            <CardContent>
              <Button variant="outline" onClick={exportOwnData} className="gap-2"><Download className="size-4" /> Meine Daten exportieren (JSON)</Button>
            </CardContent>
          </Card>
          {isAdmin && (
            <Card>
              <CardHeader><CardTitle className="text-base">Datenauszug für Mitglied</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                  <SelectTrigger><SelectValue placeholder="Mitglied wählen…" /></SelectTrigger>
                  <SelectContent>
                    {members.map(m => <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button disabled={!selectedMemberId} onClick={() => exportMemberData(selectedMemberId)} className="gap-2"><Download className="size-4" /> Export starten</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="delete" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Löschung beantragen</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Grund (optional)</Label>
                <Input value={deleteReason} onChange={e => setDeleteReason(e.target.value)} placeholder="z.B. Vereinsaustritt" />
              </div>
              <Button
                variant="destructive"
                disabled={deleteRequestMutation.isPending}
                onClick={() => deleteRequestMutation.mutate(deleteReason)}
                className="gap-2"
              >
                {deleteRequestMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />} Lösch-Antrag einreichen
              </Button>
            </CardContent>
          </Card>

          {isAdmin && (
            <Card>
              <CardHeader><CardTitle className="text-base">Offene Löschanträge</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {deletionRequests.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Keine Anträge vorhanden.</p>
                ) : deletionRequests.map(r => (
                  <div key={r.id} className="rounded-md border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">Antrag #{r.id}</div>
                        <div className="text-sm text-muted-foreground">User #{r.userId} · {new Date(r.requestedAt).toLocaleString("de-DE")}</div>
                      </div>
                      <Badge variant={r.status === "pending" ? "secondary" : r.status === "approved" ? "default" : "destructive"}>{STATUS_LABELS[r.status] || r.status}</Badge>
                    </div>
                    {r.reason && <p className="text-sm">{r.reason}</p>}
                    {r.status === "pending" && (
                      <div className="space-y-2">
                        <Input placeholder="Begründung / Hinweis" value={reviewNotes[r.id] || ""} onChange={e => setReviewNotes(prev => ({ ...prev, [r.id]: e.target.value }))} />
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => reviewMutation.mutate({ id: r.id, status: "approved" })} disabled={reviewMutation.isPending}>Genehmigen</Button>
                          <Button size="sm" variant="destructive" onClick={() => reviewMutation.mutate({ id: r.id, status: "rejected" })} disabled={reviewMutation.isPending}>Ablehnen</Button>
                        </div>
                      </div>
                    )}
                    {r.notes && <p className="text-xs text-muted-foreground">Admin-Notiz: {r.notes}</p>}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
