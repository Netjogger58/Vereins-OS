import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Pin, Plus, Trash2, Filter, Megaphone } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { relativeTime } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { Announcement } from "@shared/schema";

export default function Announcements() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [filter, setFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", targetRole: "all", pinned: false });

  const { data: announcements = [] } = useQuery<Announcement[]>({ queryKey: ["/api/announcements"] });

  const createMut = useMutation({
    mutationFn: async (data: any) => (await apiRequest("POST", "/api/announcements", data)).json(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      setOpen(false);
      setForm({ title: "", content: "", targetRole: "all", pinned: false });
      toast({ title: "Ankündigung veröffentlicht" });
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => (await apiRequest("DELETE", `/api/announcements/${id}`)).json(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/announcements"] }),
  });

  const togglePin = useMutation({
    mutationFn: async ({ id, pinned }: { id: number; pinned: boolean }) =>
      (await apiRequest("PATCH", `/api/announcements/${id}`, { pinned })).json(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/announcements"] }),
  });

  const canEdit = user && ["präsident", "admin", "trainer"].includes(user.role);
  const canDelete = user && ["präsident", "admin"].includes(user.role);

  const filtered = announcements.filter(a =>
    filter === "all" ? true : a.targetRole === filter || a.targetRole === "all"
  );
  const pinned = filtered.filter(a => a.pinned);
  const unpinned = filtered.filter(a => !a.pinned);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight">Ankündigungen</h1>
          <p className="text-sm text-muted-foreground">Aktuelles aus dem Verein</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[140px]" data-testid="select-filter">
              <Filter className="size-3.5 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle</SelectItem>
              <SelectItem value="trainer">Trainer</SelectItem>
              <SelectItem value="spieler">Spieler</SelectItem>
              <SelectItem value="elternteil">Eltern</SelectItem>
            </SelectContent>
          </Select>
          {canEdit && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-new-announcement">
                  <Plus className="size-4 mr-1" /> Neu
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Neue Ankündigung</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label>Titel</Label>
                    <Input
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      data-testid="input-title"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Inhalt</Label>
                    <Textarea
                      rows={5}
                      value={form.content}
                      onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                      data-testid="input-content"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Zielgruppe</Label>
                    <Select value={form.targetRole} onValueChange={v => setForm(f => ({ ...f, targetRole: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Alle Mitglieder</SelectItem>
                        <SelectItem value="trainer">Trainer</SelectItem>
                        <SelectItem value="spieler">Spieler</SelectItem>
                        <SelectItem value="elternteil">Eltern</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="pinned"
                      checked={form.pinned}
                      onCheckedChange={v => setForm(f => ({ ...f, pinned: !!v }))}
                    />
                    <Label htmlFor="pinned" className="cursor-pointer">Anheften</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setOpen(false)}>Abbrechen</Button>
                  <Button
                    onClick={() => createMut.mutate(form)}
                    disabled={!form.title || !form.content || createMut.isPending}
                    data-testid="button-save-announcement"
                  >
                    Veröffentlichen
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {filtered.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Megaphone className="size-10 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Noch keine Ankündigungen</p>
          </CardContent>
        </Card>
      )}

      {pinned.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-1.5">
            <Pin className="size-3" /> Angeheftet
          </p>
          {pinned.map(a => (
            <Item
              key={a.id}
              a={a}
              canDelete={!!canDelete}
              canPin={!!canEdit}
              onDelete={() => deleteMut.mutate(a.id)}
              onTogglePin={() => togglePin.mutate({ id: a.id, pinned: false })}
            />
          ))}
        </div>
      )}

      {unpinned.length > 0 && (
        <div className="space-y-3">
          {pinned.length > 0 && (
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
              Feed
            </p>
          )}
          {unpinned.map(a => (
            <Item
              key={a.id}
              a={a}
              canDelete={!!canDelete}
              canPin={!!canEdit}
              onDelete={() => deleteMut.mutate(a.id)}
              onTogglePin={() => togglePin.mutate({ id: a.id, pinned: true })}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Wandelt URLs im Ankündigungstext in anklickbare Links um.
function linkify(text: string) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return parts.map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline underline-offset-2 break-all hover:opacity-80"
      >
        {part}
      </a>
    ) : (
      part
    )
  );
}

function Item({
  a, canDelete, canPin, onDelete, onTogglePin,
}: {
  a: Announcement;
  canDelete: boolean;
  canPin: boolean;
  onDelete: () => void;
  onTogglePin: () => void;
}) {
  return (
    <Card className={a.pinned ? "border-secondary/50" : ""}>
      <CardContent className="p-4 md:p-5">
        <div className="flex items-start gap-4">
          <div className={`w-1 self-stretch rounded-full ${a.pinned ? "bg-secondary" : "bg-primary/30"}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h3 className="font-semibold text-base">{a.title}</h3>
              {a.targetRole !== "all" && (
                <Badge variant="outline" className="text-[10px]">{a.targetRole}</Badge>
              )}
              <span className="text-xs text-muted-foreground ml-auto">{relativeTime(a.createdAt)}</span>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{linkify(a.content)}</p>
            {(canPin || canDelete) && (
              <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border">
                {canPin && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onTogglePin}
                    className="h-7 text-xs"
                  >
                    <Pin className="size-3 mr-1" /> {a.pinned ? "Loslösen" : "Anheften"}
                  </Button>
                )}
                {canDelete && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onDelete}
                    className="h-7 text-xs text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-3 mr-1" /> Löschen
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
