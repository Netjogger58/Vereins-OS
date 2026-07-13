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
import { formatMemberName } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { 
  FileText, 
  Upload, 
  Trash2, 
  Download, 
  Search,
  File,
  FileSpreadsheet,
  FileImage,
  FileArchive,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import type { Document, Member } from "@shared/schema";

const CATEGORY_LABELS: Record<string, string> = {
  contract: "Vertrag",
  invoice: "Rechnung",
  certificate: "Urkunde",
  protocol: "Protokoll",
  other: "Sonstiges",
};

const VISIBILITY_LABELS: Record<string, { label: string; color: string }> = {
  private: { label: "Privat", color: "bg-gray-500" },
  team: { label: "Team", color: "bg-blue-500" },
  board: { label: "Vorstand", color: "bg-purple-500" },
  public: { label: "Öffentlich", color: "bg-green-500" },
};

const getFileIcon = (mimeType: string) => {
  if (mimeType.includes("pdf")) return <File className="w-5 h-5 text-red-500" />;
  if (mimeType.includes("sheet") || mimeType.includes("excel")) return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
  if (mimeType.includes("image")) return <FileImage className="w-5 h-5 text-blue-500" />;
  if (mimeType.includes("zip") || mimeType.includes("archive")) return <FileArchive className="w-5 h-5 text-yellow-500" />;
  return <FileText className="w-5 h-5 text-gray-500" />;
};

export default function Documents() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [openUpload, setOpenUpload] = useState(false);

  const canUpload = user && ["präsident", "admin", "kassenwart", "secretaire"].includes(user.role);
  const canDelete = user && ["präsident", "admin"].includes(user.role);

  const { data: documents = [] } = useQuery<Document[]>({
    queryKey: ["/api/documents", categoryFilter],
    queryFn: async () => {
      const url = categoryFilter ? `/api/documents?category=${categoryFilter}` : "/api/documents";
      return (await apiRequest("GET", url)).json();
    },
  });

  const { data: members = [] } = useQuery<Member[]>({
    queryKey: ["/api/members"],
  });

  const uploadMut = useMutation({
    mutationFn: async (data: any) => {
      return (await apiRequest("POST", "/api/documents", data)).json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      setOpenUpload(false);
      toast({ title: "Dokument hochgeladen" });
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => {
      return (await apiRequest("DELETE", `/api/documents/${id}`)).json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({ title: "Dokument gelöscht" });
    },
  });

  const filteredDocs = documents.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.fileName.toLowerCase().includes(search.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dokumentenverwaltung</h1>
          <p className="text-sm text-muted-foreground">
            {documents.length} Dokumente gespeichert
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
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Kategorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Alle</SelectItem>
              <SelectItem value="contract">Vertrag</SelectItem>
              <SelectItem value="invoice">Rechnung</SelectItem>
              <SelectItem value="certificate">Urkunde</SelectItem>
              <SelectItem value="protocol">Protokoll</SelectItem>
              <SelectItem value="other">Sonstiges</SelectItem>
            </SelectContent>
          </Select>
          {canUpload && (
            <Button onClick={() => setOpenUpload(true)}>
              <Upload className="w-4 h-4 mr-1" />
              Hochladen
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dokument</TableHead>
                <TableHead>Kategorie</TableHead>
                <TableHead>Zuordnung</TableHead>
                <TableHead>Sichtbarkeit</TableHead>
                <TableHead>Größe</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocs.map((doc) => {
                const member = members.find(m => m.id === doc.memberId);
                const category = CATEGORY_LABELS[doc.category] || doc.category;
                const visibility = VISIBILITY_LABELS[doc.visibility];

                return (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {getFileIcon(doc.mimeType)}
                        <div>
                          <p className="font-medium">{doc.title}</p>
                          <p className="text-xs text-muted-foreground">{doc.fileName}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{category}</Badge>
                    </TableCell>
                    <TableCell>
                      {member ? formatMemberName(member) : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge className={visibility?.color || "bg-gray-500"}>
                        {visibility?.label || doc.visibility}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
                    <TableCell>
                      {format(new Date(doc.createdAt), "dd.MM.yyyy", { locale: de })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Download className="w-4 h-4" />
                        </Button>
                        {canDelete && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => deleteMut.mutate(doc.id)}
                            disabled={deleteMut.isPending}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={openUpload} onOpenChange={setOpenUpload}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Dokument hochladen</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const formData = new FormData(form);
              uploadMut.mutate({
                title: formData.get("title"),
                fileName: formData.get("fileName"),
                filePath: formData.get("filePath"),
                fileSize: parseInt(formData.get("fileSize") as string) || 0,
                mimeType: formData.get("mimeType"),
                category: formData.get("category"),
                memberId: formData.get("memberId") ? parseInt(formData.get("memberId") as string) : null,
                visibility: formData.get("visibility"),
                description: formData.get("description"),
              });
            }}
            className="space-y-4"
          >
            <div>
              <label className="text-sm font-medium">Titel *</label>
              <Input name="title" placeholder="z.B. Spielervertrag 2025" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Kategorie *</label>
                <Select name="category" defaultValue="other">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contract">Vertrag</SelectItem>
                    <SelectItem value="invoice">Rechnung</SelectItem>
                    <SelectItem value="certificate">Urkunde</SelectItem>
                    <SelectItem value="protocol">Protokoll</SelectItem>
                    <SelectItem value="other">Sonstiges</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Sichtbarkeit *</label>
                <Select name="visibility" defaultValue="private">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Privat (nur Admin)</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                    <SelectItem value="board">Vorstand</SelectItem>
                    <SelectItem value="public">Öffentlich</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Mitglied (optional)</label>
              <Select name="memberId">
                <SelectTrigger>
                  <SelectValue placeholder="Mitglied wählen" />
                </SelectTrigger>
                <SelectContent>
                  {members.map(m => (
                    <SelectItem key={m.id} value={String(m.id)}>{formatMemberName(m)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Datei *</label>
              <Input type="file" />
            </div>
            <div>
              <label className="text-sm font-medium">Beschreibung</label>
              <Input name="description" placeholder="Optionale Beschreibung" />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpenUpload(false)}>
                Abbrechen
              </Button>
              <Button type="submit" disabled={uploadMut.isPending}>
                Hochladen
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
