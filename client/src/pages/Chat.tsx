import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, MessageCircle, Users } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { initials } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { Team } from "@shared/schema";

type ChatMessage = {
  id: number;
  teamId: number;
  authorId: number;
  authorName: string;
  content: string;
  createdAt: string;
};

export default function Chat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [teamId, setTeamId] = useState<string>("");
  const [msgText, setMsgText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use /api/chat-teams which filters teams for elternteil users
  const { data: teams = [] } = useQuery<Team[]>({ queryKey: ["/api/chat-teams"] });

  // Default to user's team
  useEffect(() => {
    if (!teamId && user?.teamId) setTeamId(String(user.teamId));
    else if (!teamId && teams.length > 0) setTeamId(String(teams[0].id));
  }, [teams, user, teamId]);

  const selTeamId = teamId ? Number(teamId) : 0;
  const selectedTeam = teams.find(t => t.id === selTeamId);

  // Poll every 4 seconds for new messages
  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat", selTeamId],
    queryFn: () =>
      selTeamId
        ? apiRequest("GET", `/api/chat/${selTeamId}`).then(r => r.json())
        : Promise.resolve([]),
    enabled: !!selTeamId,
    refetchInterval: 4000,
    refetchIntervalInBackground: false,
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: () =>
      apiRequest("POST", "/api/chat", {
        teamId: selTeamId,
        content: msgText.trim(),
      }).then(r => r.json()),
    onSuccess: () => {
      setMsgText("");
      qc.invalidateQueries({ queryKey: ["/api/chat", selTeamId] });
    },
    onError: () =>
      toast({ title: "Fehler", description: "Nachricht konnte nicht gesendet werden", variant: "destructive" }),
  });

  const handleSend = () => {
    if (!msgText.trim()) return;
    sendMutation.mutate();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const isSameDay = d.toDateString() === now.toDateString();
    if (isSameDay) {
      return d.toLocaleTimeString("de-LU", { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString("de-LU", { day: "2-digit", month: "2-digit" }) +
      " " + d.toLocaleTimeString("de-LU", { hour: "2-digit", minute: "2-digit" });
  };

  const isMyMessage = (msg: ChatMessage) => msg.authorId === user?.id;

  // Group consecutive messages by same user
  const groupedMessages = messages.reduce<{ msg: ChatMessage; showAvatar: boolean }[]>((acc, msg, idx) => {
    const prev = messages[idx - 1];
    const showAvatar = !prev || prev.authorId !== msg.authorId;
    acc.push({ msg, showAvatar });
    return acc;
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] max-w-3xl mx-auto">
      <div className="mb-4">
        <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
          <MessageCircle className="size-5 text-primary" />
          Gruppen-Chat
        </h1>
        <p className="text-sm text-muted-foreground">
          Echtzeit-Kommunikation im Team
          {user?.role === "elternteil" && " — Eltern-Zugang (U11 & jünger)"}
        </p>
      </div>

      {/* Team selector */}
      <Card className="mb-3 shrink-0">
        <CardContent className="p-3 flex items-center gap-3">
          <Users className="size-4 text-muted-foreground shrink-0" />
          <Select value={teamId} onValueChange={setTeamId}>
            <SelectTrigger className="flex-1" data-testid="select-chat-team">
              <SelectValue placeholder="Team auswählen..." />
            </SelectTrigger>
            <SelectContent>
              {teams.map(t => (
                <SelectItem key={t.id} value={String(t.id)}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedTeam && (
            <Badge variant="outline" className="shrink-0 text-[11px]">
              {selectedTeam.category ?? selectedTeam.name}
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Messages area */}
      <Card className="flex-1 flex flex-col min-h-0">
        <CardHeader className="py-3 px-4 border-b border-border shrink-0">
          <CardTitle className="text-sm font-semibold">
            {selectedTeam ? selectedTeam.name : "Kein Team ausgewählt"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-1 min-h-0">
          {isLoading && (
            <div className="flex flex-col gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`flex gap-2 ${i % 2 === 0 ? "" : "flex-row-reverse"}`}>
                  <div className="size-8 rounded-full bg-muted animate-pulse shrink-0" />
                  <div className="h-10 w-48 rounded-2xl bg-muted animate-pulse" />
                </div>
              ))}
            </div>
          )}

          {!isLoading && messages.length === 0 && selTeamId && (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <MessageCircle className="size-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">Noch keine Nachrichten.</p>
              <p className="text-xs text-muted-foreground">Sende die erste Nachricht an dein Team!</p>
            </div>
          )}

          {!isLoading && !selTeamId && (
            <div className="flex items-center justify-center h-32">
              <p className="text-sm text-muted-foreground">Bitte ein Team auswählen.</p>
            </div>
          )}

          {groupedMessages.map(({ msg, showAvatar }, idx) => {
            const mine = isMyMessage(msg);
            return (
              <div
                key={msg.id}
                data-testid={`chat-message-${msg.id}`}
                className={`flex items-end gap-2 ${mine ? "flex-row-reverse" : ""} ${showAvatar ? "mt-3" : "mt-0.5"}`}
              >
                {/* Avatar */}
                <div className="shrink-0 w-8">
                  {showAvatar && (
                    <Avatar className="size-8">
                      <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                        {initials(msg.authorName)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>

                {/* Bubble */}
                <div className={`flex flex-col max-w-[75%] ${mine ? "items-end" : "items-start"}`}>
                  {showAvatar && (
                    <div className={`flex items-center gap-1.5 mb-0.5 ${mine ? "flex-row-reverse" : ""}`}>
                      <span className="text-xs font-semibold text-foreground/80">{msg.authorName}</span>
                    </div>
                  )}
                  <div
                    className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                      mine
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted text-foreground rounded-bl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-0.5 px-1">
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input */}
        <div className="p-3 border-t border-border shrink-0">
          <div className="flex items-end gap-2">
            <Textarea
              placeholder="Nachricht schreiben... (Enter zum Senden, Shift+Enter für Zeilenumbruch)"
              value={msgText}
              onChange={e => setMsgText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!selTeamId || sendMutation.isPending}
              rows={1}
              className="resize-none min-h-[40px] max-h-32 flex-1 text-sm"
              data-testid="input-chat-message"
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!msgText.trim() || !selTeamId || sendMutation.isPending}
              className="shrink-0 h-10 w-10 bg-primary hover:bg-primary/90"
              data-testid="button-send-message"
            >
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
