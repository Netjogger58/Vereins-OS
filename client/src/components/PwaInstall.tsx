import { useEffect, useState } from "react";
import { Download, X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstall() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // iOS detection for install instructions
    const ua = window.navigator.userAgent.toLowerCase();
    const iOS = /iphone|ipad|ipod/.test(ua);
    const standalone = ("standalone" in window.navigator) && !!(window.navigator as any).standalone;
    setIsIos(iOS && !standalone);

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const result = await prompt.userChoice;
    if (result.outcome === "accepted") {
      setPrompt(null);
    }
  };

  if (!prompt && !isIos) return null;
  if (dismissed) return null;

  return (
    <div className="fixed bottom-[68px] left-4 right-4 z-50 lg:hidden">
      <div className="rounded-2xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 p-2.5 rounded-xl shrink-0">
            <Smartphone className="size-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[14px] font-semibold">M75 Manager installieren</h3>
            <p className="text-[12px] text-muted-foreground mt-0.5 leading-relaxed">
              {isIos
                ? "Tippe unten auf 'Teilen' und dann 'Zum Home-Bildschirm', um die App wie eine native App zu nutzen."
                : "Installiere die App auf deinem Startbildschirm für schnelleren Zugriff und Offline-Nutzung."}
            </p>
            {!isIos && prompt && (
              <Button size="sm" onClick={handleInstall} className="mt-2.5 h-8 text-[12px]">
                <Download className="size-3.5 mr-1.5" />
                Installieren
              </Button>
            )}
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground shrink-0"
            aria-label="Schließen"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
