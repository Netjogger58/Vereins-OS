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
import { isActiveClubMember } from "@shared/memberStatus";

// Anzeige-Label: echtes Team -> sonst FLH-Kategorie -> sonst Rolle/Typ -> "—"
const MEMBER_TYPE_LABELS: Record<string, string> = {
  honoraire: "Ehrenmitglied", ehrenmitglied: "Ehrenmitglied", sponsor: "Sponsor",
  donateur: "Donateur", donateur_licence: "Donateur (Lizenz)", donateur_lizenz: "Donateur (Lizenz)", contact: "Kontakt",
  loisir: "Kidssport & Loisir",
};
// Nachname komplett groß, Vorname nur erster Buchstabe je Wort groß.
const formatLastName = (s: string) => s.toUpperCase();
const formatFirstName = (s: string) =>
  s.toLowerCase().replace(/(^|[\s\-'’])([a-zà-ÿ])/g, (_m, sep, ch) => sep + ch.toUpperCase());
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
    lastName: "",
    firstName: "",
    cardId: "",
    language: "",
    nationality: "",
    gender: "",
    address: "",
    postalCode: "",
    locality: "",
    courrier: "",
    catCode: "",
    internalCategory: "",
    flhCategory: "",
    isStudent: false,
    passNumber: "",
    licenceOff: "",
    licenceZS: "",
    licenceSR: "",
    licenceCL: "",
    comments: "",
    transferEndSeason: "",
    licenseStartDate: "",
    joinDate: "",
    medicoNext: "",
    birthdate: "",
    matricule: "",
    birthPlace: "",
    phone: "",
    phoneOffice: "",
    gsm: "",
    email: "",
    teamId: "",
    memberType: "spieler",
    familyCode: "",
    membershipStatus: "pending",
  });

  const { data: members = [] } = useQuery<Member[]>({ queryKey: ["/api/members"] });
  const { data: teams = [] } = useQuery<Team[]>({ queryKey: ["/api/teams"] });

  const [savedCount, setSavedCount] = useState(0);

  const generateCardId = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let id = "";
    for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)];
    return id;
  };

  const autoMatchTeam = (cat: string, teams: Team[]): string => {
    if (!cat) return "";
    const catUpper = cat.toUpperCase().trim();
    const match = teams.find(t => t.name?.toUpperCase().includes(catUpper));
    return match ? String(match.id) : "";
  };

  // Alter → Kategorie (Handball-Saison: 1. Aug → 31. Juli)
  // Bis U13: Mixte (F+M zesummen). Vun U15 un: getrennt baséiert op Geschlecht (gender).
  const ageToCategory = (birthdate: string, gender: string): { catCode: string; internalCat: string; flhCat: string } => {
    if (!birthdate) return { catCode: "", internalCat: "", flhCat: "" };
    const bd = new Date(birthdate);
    if (isNaN(bd.getTime())) return { catCode: "", internalCat: "", flhCat: "" };
    const now = new Date();
    const seasonYear = now.getMonth() >= 7 ? now.getFullYear() + 1 : now.getFullYear();
    const age = seasonYear - bd.getFullYear();
    const g = gender === "F" ? "F" : "H";
    let label: string;
    let code: number;
    if (age <= 4) { label = "U4 Mixte"; code = 19; }
    else if (age <= 6) { label = "U7 Mixte"; code = 18; }
    else if (age <= 8) { label = "U9 Mixte"; code = 17; }
    else if (age <= 10) { label = "U11 Mixte"; code = 16; }
    else if (age <= 12) { label = "U13 Mixte"; code = 15; }
    else if (age <= 14) { label = `U15${g}`; code = g === "F" ? 34 : 14; }
    else if (age <= 16) { label = `U17${g}`; code = g === "F" ? 33 : 13; }
    else if (age <= 20) { label = `U21${g}`; code = g === "F" ? 32 : 12; }
    else { label = g === "F" ? "Seniors FE" : "Seniors H"; code = g === "F" ? 31 : 11; }
    return { catCode: String(code), internalCat: label, flhCat: label };
  };

  const buildPayload = (data: any) => {
    const { lastName, firstName, ...rest } = data;
    const name = [firstName, lastName].filter(Boolean).join(" ").trim() || lastName;
    return { ...rest, name, firstName: firstName || null, lastName: lastName || null, teamId: data.teamId ? Number(data.teamId) : null, catCode: data.catCode ? Number(data.catCode) : null };
  };

  const resetFormKeepFamily = (famFields: { address: string; postalCode: string; locality: string; familyCode: string; courrier: string }) => {
    setNewForm({
      lastName: "", firstName: "", cardId: "", language: "", nationality: "", gender: "",
      address: famFields.address, postalCode: famFields.postalCode, locality: famFields.locality, courrier: famFields.courrier, catCode: "",
      internalCategory: "", flhCategory: "", isStudent: false, passNumber: "",
      licenceOff: "", licenceZS: "", licenceSR: "", licenceCL: "", comments: "",
      transferEndSeason: "", licenseStartDate: "", joinDate: "", medicoNext: "",
      birthdate: "", matricule: "", birthPlace: "", phone: "", phoneOffice: "",
      gsm: "", email: "", teamId: "", memberType: "spieler", familyCode: famFields.familyCode,
      membershipStatus: "pending",
    });
  };

  const createMut = useMutation({
    mutationFn: async (data: any) => (await apiRequest("POST", "/api/members", buildPayload(data))).json(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      setSavedCount(c => c + 1);
      toast({ title: "Mitglied angelegt" });
    },
  });

  const handleSaveAndNext = () => {
    const famFields = {
      address: newForm.address,
      postalCode: newForm.postalCode,
      locality: newForm.locality,
      familyCode: newForm.familyCode,
      courrier: newForm.courrier,
    };
    createMut.mutate(newForm, {
      onSuccess: () => {
        resetFormKeepFamily(famFields);
      },
    });
  };

  const handleSaveAndClose = () => {
    createMut.mutate(newForm, {
      onSuccess: () => {
        setOpenNew(false);
        setNewForm({
          lastName: "", firstName: "", cardId: "", language: "", nationality: "", gender: "",
          address: "", postalCode: "", locality: "", courrier: "", catCode: "",
          internalCategory: "", flhCategory: "", isStudent: false, passNumber: "",
          licenceOff: "", licenceZS: "", licenceSR: "", licenceCL: "", comments: "",
          transferEndSeason: "", licenseStartDate: "", joinDate: "", medicoNext: "",
          birthdate: "", matricule: "", birthPlace: "", phone: "", phoneOffice: "",
          gsm: "", email: "", teamId: "", memberType: "spieler", familyCode: "",
          membershipStatus: "pending",
        });
        setSavedCount(0);
      },
    });
  };

  const activeCount = useMemo(() => members.filter(isActiveClubMember).length, [members]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter(m => {
      const archived = !isActiveClubMember(m);
      // Ex-Mitglieder (Ancien Membres) nur zeigen, wenn explizit ausgewählt; sonst ausblenden.
      if (statusFilter === "ehemalig") {
        if (!archived) return false;
      } else {
        if (archived) return false;
        if (statusFilter !== "all" && m.membershipStatus !== statusFilter) return false;
      }
      if (teamFilter !== "all" && m.teamId !== Number(teamFilter)) return false;
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
          <p className="text-sm text-muted-foreground">{activeCount} Mitglieder im Verein</p>
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
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Neues Mitglied{savedCount > 0 && ` (${savedCount} angelegt)`}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {/* Identitéit */}
                <Field label="Nom(s) *" className="col-span-2 md:col-span-1">
                  <Input value={newForm.lastName} onChange={e => setNewForm(f => ({ ...f, lastName: e.target.value }))} data-testid="input-name" placeholder="NOM" />
                </Field>
                <Field label="Prénom(s) *" className="col-span-2 md:col-span-1">
                  <Input value={newForm.firstName} onChange={e => setNewForm(f => ({ ...f, firstName: e.target.value }))} placeholder="Prénom" />
                </Field>
                <Field label="Sexe">
                  <Select value={newForm.gender} onValueChange={v => {
                    const cats = ageToCategory(newForm.birthdate, v);
                    const teamId = autoMatchTeam(cats.internalCat, teams);
                    setNewForm(f => ({ ...f, gender: v, catCode: cats.catCode || f.catCode, internalCategory: cats.internalCat || f.internalCategory, flhCategory: cats.flhCat || f.flhCategory, teamId: teamId || f.teamId }));
                  }}>
                    <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">M (Männlech)</SelectItem>
                      <SelectItem value="F">F (Weiblech)</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Card-ID">
                  <Select
                    value={newForm.cardId ? "J" : "N"}
                    onValueChange={v => {
                      if (v === "J") {
                        setNewForm(f => ({ ...f, cardId: generateCardId() }));
                      } else {
                        setNewForm(f => ({ ...f, cardId: "" }));
                      }
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="N" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="N">Neen</SelectItem>
                      <SelectItem value="J">Jo – generéieren</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    value={newForm.cardId}
                    onChange={e => setNewForm(f => ({ ...f, cardId: e.target.value.toUpperCase().slice(0, 8) }))}
                    className="mt-1 text-xs font-mono"
                    placeholder="XXXXXXXX (8 Zeechen)"
                    maxLength={8}
                  />
                </Field>
                <Field label="Langue">
                  <Select value={newForm.language} onValueChange={v => setNewForm(f => ({ ...f, language: v }))}>
                    <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L">L</SelectItem>
                      <SelectItem value="F">F</SelectItem>
                      <SelectItem value="D">D</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Nationalité">
                  <Input value={newForm.nationality} onChange={e => setNewForm(f => ({ ...f, nationality: e.target.value }))} placeholder="z.B. LU, FR, PT" />
                </Field>
                {/* Adress */}
                <Field label="Adresse" className="col-span-2 md:col-span-2">
                  <Input value={newForm.address} onChange={e => setNewForm(f => ({ ...f, address: e.target.value }))} />
                </Field>
                <Field label="Code postale">
                  <Input value={newForm.postalCode} onChange={e => setNewForm(f => ({ ...f, postalCode: e.target.value }))} placeholder="z.B. L-7512" />
                </Field>
                <Field label="Localité">
                  <Input value={newForm.locality} onChange={e => setNewForm(f => ({ ...f, locality: e.target.value }))} />
                </Field>
                <Field label="Code courrier">
                  <Input value={newForm.courrier} onChange={e => setNewForm(f => ({ ...f, courrier: e.target.value }))} placeholder="F999 / S / D" />
                </Field>
                {/* Kategorien */}
                <Field label="Cat (Code)">
                  <Input type="number" value={newForm.catCode} onChange={e => setNewForm(f => ({ ...f, catCode: e.target.value }))} placeholder="1-30 / 31-" />
                </Field>
                <Field label="Cat. interne M75">
                  <Input value={newForm.internalCategory} onChange={e => {
                    const val = e.target.value;
                    const teamId = autoMatchTeam(val, teams);
                    setNewForm(f => ({ ...f, internalCategory: val, teamId: teamId || f.teamId }));
                  }} placeholder="z.B. U13H" />
                </Field>
                <Field label="Cat. FLH">
                  <Input value={newForm.flhCategory} onChange={e => {
                    const val = e.target.value;
                    const teamId = autoMatchTeam(val, teams);
                    setNewForm(f => ({ ...f, flhCategory: val, teamId: teamId || f.teamId }));
                  }} placeholder="z.B. U13H" />
                </Field>
                <Field label="Etudiant">
                  <Select value={newForm.isStudent ? "yes" : "no"} onValueChange={v => setNewForm(f => ({ ...f, isStudent: v === "yes" }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">Neen</SelectItem>
                      <SelectItem value="yes">Jo</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                {/* Lizenzen */}
                <Field label="Pass Nummer">
                  <Input value={newForm.passNumber} onChange={e => {
                    const val = e.target.value;
                    setNewForm(f => ({ ...f, passNumber: val, membershipStatus: val.trim() ? "active" : f.membershipStatus }));
                  }} />
                </Field>
                <Field label="Licence Off">
                  <Input value={newForm.licenceOff} onChange={e => setNewForm(f => ({ ...f, licenceOff: e.target.value }))} />
                </Field>
                <Field label="Licence ZS">
                  <Input value={newForm.licenceZS} onChange={e => setNewForm(f => ({ ...f, licenceZS: e.target.value }))} />
                </Field>
                <Field label="Licence SR">
                  <Input value={newForm.licenceSR} onChange={e => setNewForm(f => ({ ...f, licenceSR: e.target.value }))} />
                </Field>
                <Field label="Licence CL">
                  <Input value={newForm.licenceCL} onChange={e => setNewForm(f => ({ ...f, licenceCL: e.target.value }))} />
                </Field>
                {/* Sekretariat */}
                <Field label="Commentaires / Changements" className="col-span-2 md:col-span-3">
                  <Input value={newForm.comments} onChange={e => setNewForm(f => ({ ...f, comments: e.target.value }))} />
                </Field>
                <Field label="Transfer à faire en fin de saison">
                  <Input value={newForm.transferEndSeason} onChange={e => setNewForm(f => ({ ...f, transferEndSeason: e.target.value }))} />
                </Field>
                {/* Daten */}
                <Field label="Date début licence">
                  <Input type="date" value={newForm.licenseStartDate} onChange={e => setNewForm(f => ({ ...f, licenseStartDate: e.target.value }))} />
                </Field>
                <Field label="Date début membre">
                  <Input type="date" value={newForm.joinDate} onChange={e => setNewForm(f => ({ ...f, joinDate: e.target.value }))} />
                </Field>
                <Field label="Prochain Médico">
                  <Input type="date" value={newForm.medicoNext} onChange={e => setNewForm(f => ({ ...f, medicoNext: e.target.value }))} />
                </Field>
                <Field label="Naissance (Geburtsdatum)">
                  <Input type="date" value={newForm.birthdate} onChange={e => {
                    const val = e.target.value;
                    const cats = ageToCategory(val, newForm.gender);
                    const teamId = autoMatchTeam(cats.internalCat, teams);
                    setNewForm(f => ({
                      ...f,
                      birthdate: val,
                      catCode: cats.catCode || f.catCode,
                      internalCategory: cats.internalCat || f.internalCategory,
                      flhCategory: cats.flhCat || f.flhCategory,
                      teamId: teamId || f.teamId,
                    }));
                  }} />
                </Field>
                <Field label="Matricule">
                  <Input value={newForm.matricule} onChange={e => setNewForm(f => ({ ...f, matricule: e.target.value }))} />
                </Field>
                <Field label="Lieu et pays de naissance">
                  <Input value={newForm.birthPlace} onChange={e => setNewForm(f => ({ ...f, birthPlace: e.target.value }))} />
                </Field>
                {/* Kontakt */}
                <Field label="Tél.">
                  <Input value={newForm.phone} onChange={e => setNewForm(f => ({ ...f, phone: e.target.value }))} />
                </Field>
                <Field label="Tél.-Bureau">
                  <Input value={newForm.phoneOffice} onChange={e => setNewForm(f => ({ ...f, phoneOffice: e.target.value }))} />
                </Field>
                <Field label="GSM">
                  <Input value={newForm.gsm} onChange={e => setNewForm(f => ({ ...f, gsm: e.target.value }))} />
                </Field>
                <Field label="Email" className="col-span-2 md:col-span-1">
                  <Input type="email" value={newForm.email} onChange={e => setNewForm(f => ({ ...f, email: e.target.value }))} />
                </Field>
                {/* Zouordnung */}
                <Field label="Member-Typ">
                  <Select value={newForm.memberType} onValueChange={v => setNewForm(f => ({ ...f, memberType: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spieler">Spieler</SelectItem>
                      <SelectItem value="loisir">Kidssport & Loisir</SelectItem>
                      <SelectItem value="donateur">Donateur</SelectItem>
                      <SelectItem value="donateur_lizenz">Donateur (Lizenz)</SelectItem>
                      <SelectItem value="ehrenmitglied">Ehrenmitglied</SelectItem>
                      <SelectItem value="sponsor">Sponsor</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Famillencode">
                  <Input value={newForm.familyCode} onChange={e => setNewForm(f => ({ ...f, familyCode: e.target.value }))} placeholder="F999 / S / D" />
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
                <Button
                  variant="outline"
                  onClick={handleSaveAndNext}
                  disabled={(!newForm.lastName && !newForm.firstName) || createMut.isPending}
                >
                  Weiteres Familienmitglied
                </Button>
                <Button
                  onClick={handleSaveAndClose}
                  disabled={(!newForm.lastName && !newForm.firstName) || createMut.isPending}
                >
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
            <SelectTrigger className="md:w-[170px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle (aktiv)</SelectItem>
              <SelectItem value="active">Aktiv</SelectItem>
              <SelectItem value="inactive">Inaktiv</SelectItem>
              <SelectItem value="pending">Wartend</SelectItem>
              <SelectItem value="ehemalig">Ancien Membres (Archiv)</SelectItem>
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
