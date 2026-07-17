import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users, Shield, CalendarDays, Megaphone, MapPin, ChevronRight, Clock, Pin,
  Euro, Wallet, UserPlus, Car, TrendingUp, Target,
} from "lucide-react";
import { relativeTime } from "@/lib/utils";
import type { Member, Team, Event, Announcement } from "@shared/schema";
import { isActiveClubMember } from "@shared/memberStatus";
import type { Role } from "@shared/schema";

const EVENT_STYLES: Record<string, { color: string; label: string }> = {
  training: { color: "bg-blue-500", label: "Training" },
  spiel: { color: "bg-emerald-500", label: "Spiel" },
  meeting: { color: "bg-violet-500", label: "Meeting" },
  event: { color: "bg-amber-500", label: "Event" },
};

export default function Dashboard() {
  const { user } = useAuth();
  const role = user?.role as Role;

  if (role === "kassenwart") return <KassenwartDashboard />;
  if (role === "secretaire") return <SecretaireDashboard />;
  if (role === "trainer") return <TrainerDashboard />;
  if (role === "spieler") return <SpielerDashboard />;
  if (role === "elternteil") return <ElternDashboard />;
  return <VorstandDashboard />;
}

// ═══════════════════════════════════════════════════════════
// Gemeinsam Hëllef-Komponenten
// ═══════════════════════════════════════════════════════════

function useDashboardData() {
  const { data: members = [] } = useQuery<Member[]>({ queryKey: ["/api/members"] });
  const { data: teams = [] } = useQuery<Team[]>({ queryKey: ["/api/teams"] });
  const { data: events = [] } = useQuery<Event[]>({ queryKey: ["/api/events"] });
  const { data: announcements = [] } = useQuery<Announcement[]>({ queryKey: ["/api/announcements"] });
  return { members, teams, events, announcements };
}

