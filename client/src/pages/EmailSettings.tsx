import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { Mail, Server, Shield, Send, CheckCircle, AlertCircle } from "lucide-react";

export default function EmailSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [testing, setTesting] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/email-settings"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/email-settings");
      return res.json();
    },
  });

  const { data: emails = [] } = useQuery({
    queryKey: ["/api/emails"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/emails");
      return res.json();
    },
  });

  const saveMut = useMutation({
    mutationFn: async (data: any) => {
      return (await apiRequest("POST", "/api/email-settings", data)).json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-settings"] });
      toast({ title: "Einstellungen gespeichert" });
    },
  });

  const testMut = useMutation({
    mutationFn: async () => {
      return (await apiRequest("POST", "/api/email-settings/test")).json();
    },
    onSuccess: (data) => {
      toast({ title: data.message });
    },
    onError: (error: any) => {
      toast({ 
        title: "Fehler", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  if (!user || !["präsident", "admin"].includes(user.role)) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Keine Berechtigung</p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    saveMut.mutate({
      smtpHost: formData.get("smtpHost"),
      smtpPort: parseInt(formData.get("smtpPort") as string) || 587,
      smtpUser: formData.get("smtpUser"),
      smtpPassword: formData.get("smtpPassword"),
      smtpSecure: formData.get("smtpSecure") === "on",
      fromName: formData.get("fromName"),
      fromEmail: formData.get("fromEmail"),
      replyTo: formData.get("replyTo"),
      enabled: formData.get("enabled") === "on",
    });
  };

  const pendingCount = emails.filter((e: any) => e.status === "pending").length;
  const sentCount = emails.filter((e: any) => e.status === "sent").length;
  const failedCount = emails.filter((e: any) => e.status === "failed").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">E-Mail-Einstellungen</h1>
        <p className="text-sm text-muted-foreground">
          Konfigurieren Sie den E-Mail-Versand für Benachrichtigungen
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Ausstehend</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
              <Mail className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Gesendet</p>
                <p className="text-2xl font-bold text-green-600">{sentCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Fehlgeschlagen</p>
                <p className="text-2xl font-bold text-red-600">{failedCount}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            SMTP-Konfiguration
          </CardTitle>
          <CardDescription>
            Verbindungsdaten für Ihren E-Mail-Server
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">E-Mail-Versand aktivieren</p>
                  <p className="text-sm text-muted-foreground">
                    Systemweite E-Mail-Benachrichtigungen
                  </p>
                </div>
              </div>
              <Switch 
                name="enabled" 
                defaultChecked={settings?.enabled || false}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">SMTP-Server *</label>
                <Input
                  name="smtpHost"
                  placeholder="z.B. smtp.gmail.com"
                  defaultValue={settings?.smtpHost || ""}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">SMTP-Port *</label>
                <Input
                  name="smtpPort"
                  type="number"
                  placeholder="587"
                  defaultValue={settings?.smtpPort || 587}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Benutzername *</label>
                <Input
                  name="smtpUser"
                  placeholder="E-Mail-Adresse"
                  defaultValue={settings?.smtpUser || ""}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Passwort *</label>
                <Input
                  name="smtpPassword"
                  type="password"
                  placeholder="App-Passwort oder SMTP-Passwort"
                  defaultValue={settings?.smtpPassword || ""}
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2 p-4 border rounded-lg bg-muted/50">
              <input
                type="checkbox"
                name="smtpSecure"
                id="smtpSecure"
                className="rounded"
                defaultChecked={settings?.smtpSecure || false}
              />
              <label htmlFor="smtpSecure" className="text-sm cursor-pointer">
                TLS/SSL-Verschlüsselung verwenden (empfohlen für Port 465)
              </label>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-medium mb-4">Absender-Einstellungen</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Absender-Name *</label>
                  <Input
                    name="fromName"
                    placeholder="z.B. FC Mersch 75"
                    defaultValue={settings?.fromName || "M75 Manager"}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Absender-E-Mail *</label>
                  <Input
                    name="fromEmail"
                    type="email"
                    placeholder="info@mersch75.lu"
                    defaultValue={settings?.fromEmail || ""}
                    required
                  />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <label className="text-sm font-medium">Antwort-Adresse (optional)</label>
                <Input
                  name="replyTo"
                  type="email"
                  placeholder="vorstand@mersch75.lu"
                  defaultValue={settings?.replyTo || ""}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button type="submit" disabled={saveMut.isPending}>
                <Mail className="w-4 h-4 mr-2" />
                Einstellungen speichern
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => testMut.mutate()}
                disabled={testMut.isPending || !settings?.enabled}
              >
                <Send className="w-4 h-4 mr-2" />
                Test-E-Mail senden
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Recent Emails */}
      <Card>
        <CardHeader>
          <CardTitle>Letzte E-Mails</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {emails.slice(0, 10).map((email: any) => (
              <div key={email.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge className={
                    email.status === "sent" ? "bg-green-500" :
                    email.status === "failed" ? "bg-red-500" :
                    "bg-yellow-500"
                  }>
                    {email.status}
                  </Badge>
                  <div>
                    <p className="font-medium">{email.subject}</p>
                    <p className="text-sm text-muted-foreground">{email.toEmail}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(email.createdAt).toLocaleString("de-DE")}
                </p>
              </div>
            ))}
            {emails.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Noch keine E-Mails versendet
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
