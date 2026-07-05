import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Search, Users, Shield, CalendarDays, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { initials } from "@/lib/utils";
import { CAT_CODE_LABELS } from "@shared/schema";
import type { Member, Team, Event } from "@shared/schema";

type Hit =
  | { kind: "member"; id: number; title: string; sub: string; href: string }
  | { kind: "team"; id: number; title: string; sub: string; href: string }
  | { kind: "event"; id: number; title: string; sub: string; href: string };

const MEMBER_TYPE_LABELS: Record<string, string> = {
  honoraire: "Ehrenmitglied", ehrenmitglied: "Ehrenmitglied", sponsor: "Sponsor",
  donateur: "Donateur", donateur_licence: "Donateur (Lizenz)", donateur_lizenz: "Donateur (Lizenz)", contact: "Kontakt",
};
function memberSub(m: Member, teamName?: string): string {
  if (teamName) return teamName;
  const cat = (m as any).catCode as number | null | undefined;
  if (cat && CAT_CODE_LABELS[cat]) return `${CAT_CODE_LABELS[cat]} (FLH)`;
  const contact = (m as any).contactInfoType as string | null | undefined;
  if (contact === "contact_famille") return "Kontakt (Familie)";
  if (contact === "mere_accueil") return "Mère d'accueil";
  const type = (m as any).memberType as string | null | undefined;
  if (type && MEMBER_TYPE_LABELS[type]) return MEMBER_TYPE_LABELS[type];
  return "Mitglied";
}

export function GlobalSearch() {
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: members = [] } = useQuery<Member[]>({ queryKey: ["/api/members"], enabled: open });
  const { data: teams = [] } = useQuery<Team[]>({ queryKey: ["/api/teams"], enabled: open });
  const { data: events = [] } = useQuery<Event[]>({ queryKey: ["/api/events"], enabled: open });

  // Cmd/Ctrl+K to open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(o => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) { setQ(""); setActive(0); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [open]);

  const hits = useMemo<Hit[]>(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    const out: Hit[] = [];

    for (const m of members) {
      const team = teams.find(t => t.id === m.teamId);
      const hay = [
        m.name, m.email, m.phone, m.licenseNumber,
        (m as any).matricule, (m as any).familyCode, memberSub(m, team?.name),
      ].filter(Boolean).join(" ").toLowerCase();
      if (hay.includes(term)) out.push({ kind: "member", id: m.id, title: m.name, sub: memberSub(m, team?.name), href: `/members/${m.id}` });
      if (out.filter(h => h.kind === "member").length >= 8) break;
    }
    for (const t of teams) {
      const hay = [t.name, (t as any).category].filter(Boolean).join(" ").toLowerCase();
      if (hay.includes(term)) out.push({ kind: "team", id: t.id, title: t.name, sub: (t as any).category || "Team", href: `/teams/${t.id}` });
    }
    for (const ev of events) {
      const hay = [ev.title, (ev as any).location].filter(Boolean).join(" ").toLowerCase();
      if (hay.includes(term)) {
        const d = (ev as any).date ? new Date((ev as any).date).toLocaleDateString("de-DE") : "";
        out.push({ kind: "event", id: ev.id, title: ev.title, sub: d || "Termin", href: `/calendar` });
      }
      if (out.filter(h => h.kind === "event").length >= 6) break;
    }
    return out;
  }, [q, members, teams, events]);

  const go = (h: Hit) => { setOpen(false); navigate(h.href); };

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(a => Math.min(a + 1, hits.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
    else if (e.key === "Enter" && hits[active]) { e.preventDefault(); go(hits[active]); }
  };

  const groups: { key: Hit["kind"]; label: string; icon: typeof Users }[] = [
    { key: "member", label: "Mitglieder", icon: Users },
    { key: "team", label: "Teams", icon: Shield },
    { key: "event", label: "Termine", icon: CalendarDays },
  ];

  return (
    <>
      {/* Trigger: search box on desktop, icon on mobile */}
      <button
        onClick={() => setOpen(true)}
        data-testid="button-global-search"
        className="hidden md:flex items-center gap-2 h-9 w-48 lg:w-64 px-3 rounded-xl border border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted/70 transition-colors text-sm"
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">Suche…</span>
        <kbd className="hidden lg:inline text-[10px] font-mono px-1.5 py-0.5 rounded bg-background/70 border border-border/60">⌘K</kbd>
      </button>
      <button
        onClick={() => setOpen(true)}
        data-testid="button-global-search-mobile"
        className="md:hidden size-9 rounded-xl hover:bg-muted/60 flex items-center justify-center text-foreground/70"
        title="Suche"
      >
        <Search className="size-4" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 gap-0 max-w-lg top-[15%] translate-y-0 overflow-hidden">
          <div className="flex items-center gap-2 px-4 border-b">
            <Search className="size-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              value={q}
              onChange={e => { setQ(e.target.value); setActive(0); }}
              onKeyDown={onInputKey}
              placeholder="Mitglieder, Teams, Termine suchen…"
              className="flex-1 h-12 bg-transparent outline-none text-sm"
              data-testid="input-global-search"
            />
            {q && <button onClick={() => setQ("")} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>}
          </div>

          <div className="max-h-[60vh] overflow-y-auto py-2">
            {q.trim() === "" && (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                Tippe, um nach Namen, Email, Telefon, Lizenz, Kategorie, Team oder Terminen zu suchen.
              </p>
            )}
            {q.trim() !== "" && hits.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">Keine Treffer für „{q}"</p>
            )}
            {groups.map(g => {
              const gHits = hits.filter(h => h.kind === g.key);
              if (gHits.length === 0) return null;
              const Icon = g.icon;
              return (
                <div key={g.key} className="mb-1">
                  <div className="px-4 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{g.label}</div>
                  {gHits.map(h => {
                    const idx = hits.indexOf(h);
                    return (
                      <button
                        key={`${h.kind}-${h.id}`}
                        onMouseEnter={() => setActive(idx)}
                        onClick={() => go(h)}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${idx === active ? "bg-muted" : "hover:bg-muted/60"}`}
                        data-testid={`search-hit-${h.kind}-${h.id}`}
                      >
                        <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                          {h.kind === "member" ? initials(h.title) : <Icon className="size-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{h.title}</div>
                          <div className="text-xs text-muted-foreground truncate">{h.sub}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
