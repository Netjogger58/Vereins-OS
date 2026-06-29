import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Globe, Github, ExternalLink, Pencil, RefreshCw, Wand2, Info } from "lucide-react";

// Live-Website (GitHub Pages) + Repo für die Bearbeitung
const LIVE_URL = "https://mersch75.lu";
const REPO_URL = "https://github.com/Netjogger58/mersch75test.github.io";
const BRANCH = "main";

const pageUrl = (file: string) => `${LIVE_URL}/${file === "index.html" ? "" : file}`;
const editUrl = (file: string) => `${REPO_URL}/edit/${BRANCH}/${file}`;

// Seiten der Website (Label -> Datei im Repo). Stand: Live-Menü mersch75.lu (26.06.)
const PAGES: { label: string; file: string }[] = [
  { label: "Startseite", file: "index.html" },
  { label: "News", file: "news.html" },
  { label: "Spillplang (Live-Center)", file: "live-center.html" },
  { label: "NextGen", file: "nextgen.html" },
  { label: "Statistiken", file: "statistics-25-26.html" },
  { label: "Mitglied werden", file: "join.html" },
  { label: "Training", file: "training.html" },
  { label: "Trainer & Staff", file: "trainerstaff.html" },
  { label: "Intern (Comité + Geschicht)", file: "inside.html" },
  { label: "Halle & Anfahrt", file: "hallenkarte.html" },
  { label: "Galerie", file: "gallery.html" },
  { label: "Memories", file: "memories.html" },
  { label: "Kontakt", file: "contact.html" },
  { label: "Links", file: "links.html" },
  { label: "Community", file: "community.html" },
  { label: "Willkommensmappe", file: "wellkomm-mapp.html" },
  { label: "Generator (Tool)", file: "generator.html" },
  { label: "Impressum", file: "impressum.html" },
  { label: "Datenschutz", file: "dataprotection.html" },
  { label: "AGB", file: "terms.html" },
];

export default function Website() {
  const [active, setActive] = useState(PAGES[0]);
  const [reloadKey, setReloadKey] = useState(0);

  const open = (url: string) => window.open(url, "_blank", "noopener,noreferrer");

  return (
    <div className="space-y-6">
      {/* Header + Hauptaktionen */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Website</h1>
          <p className="text-muted-foreground mt-1">
            Öffentliche Vereins-Website · <span className="font-medium">mersch75.lu</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => open(LIVE_URL)} className="gap-2">
            <Globe className="size-4" /> Website öffnen
          </Button>
          <Button variant="outline" onClick={() => open(editUrl(active.file))} className="gap-2">
            <Pencil className="size-4" /> Diese Seite bearbeiten
          </Button>
          <Button variant="outline" onClick={() => open(REPO_URL)} className="gap-2">
            <Github className="size-4" /> GitHub-Repo
          </Button>
          <Button variant="outline" onClick={() => open(pageUrl("generator.html"))} className="gap-2">
            <Wand2 className="size-4" /> Generator
          </Button>
        </div>
      </div>

      {/* Hinweis: Bearbeitung läuft über GitHub */}
      <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/40 p-4 text-sm">
        <Info className="size-4 mt-0.5 shrink-0 text-primary" />
        <div className="text-muted-foreground">
          Änderungen laufen aktuell über <span className="font-medium text-foreground">GitHub</span>: Seite links auswählen,
          dann <span className="font-medium text-foreground">„Diese Seite bearbeiten"</span> öffnet den GitHub-Editor.
          Nach dem Speichern (Commit) veröffentlicht GitHub Pages automatisch – die Vorschau aktualisierst du mit dem
          Neu-laden-Button.
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        {/* Seitenliste */}
        <Card className="h-fit">
          <CardContent className="p-2">
            <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Seiten
            </div>
            <div className="flex max-h-[60vh] flex-col gap-0.5 overflow-y-auto">
              {PAGES.map((p) => (
                <button
                  key={p.file}
                  onClick={() => setActive(p)}
                  className={cn(
                    "flex items-center justify-between rounded-md px-2.5 py-2 text-left text-[13px] transition-colors",
                    active.file === p.file ? "bg-primary/10 font-medium text-primary" : "hover:bg-muted",
                  )}
                >
                  <span>{p.label}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">{p.file}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Live-Vorschau */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5">
            <div className="min-w-0">
              <div className="text-[13px] font-semibold">{active.label}</div>
              <div className="truncate font-mono text-[11px] text-muted-foreground">{pageUrl(active.file)}</div>
            </div>
            <div className="flex shrink-0 gap-1.5">
              <Button variant="ghost" size="icon" title="Vorschau neu laden" onClick={() => setReloadKey((k) => k + 1)}>
                <RefreshCw className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" title="In neuem Tab öffnen" onClick={() => open(pageUrl(active.file))}>
                <ExternalLink className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" title="Auf GitHub bearbeiten" onClick={() => open(editUrl(active.file))}>
                <Pencil className="size-4" />
              </Button>
            </div>
          </div>
          <div className="bg-muted/30">
            <iframe
              key={`${active.file}-${reloadKey}`}
              src={pageUrl(active.file)}
              title={`Vorschau: ${active.label}`}
              className="h-[68vh] w-full border-0 bg-white"
            />
          </div>
          <div className="border-t border-border/60 px-4 py-2 text-[11px] text-muted-foreground">
            Bleibt die Vorschau leer? Manche Seiten verbieten das Einbetten – dann
            {" "}
            <button className="text-primary underline" onClick={() => open(pageUrl(active.file))}>
              in neuem Tab öffnen
            </button>.
          </div>
        </Card>
      </div>
    </div>
  );
}
