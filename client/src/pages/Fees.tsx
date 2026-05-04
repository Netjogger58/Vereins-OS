import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { 
  Euro, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ArrowLeft,
  Search,
  Wallet
} from "lucide-react";
import { Link } from "wouter";
import type { FeeRule, MemberFee, Member } from "@shared/schema";

const STATUS_LABELS: Record<string, { label: string; color: string; icon: any }> = {
  open: { label: "Offen", color: "bg-red-500", icon: AlertCircle },
  partial: { label: "Teilweise", color: "bg-yellow-500", icon: Clock },
  paid: { label: "Bezahlt", color: "bg-green-500", icon: CheckCircle },
  waived: { label: "Erlassen", color: "bg-gray-500", icon: AlertCircle },
};

export default function Fees() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [openNewRule, setOpenNewRule] = useState(false);
  const [openAssignFee, setOpenAssignFee] = useState(false);
  const [openPayment, setOpenPayment] = useState(false);
  const [selectedMemberFee, setSelectedMemberFee] = useState<MemberFee | null>(null);
  
  const canEdit = user && ["präsident", "admin", "kassenwart"].includes(user.role);

  const { data: feeRules = [] } = useQuery<FeeRule[]>({
    queryKey: ["/api/fee-rules"],
  });

  const { data: memberFees = [] } = useQuery<MemberFee[]>({
    queryKey: ["/api/member-fees", selectedYear],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/member-fees?year=${selectedYear}`);
      return res.json();
    },
  });

  const { data: members = [] } = useQuery<Member[]>({
    queryKey: ["/api/members"],
  });

  // Calculate statistics
  const stats = {
    totalOpen: memberFees.filter(f => f.status === "open").reduce((sum, f) => sum + (f.amount - f.paidAmount), 0),
    totalPaid: memberFees.reduce((sum, f) => sum + f.paidAmount, 0),
    totalExpected: memberFees.reduce((sum, f) => sum + f.amount, 0),
    countOpen: memberFees.filter(f => f.status === "open").length,
    countPaid: memberFees.filter(f => f.status === "paid").length,
  };

  const createRuleMut = useMutation({
    mutationFn: async (data: any) => {
      return (await apiRequest("POST", "/api/fee-rules", data)).json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fee-rules"] });
      setOpenNewRule(false);
      toast({ title: "Beitragsregel erstellt" });
    },
  });

  const createMemberFeeMut = useMutation({
    mutationFn: async (data: any) => {
      return (await apiRequest("POST", "/api/member-fees", data)).json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/member-fees"] });
      setOpenAssignFee(false);
      toast({ title: "Beitrag zugewiesen" });
    },
  });

  const createPaymentMut = useMutation({
    mutationFn: async (data: any) => {
      return (await apiRequest("POST", "/api/fee-payments", data)).json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/member-fees"] });
      setOpenPayment(false);
      setSelectedMemberFee(null);
      toast({ title: "Zahlung erfasst" });
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/finance">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Beitragswesen</h1>
            <p className="text-sm text-muted-foreground">
              Verwaltung der Mitgliedsbeiträge
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(parseInt(v))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026].map(y => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {canEdit && (
            <>
              <Button variant="outline" onClick={() => setOpenNewRule(true)}>
                <Plus className="h-4 w-4 mr-1" /> Regel
              </Button>
              <Button onClick={() => setOpenAssignFee(true)}>
                <Plus className="h-4 w-4 mr-1" /> Beitrag
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Erwartet</p>
                <p className="text-2xl font-bold">{stats.totalExpected.toFixed(2)} €</p>
              </div>
              <Wallet className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Eingegangen</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalPaid.toFixed(2)} €</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Offen</p>
                <p className="text-2xl font-bold text-red-600">{stats.totalOpen.toFixed(2)} €</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Status</p>
                <p className="text-sm font-medium">
                  <span className="text-green-600">{stats.countPaid} bezahlt</span>
                  <span className="mx-2">/</span>
                  <span className="text-red-600">{stats.countOpen} offen</span>
                </p>
              </div>
              <Euro className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fee Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Beitragsregeln</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Kategorie</TableHead>
                <TableHead>Betrag</TableHead>
                <TableHead>Alter</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feeRules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">{rule.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{rule.category}</Badge>
                  </TableCell>
                  <TableCell>{rule.amount.toFixed(2)} €</TableCell>
                  <TableCell>
                    {rule.minAge && rule.maxAge 
                      ? `${rule.minAge}-${rule.maxAge} Jahre`
                      : rule.minAge 
                        ? `ab ${rule.minAge} Jahre`
                        : rule.maxAge
                          ? `bis ${rule.maxAge} Jahre`
                          : "-"
                    }
                  </TableCell>
                  <TableCell>
                    <Badge className={rule.active ? "bg-green-500" : "bg-gray-500"}>
                      {rule.active ? "Aktiv" : "Inaktiv"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Member Fees */}
      <Card>
        <CardHeader>
          <CardTitle>Mitgliedsbeiträge {selectedYear}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mitglied</TableHead>
                <TableHead>Beitrag</TableHead>
                <TableHead>Betrag</TableHead>
                <TableHead>Bezahlt</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {memberFees.map((fee) => {
                const member = members.find(m => m.id === fee.memberId);
                const rule = feeRules.find(r => r.id === fee.feeRuleId);
                const status = STATUS_LABELS[fee.status];
                const StatusIcon = status?.icon || Clock;
                
                return (
                  <TableRow key={fee.id}>
                    <TableCell className="font-medium">{member?.name || "Unbekannt"}</TableCell>
                    <TableCell>{rule?.name || "-"}</TableCell>
                    <TableCell>{fee.amount.toFixed(2)} €</TableCell>
                    <TableCell>{fee.paidAmount.toFixed(2)} €</TableCell>
                    <TableCell>
                      <Badge className={status?.color || "bg-gray-500"}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {status?.label || fee.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {canEdit && fee.status !== "paid" && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedMemberFee(fee);
                            setOpenPayment(true);
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" /> Zahlung
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog: New Fee Rule */}
      <Dialog open={openNewRule} onOpenChange={setOpenNewRule}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neue Beitragsregel</DialogTitle>
          </DialogHeader>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const formData = new FormData(form);
              createRuleMut.mutate({
                name: formData.get("name"),
                category: formData.get("category"),
                amount: parseFloat(formData.get("amount") as string),
                description: formData.get("description"),
                minAge: formData.get("minAge") ? parseInt(formData.get("minAge") as string) : null,
                maxAge: formData.get("maxAge") ? parseInt(formData.get("maxAge") as string) : null,
              });
            }}
            className="space-y-4"
          >
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input name="name" placeholder="z.B. Jugend U17" required />
            </div>
            <div>
              <label className="text-sm font-medium">Kategorie</label>
              <Select name="category" defaultValue="age_group">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="age_group">Altersgruppe</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                  <SelectItem value="family">Familie</SelectItem>
                  <SelectItem value="custom">Individuell</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Betrag (€)</label>
              <Input name="amount" type="number" step="0.01" placeholder="150.00" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Min. Alter</label>
                <Input name="minAge" type="number" placeholder="optional" />
              </div>
              <div>
                <label className="text-sm font-medium">Max. Alter</label>
                <Input name="maxAge" type="number" placeholder="optional" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpenNewRule(false)}>
                Abbrechen
              </Button>
              <Button type="submit" disabled={createRuleMut.isPending}>
                Erstellen
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Assign Fee to Member */}
      <Dialog open={openAssignFee} onOpenChange={setOpenAssignFee}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Beitrag zuweisen</DialogTitle>
          </DialogHeader>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const formData = new FormData(form);
              createMemberFeeMut.mutate({
                memberId: parseInt(formData.get("memberId") as string),
                feeRuleId: parseInt(formData.get("feeRuleId") as string),
                year: selectedYear,
                amount: parseFloat(formData.get("amount") as string),
                dueDate: formData.get("dueDate") || null,
              });
            }}
            className="space-y-4"
          >
            <div>
              <label className="text-sm font-medium">Mitglied</label>
              <Select name="memberId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Mitglied wählen" />
                </SelectTrigger>
                <SelectContent>
                  {members.filter(m => m.membershipStatus === "active").map(m => (
                    <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Beitragsregel</label>
              <Select name="feeRuleId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Regel wählen" />
                </SelectTrigger>
                <SelectContent>
                  {feeRules.filter(r => r.active).map(r => (
                    <SelectItem key={r.id} value={String(r.id)}>
                      {r.name} ({r.amount.toFixed(2)} €)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Betrag (€)</label>
              <Input name="amount" type="number" step="0.01" placeholder="150.00" required />
            </div>
            <div>
              <label className="text-sm font-medium">Fällig am</label>
              <Input name="dueDate" type="date" />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpenAssignFee(false)}>
                Abbrechen
              </Button>
              <Button type="submit" disabled={createMemberFeeMut.isPending}>
                Zuweisen
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Record Payment */}
      <Dialog open={openPayment} onOpenChange={setOpenPayment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Zahlung erfassen</DialogTitle>
          </DialogHeader>
          {selectedMemberFee && (
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                const amount = parseFloat(formData.get("amount") as string);
                const remaining = selectedMemberFee.amount - selectedMemberFee.paidAmount;
                
                if (amount > remaining) {
                  toast({ title: "Fehler", description: "Zahlung höher als offener Betrag", variant: "destructive" });
                  return;
                }
                
                createPaymentMut.mutate({
                  memberFeeId: selectedMemberFee.id,
                  amount: amount,
                  paymentDate: formData.get("paymentDate"),
                  paymentMethod: formData.get("paymentMethod"),
                  reference: formData.get("reference") || null,
                });
              }}
              className="space-y-4"
            >
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm">Offener Betrag: <strong>{(selectedMemberFee.amount - selectedMemberFee.paidAmount).toFixed(2)} €</strong></p>
              </div>
              <div>
                <label className="text-sm font-medium">Zahlungsbetrag (€)</label>
                <Input 
                  name="amount" 
                  type="number" 
                  step="0.01" 
                  max={selectedMemberFee.amount - selectedMemberFee.paidAmount}
                  defaultValue={(selectedMemberFee.amount - selectedMemberFee.paidAmount).toFixed(2)}
                  required 
                />
              </div>
              <div>
                <label className="text-sm font-medium">Zahlungsdatum</label>
                <Input name="paymentDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
              </div>
              <div>
                <label className="text-sm font-medium">Zahlungsart</label>
                <Select name="paymentMethod" defaultValue="transfer">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transfer">Überweisung</SelectItem>
                    <SelectItem value="cash">Bar</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="other">Sonstiges</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Verwendungszweck / Referenz</label>
                <Input name="reference" placeholder="optional" />
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setOpenPayment(false)}>
                  Abbrechen
                </Button>
                <Button type="submit" disabled={createPaymentMut.isPending}>
                  Zahlung erfassen
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
