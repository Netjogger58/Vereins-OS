import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { KeyRound, Plus, Trash2, Copy, Users, Power } from "lucide-react";
import type { TrainerCode, Team, User } from "@shared/schema";

interface TrainerCodeForm {
  name: string;
  userId: string;
  allTeams: boolean;
  teamIds: number[];
}

const EMPTY_FORM: TrainerCodeForm = { name: "", userId: "", allTeams: false, teamIds: [] };

function parseTeamIds(raw: string | null): number[] {
  try {
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed.map(Number).filter((n) => !Number.isNaN(n)) : [];
  } catch {
    return [];
  }
}

export default function TrainerCodes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TrainerCode | null>(null);
  const [form, setForm] = useState<TrainerCodeForm>(EMPTY_FORM);

  const canManage = user && ["präsident", "admin"].includes(user.role);

  const { data: codes = [] } = useQuery<TrainerCode[]>({
    queryKey: ["/api/trainer-codes"],
    queryFn: async () => (await apiRequest("GET", "/api/trainer-codes")).json(),
  });
  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
    queryFn: async () => (await apiRequest("GET", "/api/teams")).json(),
  });
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
    queryFn: async () => (await apiRequest("GET", "/api/users")).json(),
    enabled: !!canManage,
  });

  const teamName = (id: number) => teams.find((t) => t.id === id)?.name || `#${id}`;

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["/api/trainer-codes"] });

  const createMut = useMutation({
    mutationFn: async (data: TrainerCodeForm) =>
      (await apiRequest("POST", "/api/trainer-codes", {
        name: data.name,
        userId: data.userId ? Number(data.userId) : null,
        allTeams: data.allTeams,
        teamIds: data.allTeams ? [] : data.teamIds,
      })).json(),
    onSuccess: () => {
      invalidate();
      setDialogOpen(false);
      toast({ title: "Trainer-Code erstellt" });
    },
    onError: (e: any) => toast({ title: "Fehler", description: String(e?.message || e), variant: "destructive" }),
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) =>
      (await apiRequest("PATCH", `/api/trainer-codes/${id}`, data)).json(),
    onSuccess: () => {
      invalidate();
      setDialogOpen(false);
      toast({ title: "Gespeichert" });
    },
    onError: (e: any) => toast({ title: "Fehler", description: String(e?.message || e), variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => (await apiRequest("DELETE", `/api/trainer-codes/${id}`)).json(),
    onSuccess: () => {
      invalidate();
      toast({ title: "Gelöscht" });
    },
  });

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (c: TrainerCode) => {
    setEditing(c);
    setForm({
      name: c.name,
      userId: c.userId ? String(c.userId) : "",
      allTeams: c.allTeams,
      teamIds: parseTeamIds(c.teamIds),
    });
    setDialogOpen(true);
  };

  const submit = () => {
    if (!form.name.trim()) {
      toast({ title: "Name erforderlich", variant: "destructive" });
      return;
    }
    if (editing) {
      updateMut.mutate({
        id: editing.id,
        data: {
          name: form.name,
          userId: form.userId ? Number(form.userId) : null,
          allTeams: form.allTeams,
          teamIds: form.allTeams ? [] : form.teamIds,
        },
      });
    } else {
      createMut.mutate(form);
    }
  };

  const toggleTeam = (id: number) => {
    setForm((f) => ({
      ...f,
      teamIds: f.teamIds.includes(id) ? f.teamIds.filter((x) => x !== id) : [...f.teamIds, id],
    }));
  };

  const copyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    toast({ title: "Code kopiert", description: code });
  };

  if (!canManage) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Keine Berechtigung.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <KeyRound className="h-6 w-6" /> Trainer-Codes
          </h1>
          <p className="text-muted-foreground text-sm">
            8-stellige Zugangscodes für Trainer – gültig für alle oder ausgewählte Teams.
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-2" /> Neuer Code
        </Button>
      </div>

      <div className="grid gap-3">
        {codes.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Noch keine Trainer-Codes angelegt.
            </CardContent>
          </Card>
        )}
        {codes.map((c) => {
          const ids = parseTeamIds(c.teamIds);
          return (
            <Card key={c.id} className={c.active ? "" : "opacity-60"}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {c.name}
                      {!c.active && <Badge variant="secondary">inaktiv</Badge>}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <code className="font-mono text-base tracking-widest bg-muted px-2 py-0.5 rounded">
                        {c.code}
                      </code>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyCode(c.code)}>
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateMut.mutate({ id: c.id, data: { active: !c.active } })}
                      title={c.active ? "Deaktivieren" : "Aktivieren"}
                    >
                      <Power className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openEdit(c)}>
                      Bearbeiten
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (confirm(`Code "${c.name}" wirklich löschen?`)) deleteMut.mutate(c.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-2 flex-wrap text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  {c.allTeams ? (
                    <Badge>Alle Teams</Badge>
                  ) : ids.length > 0 ? (
                    ids.map((id) => (
                      <Badge key={id} variant="secondary">
                        {teamName(id)}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">Keine Teams zugeordnet</span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Trainer-Code bearbeiten" : "Neuer Trainer-Code"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="tc-name">Trainername</Label>
              <Input
                id="tc-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="z.B. Max Mustermann"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Benutzerkonto verknüpfen (optional)</Label>
              <Select
                value={form.userId || "none"}
                onValueChange={(v) => setForm((f) => ({ ...f, userId: v === "none" ? "" : v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kein Konto (externer Trainer)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Kein Konto (externer Trainer)</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={String(u.id)}>
                      {u.name || u.email} ({u.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="tc-all"
                checked={form.allTeams}
                onCheckedChange={(v) => setForm((f) => ({ ...f, allTeams: !!v }))}
              />
              <Label htmlFor="tc-all" className="cursor-pointer">
                Gilt für alle Teams
              </Label>
            </div>

            {!form.allTeams && (
              <div className="space-y-1.5">
                <Label>Teams</Label>
                <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto border rounded-md p-2">
                  {teams.map((t) => (
                    <label key={t.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={form.teamIds.includes(t.id)}
                        onCheckedChange={() => toggleTeam(t.id)}
                      />
                      {t.name}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={submit} disabled={createMut.isPending || updateMut.isPending}>
              {editing ? "Speichern" : "Erstellen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
