import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Layout, X, Save, Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { initials, formatMemberName } from "@/lib/utils";
import { isActiveClubMember } from "@shared/memberStatus";
import type { Match, Team, Member } from "@shared/schema";

const FORMATIONS = [
  { value: "1-6", label: "Handball 1-6", rows: [1, 6] },
  { value: "1-3-3", label: "Handball 1-3-3", rows: [1, 3, 3] },
  { value: "1-2-4", label: "Handball 1-2-4", rows: [1, 2, 4] },
];

const POSITIONS = ["TW", "LA", "RA", "RL", "RR", "KM", "RM", "LM", "HM", "ST"];

interface Slot {
  row: number;
  col: number;
  memberId: number | null;
  position: string;
}

export default function LineupEditor({ match }: { match: Match }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formation, setFormation] = useState("1-4-3-3");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [draggedMember, setDraggedMember] = useState<number | null>(null);
  const [draggedFromSlot, setDraggedFromSlot] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  const canEdit = user && ["präsident", "admin", "trainer"].includes(user.role);

  const { data: teams = [] } = useQuery<Team[]>({ queryKey: ["/api/teams"] });
  const { data: members = [] } = useQuery<Member[]>({ queryKey: ["/api/members"] });

  const teamMembers = useMemo(() =>
    members.filter(m => m.teamId === match.teamId && isActiveClubMember(m) && (m as any).squadStatus !== "reserve"),
    [members, match.teamId]
  );

  const formationData = FORMATIONS.find(f => f.value === formation)!;

  // Initialize slots from formation
  const initSlots = () => {
    const newSlots: Slot[] = [];
    let posIdx = 0;
    formationData.rows.forEach((count, row) => {
      for (let col = 0; col < count; col++) {
        newSlots.push({ row, col, memberId: null, position: POSITIONS[posIdx % POSITIONS.length] });
        posIdx++;
      }
    });
    setSlots(newSlots);
  };

  const assignedIds = new Set(slots.filter(s => s.memberId).map(s => s.memberId));
  const unassigned = teamMembers.filter(m => !assignedIds.has(m.id));

  const handleDrop = (slotIdx: number) => {
    if (draggedMember !== null) {
      // From bench to slot
      setSlots(prev => prev.map((s, i) => {
        if (i === slotIdx) return { ...s, memberId: draggedMember };
        if (s.memberId === draggedMember) return { ...s, memberId: null };
        return s;
      }));
      setDraggedMember(null);
    } else if (draggedFromSlot !== null) {
      // Swap between slots
      setSlots(prev => {
        const next = [...prev];
        const tmp = next[slotIdx].memberId;
        next[slotIdx].memberId = next[draggedFromSlot].memberId;
        next[draggedFromSlot].memberId = tmp;
        return next;
      });
      setDraggedFromSlot(null);
    }
  };

  const removeFromSlot = (slotIdx: number) => {
    setSlots(prev => prev.map((s, i) => i === slotIdx ? { ...s, memberId: null } : s));
  };

  const saveMut = useMutation({
    mutationFn: async () => {
      const positions = slots.map((s, i) => ({ slotIndex: i, memberId: s.memberId, position: s.position, row: s.row, col: s.col }));
      return (await apiRequest("POST", `/api/matches/${match.id}/lineup`, { formation, positions })).json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/matches", match.id, "lineup"] });
      toast({ title: "Aufstellung gespeichert" });
      setOpen(false);
    },
  });

  const formationRows = formationData.rows;

  return (
    <Dialog open={open} onOpenChange={v => { setOpen(v); if (v && slots.length === 0) initSlots(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Layout className="size-3.5" /> Aufstellung
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Aufstellungs-Editor — {match.homeTeam} vs {match.awayTeam}</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2 mb-3">
          <Label className="text-xs">Formation:</Label>
          <Select value={formation} onValueChange={v => { setFormation(v); setTimeout(initSlots, 0); }}>
            <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {FORMATIONS.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">Drag & Drop Spiller op d'Positiounen</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Field */}
          <div className="bg-green-600/20 rounded-lg p-3 min-h-[400px] flex flex-col justify-between border-2 border-green-600/30">
            {formationRows.map((count, rowIdx) => (
              <div key={rowIdx} className="flex justify-center gap-2">
                {slots.filter(s => s.row === rowIdx).map((slot, slotIdx) => {
                  const actualIdx = slots.findIndex(s => s === slot);
                  const m = slot.memberId ? teamMembers.find(tm => tm.id === slot.memberId) : null;
                  return (
                    <div
                      key={actualIdx}
                      onDragOver={e => e.preventDefault()}
                      onDrop={() => handleDrop(actualIdx)}
                      onDragStart={() => setDraggedFromSlot(actualIdx)}
                      draggable={!!slot.memberId}
                      className={`w-20 h-20 rounded-full border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${m ? "border-primary bg-primary/10" : "border-dashed border-green-600/40 bg-green-600/5"}`}
                    >
                      {m ? (
                        <>
                          <Avatar className="size-8">
                            <AvatarImage src={m.photoUrl || undefined} />
                            <AvatarFallback className="text-[10px] font-bold bg-primary/20">{initials(m.name)}</AvatarFallback>
                          </Avatar>
                          <span className="text-[9px] font-medium mt-0.5 truncate max-w-[70px]">{formatMemberName(m)}</span>
                          <button onClick={() => removeFromSlot(actualIdx)} className="absolute -mt-1 -mr-12 size-4 rounded-full bg-destructive text-white flex items-center justify-center text-[8px]">
                            <X className="size-2.5" />
                          </button>
                        </>
                      ) : (
                        <span className="text-[10px] text-green-700/60 font-bold">{slot.position}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Bench / unassigned */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground">Bank / verfügbar ({unassigned.length})</div>
            <div className="space-y-1 max-h-[350px] overflow-y-auto">
              {unassigned.map(m => (
                <div
                  key={m.id}
                  draggable
                  onDragStart={() => setDraggedMember(m.id)}
                  onDragEnd={() => { setDraggedMember(null); setDraggedFromSlot(null); }}
                  className="flex items-center gap-2 p-2 rounded-md border border-border hover-elevate cursor-grab active:cursor-grabbing"
                >
                  <Avatar className="size-7">
                    <AvatarImage src={m.photoUrl || undefined} />
                    <AvatarFallback className="text-[10px] font-bold bg-primary/10">{initials(m.name)}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs flex-1 truncate">{formatMemberName(m)}</span>
                  {m.licenseNumber && <span className="text-[10px] text-muted-foreground">{m.licenseNumber}</span>}
                </div>
              ))}
              {unassigned.length === 0 && <p className="text-xs text-muted-foreground italic">All Spiller opgestallt</p>}
            </div>
          </div>
        </div>

        {canEdit && (
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" size="sm" onClick={initSlots}>
              <Trash2 className="size-3.5 mr-1" /> Reset
            </Button>
            <Button size="sm" onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>
              <Save className="size-3.5 mr-1" /> {saveMut.isPending ? "Speichern…" : "Speichern"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
