import { useRef, useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Upload, AlertCircle, User, Users, Shield, CreditCard, Pencil, Check, X } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { initials, formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { CAT_CODE_LABELS } from "@shared/schema";
import type { Member, Team, Attendance, PlayerFlag } from "@shared/schema";

const MEMBER_TYPE_LABELS: Record<string, string> = {
  honoraire: "Ehrenmitglied", ehrenmitglied: "Ehrenmitglied", sponsor: "Sponsor",
  donateur: "Donateur", donateur_licence: "Donateur (Lizenz)", donateur_lizenz: "Donateur (Lizenz)", contact: "Kontakt",
};
function memberCategoryLabel(m: Member, teamName?: string): string | null {
  if (teamName) return teamName;
  const cat = (m as any).catCode as number | null | undefined;
  if (cat && CAT_CODE_LABELS[cat]) return `${CAT_CODE_LABELS[cat]} (FLH)`;
  const contact = (m as any).contactInfoType as string | null | undefined;
  if (contact === "contact_famille") return "Kontakt (Familie)";
  if (contact === "mere_accueil") return "Mère d'accueil";
  const type = (m as any).memberType as string | null | undefined;
  if (type && MEMBER_TYPE_LABELS[type]) return MEMBER_TYPE_LABELS[type];
  return null;
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Simple downscale: returns data URL at max 400px wide
async function downscaleImage(file: File, max = 400): Promise<string> {
  const dataUrl = await fileToDataUrl(file);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.src = dataUrl;
  });
}

