import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { 
  CalendarDays, 
  Clock, 
  MapPin, 
  Plus, 
  Trash2, 
  Play,
  CheckCircle,
  AlertCircle,
  Users
} from "lucide-react";
import type { TrainingSchedule, Team } from "@shared/schema";

const DAYS = [
  { value: 1, label: "Montag" },
  { value: 2, label: "Dienstag" },
  { value: 3, label: "Mittwoch" },
  { value: 4, label: "Donnerstag" },
  { value: 5, label: "Freitag" },
  { value: 6, label: "Samstag" },
  { value: 0, label: "Sonntag" },
];

const LOCATIONS = [
  "Omnisport",
  "Krounebierg", 
  "Lintgen",
  "Mersch",
];

export default function TrainingSchedules() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [openNew, setOpenNew] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [generateDialog, setGenerateDialog] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const canManage = user && ["präsident", "admin", "trainer"].includes(user.role);
  const canView = user && ["präsident", "admin", "trainer", "secretaire"].includes(user.role);
  const isTrainer = user?.role === "trainer";

  // Eigener Trainer-Code des Nutzers (bestimmt die abgedeckten Teams)
  const { data: myCode } = useQuery<{ allTeams: boolean; teamIdsResolved: number[] } | null>({
    queryKey: ["/api/trainer-codes/me"],
    queryFn: async () => (await apiRequest("GET", "/api/trainer-codes/me")).json(),
    enabled: !!isTrainer,
  });

  // Teams, die der Trainer laut Code betreuen darf (Fallback: eigenes user.teamId)
  const trainerTeamIds: number[] =
    myCode?.teamIdsResolved && myCode.teamIdsResolved.length > 0
      ? myCode.teamIdsResolved
      : user?.teamId
        ? [Number(user.teamId)]
        : [];

  // Trainer mit genau einem Team: automatisch vorauswählen
  useEffect(() => {
    if (isTrainer && trainerTeamIds.length === 1) setSelectedTeam(String(trainerTeamIds[0]));
  }, [isTrainer, trainerTeamIds.join(",")]);

  // Team-Umfang fürs Generieren: Trainer = gewähltes erlaubtes Team (leer = alle erlaubten), sonst Filter
  const generateTeamId = selectedTeam ? Number(selectedTeam) : undefined;

  const { data: schedules = [] } = useQuery<TrainingSchedule[]>({
    queryKey: ["/api/training-schedules", selectedTeam || undefined],
    queryFn: async () => {
      const url = selectedTeam ? `/api/training-schedules?teamId=${selectedTeam}` : "/api/training-schedules";
      return (await apiRequest("GET", url)).json();
    },
    enabled: !!canView,
  });

  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  const createMut = useMutation({
    mutationFn: async (data: any) => {
      return (await apiRequest("POST", "/api/training-schedules", data)).json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training-schedules"] });
      setOpenNew(false);
      toast({ title: "Trainingsplan erstellt" });
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => {
      return (await apiRequest("DELETE", `/api/training-schedules/${id}`)).json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training-schedules"] });
      toast({ title: "Trainingsplan gelöscht" });
    },
  });

  const generateMut = useMutation({
    mutationFn: async ({ startDate, endDate, teamId }: { startDate: string; endDate: string; teamId?: number }) => {
      return (await apiRequest("POST", "/api/training-schedules/generate", { startDate, endDate, teamId })).json();
    },
    onSuccess: (data) => {
      setGenerateDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({ 
        title: "Events generiert", 
        description: `${data.generatedCount} Trainingstermine wurden erstellt` 
      });
    },
  });

  // Group schedules by day
  const byDay = DAYS.map(day => ({
    ...day,
    schedules: schedules.filter(s => s.dayOfWeek === day.value),
  }));

  if (!canView) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Keine Berechtigung</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Trainingsplanung</h1>
          <p className="text-sm text-muted-foreground">
            {schedules.length} wöchentliche Trainings eingerichtet
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(() => {
            // Trainer sehen nur ihre per Code freigegebenen Teams; ein einzelnes Team ist fix.
            const visibleTeams = isTrainer ? teams.filter(t => trainerTeamIds.includes(t.id)) : teams;
            const lockSingle = isTrainer && trainerTeamIds.length <= 1;
            return (
              <Select value={selectedTeam} onValueChange={setSelectedTeam} disabled={lockSingle}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={isTrainer ? "Alle meine Teams" : "Alle Teams"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{isTrainer ? "Alle meine Teams" : "Alle Teams"}</SelectItem>
                  {visibleTeams.map(team => (
                    <SelectItem key={team.id} value={String(team.id)}>{team.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );
          })()}
          {canManage && (
            <>
              <Button variant="outline" onClick={() => setGenerateDialog(true)}>
                <Play className="w-4 h-4 mr-1" />
                Generieren
              </Button>
              <Button onClick={() => setOpenNew(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Neuer Plan
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Weekly View */}
      <div className="grid grid-cols-7 gap-2">
        {byDay.map((day) => (
          <Card key={day.value} className={day.schedules.length > 0 ? "border-primary/20" : ""}>
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm font-medium text-center">{day.label}</CardTitle>
            </CardHeader>
            <CardContent className="p-2 pt-0 space-y-2">
              {day.schedules.map((schedule) => {
                const team = teams.find(t => t.id === schedule.teamId);
                return (
                  <div 
                    key={schedule.id} 
                    className="p-2 bg-primary/5 rounded text-xs space-y-1"
                  >
                    <div className="font-medium">{team?.name || "Unbekannt"}</div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {schedule.startTime} - {schedule.endTime}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {schedule.location}
                    </div>
                    {canManage && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 float-right -mt-6"
                        onClick={() => deleteMut.mutate(schedule.id)}
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </Button>
                    )}
                  </div>
                );
              })}
              {day.schedules.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">-</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* List View */}
      <Card>
        <CardHeader>
          <CardTitle>Alle Trainingspläne</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {schedules.map((schedule) => {
              const team = teams.find(t => t.id === schedule.teamId);
              const dayLabel = DAYS.find(d => d.value === schedule.dayOfWeek)?.label;
              
              return (
                <div 
                  key={schedule.id} 
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-24 font-medium">{dayLabel}</div>
                    <div className="w-32">{team?.name || "Unbekannt"}</div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {schedule.startTime} - {schedule.endTime}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {schedule.location}
                      {schedule.hall && ` (${schedule.hall})`}
                    </div>
                    <Badge variant={schedule.active ? "default" : "secondary"}>
                      {schedule.active ? "Aktiv" : "Inaktiv"}
                    </Badge>
                  </div>
                  {canManage && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => deleteMut.mutate(schedule.id)}
                      disabled={deleteMut.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  )}
                </div>
              );
            })}
            {schedules.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Keine Trainingspläne vorhanden
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* New Schedule Dialog */}
      <Dialog open={openNew} onOpenChange={setOpenNew}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Neuer Trainingsplan</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const formData = new FormData(form);
              createMut.mutate({
                teamId: parseInt(formData.get("teamId") as string),
                dayOfWeek: parseInt(formData.get("dayOfWeek") as string),
                startTime: formData.get("startTime"),
                endTime: formData.get("endTime"),
                location: formData.get("location"),
                hall: formData.get("hall") || null,
                seasonStart: formData.get("seasonStart"),
                seasonEnd: formData.get("seasonEnd"),
                active: true,
                notes: formData.get("notes") || null,
              });
            }}
            className="space-y-4"
          >
            <div>
              <label className="text-sm font-medium">Team *</label>
              <Select name="teamId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Team wählen" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map(team => (
                    <SelectItem key={team.id} value={String(team.id)}>{team.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Wochentag *</label>
                <Select name="dayOfWeek" defaultValue="1">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map(day => (
                      <SelectItem key={day.value} value={String(day.value)}>{day.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Ort *</label>
                <Select name="location" defaultValue="Omnisport">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map(loc => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Startzeit *</label>
                <Input name="startTime" type="time" defaultValue="18:00" required />
              </div>
              <div>
                <label className="text-sm font-medium">Endzeit *</label>
                <Input name="endTime" type="time" defaultValue="19:30" required />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Halle (optional)</label>
              <Input name="hall" placeholder="z.B. Halle 1" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Saison Start *</label>
                <Input name="seasonStart" type="date" defaultValue="2025-08-01" required />
              </div>
              <div>
                <label className="text-sm font-medium">Saison Ende *</label>
                <Input name="seasonEnd" type="date" defaultValue="2026-06-30" required />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Notizen</label>
              <Input name="notes" placeholder="Optional" />
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpenNew(false)}>
                Abbrechen
              </Button>
              <Button type="submit" disabled={createMut.isPending}>
                Erstellen
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Generate Events Dialog */}
      <Dialog open={generateDialog} onOpenChange={setGenerateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Trainingstermine generieren</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Erstellt automatisch Trainingsevents im Kalender für den gewählten Zeitraum.
            </p>
            <div className="text-sm rounded-md bg-primary/5 border border-primary/10 px-3 py-2">
              Umfang:{" "}
              <span className="font-semibold">
                {generateTeamId
                  ? (teams.find(t => t.id === generateTeamId)?.name || "Ausgewähltes Team")
                  : "Alle Teams"}
              </span>
              {isTrainer && <span className="text-muted-foreground"> · nur dein Team</span>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Von</label>
                <Input 
                  type="date" 
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Bis</label>
                <Input 
                  type="date" 
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setGenerateDialog(false)}>
              Abbrechen
            </Button>
            <Button
              onClick={() => generateMut.mutate({ startDate: dateRange.start, endDate: dateRange.end, teamId: generateTeamId })}
              disabled={!dateRange.start || !dateRange.end || generateMut.isPending}
            >
              {generateMut.isPending ? "Generiere..." : "Generieren"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
