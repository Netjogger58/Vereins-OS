import { useState, useMemo, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Mail, Phone, MapPin, ChevronRight, Upload, FileSpreadsheet } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { initials } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { CAT_CODE_LABELS } from "@shared/schema";
import type { Member, Team } from "@shared/schema";

// Anzeige-Label: echtes Team -> sonst FLH-Kategorie -> sonst Rolle/Typ -> "—"
const MEMBER_TYPE_LABELS: Record<string, string> = {
  honoraire: "Ehrenmitglied", ehrenmitglied: "Ehrenmitglied", sponsor: "Sponsor",
  donateur: "Donateur", donateur_licence: "Donateur (Lizenz)", donateur_lizenz: "Donateur (Lizenz)", contact: "Kontakt",
};
// Nachname komplett groß, Vorname nur erster Buchstabe je Wort groß.
const formatLastName = (s: string) => s.toUpperCase();
const formatFirstName = (s: string) =>
  s.replace(/\S+/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
function MemberName({ m }: { m: Member }) {
  const first = (m as any).firstName as string | null | undefined;
  const last = (m as any).lastName as string | null | undefined;
  if (!last) return <>{m.name}</>;
  return (
    <span className="font-normal">
      {first ? `${formatFirstName(first)} ` : ""}
      <span className="font-bold">{formatLastName(last)}</span>
    </span>
  );
}

function memberCategoryLabel(m: Member, teamName?: string): string {
  if (teamName) return teamName;
  const cat = (m as any).catCode as number | null | undefined;
  if (cat && CAT_CODE_LABELS[cat]) return `${CAT_CODE_LABELS[cat]} (FLH)`;
  const contact = (m as any).contactInfoType as string | null | undefined;
  if (contact === "contact_famille") return "Kontakt (Familie)";
  if (contact === "mere_accueil") return "Mère d'accueil";
  const type = (m as any).memberType as string | null | undefined;
  if (type && MEMBER_TYPE_LABELS[type]) return MEMBER_TYPE_LABELS[type];
  return "—";
}

export default function Members() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [openNew, setOpenNew] = useState(false);
  const [newForm, setNewForm] = useState({
    name: "",
    email: "",
    phone: "",
    birthdate: "",
    address: "",
    teamId: "",
    licenseNumber: "",
    membershipStatus: "active",
  });

  const { data: members = [] } = useQuery<Member[]>({ queryKey: ["/api/members"] });
  const { data: teams = [] } = useQuery<Team[]>({ queryKey: ["/api/teams"] });

  const createMut = useMutation({
    mutationFn: async (data: any) => (await apiRequest("POST", "/api/members", { ...data, teamId: data.teamId ? Number(data.teamId) : null })).json(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      setOpenNew(false);
      setNewForm({ name: "", email: "", phone: "", birthdate: "", address: "", teamId: "", licenseNumber: "", membershipStatus: "active" });
      toast({ title: "Mitglied angelegt" });
    },
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter(m => {
      if (teamFilter !== "all" && m.teamId !== Number(teamFilter)) return false;
      if (statusFilter !== "all" && m.membershipStatus !== statusFilter) return false;
      if (!q) return true;
      const team = teams.find(t => t.id === m.teamId);
      const hay = [
        m.name, m.email, m.phone, m.licenseNumber,
        (m as any).matricule, (m as any).familyCode,
        memberCategoryLabel(m, team?.name),
      ].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [members, teams, query, teamFilter, statusFilter]);

  const canEdit = user && ["präsident", "admin", "trainer", "secretaire"].includes(user.role);
  const canImport = user && ["präsident", "admin", "secretaire"].includes(user.role);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight">Mitglieder</h1>
          <p className="text-sm text-muted-foreground">{members.length} Mitglieder im Verein</p>
        </div>
        <div className="flex gap-2">
          {canImport && (
            <Link href="/import">
              <Button variant="outline" data-testid="button-import">
                <FileSpreadsheet className="size-4 mr-1" /> Import
              </Button>
            </Link>
          )}
          {canEdit && (
            <Dialog open={openNew} onOpenChange={setOpenNew}>
              <DialogTrigger asChild>
                <Button data-testid="button-new-member"><Plus className="size-4 mr-1" /> Mitglied</Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Neues Mitglied</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Name" className="col-span-2">
                  <Input value={newForm.name} onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))} data-testid="input-name" />
                </Field>
                <Field label="E-Mail">
                  <Input type="email" value={newForm.email} onChange={e => setNewForm(f => ({ ...f, email: e.target.value }))} />
                </Field>
                <Field label="Telefon">
                  <Input value={newForm.phone} onChange={e => setNewForm(f => ({ ...f, phone: e.target.value }))} />
                </Field>
                <Field label="Geburtsdatum">
                  <Input type="date" value={newForm.birthdate} onChange={e => setNewForm(f => ({ ...f, birthdate: e.target.value }))} />
                </Field>
                <Field label="Lizenz-Nr.">
                  <Input value={newForm.licenseNumber} onChange={e => setNewForm(f => ({ ...f, licenseNumber: e.target.value }))} />
                </Field>
                <Field label="Adresse" className="col-span-2">
                  <Input value={newForm.address} onChange={e => setNewForm(f => ({ ...f, address: e.target.value }))} />
                </Field>
                <Field label="Team">
                  <Select value={newForm.teamId} onValueChange={v => setNewForm(f => ({ ...f, teamId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Team wählen" /></SelectTrigger>
                    <SelectContent>
                      {teams.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Status">
                  <Select value={newForm.membershipStatus} onValueChange={v => setNewForm(f => ({ ...f, membershipStatus: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Aktiv</SelectItem>
                      <SelectItem value="inactive">Inaktiv</SelectItem>
                      <SelectItem value="pending">Wartend</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpenNew(false)}>Abbrechen</Button>
                <Button onClick={() => createMut.mutate(newForm)} disabled={!newForm.name || createMut.isPending}>
                  Speichern
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3 flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Suche: Name, Email, Tel, Lizenz, Matricule, Kategorie, Familiencode…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search"
            />
          </div>
          <Select value={teamFilter} onValueChange={setTeamFilter}>
            <SelectTrigger className="md:w-[180px]" data-testid="select-team"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Teams</SelectItem>
              {teams.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="md:w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Status</SelectItem>
              <SelectItem value="active">Aktiv</SelectItem>
              <SelectItem value="inactive">Inaktiv</SelectItem>
              <SelectItem value="pending">Wartend</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardContent className="p-0 divide-y divide-border">
          {filtered.length === 0 && (
            <div className="p-12 text-center text-sm text-muted-foreground">
              Keine Mitglieder gefunden
            </div>
          )}
          {filtered.map(m => {
            const team = teams.find(t => t.id === m.teamId);
            return (
              <Link
                key={m.id}
                href={`/members/${m.id}`}
                className="flex items-center gap-3 p-3 hover-elevate"
                data-testid={`row-member-${m.id}`}
              >
                <Avatar className="size-10">
                  <AvatarImage src={m.photoUrl || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {initials(m.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate"><MemberName m={m} /></div>
                  <div className="text-xs text-muted-foreground truncate">
                    {memberCategoryLabel(m, team?.name)}
                    {m.licenseNumber && <> · {m.licenseNumber}</>}
                  </div>
                </div>
                <StatusBadge status={m.membershipStatus} />
                <ChevronRight className="size-4 text-muted-foreground" />
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    active: { label: "Aktiv", className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30" },
    inactive: { label: "Inaktiv", className: "bg-muted text-muted-foreground border-border" },
    pending: { label: "Wartend", className: "bg-secondary/20 text-secondary-foreground border-secondary/40" },
  };
  const m = map[status] || map.active;
  return <Badge variant="outline" className={`text-[10px] ${m.className}`}>{m.label}</Badge>;
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className || ""}`}>
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
