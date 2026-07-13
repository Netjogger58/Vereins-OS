import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { Plus, Trash2, Edit3, Save, ShoppingBag, ExternalLink } from "lucide-react";

const FANSHOP_URL = "https://www.peterssportsfirveraeiner.com/store/hb-mersch/";

export default function Shop() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Record<string,string>>({});
  const { data: items = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/shop"] });
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/shop", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/shop"] }); setShowForm(false); setForm({}); toast({ title: t("common.saved") }); },
  });
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await fetch(`/api/shop/${id}`, { method: "DELETE" }); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/shop"] }); toast({ title: t("common.deleted") }); },
  });

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">{t("common.loading")}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("nav.shop")}</h1>
          <p className="text-muted-foreground mt-1">Fan-Shop und Merchandise</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="size-4" /> {t("common.create")}
        </Button>
      </div>

      {/* Externer Fan-Shop (Biller & Link wie im Homepage-Karussell) */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-[#002F65] to-[#00193a] text-white">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row items-center gap-5 p-5 sm:p-6">
            <img
              src="/shop/fanshop-applestyle.png"
              alt="Mersch75 Fan-Shop"
              className="w-28 h-28 sm:w-32 sm:h-32 object-contain rounded-xl bg-white/5 shrink-0"
              loading="lazy"
            />
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#FFDE00]">Fanshop · Mersch75</p>
              <h2 className="text-lg sm:text-xl font-extrabold mt-1">Dréi eis Faarwen och nieft dem Terrain</h2>
              <p className="text-sm text-white/70 mt-1.5">
                Am Mersch75 Fanshop fënns du Hoodies, T-Shirts an aner Fanartikelen am Look vum Club.
                Weisen däi Support a dro eis blo-giel Faarwen mat Stolz.
              </p>
              <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start mt-3">
                <Badge className="bg-white/10 text-white border-0">Hoodies</Badge>
                <Badge className="bg-white/10 text-white border-0">T-Shirts</Badge>
                <Badge className="bg-white/10 text-white border-0">💛💙 Mersch75</Badge>
              </div>
              <a
                href={FANSHOP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-[#FFDE00] text-[#002F65] font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                <ShoppingBag className="size-4" /> Zum Fan-Shop
                <ExternalLink className="size-3.5" />
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>{t("common.create")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3">
              <div>
                <Label>{t("common.name")}</Label>
                <Input value={form.name || ""} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div>
                <Label>{t("common.description")}</Label>
                <Input value={form.description || ""} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
            </div>
            <Button onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending} className="gap-2">
              <Save className="size-4" /> {t("common.save")}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3">
        {items.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">{t("common.no_data")}</CardContent></Card>
        ) : items.map((item: any) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold">{item.name}</div>
                {item.description && <div className="text-sm text-muted-foreground">{item.description}</div>}
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(item.id)} className="text-destructive">
                <Trash2 className="size-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
