import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatMemberName } from "@/lib/utils";
import type { Member } from "@shared/schema";

const COLORS = [
  { value: "blue", label: "Blau" },
  { value: "red", label: "Rot" },
  { value: "green", label: "Grün" },
  { value: "amber", label: "Orange" },
  { value: "purple", label: "Lila" },
];

const colorClass: Record<string, string> = {
  blue: "bg-blue-500",
  red: "bg-red-500",
  green: "bg-green-500",
  amber: "bg-amber-500",
  purple: "bg-purple-500",
};

interface Props {
  eventId: number;
  members: Member[];
}

export default function EventGroupManager({ eventId, members }: Props) {
  const { toast } = useToast();
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("blue");

  const { data } = useQuery<{ groups: any[]; members: any[] }>({
    queryKey: ["/api/events", eventId, "groups"],
    queryFn: () => apiRequest("GET", `/api/events/${eventId}/groups`).then(r => r.json()),
    enabled: !!eventId,
  });

  const groups = data?.groups || [];
  const groupMembers = data?.members || [];

  const createGroup = useMutation({
    mutationFn: () =>
      apiRequest("POST", `/api/events/${eventId}/groups`, { name: newName, color: newColor }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "groups"] });
      setNewName("");
      toast({ title: "Gruppe erstellt" });
    },
  });

  const deleteGroup = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/event-groups/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "groups"] });
      toast({ title: "Gruppe gelöscht" });
    },
  });

  const addMember = useMutation({
    mutationFn: ({ groupId, memberId }: { groupId: number; memberId: number }) =>
      apiRequest("POST", `/api/event-groups/${groupId}/members`, { memberId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "groups"] }),
  });

  const removeMember = useMutation({
    mutationFn: ({ groupId, memberId }: { groupId: number; memberId: number }) =>
      apiRequest("DELETE", `/api/event-groups/${groupId}/members/${memberId}`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "groups"] }),
  });

  const membersInGroups = new Set(groupMembers.map((m: any) => m.member_id));
  const unassigned = members.filter(m => !membersInGroups.has(m.id));

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div className="flex items-end gap-2">
        <Input
          placeholder="Neue Gruppe..."
          value={newName}
          onChange={e => setNewName(e.target.value)}
          className="flex-1"
        />
        <Select value={newColor} onValueChange={setNewColor}>
          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
          <SelectContent>
            {COLORS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          onClick={() => createGroup.mutate()}
          disabled={!newName.trim() || createGroup.isPending}
        >
          <Plus className="size-4" />
        </Button>
      </div>

      {groups.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">Nach keng Gruppen.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {groups.map((g: any) => {
          const membersOfGroup = groupMembers.filter((m: any) => m.group_id === g.id);
          return (
            <Card key={g.id} className="rounded-2xl shadow-sm border-none overflow-hidden">
              <CardHeader className={`${colorClass[g.color] || "bg-primary"} p-3 text-white flex flex-row items-center justify-between`}>
                <CardTitle className="text-base font-bold">{g.name}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-white hover:bg-white/20"
                  onClick={() => deleteGroup.mutate(g.id)}
                >
                  <X className="size-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-3 space-y-2">
                {membersOfGroup.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Keng Spiller</p>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {membersOfGroup.map((m: any) => (
                      <Badge
                        key={m.member_id}
                        variant="secondary"
                        className="text-[10px] cursor-pointer"
                        onClick={() => removeMember.mutate({ groupId: g.id, memberId: m.member_id })}
                      >
                        {m.name || `${m.first_name || ""} ${m.last_name || ""}`.trim() || `Spiller ${m.member_id}`}
                        <X className="size-2.5 ml-1" />
                      </Badge>
                    ))}
                  </div>
                )}
                <Select
                  onValueChange={(v) => addMember.mutate({ groupId: g.id, memberId: Number(v) })}
                >
                  <SelectTrigger className="text-xs h-8">
                    <SelectValue placeholder="Spiller derbäisetzen" />
                  </SelectTrigger>
                  <SelectContent>
                    {unassigned.map(m => (
                      <SelectItem key={m.id} value={String(m.id)}>{formatMemberName(m)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
