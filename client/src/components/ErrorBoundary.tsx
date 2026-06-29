import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Fängt Render-Fehler einzelner Seiten ab, damit nicht die ganze App
 * abstürzt (weißer Bildschirm). Sidebar/Header bleiben erhalten, da diese
 * Boundary nur den Seiteninhalt umschließt. Über den Schlüssel `location`
 * (in Layout) wird sie bei Navigation automatisch zurückgesetzt.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: unknown) {
    // Für die Diagnose in der Konsole behalten.
    console.error("Seitenfehler abgefangen:", error, info);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Card className="w-full max-w-lg">
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="size-5 text-destructive" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">Diese Seite konnte nicht geladen werden</h1>
                <p className="text-sm text-muted-foreground">
                  Hier ist etwas schiefgelaufen – die übrige App funktioniert weiter.
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Wähle links eine andere Funktion, lade die Seite neu oder gehe zurück zum Dashboard.
            </p>

            <details className="rounded-md border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground">
              <summary className="cursor-pointer font-medium text-foreground">Technische Details</summary>
              <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-words">
                {error.message}
              </pre>
            </details>

            <div className="flex flex-wrap gap-2">
              <Button onClick={() => this.setState({ error: null })} className="gap-2">
                <RefreshCw className="size-4" /> Erneut versuchen
              </Button>
              <Button variant="outline" onClick={() => { window.location.hash = "#/"; this.setState({ error: null }); }} className="gap-2">
                <Home className="size-4" /> Zum Dashboard
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()} className="gap-2">
                <RefreshCw className="size-4" /> App neu laden
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}
