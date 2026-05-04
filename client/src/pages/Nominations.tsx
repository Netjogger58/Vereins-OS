import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, XCircle, Clock, Plus, Trash2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Event = { id: number; title: string; type: string; date: string; time?: string; teamId?: number };
type Member = { id: number; name: string; photoUrl?: string; teamId?: number; userId?: number | null };
type Nomination = { id: number; eventId: number; memberId: number; nominatedById: number; response?: string; reason?: string; createdAt: string };
type User = { id: number; name: string; role: string; teamId?: number };

export default function Nominations() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [responseDialog, setResponseDialog] = useState<{ open: boolean; nominationId: number; memberName: string } | null>(null);
  const [responseValue, setResponseValue] = useState<"ja" | "nein">("ja");
  const [reasonText, setReasonText] = useState("");

  const { data: me } = useQuery<User>({ queryKey: ["/api/auth/me"] });
  const { data: events = [] } = useQuery<Event[]>({ queryKey: ["/api/events"] });
  const { data: members = [] } = useQuery<Member[]>({ queryKey: ["/api/members"] });

  const spielEvents = events.filter(e => e.type === "spiel").sort((a, b) => a.date.localeCompare(b.date));
  const selectedEvent = spielEvents.find(e => e.id === Number(selectedEventId));

  const { data: nominations = [] } = useQuery<Nomination[]>({
    queryKey: ["/api/nominations/event", selectedEventId],
    queryFn: () => selectedEventId ? apiRequest("GET", `/api/nominations/event/${selectedEventId}`).then(r => r.json()) : Promise.resolve([]),
    enabled: !!selectedEventId,
  });

  const teamMembers = selectedEvent?.teamId
    ? members.filter(m => m.teamId === selectedEvent.teamId)
    : members;

  const nominatedIds = new Set(nominations.map(n => n.memberId));
  const unnominatedMembers = teamMembers.filter(m => !nominatedIds.has(m.id));

  const nominateMutation = useMutation({
    mutationFn: (memberId: number) => apiRequest("POST", "/api/nominations", {
      eventId: Number(selectedEventId),
      memberId,
      nominatedById: me!.id,
    }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/nominations/event", selectedEventId] }); },
    onError: () => toast({ title: "Fehler", description: "Nominierung fehlgeschlagen", variant: "destructive" }),
  });

  const nominateAll = useMutation({
    mutationFn: async () => {
      for (const m of unnominatedMembers) {
        await apiRequest("POST", "/api/nominations", { eventId: Number(selectedEventId), memberId: m.id, nominatedById: me!.id }).then(r => r.json());
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/nominations/event", selectedEventId] }); toast({ title: "Alle nominiert" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/nominations/${id}`).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/nominations/event", selectedEventId] }); },
  });

  const responseMutation = useMutation({
    mutationFn: ({ id, response, reason }: { id: number; response: string; reason?: string }) =>
      apiRequest("PATCH", `/api/nominations/${id}/response`, { response, reason }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/nominations/event", selectedEventId] });
      setResponseDialog(null);
      setReasonText("");
      toast({ title: responseValue === "ja" ? "Bestätigt ✓" : "Abgelehnt" });
    },
  });

  const isTrainer = me?.role === "trainer" || me?.role === "präsident" || me?.role === "admin";
  const isSpieler = me?.role === "spieler";

  const getMember = (id: number) => members.find(m => m.id === id);

  const responseIcon = (r?: string) => {
    if (r === "ja") return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (r === "nein") return <XCircle className="h-4 w-4 text-red-500" />;
    return <Clock className="h-4 w-4 text-yellow-500" />;
  };

  const responseBadge = (r?: string) => {
    if (r === "ja") return <Badge className="bg-green-100 text-green-800">Zugesagt</Badge>;
    if (r === "nein") return <Badge className="bg-red-100 text-red-800">Abgesagt</Badge>;
    return <Badge className="bg-yellow-100 text-yellow-800">Ausstehend</Badge>;
  };

  // For spieler: find their nominations
  const myNominations = nominations.filter(n => {
    const member = members.find(m => m.userId === me?.id);
    return member && n.memberId === member.id;
  });

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary">Spieler-Nominierung</h1>
      </div>

      {/* Event selection */}
      <Card>
        <CardHeader><CardTitle className="text-base">Spiel auswählen</CardTitle></CardHeader>
        <CardContent>
          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger data-testid="select-event">
              <SelectValue placeholder="Spiel wählen..." />
            </SelectTrigger>
            <SelectContent>
              {spielEvents.map(e => (
                <SelectItem key={e.id} value={String(e.id)}>
                  {e.date} — {e.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedEventId && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Nominiert", count: nominations.length, color: "text-primary" },
              { label: "Zugesagt", count: nominations.filter(n => n.response === "ja").length, color: "text-green-600" },
              { label: "Abgesagt", count: nominations.filter(n => n.response === "nein").length, color: "text-red-600" },
            ].map(s => (
              <Card key={s.label}>
                <CardContent className="pt-4 text-center">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Trainer view: manage nominations */}
          {isTrainer && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Nominierungsliste</CardTitle>
                  {unnominatedMembers.length > 0 && (
                    <Button size="sm" variant="outline" onClick={() => nominateAll.mutate()} disabled={nominateAll.isPending}>
                      <Users className="h-4 w-4 mr-1" /> Alle nominieren
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {nominations.map(nom => {
                  const member = getMember(nom.memberId);
                  return (
                    <div key={nom.id} className="flex items-center gap-3 p-2 rounded-lg border bg-card" data-testid={`nomination-row-${nom.id}`}>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member?.photoUrl ?? undefined} />
                        <AvatarFallback>{member?.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{member?.name ?? "Unbekannt"}</p>
                        {nom.reason && <p className="text-xs text-muted-foreground">"{nom.reason}"</p>}
                      </div>
                      {responseIcon(nom.response)}
                      {responseBadge(nom.response)}
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400" onClick={() => deleteMutation.mutate(nom.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
                {nominations.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">Noch keine Spieler nominiert.</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Add individual nominations */}
          {isTrainer && unnominatedMembers.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Spieler hinzufügen</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {unnominatedMembers.map(m => (
                  <div key={m.id} className="flex items-center gap-3 p-2 rounded-lg border hover:bg-muted/40">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={m.photoUrl ?? undefined} />
                      <AvatarFallback>{m.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="flex-1 text-sm">{m.name}</span>
                    <Button size="sm" variant="outline" onClick={() => nominateMutation.mutate(m.id)} disabled={nominateMutation.isPending}>
                      <Plus className="h-3 w-3 mr-1" /> Nominieren
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Spieler view: respond to nominations */}
          {isSpieler && myNominations.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Meine Nominierungen</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {myNominations.map(nom => (
                  <div key={nom.id} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{selectedEvent?.title}</p>
                      <p className="text-xs text-muted-foreground">{selectedEvent?.date} {selectedEvent?.time}</p>
                      {nom.reason && <p className="text-xs text-muted-foreground mt-1">"{nom.reason}"</p>}
                    </div>
                    {nom.response ? (
                      responseBadge(nom.response)
                    ) : (
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => {
                          setResponseDialog({ open: true, nominationId: nom.id, memberName: "" });
                          setResponseValue("ja");
                        }}>Ja</Button>
                        <Button size="sm" variant="destructive" onClick={() => {
                          setResponseDialog({ open: true, nominationId: nom.id, memberName: "" });
                          setResponseValue("nein");
                        }}>Nein</Button>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Response dialog */}
      <Dialog open={!!responseDialog?.open} onOpenChange={() => setResponseDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{responseValue === "ja" ? "Zusagen" : "Absagen"}</DialogTitle>
          </DialogHeader>
          {responseValue === "nein" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Begründung (Pflicht bei Absage)</label>
              <Textarea
                placeholder="z.B. Verletzung, beruflich verhindert..."
                value={reasonText}
                onChange={e => setReasonText(e.target.value)}
                data-testid="input-reason"
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setResponseDialog(null)}>Abbrechen</Button>
            <Button
              disabled={responseValue === "nein" && !reasonText.trim()}
              className={responseValue === "ja" ? "bg-green-600 hover:bg-green-700" : ""}
              variant={responseValue === "nein" ? "destructive" : "default"}
              onClick={() => {
                if (responseDialog) {
                  responseMutation.mutate({ id: responseDialog.nominationId, response: responseValue, reason: reasonText || undefined });
                }
              }}
            >
              {responseValue === "ja" ? "Zusagen ✓" : "Absagen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