function EditableField({ label, value, onSave, canEdit, type = "text" }: {
  label: string; value: string | null | undefined; onSave: (v: string) => void;
  canEdit: boolean; type?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value || "");
  return (
    <div className="space-y-0.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {editing ? (
        <div className="flex gap-1">
          <Input value={val} onChange={e => setVal(e.target.value)} type={type} className="h-7 text-sm" autoFocus />
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { onSave(val); setEditing(false); }}>
            <Check className="size-3.5 text-green-600" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setVal(value || ""); setEditing(false); }}>
            <X className="size-3.5 text-destructive" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-1 group">
          <span className="text-sm">{value || <span className="text-muted-foreground italic">—</span>}</span>
          {canEdit && (
            <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100"
              onClick={() => setEditing(true)}>
              <Pencil className="size-3" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function isChild(birthdate: string | null | undefined): boolean {
  if (!birthdate) return false;
  const age = new Date().getFullYear() - new Date(birthdate).getFullYear();
  return age < 18;
}

export default function MemberDetail() {
  const [, params] = useRoute("/members/:id");
  const id = Number(params?.id);
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInput = useRef<HTMLInputElement>(null);
  const guardianFileInput = useRef<HTMLInputElement>(null);

  const { data: member, isLoading } = useQuery<Member & {
    guardianName?: string; guardianPhone?: string; guardianEmail?: string;
    guardian2Name?: string; guardian2Phone?: string; nationality?: string;
  }>({
    queryKey: ["/api/members", id],
    queryFn: async () => (await apiRequest("GET", `/api/members/${id}`)).json(),
  });
  const { data: teams = [] } = useQuery<Team[]>({ queryKey: ["/api/teams"] });
  const { data: allMembers = [] } = useQuery<Member[]>({ queryKey: ["/api/members"] });
  const { data: attendance = [] } = useQuery<Attendance[]>({
    queryKey: ["/api/attendance/member", id],
    queryFn: async () => (await apiRequest("GET", `/api/attendance/member/${id}`)).json(),
  });
  const { data: allFlags = [] } = useQuery<PlayerFlag[]>({
    queryKey: ["/api/flags"],
    queryFn: async () => (await apiRequest("GET", `/api/flags`)).json(),
  });

  const updateMut = useMutation({
    mutationFn: async (data: any) => (await apiRequest("PATCH", `/api/members/${id}`, data)).json(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      queryClient.invalidateQueries({ queryKey: ["/api/members", id] });
      toast({ title: "Gespeichert" });
    },
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
  if (!member) return (
    <div className="p-6 text-center text-muted-foreground">
      <AlertCircle className="mx-auto mb-2 size-8" />
      <p>Mitglied nicht gefunden</p>
      <Link href="/members"><Button variant="outline" className="mt-4" size="sm"><ArrowLeft className="size-4 mr-1"/>Zurück</Button></Link>
    </div>
  );

  const team = teams.find(t => t.id === member.teamId);
  // Familie: nur echte Haushaltscodes (F<Zahl>), nicht Sammelcodes wie "Seul"/"AJ-GL".
  const famCode = (member as any).familyCode as string | null | undefined;
  const family = famCode && /^F\d+$/i.test(famCode)
    ? allMembers.filter(x => (x as any).familyCode === famCode && x.id !== member.id)
    : [];
  const flags = allFlags.filter((f: any) => f.memberId === member.id);
  const presentCount = attendance.filter((a: any) => a.present).length;
  const totalSessions = attendance.length;
  const attendanceRate = totalSessions ? Math.round((presentCount / totalSessions) * 100) : null;
  const canEdit = user && ["präsident", "admin", "trainer"].includes(user.role);
  const child = isChild(member.birthdate);

  const onUpload = async (file: File) => {
    const dataUrl = await downscaleImage(file);
    updateMut.mutate({ photoUrl: dataUrl });
  };

  const save = (field: string) => (val: string) => updateMut.mutate({ [field]: val });

  return (
    <div className="space-y-5 max-w-4xl">
      <Link href="/members" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Zurück zu Mitglieder
      </Link>

      {/* Header card with photo */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="relative group flex-shrink-0">
              <Avatar className="size-32 ring-4 ring-secondary/30">
                <AvatarImage src={member.photoUrl || undefined} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-4xl font-bold">
                  {initials(member.name)}
                </AvatarFallback>
              </Avatar>
              {canEdit && (
                <>
                  <input ref={fileInput} type="file" accept="image/*" hidden
                    onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f); }} />
                  <button onClick={() => fileInput.current?.click()}
                    className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload className="size-6 text-white" />
                  </button>
                </>
              )}
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold">{member.name}</h1>
                <Badge variant={member.membershipStatus === "active" ? "default" : "outline"} className="text-[10px]">
                  {member.membershipStatus === "active" ? "Aktiv" : (member.membershipStatus || "Unbekannt")}
                </Badge>
                {(() => { const lbl = memberCategoryLabel(member, team?.name); return lbl ? <Badge variant="secondary" className="text-[10px]">{lbl}</Badge> : null; })()}
                {child && <Badge className="bg-blue-500 text-white text-[10px]">Junior</Badge>}
              </div>

              {member.licenseNumber && (
                <div className="flex items-center gap-1.5 text-sm">
                  <CreditCard className="size-3.5 text-muted-foreground" />
                  <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{member.licenseNumber}</span>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 pt-1">
                <EditableField label="E-Mail" value={member.email} onSave={save("email")} canEdit={!!canEdit} />
                <EditableField label="Telefon / GSM" value={member.phone} onSave={save("phone")} canEdit={!!canEdit} />
                <EditableField label="Geburtsdatum" value={member.birthdate} onSave={save("birthdate")} canEdit={!!canEdit} type="date" />
                <EditableField label="Nationalität" value={(member as any).nationality} onSave={save("nationality")} canEdit={!!canEdit} />
                <EditableField label="Adresse" value={member.address} onSave={save("address")} canEdit={!!canEdit} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guardian card — always visible for juniors, optional for adults */}
      {(child || (member as any).guardianName) && (
        <Card className={child ? "border-blue-200 dark:border-blue-800" : ""}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="size-4 text-blue-500" />
              Erziehungsberechtigte{child ? "" : " (optional)"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Person 1</p>
              <div className="grid sm:grid-cols-3 gap-x-6 gap-y-3">
                <EditableField label="Name" value={(member as any).guardianName} onSave={save("guardianName")} canEdit={!!canEdit} />
                <EditableField label="Telefon / GSM" value={(member as any).guardianPhone} onSave={save("guardianPhone")} canEdit={!!canEdit} />
                <EditableField label="E-Mail" value={(member as any).guardianEmail} onSave={save("guardianEmail")} canEdit={!!canEdit} />
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Person 2</p>
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
                <EditableField label="Name" value={(member as any).guardian2Name} onSave={save("guardian2Name")} canEdit={!!canEdit} />
                <EditableField label="Telefon / GSM" value={(member as any).guardian2Phone} onSave={save("guardian2Phone")} canEdit={!!canEdit} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add guardian button for adults */}
      {!child && !(member as any).guardianName && canEdit && (
        <Button variant="outline" size="sm" className="w-full" onClick={() => updateMut.mutate({ guardianName: " " })}>
          <Users className="size-4 mr-2" /> Kontaktperson / Erziehungsberechtigte hinzufügen
        </Button>
      )}

      {/* Familie / verknüpfte Kontakte (gleicher family_code) */}
      {family.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="size-4 text-blue-500" /> Familie &amp; Kontakte ({family.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-border">
            {family.map(fm => (
              <Link key={fm.id} href={`/members/${fm.id}`} className="flex items-center gap-3 p-3 hover-elevate">
                <Avatar className="size-9">
                  <AvatarImage src={fm.photoUrl || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{initials(fm.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{fm.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{memberCategoryLabel(fm, teams.find(t => t.id === fm.teamId)?.name)}</div>
                </div>
                <div className="text-xs text-right text-muted-foreground shrink-0">
                  {fm.phone && <div className="flex items-center gap-1 justify-end"><Phone className="size-3" />{fm.phone}</div>}
                  {fm.email && <div className="flex items-center gap-1 justify-end truncate max-w-[190px]"><Mail className="size-3" />{fm.email}</div>}
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-5">
        {/* Attendance */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="size-4" />Anwesenheit</CardTitle></CardHeader>
          <CardContent>
            {attendanceRate === null ? (
              <p className="text-sm text-muted-foreground">Noch keine Trainingsdaten</p>
            ) : (
              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-primary">{attendanceRate}%</span>
                  <span className="text-sm text-muted-foreground">{presentCount} / {totalSessions} Einheiten</span>
                </div>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${attendanceRate}%` }} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Flags */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertCircle className="size-4" />Status & Flags</CardTitle></CardHeader>
          <CardContent>
            {flags.length === 0 ? (
              <p className="text-sm text-muted-foreground">Keine aktiven Flags</p>
            ) : (
              <div className="space-y-2">
                {flags.map((f: any) => (
                  <div key={f.id} className="flex items-start gap-2 p-2 rounded-md bg-destructive/10 text-destructive">
                    <AlertCircle className="size-4 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <div className="font-semibold capitalize">{f.flag}</div>
                      {f.note && <div className="text-xs opacity-90">{f.note}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
