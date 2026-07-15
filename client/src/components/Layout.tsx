import { ReactNode, useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Megaphone,
  Users,
  Shield,
  CalendarDays,
  Calendar,
  ClipboardCheck,
  Video,
  Euro,
  User,
  Menu,
  X,
  LogOut,
  Moon,
  Sun,
  Trophy,
  TrendingUp,
  Target,
  Car,
  MessageCircle,
  Wallet,
  FileText,
  Mail,
  UserPlus,
  BarChart3,
  CalendarClock,
  ChevronRight,
  Search,
  Star,
  Camera,
  ClipboardList,
  Building,
  ShoppingBag,
  Package,
  List,
  PiggyBank,
  Send,
  ShieldCheck,
  Globe,
  QrCode,
  BookOpen,
  Archive,
  KeyRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ErrorBoundary } from "./ErrorBoundary";
import { LogoLockup, Logo } from "./Logo";
import { GlobalSearch } from "./GlobalSearch";
import { PwaInstall } from "./PwaInstall";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";
import type { Role } from "@shared/schema";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles?: Role[];
  section?: string;
}

const NAV: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, section: "Übersicht" },
  { href: "/announcements", label: "Ankündigungen", icon: Megaphone, section: "Übersicht" },
  { href: "/my-events", label: "Meine Termine", icon: Calendar, section: "Übersicht" },
  { href: "/calendar", label: "Kalender", icon: CalendarDays, section: "Übersicht" },
  { href: "/chat", label: "Team-Chat", icon: MessageCircle, section: "Übersicht" },
  { href: "/inventory", label: "Inventar", icon: Package, section: "Verwaltung" },
  { href: "/teams", label: "Teams", icon: Shield, section: "Sport" },
  { href: "/members", label: "Mitglieder", icon: Users, section: "Verein" },
  { href: "/secretariat", label: "Sekretariat", icon: ClipboardList, section: "Verein", roles: ["präsident", "admin", "secretaire", "kassenwart"] },
  { href: "/registrations", label: "Anmeldungen", icon: UserPlus, section: "Verein", roles: ["präsident", "admin", "secretaire", "trainer"] },
  { href: "/checkin", label: "Ausweis & Check-in", icon: QrCode, section: "Verein", roles: ["präsident", "admin", "secretaire", "trainer"] },
  { href: "/training-schedules", label: "Trainingsplan", icon: CalendarClock, section: "Sport", roles: ["präsident", "admin", "trainer", "secretaire"] },
  { href: "/trainer-codes", label: "Trainer-Codes", icon: KeyRound, section: "Sport", roles: ["präsident", "admin"] },
  { href: "/attendance", label: "Anwesenheit", icon: ClipboardCheck, section: "Sport", roles: ["präsident", "admin", "trainer"] },
  { href: "/matches", label: "Spiele", icon: Trophy, section: "Sport", roles: ["präsident", "admin", "trainer", "secretaire", "spieler"] },
  { href: "/player-statistics", label: "Statistiken", icon: TrendingUp, section: "Sport", roles: ["präsident", "admin", "trainer", "secretaire", "spieler"] },
  { href: "/nominations", label: "Nominierung", icon: Users, section: "Sport", roles: ["präsident", "admin", "trainer", "spieler"] },
  { href: "/finance", label: "Finanzen", icon: Euro, section: "Verwaltung", roles: ["präsident", "admin", "kassenwart"] },
  { href: "/fees", label: "Beiträge", icon: Wallet, section: "Verwaltung", roles: ["präsident", "admin", "kassenwart"] },
  { href: "/documents", label: "Dokumente", icon: FileText, section: "Verwaltung", roles: ["präsident", "admin", "secretaire", "kassenwart"] },
  { href: "/statistics", label: "Berichte", icon: BarChart3, section: "Verwaltung", roles: ["präsident", "admin", "kassenwart", "secretaire"] },
  { href: "/meetings", label: "Meetings", icon: Video, section: "Verwaltung" },
  { href: "/email-settings", label: "E-Mail", icon: Mail, section: "Verwaltung", roles: ["präsident", "admin"] },
  { href: "/sponsors", label: "Sponsoren", icon: Star, section: "Verein", roles: ["präsident", "admin", "secretaire"] },
  { href: "/gallery", label: "Galerie", icon: Camera, section: "Verein" },
  { href: "/duties", label: "Dienste", icon: ClipboardList, section: "Sport", roles: ["präsident", "admin", "trainer", "secretaire"] },
  { href: "/facility-bookings", label: "Raumreservierung", icon: Building, section: "Sport", roles: ["präsident", "admin", "trainer", "secretaire"] },
  { href: "/polls", label: "Umfragen", icon: BarChart3, section: "Verein" },
  { href: "/opponents", label: "Gegner", icon: Target, section: "Sport", roles: ["präsident", "admin", "trainer", "secretaire"] },
  { href: "/carpools", label: "Fahrgemeinschaften", icon: Car, section: "Verein" },
  { href: "/shop", label: "Fan-Shop", icon: ShoppingBag, section: "Verein" },
  { href: "/waitlist", label: "Warteliste", icon: List, section: "Sport", roles: ["präsident", "admin", "trainer"] },
  { href: "/budget", label: "Budget", icon: PiggyBank, section: "Verwaltung", roles: ["präsident", "admin", "kassenwart"] },
  { href: "/newsletter", label: "Newsletter", icon: Send, section: "Verwaltung", roles: ["präsident", "admin", "secretaire"] },
  { href: "/gdpr", label: "DSGVO", icon: ShieldCheck, section: "Verwaltung" },
  { href: "/website", label: "Website", icon: Globe, section: "Verwaltung", roles: ["präsident", "admin", "secretaire"] },
  { href: "/archive", label: "Saison-Archiv", icon: Archive, section: "Verwaltung", roles: ["präsident", "admin", "secretaire"] },
  { href: "/welcome-mappe", label: "Willkommensmappe", icon: BookOpen, section: "Verein" },
];

