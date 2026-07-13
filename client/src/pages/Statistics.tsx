import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { formatMemberName } from "@/lib/utils";
import { 
  Users, 
  Euro, 
  TrendingUp, 
  TrendingDown,
  PieChart,
  BarChart3,
  Activity,
  Calendar
} from "lucide-react";

// Simple bar chart component
const SimpleBarChart = ({ data, maxValue }: { data: { label: string; value: number; color?: string }[]; maxValue?: number }) => {
  const max = maxValue || Math.max(...data.map(d => d.value), 1);
  
  return (
    <div className="space-y-2">
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-24 text-sm text-muted-foreground truncate">{item.label}</div>
          <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full ${item.color || "bg-primary"} transition-all duration-500`}
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
          <div className="w-16 text-sm font-medium text-right">{item.value}</div>
        </div>
      ))}
    </div>
  );
};

// Simple pie chart using CSS conic-gradient
const SimplePieChart = ({ data }: { data: { label: string; value: number; color: string }[] }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  
  return (
    <div className="flex items-center gap-6">
      <div 
        className="w-32 h-32 rounded-full"
        style={{
          background: `conic-gradient(${data.map((d, i) => {
            const prev = data.slice(0, i).reduce((s, x) => s + x.value, 0);
            return `${d.color} ${(prev / total) * 360}deg ${((prev + d.value) / total) * 360}deg`;
          }).join(", ")})`
        }}
      />
      <div className="space-y-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-muted-foreground">{d.label}:</span>
            <span className="font-medium">{d.value} ({((d.value / total) * 100).toFixed(1)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Statistics() {
  const { user } = useAuth();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const canViewMembers = user && ["präsident", "admin", "secretaire"].includes(user.role);
  const canViewFinance = user && ["präsident", "admin", "kassenwart"].includes(user.role);
  const canViewFees = user && ["präsident", "admin", "kassenwart"].includes(user.role);
  const canViewAttendance = user && ["präsident", "admin", "trainer"].includes(user.role);

  const { data: memberStats = { total: 0, byCategory: {}, byTeam: {} }, isLoading: loadingMembers } = useQuery<{ total: number; byCategory: Record<string, number>; byTeam: Record<string, number> }>({
    queryKey: ["/api/statistics/members"],
    queryFn: async () => (await apiRequest("GET", "/api/statistics/members")).json(),
    enabled: !!canViewMembers,
  });

  const { data: financeStats = { totalIncome: 0, totalExpense: 0, balance: 0, monthlyData: [] }, isLoading: loadingFinance } = useQuery<{ totalIncome: number; totalExpense: number; balance: number; monthlyData: any[] }>({
    queryKey: ["/api/statistics/finance", selectedYear],
    queryFn: async () => (await apiRequest("GET", `/api/statistics/finance?year=${selectedYear}`)).json(),
    enabled: !!canViewFinance,
  });

  const { data: feeStats = { totalExpected: 0, totalPaid: 0, totalOpen: 0, byStatus: {} }, isLoading: loadingFees } = useQuery<{ totalExpected: number; totalPaid: number; totalOpen: number; byStatus: Record<string, number> }>({
    queryKey: ["/api/statistics/fees", selectedYear],
    queryFn: async () => (await apiRequest("GET", `/api/statistics/fees?year=${selectedYear}`)).json(),
    enabled: !!canViewFees,
  });

  const { data: attendanceStats = { averageAttendance: 0, totalRecords: 0, byMember: [] }, isLoading: loadingAttendance } = useQuery<{ averageAttendance: number; totalRecords: number; byMember: any[] }>({
    queryKey: ["/api/statistics/attendance"],
    queryFn: async () => (await apiRequest("GET", "/api/statistics/attendance")).json(),
    enabled: !!canViewAttendance,
  });

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(val);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Statistiken & Reports</h1>
          <p className="text-sm text-muted-foreground">
            Übersicht über Mitglieder, Finanzen und Anwesenheit
          </p>
        </div>
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
      </div>

      <Tabs defaultValue={canViewMembers ? "members" : canViewFinance ? "finance" : "fees"}>
        <TabsList className="grid w-full grid-cols-4">
          {canViewMembers && <TabsTrigger value="members">Mitglieder</TabsTrigger>}
          {canViewFinance && <TabsTrigger value="finance">Finanzen</TabsTrigger>}
          {canViewFees && <TabsTrigger value="fees">Beiträge</TabsTrigger>}
          {canViewAttendance && <TabsTrigger value="attendance">Anwesenheit</TabsTrigger>}
        </TabsList>

        {/* Members Tab */}
        {canViewMembers && (
          <TabsContent value="members" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Gesamtmitglieder</p>
                      <p className="text-3xl font-bold">{memberStats?.total || 0}</p>
                    </div>
                    <Users className="h-10 w-10 text-primary opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <PieChart className="w-4 h-4" />
                    Nach Alterskategorie
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {memberStats?.byCategory && Object.keys(memberStats.byCategory).length > 0 ? (
                    <SimplePieChart 
                      data={Object.entries(memberStats.byCategory).map(([label, value], i) => ({
                        label,
                        value: value as number,
                        color: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"][i % 6]
                      }))} 
                    />
                  ) : (
                    <p className="text-muted-foreground text-center py-8">Keine Daten</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BarChart3 className="w-4 h-4" />
                    Nach Team
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {memberStats?.byTeam && Object.keys(memberStats.byTeam).length > 0 ? (
                    <SimpleBarChart 
                      data={Object.entries(memberStats.byTeam).map(([label, value]) => ({
                        label,
                        value: value as number
                      }))} 
                    />
                  ) : (
                    <p className="text-muted-foreground text-center py-8">Keine Daten</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {/* Finance Tab */}
        {canViewFinance && (
          <TabsContent value="finance" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Einnahmen</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(financeStats?.totalIncome || 0)}
                      </p>
                    </div>
                    <TrendingUp className="h-10 w-10 text-green-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Ausgaben</p>
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(financeStats?.totalExpense || 0)}
                      </p>
                    </div>
                    <TrendingDown className="h-10 w-10 text-red-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Saldo</p>
                      <p className={`text-2xl font-bold ${(financeStats?.balance || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {formatCurrency(financeStats?.balance || 0)}
                      </p>
                    </div>
                    <Euro className="h-10 w-10 text-primary opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Monatliche Übersicht</CardTitle>
              </CardHeader>
              <CardContent>
                {financeStats?.monthlyData && (
                  <div className="space-y-4">
                    {financeStats.monthlyData.map((m: any, i: number) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="w-20 text-sm font-medium">
                          {new Date(2024, m.month - 1).toLocaleString("de-DE", { month: "short" })}
                        </div>
                        <div className="flex-1 flex gap-1 h-8">
                          <div 
                            className="bg-green-500 rounded-l"
                            style={{ width: `${(m.income / Math.max(m.income + m.expense, 1)) * 100}%` }}
                            title={`Einnahmen: ${formatCurrency(m.income)}`}
                          />
                          <div 
                            className="bg-red-500 rounded-r"
                            style={{ width: `${(m.expense / Math.max(m.income + m.expense, 1)) * 100}%` }}
                            title={`Ausgaben: ${formatCurrency(m.expense)}`}
                          />
                        </div>
                        <div className="w-32 text-right text-sm text-muted-foreground">
                          {formatCurrency(m.income - m.expense)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Fees Tab */}
        {canViewFees && (
          <TabsContent value="fees" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Erwartete Beiträge</p>
                      <p className="text-2xl font-bold">{formatCurrency(feeStats?.totalExpected || 0)}</p>
                    </div>
                    <Calendar className="h-10 w-10 text-primary opacity-50" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Bereits bezahlt</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(feeStats?.totalPaid || 0)}
                      </p>
                    </div>
                    <TrendingUp className="h-10 w-10 text-green-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Offen</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {formatCurrency(feeStats?.totalOpen || 0)}
                      </p>
                    </div>
                    <Activity className="h-10 w-10 text-yellow-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Beitragsstatus</CardTitle>
              </CardHeader>
              <CardContent>
                {feeStats?.byStatus && (
                  <SimpleBarChart 
                    data={[
                      { label: "Bezahlt", value: feeStats.byStatus.paid || 0, color: "bg-green-500" },
                      { label: "Teilweise", value: feeStats.byStatus.partial || 0, color: "bg-blue-500" },
                      { label: "Offen", value: feeStats.byStatus.open || 0, color: "bg-yellow-500" },
                      { label: "Überfällig", value: feeStats.byStatus.overdue || 0, color: "bg-red-500" },
                    ]} 
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Attendance Tab */}
        {canViewAttendance && (
          <TabsContent value="attendance" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Ø Anwesenheit</p>
                      <p className="text-3xl font-bold">
                        {(attendanceStats?.averageAttendance || 0).toFixed(1)}%
                      </p>
                    </div>
                    <Activity className="h-10 w-10 text-primary opacity-50" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Aufzeichnungen</p>
                      <p className="text-3xl font-bold">{attendanceStats?.totalRecords || 0}</p>
                    </div>
                    <Calendar className="h-10 w-10 text-primary opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Top Anwesenheit (nach Spieler)</CardTitle>
              </CardHeader>
              <CardContent>
                {attendanceStats?.byMember && attendanceStats.byMember.length > 0 ? (
                  <SimpleBarChart 
                    data={attendanceStats.byMember.slice(0, 10).map((m: any) => ({
                      label: formatMemberName(m),
                      value: Math.round(m.rate),
                      color: m.rate > 80 ? "bg-green-500" : m.rate > 60 ? "bg-yellow-500" : "bg-red-500"
                    }))}
                    maxValue={100}
                  />
                ) : (
                  <p className="text-muted-foreground text-center py-8">Keine Anwesenheitsdaten</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
