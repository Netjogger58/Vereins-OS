import { useQuery } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, ArrowLeft, Shield } from "lucide-react";
import { initials, formatMemberName, getAge } from "@/lib/utils";
import type { Team, Member, PublicUser } from "@shared/schema";
import { isActiveClubMember } from "@shared/memberStatus";
import { medicoState, medicoLabel } from "@/lib/medico";

export default function Teams() {
  const [, params] = useRoute("/teams/:id");
  const teamId = params?.id ? Number(params.id) : null;

  const { data: teams = [] } = useQuery<Team[]>({ queryKey: ["/api/teams"] });
  const { data: members = [] } = useQuery<Member[]>({ queryKey: ["/api/members"] });
  const { data: users = [] } = useQuery<PublicUser[]>({ queryKey: ["/api/users"] });

  if (teamId) {
    const team = teams.find(t => t.id === teamId);
    if (!team) return <div className="text-sm text-muted-foreground">Team nicht gefunden</div>;
    const isYouth = /^U/i.test(team.category || "");
    const medicoPenalty = (m: Member) => {
      const st = medicoState(m);
      return st === "inapte" || st === "overdue" || st === "none" ? 1 : 0;
    };
    const roster = members
      .filter(m => m.teamId === team.id && isActiveClubMember(m))
      .sort((a, b) => {
        const pa = medicoPenalty(a);
        const pb = medicoPenalty(b);
        if (pa !== pb) return pa - pb;
        const ageA = getAge(a.birthdate) ?? (isYouth ? -Infinity : Infinity);
        const ageB = getAge(b.birthdate) ?? (isYouth ? -Infinity : Infinity);
        const ageDiff = isYouth ? ageB - ageA : ageA - ageB;
        if (ageDiff !== 0 && Number.isFinite(ageDiff)) return ageDiff;
        return formatMemberName(a).localeCompare(formatMemberName(b));
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
              <span className="flex items-center gap-1"><Users className="size-4" /> {roster.length} Spieler</span>
              {trainer && <span>Trainer: {trainer.name}</span>}
            </div>
          </div>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Kader ({roster.length})</CardTitle></CardHeader>
          <CardContent className="p-0 divide-y divide-border">
            {roster.length === 0 && <p className="p-6 text-sm text-muted-foreground">Noch keine Spieler im Kader</p>}
            {roster.map(m => (
              <Link
                key={m.id}
                href={`/members/${m.id}`}
                className="flex items-center gap-3 p-3 hover-elevate"
              >
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