const MOBILE_NAV: NavItem[] = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/my-events", label: "Termine", icon: CalendarDays },
  { href: "/teams", label: "Teams", icon: Shield },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/profile", label: "Profil", icon: User },
];

const ROLE_LABELS: Record<Role, string> = {
  präsident: "Präsident",
  kassenwart: "Kassenwart",
  trainer: "Trainer",
  spieler: "Spieler",
  elternteil: "Elternteil",
  admin: "Admin",
  secretaire: "Sekretär",
};

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const { theme, toggle } = useTheme();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  if (!user) return <>{children}</>;

  const visibleNav = NAV.filter(i => !i.roles || i.roles.includes(user.role as Role));
  const sections = Array.from(new Set(visibleNav.map(i => i.section)));

  const isActive = (href: string) => {
    if (href === "/") return location === "/" || location === "";
    return location.startsWith(href);
  };

  const currentPage = NAV.find(n => isActive(n.href))?.label || "Dashboard";

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* ─── Desktop Sidebar ─── */}
      <aside className="hidden lg:flex lg:w-[268px] flex-col fixed top-0 left-0 h-screen z-40">
        <div className="flex-1 flex flex-col m-2 rounded-2xl overflow-hidden bg-gradient-to-b from-[#002F65] to-[#00193a]">
          {/* Logo */}
          <div className="px-5 pt-5 pb-4">
            <LogoLockup />
          </div>

          {/* Navigation sections */}
          <nav className="flex-1 px-3 pb-3 overflow-y-auto scroll-momentum space-y-5">
            {sections.map(section => (
              <div key={section}>
                <div className="px-3 mb-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/40">
                    {section}
                  </span>
                </div>
                <div className="space-y-0.5">
                  {visibleNav.filter(i => i.section === section).map(item => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        data-testid={`link-nav-${item.label.toLowerCase()}`}
                        className={cn(
                          "group flex items-center gap-3 px-3 py-2 rounded-[10px] text-[13px] font-medium transition-all duration-150",
                          active
                            ? "bg-white/[0.15] text-white"
                            : "text-white/70 hover:bg-white/[0.08] hover:text-white"
                        )}
                      >
                        <Icon className={cn(
                          "size-[18px] shrink-0 transition-colors",
                          active ? "text-[#FFDE00]" : "text-white/50 group-hover:text-white/70"
                        )} />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* User card */}
          <div className="p-3 border-t border-white/[0.08]">
            <div className="flex items-center gap-3 p-2.5 rounded-xl">
              <Avatar className="size-9 ring-2 ring-white/20">
                <AvatarImage src={user.photoUrl || undefined} />
                <AvatarFallback className="bg-[#FFDE00] text-[#002F65] text-xs font-bold">
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-white truncate">{user.name}</div>
                <div className="text-[11px] text-white/50 truncate">
                  {ROLE_LABELS[user.role as Role]}
                </div>
              </div>
              <button
                onClick={logout}
                data-testid="button-logout"
                className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/80 transition-all"
                title="Abmelden"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Mobile Sheet ─── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50" onClick={closeMobile}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" />
          <aside
            onClick={e => e.stopPropagation()}
            className="relative w-[280px] h-full bg-gradient-to-b from-[#002F65] to-[#00193a] flex flex-col animate-in slide-in-from-left duration-300"
          >
            <div className="p-5 flex items-center justify-between">
              <LogoLockup />
              <button
                onClick={closeMobile}
                className="p-2 rounded-full hover:bg-white/10 text-white/60"
              >
                <X className="size-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 pb-3 overflow-y-auto space-y-4">
              {sections.map(section => (
                <div key={section}>
                  <div className="px-3 mb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/40">
                      {section}
                    </span>
                  </div>
                  {visibleNav.filter(i => i.section === section).map(item => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeMobile}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors",
                          active
                            ? "bg-white/15 text-white"
                            : "text-white/70 hover:bg-white/10"
                        )}
                      >
                        <Icon className={cn("size-[18px]", active ? "text-[#FFDE00]" : "text-white/50")} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>
            <div className="p-3 border-t border-white/[0.08]">
              <Link
                href="/profile"
                onClick={closeMobile}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors"
              >
                <Avatar className="size-9 ring-2 ring-white/20">
                  <AvatarImage src={user.photoUrl || undefined} />
                  <AvatarFallback className="bg-[#FFDE00] text-[#002F65] text-xs font-bold">
                    {initials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-white truncate">{user.name}</div>
                  <div className="text-[11px] text-white/50">{ROLE_LABELS[user.role as Role]}</div>
                </div>
                <ChevronRight className="size-4 text-white/30" />
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-[268px]">
        {/* Floating header */}
        <header className={cn(
          "sticky top-0 z-30 transition-all duration-300",
          scrolled ? "pt-0" : "pt-2 lg:pt-3"
        )}>
          <div className={cn(
            "mx-2 lg:mx-4 transition-all duration-300",
            scrolled ? "mx-0 lg:mx-0" : ""
          )}>
            <div className={cn(
              "backdrop-blur-xl bg-background/80 border-b transition-all duration-300",
              scrolled
                ? "rounded-none border-border/50"
                : "rounded-2xl border-border/30 shadow-sm"
            )}>
              <div className="flex items-center justify-between h-12 px-4 lg:px-5">
                {/* Mobile: hamburger + logo */}
                <div className="flex items-center gap-3 lg:hidden">
                  <button
                    onClick={() => setMobileOpen(true)}
                    data-testid="button-mobile-menu"
                    className="p-2 -ml-1.5 rounded-xl hover:bg-muted/60 transition-colors active:scale-95"
                  >
                    <Menu className="size-5 text-foreground/70" />
                  </button>
                  <Logo size={26} />
                </div>

                {/* Desktop: page title */}
                <div className="hidden lg:flex items-center gap-2">
                  <h2 className="text-[15px] font-semibold text-foreground/80">{currentPage}</h2>
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-1.5">
                  <GlobalSearch />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggle}
                    data-testid="button-theme-toggle"
                    title="Theme"
                    className="size-9 rounded-xl hover:bg-muted/60"
                  >
                    {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
                  </Button>
                  <Link href="/profile">
                    <Avatar className="size-8 lg:hidden ring-1 ring-border cursor-pointer hover:ring-2 transition-all">
                      <AvatarImage src={user.photoUrl || undefined} />
                      <AvatarFallback className="text-[11px] font-bold bg-primary text-primary-foreground">
                        {initials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 lg:px-6 pt-4 lg:pt-5 pb-28 lg:pb-8 scroll-momentum">
          <div className="max-w-6xl mx-auto">
            <ErrorBoundary key={location}>
              {children}
            </ErrorBoundary>
          </div>
        </main>
      </div>

      <PwaInstall />

      {/* ─── Mobile Bottom Nav (iOS Tab Bar) ─── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
        <div className="backdrop-blur-xl bg-background/80 border-t border-border/50 px-safe pb-safe">
          <div className="flex items-center justify-around h-[52px] max-w-md mx-auto">
            {MOBILE_NAV.map(item => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 min-w-[56px] pt-1 transition-colors",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <Icon className={cn("size-[22px]", active && "text-primary")} strokeWidth={active ? 2.2 : 1.8} />
                  <span className={cn("text-[10px]", active ? "font-semibold" : "font-medium")}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
