import { useState, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Users, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

interface PreviewData {
  sheets: string[];
  selectedSheet: string;
  headers: string[];
  mapping: Record<string, number>;
  preview: string[][];
  totalRows: number;
}

interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
  teamsCreated: number;
}

export default function ImportMembers() {
  const { user } = useAuth();
  const [step, setStep] = useState<"upload" | "preview" | "importing" | "done">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = user?.role === "präsident" || user?.role === "admin" || user?.role === "secretaire";

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".xlsx") && !selectedFile.name.endsWith(".xls")) {
      setError("Bitte eine Excel-Datei (.xlsx oder .xls) hochladen");
      return;
    }

    setFile(selectedFile);
    setError(null);
    await analyzeFile(selectedFile);
  };

  const analyzeFile = async (f: File) => {
    setStep("upload");
    setProgress(30);

    const formData = new FormData();
    formData.append("file", f);

    try {
      const res = await fetch("/api/import/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Analyse fehlgeschlagen");
      }

      const data: PreviewData = await res.json();
      setPreview(data);
      setStep("preview");
      setProgress(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Analysieren");
      setProgress(0);
    }
  };

  const startImport = async () => {
    if (!file || !preview) return;

    setStep("importing");
    setProgress(10);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("sheetName", preview.selectedSheet);
    formData.append("mapping", JSON.stringify(preview.mapping));

    try {
      const res = await fetch("/api/import/members", {
        method: "POST",
        body: formData,
      });

      setProgress(100);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Import fehlgeschlagen");
      }

      const data: ImportResult = await res.json();
      setResult(data);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Importieren");
      setStep("preview");
      setProgress(0);
    }
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Nur Präsident oder Admin können Mitglieder importieren.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/members">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Mitglieder-Import</h1>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {step === "upload" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Excel-Datei hochladen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:bg-accent transition-colors"
            >
              <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">
                Klicken zum Auswählen oder Datei hierher ziehen
              </p>
              <p className="text-sm text-muted-foreground">
                Unterstützt: .xlsx, .xls (max. 50 MB)
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="mt-6 text-sm text-muted-foreground">
              <p className="font-medium mb-2">Unterstützte Spalten (automatisch erkannt):</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <span>• Vorname / Nachname</span>
                <span>• Name (vollständig)</span>
                <span>• Geburtsdatum</span>
                <span>• E-Mail</span>
                <span>• Telefon</span>
                <span>• Adresse</span>
                <span>• Team / Mannschaft</span>
                <span>• Lizenznummer</span>
                <span>• Status (aktiv/inaktiv)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "preview" && preview && (
        <Card>
          <CardHeader>
            <CardTitle>Vorschau: {preview.selectedSheet}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">
                <strong>{preview.totalRows.toLocaleString()}</strong> Zeilen gefunden
                  </p>
              
              <div className="text-sm mb-4">
                <p className="font-medium mb-1">Erkannte Spalten:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(preview.mapping).map(([field, idx]) => (
                    <span
                      key={field}
                      className="px-2 py-1 bg-primary/10 text-primary rounded text-xs"
                    >
                      {field} → {preview.headers[idx]}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="border rounded-lg overflow-x-auto mb-6">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    {preview.headers.slice(0, 8).map((h, i) => (
                      <th key={i} className="px-3 py-2 text-left font-medium whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                    {preview.headers.length > 8 && (
                      <th className="px-3 py-2">+{preview.headers.length - 8} weitere</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {preview.preview.map((row, i) => (
                    <tr key={i} className="border-t">
                      {row.slice(0, 8).map((cell, j) => (
                        <td key={j} className="px-3 py-2 whitespace-nowrap truncate max-w-[150px]">
                          {cell}
                        </td>
                      ))}
                      {row.length > 8 && <td className="px-3 py-2 text-muted-foreground">...</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep("upload")}>
                Zurück
              </Button>
              <Button onClick={startImport} className="flex-1">
                <Users className="h-4 w-4 mr-2" />
                {preview.totalRows.toLocaleString()} Mitglieder importieren
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "importing" && (
        <Card>
          <CardHeader>
            <CardTitle>Import läuft...</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="mb-4" />
            <p className="text-center text-muted-foreground">
              Bitte warten, Mitglieder werden importiert...
            </p>
          </CardContent>
        </Card>
      )}

      {step === "done" && result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Import abgeschlossen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">{result.imported}</p>
                <p className="text-sm text-muted-foreground">Importiert</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-yellow-600">{result.skipped}</p>
                <p className="text-sm text-muted-foreground">Übersprungen (Duplikate)</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">{result.teamsCreated}</p>
                <p className="text-sm text-muted-foreground">Neue Teams</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-red-600">{result.errors.length}</p>
                <p className="text-sm text-muted-foreground">Fehler</p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="mb-6">
                <p className="font-medium mb-2">Fehler (erste 20):</p>
                <div className="bg-red-50 p-3 rounded text-sm max-h-40 overflow-y-auto">
                  {result.errors.map((err, i) => (
                    <p key={i} className="text-red-700 mb-1">{err}</p>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep("upload")}>
                Weitere Datei importieren
              </Button>
              <Link href="/members">
                <Button>Zu den Mitgliedern</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
