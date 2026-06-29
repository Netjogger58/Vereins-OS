import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ExternalLink, Printer, Pencil, Github, Info, RefreshCw, Languages } from "lucide-react";

// Live-Website (GitHub Pages, Custom-Domain) + Repo für die Bearbeitung
const LIVE_URL = "https://mersch75.lu";
const REPO_URL = "https://github.com/Netjogger58/mersch75test.github.io";
const BRANCH = "main";
const FILE = "wellkomm-mapp.html";

const MAPP_URL = `${LIVE_URL}/${FILE}`;
const EDIT_URL = `${REPO_URL}/edit/${BRANCH}/${FILE}`;

// Die in der Mappe enthaltenen Sprachen (Umschaltung erfolgt direkt im Dokument)
const LANGUAGES = ["Lëtzebuergesch", "Deutsch", "Français", "English", "Português"];

// Inhaltsübersicht der Mappe (Seiten des Dossiers)
const SECTIONS = [
  "Brief des Präsidenten",
  "Erste Schritte, Anmeldung & Geschenk",
  "Kontakte, Trainer & Zeiten",
  "Werte (S.T.A.A.R.K.)",
  "Deine Rolle im Team & Kommunikation",
  "Digital & Online (Website-Menü)",
  "Mitgliedschaft, Kleidung & Sicherheit",
  "Ehrenamtliches Engagement",
  "Highlights, FAQ & Downloads",
];

export default function WelcomeMappe() {
  const [reloadKey, setReloadKey] = useState(0);
  const open = (url: string) => window.open(url, "_blank", "noopener,noreferrer");

  return (
    <div className="space-y-6">
      {/* Header + Hauptaktionen */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <BookOpen className="size-6 text-primary" /> Willkommensmappe
          </h1>
          <p className="text-muted-foreground mt-1">
            Mehrsprachige <span className="font-medium">Wëllkomm-Mapp</span> für neue Mitglieder · {" "}
            <span className="font-medium">mersch75.lu</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => open(MAPP_URL)} className="gap-2">
            <ExternalLink className="size-4" /> Mappe öffnen
          </Button>
          <Button variant="outline" onClick={() => open(MAPP_URL)} className="gap-2">
            <Printer className="size-4" /> Drucken / PDF
          </Button>
          <Button variant="outline" onClick={() => open(EDIT_URL)} className="gap-2">
            <Pencil className="size-4" /> Bearbeiten
          </Button>
          <Button variant="outline" onClick={() => open(REPO_URL)} className="gap-2">
            <Github className="size-4" /> GitHub-Repo
          </Button>
        </div>
      </div>

      {/* Sprachen + Hinweis */}
      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/40 p-4 text-sm">
          <Info className="size-4 mt-0.5 shrink-0 text-primary" />
          <div className="text-muted-foreground">
            Die Mappe wird über die Vereins-Website (GitHub Pages) bereitgestellt. Zum Bearbeiten öffnet {" "}
            <span className="font-medium text-foreground">„Bearbeiten"</span> den GitHub-Editor; nach dem Commit
            veröffentlicht GitHub Pages automatisch. Für ein PDF die Mappe öffnen und im Browser
            {" "}<span className="font-medium text-foreground">Drucken → Als PDF speichern</span> wählen.
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/40 p-4 text-sm">
          <Languages className="size-4 mt-0.5 shrink-0 text-primary" />
          <div className="flex flex-wrap gap-1.5">
            {LANGUAGES.map((l) => (
              <span key={l} className="rounded-md bg-primary/10 px-2 py-0.5 text-[12px] font-medium text-primary">
                {l}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        {/* Inhaltsübersicht */}
        <Card className="h-fit">
          <CardContent className="p-2">
            <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Inhalt
            </div>
            <ol className="flex flex-col gap-0.5">
              {SECTIONS.map((s, i) => (
                <li
                  key={s}
                  className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] text-muted-foreground"
                >
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                    {i + 1}
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* Live-Vorschau */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5">
            <div className="min-w-0">
              <div className="text-[13px] font-semibold">Wëllkomm-Mapp</div>
              <div className="truncate font-mono text-[11px] text-muted-foreground">{MAPP_URL}</div>
            </div>
            <div className="flex shrink-0 gap-1.5">
              <Button variant="ghost" size="icon" title="Vorschau neu laden" onClick={() => setReloadKey((k) => k + 1)}>
                <RefreshCw className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" title="In neuem Tab öffnen" onClick={() => open(MAPP_URL)}>
                <ExternalLink className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" title="Auf GitHub bearbeiten" onClick={() => open(EDIT_URL)}>
                <Pencil className="size-4" />
              </Button>
            </div>
          </div>
          <div className="bg-muted/30">
            <iframe
              key={reloadKey}
              src={MAPP_URL}
              title="Vorschau: Wëllkomm-Mapp"
              className="h-[72vh] w-full border-0 bg-white"
            />
          </div>
          <div className="border-t border-border/60 px-4 py-2 text-[11px] text-muted-foreground">
            Bleibt die Vorschau leer? Dann
            {" "}
            <button className="text-primary underline" onClick={() => open(MAPP_URL)}>
              in neuem Tab öffnen
            </button>.
          </div>
        </Card>
      </div>
    </div>
  );
}
