import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, CalendarDays, Megaphone, MapPin, ChevronRight, Clock, Pin } from "lucide-react";
import { formatDate, relativeTime } from "@/lib/utils";
import type { Member, Team, Event, Announcement } from "@shared/schema";

const EVENT_STYLES: Record<string, { color: string; label: string }> = {
  training: { color: "bg-blue-500", label: "Training" },
  spiel: { color: "bg-emerald-500", label: "Spiel" },
  meeting: { color: "bg-violet-500", label: "Meeting" },
  event: { color: "bg-amber-500", label: "Event" },
};

export default function Dashboard() {
  const { user } = useAuth();

  const { data: members = [] } = useQuery<Member[]>({ queryKey: ["/api/members"] });
  const { data: teams = [] } = useQuery<Team[]>({ queryKey: ["/api/teams"] });
  const { data: events = [] } = useQuery<Event[]>({ queryKey: ["/api/events"] });
  const { data: announcements = [] } = useQuery<Announcement[]>({ queryKey: ["/api/announcements"] });

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = events.filter(e => e.date >= today).slice(0, 5);
  const thisWeek = events.filter(e => {
    const d = new Date(e.date);
    const in7 = new Date();
    in7.setDate(in7.getDate() + 7);
    return d >= new Date() && d <= in7;
  }).length;

  const pinned = announcements.filter(a => a.pinned).slice(0, 3);
  const recent = [...announcements].slice(0, 3);

  const firstName = user?.name.split(" ")[0] || "";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Gudde Moien" : hour < 18 ? "Gudden Dag" : "Gudden Owend";

  return (
    <div className="space-y-6">
      {/* Welcome - minimal Apple style */}
      <div className="pt-1">
        <p className="text-[13px] font-medium text-muted-foreground">{greeting}</p>
        <h1 className="text-[28px] font-bold tracking-tight mt-0.5">{firstName}</h1>
      </div>

      {/* Stat cards - Apple widget grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Mitglieder" value={members.length} accent="text-blue-500" bg="bg-blue-500/10" />
        <StatCard icon={Shield} label="Teams" value={teams.length} accent="text-amber-500" bg="bg-amber-500/10" />
        <StatCard icon={CalendarDays} label="Diese Woche" value={thisWeek} accent="text-emerald-500" bg="bg-emerald-500/10" />
        <StatCard icon={Megaphone} label="News" value={announcements.length} accent="text-violet-500" bg="bg-violet-500/10" />
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        {/* Announcements */}
        <div className="lg:col-span-3 space-y-3">
          <SectionHeader title="Ankündigungen" href="/announcements" />
          <div className="space-y-2">
            {pinned.length === 0 && recent.length === 0 && (
              <EmptyState text="Keine Ankündigungen" />
            )}
            {pinned.map(a => (
              <AnnouncementRow key={a.id} a={a} pinned />
            ))}
            {recent.filter(a => !a.pinned).slice(0, 3 - pinned.length).map(a => (
              <AnnouncementRow key={a.id} a={a} />
            ))}
          </div>
        </div>

        {/* Upcoming events */}
        <div className="lg:col-span-2 space-y-3">
          <SectionHeader title="Nächste Termine" href="/calendar" />
          <div className="space-y-2">
            {upcoming.length === 0 && (
              <EmptyState text="Keine kommenden Termine" />
            )}
            {upcoming.map(e => {
              const style = EVENT_STYLES[e.type] || EVENT_STYLES.event;
              const team = teams.find(t => t.id === e.teamId);
              return (
                <Card key={e.id} className="border-0 shadow-sm bg-card hover:shadow-md transition-shadow">
                  <CardContent className="p-3.5">
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center justify-center min-w-[42px] bg-muted/50 rounded-xl px-2 py-1.5">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                          {new Date(e.date).toLocaleDateString("de-DE", { month: "short" })}
                        </span>
                        <span className="text-lg font-bold leading-none mt-0.5">
                          {new Date(e.date).getDate()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={`size-1.5 rounded-full ${style.color}`} />
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                            {style.label}
                          </span>
                        </div>
                        <div className="text-[13px] font-semibold truncate">{e.title}</div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-1">
                          {e.time && <span className="flex items-center gap-0.5"><Clock className="size-3" />{e.time}</span>}
                          {e.location && <span className="flex items-center gap-0.5 truncate"><MapPin className="size-3" />{e.location}</span>}
                        </div>
                        {team && <Badge variant="secondary" className="mt-1.5 text-[10px] font-medium h-5">{team.name}</Badge>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-[15px] font-semibold">{title}</h2>
      <Link href={href} className="text-[13px] font-medium text-primary hover:text-primary/80 flex items-center gap-0.5 transition-colors">
        Alle anzeigen <ChevronRight className="size-3.5" />
      </Link>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="py-8">
        <p className="text-[13px] text-muted-foreground text-center">{text}</p>
      </CardContent>
    </Card>
  );
}

function StatCard({ icon: Icon, label, value, accent, bg }: { icon: any; label: string; value: number; accent: string; bg: string }) {
  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-card">
      <CardContent className="p-4">
        <div className={`size-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
          <Icon className={`size-[18px] ${accent}`} />
        </div>
        <p className="text-2xl font-bold tracking-tight" data-testid={`stat-${label}`}>{value}</p>
        <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{label}</p>
      </CardContent>
    </Card>
  );
}

function AnnouncementRow({ a, pinned }: { a: Announcement; pinned?: boolean }) {
  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-3">
          {pinned && (
            <div className="w-0.5 self-stretch rounded-full bg-amber-400 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {pinned && (
                <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  <Pin className="size-2.5" /> Angeheftet
                </span>
              )}
              <span className="text-[11px] text-muted-foreground">{relativeTime(a.createdAt)}</span>
            </div>
            <div className="text-[14px] font-semibold leading-snug">{a.title}</div>
            <p className="text-[12px] text-muted-foreground line-clamp-2 mt-1 leading-relaxed">{a.content}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