function Greeting({ name }: { name: string }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Gudde Moien" : hour < 18 ? "Gudden Dag" : "Gudden Owend";
  const firstName = name.split(" ")[0] || "";
  return (
    <div className="pt-1">
      <p className="text-[13px] font-medium text-muted-foreground">{greeting}</p>
      <h1 className="text-[28px] font-bold tracking-tight mt-0.5">{firstName}</h1>
    </div>
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

function AnnouncementRow({ a, pinned }: { a: Announcement; pinned?: boolean }) {
  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-3">
          {pinned && <div className="w-0.5 self-stretch rounded-full bg-amber-400 shrink-0" />}
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

function EventRow({ e, teams }: { e: Event; teams: Team[] }) {
  const style = EVENT_STYLES[e.type] || EVENT_STYLES.event;
  const team = teams.find(t => t.id === e.teamId);
  return (
    <Card className="border-0 shadow-sm bg-card hover:shadow-md transition-shadow">
      <CardContent className="p-3.5">
        <div className="flex gap-3">
          <div className="flex flex-col items-center justify-center min-w-[42px] bg-muted/50 rounded-xl px-2 py-1.5">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              {new Date(e.date).toLocaleDateString("de-DE", { month: "short" })}
            </span>
            <span className="text-lg font-bold leading-none mt-0.5">{new Date(e.date).getDate()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className={`size-1.5 rounded-full ${style.color}`} />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{style.label}</span>
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
}

function NewsSection({ announcements }: { announcements: Announcement[] }) {
  const pinned = announcements.filter(a => a.pinned).slice(0, 3);
  const recent = [...announcements].slice(0, 3);
  return (
    <div className="lg:col-span-3 space-y-3">
      <SectionHeader title="Ankündigungen" href="/announcements" />
      <div className="space-y-2">
        {pinned.length === 0 && recent.length === 0 && <EmptyState text="Keine Ankündigungen" />}
        {pinned.map(a => <AnnouncementRow key={a.id} a={a} pinned />)}
        {recent.filter(a => !a.pinned).slice(0, 3 - pinned.length).map(a => <AnnouncementRow key={a.id} a={a} />)}
      </div>
    </div>
  );
}

function EventsSection({ events, teams }: { events: Event[]; teams: Team[] }) {
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = events.filter(e => e.date >= today).slice(0, 5);
  return (
    <div className="lg:col-span-2 space-y-3">
      <SectionHeader title="Nächste Termine" href="/calendar" />
      <div className="space-y-2">
        {upcoming.length === 0 && <EmptyState text="Keine kommenden Termine" />}
        {upcoming.map(e => <EventRow key={e.id} e={e} teams={teams} />)}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 1. Vorstand (präsident, admin)
// ═══════════════════════════════════════════════════════════
function VorstandDashboard() {
  const { user } = useAuth();
  const { members, teams, events, announcements } = useDashboardData();

  const today = new Date().toISOString().slice(0, 10);
  const thisWeek = events.filter(e => {
    const d = new Date(e.date);
    const in7 = new Date();
    in7.setDate(in7.getDate() + 7);
    return d >= new Date() && d <= in7;
  }).length;

  return (
    <div className="space-y-6">
      <Greeting name={user?.name || ""} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Mitglieder" value={members.filter(isActiveClubMember).length} accent="text-blue-500" bg="bg-blue-500/10" />
        <StatCard icon={Shield} label="Teams" value={teams.length} accent="text-amber-500" bg="bg-amber-500/10" />
        <StatCard icon={CalendarDays} label="Diese Woche" value={thisWeek} accent="text-emerald-500" bg="bg-emerald-500/10" />
        <StatCard icon={Megaphone} label="News" value={announcements.length} accent="text-violet-500" bg="bg-violet-500/10" />
      </div>
      <div className="grid lg:grid-cols-5 gap-4">
        <NewsSection announcements={announcements} />
        <EventsSection events={events} teams={teams} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 2. Kassenwart
// ═══════════════════════════════════════════════════════════
function KassenwartDashboard() {
  const { user } = useAuth();
  const { events, announcements } = useDashboardData();
  const { data: fees = [] } = useQuery<any[]>({ queryKey: ["/api/member-fees"] });

  const openFees = fees.filter(f => f.status !== "paid").length;
  const today = new Date().toISOString().slice(0, 10);
  const thisWeek = events.filter(e => {
    const d = new Date(e.date);
    const in7 = new Date();
    in7.setDate(in7.getDate() + 7);
    return d >= new Date() && d <= in7;
  }).length;

  return (
    <div className="space-y-6">
      <Greeting name={user?.name || ""} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Wallet} label="Offene Beiträge" value={openFees} accent="text-red-500" bg="bg-red-500/10" />
        <StatCard icon={Euro} label="Beiträge gesamt" value={fees.length} accent="text-emerald-500" bg="bg-emerald-500/10" />
        <StatCard icon={CalendarDays} label="Diese Woche" value={thisWeek} accent="text-blue-500" bg="bg-blue-500/10" />
        <StatCard icon={Megaphone} label="News" value={announcements.length} accent="text-violet-500" bg="bg-violet-500/10" />
      </div>
      <div className="grid lg:grid-cols-5 gap-4">
        <NewsSection announcements={announcements} />
        <EventsSection events={events} teams={[]} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 3. Secrétaire
// ═══════════════════════════════════════════════════════════
function SecretaireDashboard() {
  const { user } = useAuth();
  const { members, events, announcements } = useDashboardData();
  const { data: registrations = [] } = useQuery<any[]>({ queryKey: ["/api/registrations"] });

  const pendingRegs = registrations.filter(r => r.status === "pending").length;
  const today = new Date().toISOString().slice(0, 10);
  const thisWeek = events.filter(e => {
    const d = new Date(e.date);
    const in7 = new Date();
    in7.setDate(in7.getDate() + 7);
    return d >= new Date() && d <= in7;
  }).length;

  return (
    <div className="space-y-6">
      <Greeting name={user?.name || ""} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={UserPlus} label="Offene Anmeldungen" value={pendingRegs} accent="text-amber-500" bg="bg-amber-500/10" />
        <StatCard icon={Users} label="Mitglieder" value={members.filter(isActiveClubMember).length} accent="text-blue-500" bg="bg-blue-500/10" />
        <StatCard icon={CalendarDays} label="Diese Woche" value={thisWeek} accent="text-emerald-500" bg="bg-emerald-500/10" />
        <StatCard icon={Megaphone} label="News" value={announcements.length} accent="text-violet-500" bg="bg-violet-500/10" />
      </div>
      <div className="grid lg:grid-cols-5 gap-4">
        <NewsSection announcements={announcements} />
        <EventsSection events={events} teams={[]} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 4. Trainer
// ═══════════════════════════════════════════════════════════
function TrainerDashboard() {
  const { user } = useAuth();
  const { teams, events, announcements } = useDashboardData();

  const myTeams = teams.filter(t => t.id === user?.teamId || true);
  const today = new Date().toISOString().slice(0, 10);
  const myEvents = events.filter(e => e.date >= today).slice(0, 5);
  const thisWeek = events.filter(e => {
    const d = new Date(e.date);
    const in7 = new Date();
    in7.setDate(in7.getDate() + 7);
    return d >= new Date() && d <= in7;
  }).length;

  return (
    <div className="space-y-6">
      <Greeting name={user?.name || ""} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Shield} label="Teams" value={myTeams.length} accent="text-amber-500" bg="bg-amber-500/10" />
        <StatCard icon={CalendarDays} label="Diese Woche" value={thisWeek} accent="text-emerald-500" bg="bg-emerald-500/10" />
        <StatCard icon={Target} label="Nächste Termine" value={myEvents.length} accent="text-blue-500" bg="bg-blue-500/10" />
        <StatCard icon={Megaphone} label="News" value={announcements.length} accent="text-violet-500" bg="bg-violet-500/10" />
      </div>
      <div className="grid lg:grid-cols-5 gap-4">
        <NewsSection announcements={announcements} />
        <div className="lg:col-span-2 space-y-3">
          <SectionHeader title="Nächste Termine" href="/calendar" />
          <div className="space-y-2">
            {myEvents.length === 0 && <EmptyState text="Keine kommenden Termine" />}
            {myEvents.map(e => <EventRow key={e.id} e={e} teams={teams} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 5. Spieler
// ═══════════════════════════════════════════════════════════
function SpielerDashboard() {
  const { user } = useAuth();
  const { teams, events, announcements } = useDashboardData();

  const myTeam = teams.find(t => t.id === user?.teamId);
  const today = new Date().toISOString().slice(0, 10);
  const myEvents = events.filter(e => e.date >= today && (!user?.teamId || e.teamId === user.teamId)).slice(0, 5);

  return (
    <div className="space-y-6">
      <Greeting name={user?.name || ""} />
      {myTeam && (
        <Link href="/teams" className="inline-block">
          <Badge variant="secondary" className="text-[12px] font-medium h-6">{myTeam.name}</Badge>
        </Link>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={CalendarDays} label="Meine Termine" value={myEvents.length} accent="text-emerald-500" bg="bg-emerald-500/10" />
        <StatCard icon={Car} label="Fahrgemeinschaften" value={0} accent="text-blue-500" bg="bg-blue-500/10" />
        <StatCard icon={TrendingUp} label="Meine Statistiken" value={0} accent="text-amber-500" bg="bg-amber-500/10" />
        <StatCard icon={Megaphone} label="News" value={announcements.length} accent="text-violet-500" bg="bg-violet-500/10" />
      </div>
      <div className="grid lg:grid-cols-5 gap-4">
        <NewsSection announcements={announcements} />
        <div className="lg:col-span-2 space-y-3">
          <SectionHeader title="Meine nächsten Termine" href="/my-events" />
          <div className="space-y-2">
            {myEvents.length === 0 && <EmptyState text="Keine kommenden Termine" />}
            {myEvents.map(e => <EventRow key={e.id} e={e} teams={teams} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 6. Elternteil
// ═══════════════════════════════════════════════════════════
function ElternDashboard() {
  const { user } = useAuth();
  const { teams, events, announcements } = useDashboardData();

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = events.filter(e => e.date >= today).slice(0, 5);

  return (
    <div className="space-y-6">
      <Greeting name={user?.name || ""} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={CalendarDays} label="Termine" value={upcoming.length} accent="text-emerald-500" bg="bg-emerald-500/10" />
        <StatCard icon={Car} label="Fahrgemeinschaften" value={0} accent="text-blue-500" bg="bg-blue-500/10" />
        <StatCard icon={Wallet} label="Offene Beiträge" value={0} accent="text-amber-500" bg="bg-amber-500/10" />
        <StatCard icon={Megaphone} label="News" value={announcements.length} accent="text-violet-500" bg="bg-violet-500/10" />
      </div>
      <div className="grid lg:grid-cols-5 gap-4">
        <NewsSection announcements={announcements} />
        <div className="lg:col-span-2 space-y-3">
          <SectionHeader title="Termine meiner Kinder" href="/calendar" />
          <div className="space-y-2">
            {upcoming.length === 0 && <EmptyState text="Keine kommenden Termine" />}
            {upcoming.map(e => <EventRow key={e.id} e={e} teams={teams} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
