import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Logo } from "@/components/Logo";
import { CheckCircle, User, Mail, Phone, MapPin, Calendar, Users, FileText } from "lucide-react";
import type { Team } from "@shared/schema";

export default function Registration() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      await apiRequest("POST", "/api/registrations", {
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        birthdate: formData.get("birthdate"),
        address: formData.get("address"),
        teamId: formData.get("teamId") ? parseInt(formData.get("teamId") as string) : null,
        parentName: formData.get("parentName"),
        parentEmail: formData.get("parentEmail"),
        parentPhone: formData.get("parentPhone"),
        notes: formData.get("notes"),
      });

      setSubmitted(true);
      toast({
        title: "Anmeldung eingereicht",
        description: "Wir werden uns in Kürze bei Ihnen melden.",
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Anmeldung konnte nicht gesendet werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Anmeldung erfolgreich!</h2>
            <p className="text-muted-foreground mb-6">
              Vielen Dank für Ihre Anmeldung. Unser Vorstand wird diese prüfen und sich in Kürze bei Ihnen melden.
            </p>
            <Button onClick={() => window.location.href = "/"}>
              Zurück zur Startseite
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Logo size={60} className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold">Online-Anmeldung</h1>
          <p className="text-muted-foreground">Werden Sie Mitglied beim FC Mersch 75</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Persönliche Daten</CardTitle>
            <CardDescription>
              Bitte füllen Sie alle Felder aus. Felder mit * sind Pflichtfelder.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Vorname *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="firstName" name="firstName" className="pl-9" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nachname *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="lastName" name="lastName" className="pl-9" required />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-Mail *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="email" name="email" type="email" className="pl-9" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="phone" name="phone" type="tel" className="pl-9" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthdate">Geburtsdatum</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="birthdate" name="birthdate" type="date" className="pl-9" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="address" name="address" className="pl-9" placeholder="Straße, PLZ Ort" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="teamId">Gewünschtes Team</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                  <Select name="teamId">
                    <SelectTrigger className="pl-9">
                      <SelectValue placeholder="Team wählen (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={String(team.id)}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-medium mb-4">Für Minderjährige: Eltern/Guardian</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="parentName">Name Erziehungsberechtigter</Label>
                    <Input id="parentName" name="parentName" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parentEmail">E-Mail Erziehungsberechtigter</Label>
                    <Input id="parentEmail" name="parentEmail" type="email" />
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <Label htmlFor="parentPhone">Telefon Erziehungsberechtigter</Label>
                  <Input id="parentPhone" name="parentPhone" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Anmerkungen</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="notes" name="notes" className="pl-9" placeholder="Z.B. frühere Vereine, Position, etc." />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Wird gesendet..." : "Anmeldung absenden"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
