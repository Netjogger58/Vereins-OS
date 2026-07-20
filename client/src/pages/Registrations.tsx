import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  UserPlus, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  ArrowRight,
  Loader2
} from "lucide-react";
import { Link } from "wouter";
import type { Registration, Team } from "@shared/schema";

const STATUS_LABELS: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Ausstehend", color: "bg-yellow-500", icon: Clock },
  approved: { label: "Genehmigt", color: "bg-green-500", icon: CheckCircle },
  rejected: { label: "Abgelehnt", color: "bg-red-500", icon: XCircle },
  converted: { label: "Umgewandelt", color: "bg-blue-500", icon: UserPlus },
};

export default function Registrations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const canProcess = user && ["präsident", "admin", "secretaire"].includes(user.role);

  const { data: registrations = [] } = useQuery<Registration[]>({
    queryKey: ["/api/registrations"],
  });

  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  const approveMut = useMutation({
    mutationFn: async ({ id, notes }: { id: number; notes?: string }) => {
      return (await apiRequest("POST", `/api/registrations/${id}/approve`, { notes })).json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/registrations"] });
      toast({ title: "Anmeldung genehmigt" });
      setSelectedReg(null);
    },
  });

  const rejectMut = useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
      return (await apiRequest("POST", `/api/registrations/${id}/reject`, { reason })).json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/registrations"] });
      toast({ title: "Anmeldung abgelehnt" });
      setRejectDialog(false);
      setSelectedReg(null);
      setRejectReason("");
    },
  });

  const convertMut = useMutation({
    mutationFn: async (id: number) => {
      return (await apiRequest("POST", `/api/registrations/${id}/convert`)).json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/registrations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      toast({ title: "In Mitglied umgewandelt", description: `${data.firstName} ${data.lastName} wurde zur Mitgliederliste hinzugefügt.` });
    },
  });

  const filteredRegs = registrations.filter(r => 
    r.firstName.toLowerCase().includes(search.toLowerCase()) ||
    r.lastName.toLowerCase().includes(search.toLowerCase()) ||
    r.email.toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount = registrations.filter(r => r.status === "pending").length;

  const RegistrationCard = ({ reg }: { reg: Registration }) => {
    const status = STATUS_LABELS[reg.status];
    const StatusIcon = status.icon;
    const team = teams.find(t => t.id === reg.teamId);

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-semibold text-primary">
                  {reg.firstName[0]}{reg.lastName[0]}
                </span>
              </div>
              <div>
                <h3 className="font-semibold">{reg.firstName} {reg.lastName}</h3>
                <p className="text-sm text-muted-foreground">{reg.email}</p>
              </div>
            </div>
            <Badge className={status.color}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {status.label}
            </Badge>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {reg.phone && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Phone className="w-3 h-3" />
                {reg.phone}
              </div>
            )}
            {reg.birthdate && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {new Date(reg.birthdate).toLocaleDateString("de-DE")}
              </div>
            )}
            {team && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="w-3 h-3" />
                {team.name}
              </div>
            )}
            {reg.address && (
              <div className="flex items-center gap-1 text-muted-foreground col-span-2">
                <MapPin className="w-3 h-3" />
                {reg.address}
              </div>
            )}
          </div>

          {(reg.parentName || reg.parentEmail) && (
            <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
              <p className="font-medium text-blue-900">Elternteil:</p>
              <p className="text-blue-800">{reg.parentName}</p>
              {reg.parentEmail && <p className="text-blue-700">{reg.parentEmail}</p>}
            </div>
          )}

          {reg.notes && (
            <p className="mt-3 text-sm text-muted-foreground italic">
              "{reg.notes}"
            </p>
          )}

          {reg.status === "pending" && canProcess && (
            <div className="mt-4 flex gap-2">
              <Button 
                size="sm" 
                className="flex-1" 
                onClick={() => approveMut.mutate({ id: reg.id })}
                disabled={approveMut.isPending}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Annehmen
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
                onClick={() => { setSelectedReg(reg); setRejectDialog(true); }}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Ablehnen
              </Button>
            </div>
          )}

          {reg.status === "approved" && !reg.memberId && (
            <div className="mt-4 flex gap-2">
              <Button
                size="sm"
                className="flex-1"
                onClick={() => convertMut.mutate(reg.id)}
                disabled={convertMut.isPending}
              >
                {convertMut.isPending ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4 mr-1" />
                )}
                Autom. als Mitglied anlegen
              </Button>
              <Link href={`/members/${reg.memberId || ""}`}>
                <Button size="sm" variant="outline">
                  <ArrowRight className="w-4 h-4 mr-1" />
                  Detail
                </Button>
              </Link>
            </div>
          )}

          {reg.status === "converted" && reg.memberId && (
            <div className="mt-4">
              <Link href={`/members/${reg.memberId}`}>
                <Button size="sm" variant="outline" className="w-full">
                  <ArrowRight className="w-4 h-4 mr-1" />
                  Mitglied ansehen / bearbeiten
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Online-Anmeldungen</h1>
          <p className="text-sm text-muted-foreground">
            {pendingCount} ausstehende Anmeldungen
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Suchen..."
              className="pl-8 w-[200px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Link href="/registration" target="_blank">
            <Button variant="outline">Öffentlicher Link</Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Ausstehend ({registrations.filter(r => r.status === "pending").length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Genehmigt ({registrations.filter(r => r.status === "approved").length})
          </TabsTrigger>
          <TabsTrigger value="all">Alle ({registrations.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <div className="grid gap-4">
            {filteredRegs.filter(r => r.status === "pending").map(reg => (
              <RegistrationCard key={reg.id} reg={reg} />
            ))}
            {filteredRegs.filter(r => r.status === "pending").length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Keine ausstehenden Anmeldungen
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="approved" className="mt-4">
          <div className="grid gap-4">
            {filteredRegs.filter(r => r.status === "approved").map(reg => (
              <RegistrationCard key={reg.id} reg={reg} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="all" className="mt-4">
          <div className="grid gap-4">
            {filteredRegs.map(reg => (
              <RegistrationCard key={reg.id} reg={reg} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Anmeldung ablehnen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Bitte geben Sie einen Grund für die Ablehnung an:</p>
            <Input
              placeholder="z.B. Vollständige Mannschaft, Alter nicht passend..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejectDialog(false)}>
              Abbrechen
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedReg && rejectMut.mutate({ id: selectedReg.id, reason: rejectReason })}
              disabled={!rejectReason || rejectMut.isPending}
            >
              Ablehnen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
