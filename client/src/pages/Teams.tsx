import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, ArrowLeft, Shield, ArrowRightLeft } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { initials, formatMemberName, getAge, memberExtraTeamIds } from "@/lib/utils";
import type { Team, Member, PublicUser } from "@shared/schema";
import { isActiveClubMember } from "@shared/memberStatus";
import { medicoState, medicoLabel } from "@/lib/medico";

export default function Teams() {
  const [, params] = useRoute("/teams/:id");
  const teamId = params?.id ? Number(params.id) : null;
  const { user } = useAuth();
  const canEdit = user && ["präsident", "admin", "trainer"].includes(user.role);

  const toggleExtraTeamMut = useMutation({
    mutationFn: async ({ memberId, next }: { memberId: number; next: number[] }) => {
      const res = await apiRequest("PATCH", `/api/members/${memberId}`, { extraTeamIds: JSON.stringify(next) });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
    },
  });

  const { data: teams = [] } = useQuery<Team[]>({ queryKey: ["/api/teams"] });
  const { data: members = [] } = useQuery<Member[]>({ queryKey: ["/api/members"] });
  const { data: users = [] } = useQuery<PublicUser[]>({ queryKey: ["/api/users"] });
  const { data: teamNominations = [] } = useQuery<{ memberId: number }[]>({
    queryKey: ["/api/nominations/team", teamId],
    queryFn: () => teamId ? apiRequest("GET", `/api/nominations/team/${teamId}`).then(r => r.json()) : Promise.resolve([]),
    enabled: !!teamId,
  });
  const nominatedIds = new Set(teamNominations.map(n => n.memberId));

  if (teamId) {
    const team = teams.find(t => t.id === teamId);
    if (!team) return <div className="text-sm text-muted-foreground">Team nicht gefunden</div>;
    const isYouth = /^U/i.test(team.category || "");
    const isTeamMember = (m: Member) => m.teamId === team.id || memberExtraTeamIds(m).includes(team.id);
    const youthRank = (cat?: string | null) => cat ? parseInt((cat.match(/U(\d+)/) || [])[1] || "0", 10) : 0;
    const tierOf = (name?: string | null) => name ? (/Elite/i.test(name) ? 2 : /Espoir/i.test(name) ? 1 : 0) : 0;
    const upgradeOptions = teams.filter(t => {
      if (!/^U/i.test(t.category || "")) return false;
      const rankDiff = youthRank(t.category) - youthRank(team.category);
      if (rankDiff === 2) return true; // nächst älterer Altersjahrgang
      if (rankDiff === 0 && t.id !== team.id && tierOf(t.name) > tierOf(team.name)) return true; // z.B. U11 Espoir -> U11 Elite
      return false;
    }).sort((a, b) => youthRank(a.category) - youthRank(b.category) || tierOf(a.name) - tierOf(b.name));
    const medicoPenalty = (m: Member) => {
      const st = medicoState(m);
      return st === "inapte" || st === "overdue" || st === "none" ? 1 : 0;
    };
    const allRoster = members
      .filter(m => isTeamMember(m) && isActiveClubMember(m))
      .sort((a, b) => {
        const na = nominatedIds.has(a.id) ? 0 : 1;
        const nb = nominatedIds.has(b.id) ? 0 : 1;
        if (na !== nb) return na - nb;
        const pa = medicoPenalty(a);
        const pb = medicoPenalty(b);
        if (pa !== pb) return pa - pb;
        const ageA = getAge(a.birthdate) ?? (isYouth ? -Infinity : Infinity);
        const ageB = getAge(b.birthdate) ?? (isYouth ? -Infinity : Infinity);
        const ageDiff = isYouth ? ageB - ageA : ageA - ageB;
        if (ageDiff !== 0 && Number.isFinite(ageDiff)) return ageDiff;
        return formatMemberName(a).localeCompare(formatMemberName(b));
      });
    const roster = allRoster.filter(m => (m as any).squadStatus !== 'reserve');
    const reserve = allRoster.filter(m => (m as any).squadStatus === 'reserve');
    const squadMut = useMutation({
      mutationFn: async ({ memberId, status }: { memberId: number; status: string }) => {
        const res = await apiRequest("PATCH", `/api/members/${memberId}`, { squadStatus: status });
        return res.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      },
    });
    const trainer = users.find(u => u.id === team.trainerId);

    return (
      <div className="space-y-5 max-w-4xl">
        <Link href="/teams" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Alle Teams
        </Link>

        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary to-[#001A3A] text-primary-foreground p-6">
          <div className="absolute inset-y-0 right-0 w-48 opacity-10">
            <svg viewBox="0 0 100 100" className="h-full">
              <circle cx="70" cy="50" r="40" fill="#FFDE00" />
            </svg>
          </div>
          <div className="relative z-10">
            <Badge className="bg-secondary text-secondary-foreground text-[10px] tracking-wider">
              {team.category}
            </Badge>
            <h1 className="text-2xl font-extrabold mt-2">{team.name}</h1>
            <div className="flex items-center gap-4 mt-3 text-sm text-primary-foreground/80">
              <span className="flex items-center gap-1"><Users className="size-4" /> {roster.length} Aktiv{reserve.length > 0 && <span className="text-amber-300"> · {reserve.length} Reserve</span>}</span>
              {trainer && <span>Trainer: {trainer.name}</span>}
            </div>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Kader ({roster.length})</CardTitle>
            <span className="text-xs text-muted-foreground">Aktiv — trainéiert & spillt</span>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-border">
            {roster.length === 0 && <p className="p-6 text-sm text-muted-foreground">Noch keine Spieler im Kader</p>}
            {roster.map(m => (
              <div key={m.id} className="flex items-center gap-3 p-3 hover-elevate">
                <Link href={`/members/${m.id}`} className="flex flex-1 items-center gap-3 min-w-0">
                  <Avatar className="size-10">
                    <AvatarImage src={m.photoUrl || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                      {initials(m.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{formatMemberName(m)}</div>
                    <div className="text-xs text-muted-foreground">
                      {m.licenseNumber || "—"}
                      {m.birthdate && <> · Jg. {new Date(m.birthdate).getFullYear()}</>}
                    </div>
                    {(() => {
                      const st = medicoState(m);
                      const label = medicoLabel(m);
                      if (st === "due" || st === "overdue") {
                        return (
                          <span className="mt-1 inline-block rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                            {label}
                          </span>
                        );
                      }
                      if (st === "inapte") {
                        return <span className="mt-1 inline-block rounded bg-purple-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">{label}</span>;
                      }
                      if (st === "valid") {
                        return <span className="mt-1 inline-block text-[10px] text-emerald-600 dark:text-emerald-400">{label}</span>;
                      }
                      return <span className="mt-1 inline-block text-[10px] text-muted-foreground">{label}</span>;
                    })()}
                  </div>
                </Link>
                {canEdit && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 text-xs gap-1"
                    disabled={squadMut.isPending}
                    onClick={() => squadMut.mutate({ memberId: m.id, status: "reserve" })}
                    title="In Reserve versetzen"
                  >
                    <ArrowRightLeft className="size-3" />
                    <span className="hidden sm:inline">Reserve</span>
                  </Button>
                )}
                {isYouth && upgradeOptions.length > 0 && (
                  <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                    {upgradeOptions.map(opt => {
                      const checked = memberExtraTeamIds(m).includes(opt.id);
                      return (
                        <label key={opt.id} className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                          <Checkbox
                            checked={checked}
                            disabled={!canEdit || toggleExtraTeamMut.isPending}
                            onCheckedChange={v => {
                              const next = v === true
                                ? Array.from(new Set([...memberExtraTeamIds(m), opt.id]))
                                : memberExtraTeamIds(m).filter(id => id !== opt.id);
                              toggleExtraTeamMut.mutate({ memberId: m.id, next });
                            }}
                          />
                          <span className="hidden sm:inline">{opt.name}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-amber-200 dark:border-amber-900">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Reserve ({reserve.length})</CardTitle>
            <span className="text-xs text-muted-foreground">Auf Abruf — kann in Kader gerufen werden</span>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-border">
            {reserve.length === 0 && <p className="p-6 text-sm text-muted-foreground">Keng Spiller an der Reserve</p>}
            {reserve.map(m => (
              <div key={m.id} className="flex items-center gap-3 p-3 hover-elevate">
                <Link href={`/members/${m.id}`} className="flex flex-1 items-center gap-3 min-w-0">
                  <Avatar className="size-10 opacity-70">
                    <AvatarImage src={m.photoUrl || undefined} />
                    <AvatarFallback className="bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold">
                      {initials(m.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{formatMemberName(m)}</div>
                    <div className="text-xs text-muted-foreground">
                      {m.licenseNumber || "—"}
                      {m.birthdate && <> · Jg. {new Date(m.birthdate).getFullYear()}</>}
                    </div>
                    {(() => {
                      const st = medicoState(m);
                      const label = medicoLabel(m);
                      if (st === "due" || st === "overdue") {
                        return (
                          <span className="mt-1 inline-block rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                            {label}
                          </span>
                        );
                      }
                      if (st === "inapte") {
                        return <span className="mt-1 inline-block rounded bg-purple-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">{label}</span>;
                      }
                      if (st === "valid") {
                        return <span className="mt-1 inline-block text-[10px] text-emerald-600 dark:text-emerald-400">{label}</span>;
                      }
                      return <span className="mt-1 inline-block text-[10px] text-muted-foreground">{label}</span>;
                    })()}
                  </div>
                </Link>
                {canEdit && (
                  <Button
                    size="sm"
                    variant="default"
                    className="shrink-0 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700"
                    disabled={squadMut.isPending}
                    onClick={() => squadMut.mutate({ memberId: m.id, status: "active" })}
                    title="Aktivéieren — an de Kader versetzen"
                  >
                    <ArrowRightLeft className="size-3" />
                    <span className="hidden sm:inline">Aktivéieren</span>
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight">Teams</h1>
        <p className="text-sm text-muted-foreground">{teams.length} Mannschaften</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map(team => {
          const count = members.filter(m => m.teamId === team.id && isActiveClubMember(m)).length;
          const trainer = users.find(u => u.id === team.trainerId);
          return (
            <Link
              key={team.id}
              href={`/teams/${team.id}`}
              data-testid={`card-team-${team.id}`}
              className="group"
            >
              <Card className="overflow-hidden hover-elevate transition-all h-full">
                <div className="relative bg-gradient-to-br from-primary to-[#001A3A] p-5 text-primary-foreground">
                  <div className="absolute top-3 right-3">
                    <Shield className="size-5 text-secondary opacity-80" />
                  </div>
                  <Badge className="bg-secondary text-secondary-foreground text-[10px]">{team.category}</Badge>
                  <h3 className="text-lg font-extrabold mt-3">{team.name}</h3>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {members.filter(m => m.teamId === team.id && isActiveClubMember(m)).slice(0, 4).map(m => (
                        <Avatar key={m.id} className="size-7 ring-2 ring-card">
                          <AvatarImage src={m.photoUrl || undefined} />
                          <AvatarFallback className="text-[10px] bg-muted">{initials(m.name)}</AvatarFallback>
                        </Avatar>
                      ))}
                      {count > 4 && (
                        <div className="size-7 rounded-full bg-muted ring-2 ring-card flex items-center justify-center text-[10px] font-bold">
                          +{count - 4}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <div>{count} Spieler</div>
                      {trainer && <div className="truncate max-w-[120px]">{trainer.name}</div>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
