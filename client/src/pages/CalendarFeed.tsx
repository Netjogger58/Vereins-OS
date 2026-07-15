import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";

export default function CalendarFeed() {
  const { toast } = useToast();
  const { data, isLoading } = useQuery<{ url: string }>({ queryKey: ["/api/calendar/token"] });

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Kalender-Feed</h1>
      <Card>
        <CardHeader><CardTitle>iCal-Abonnement</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Abonnéier deng perséinlech M75-Terminer an Google Calendar, Apple Calendar oder Outlook.
          </p>
          {isLoading ? (
            <p className="text-muted-foreground">Lueden...</p>
          ) : (
            <div className="space-y-2">
              <Label>Feed-URL</Label>
              <div className="flex gap-2">
                <Input value={data?.url || ""} readOnly />
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(data?.url || "");
                    toast({ title: "URL kopéiert" });
                  }}
                >
                  <Copy className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
