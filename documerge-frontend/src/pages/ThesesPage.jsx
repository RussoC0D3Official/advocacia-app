import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Plus,
  Edit,
  Trash2,
  Download,
  Search,
  ArrowLeft,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

export function ThesesPage() {
  const { clientId } = useParams();
  const [client, setClient] = useState(null);
  const [theses, setTheses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedThesis, setSelectedThesis] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    file: null,
  });

  const fetchClient = useCallback(async () => {
    try {
      setClient({
        id: parseInt(clientId),
        name: "Banco ABC",
        description: "Instituição financeira - casos trabalhistas",
      });
    } catch (error) {
      toast.error("Erro ao carregar cliente", error);
    }
  }, [clientId]);

  const fetchTheses = useCallback(async () => {
    try {
      setTheses([
        {
          id: 1,
          title: "Horas extras Netcursos",
          description: "Tese sobre direito a horas extras em cursos online",
          type: "trabalhista",
          gcs_path: "client_1/theses/20250101_horas_extras.docx",
          created_at: "2025-01-01T10:00:00Z",
          updated_at: "2025-01-01T10:00:00Z",
        },
      ]);
    } catch (error) {
      toast.error("Erro ao carregar teses", error);
    }
  }, []);

  useEffect(() => {
    if (clientId) {
      fetchClient();
    }
    fetchTheses();
  }, [clientId, fetchClient, fetchTheses]);

  const handleCreateThesis = async () => {
    try {
      if (!formData.title.trim()) {
        toast.error("Título é obrigatório");
        return;
      }
      if (!formData.type) {
        toast.error("Tipo da tese é obrigatório");
        return;
      }
      if (!formData.file) {
        toast.error("Arquivo .docx é obrigatório");
        return;
      }

      const newThesis = {
        id: Date.now(),
        title: formData.title,
        description: formData.description,
        type: formData.type,
        gcs_path: `client_${clientId}/theses/${Date.now()}_${
          formData.file.name
        }`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setTheses([...theses, newThesis]);
      setFormData({ title: "", description: "", type: "", file: null });
      setIsCreateDialogOpen(false);
      toast.success("Tese criada com sucesso");
    } catch (error) {
      toast.error("Erro ao criar tese", error);
    }
  };

  const handleUpdateThesis = async () => {
    try {
      if (!formData.title.trim()) {
        toast.error("Título é obrigatório");
        return;
      }

      setTheses(
        theses.map((thesis) =>
          thesis.id === selectedThesis.id
            ? {
                ...thesis,
                title: formData.title,
                description: formData.description,
                updated_at: new Date().toISOString(),
              }
            : thesis
        )
      );

      setFormData({ title: "", description: "", type: "", file: null });
      setSelectedThesis(null);
      setIsEditDialogOpen(false);
      toast.success("Tese atualizada com sucesso");
    } catch (error) {
      toast.error("Erro ao atualizar tese", error);
    }
  };

  const handleDeleteThesis = async (thesisId) => {
    if (!confirm("Tem certeza que deseja excluir esta tese?")) return;
    setTheses(theses.filter((t) => t.id !== thesisId));
    toast.success("Tese excluída com sucesso");
  };

  const handleDownloadThesis = async () => {
    toast.success("Download iniciado");
  };

  const openEditDialog = (thesis) => {
    setSelectedThesis(thesis);
    setFormData({
      title: thesis.title,
      description: thesis.description,
      type: thesis.type || "",
      file: null,
    });
    setIsEditDialogOpen(true);
  };

  const filteredTheses = theses.filter(
    (thesis) =>
      thesis.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      thesis.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("pt-BR");

  const formatarTipo = (value) => {
    switch (value) {
      case "trabalhista":
        return "Direito do Trabalho";
      case "previdenciario":
        return "Direito Previdenciário";
      case "civil":
        return "Direito Cível";
      case "penal":
        return "Direito Penal";
      case "tributario":
        return "Direito Tributário";
      default:
        return "-";
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {clientId && (
            <Button variant="outline" size="sm" asChild>
              <Link to="/clients">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Link>
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {clientId ? `Teses - ${client?.name}` : "Teses Jurídicas"}
            </h1>
            <p className="mt-2 text-gray-600">
              {clientId
                ? `Gerencie as teses jurídicas para ${client?.name}`
                : "Gerencie todas as teses jurídicas do sistema"}
            </p>
          </div>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Tese
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Tese</DialogTitle>
              <DialogDescription>
                Adicione uma nova tese jurídica para {client?.name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Título *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Tipo da Tese *</Label>
                <select
                  className="w-full mt-1 p-2 border border-gray-300 rounded text-sm"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  required
                >
                  <option value="">Selecione o tipo de tese</option>
                  <option value="trabalhista">Direito do Trabalho</option>
                  <option value="previdenciario">Direito Previdenciário</option>
                  <option value="civil">Direito Cível</option>
                  <option value="penal">Direito Penal</option>
                  <option value="tributario">Direito Tributário</option>
                </select>
              </div>

              <div>
                <Label>Arquivo .docx *</Label>
                <Input
                  type="file"
                  accept=".docx"
                  onChange={(e) =>
                    setFormData({ ...formData, file: e.target.files[0] })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleCreateThesis}>Criar Tese</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Tese</DialogTitle>
            <DialogDescription>
              Modifique os dados da tese selecionada
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Título *</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Tipo da Tese</Label>
              <select
                className="w-full mt-1 p-2 border border-gray-300 rounded text-sm"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                <option value="">Selecione o tipo de tese</option>
                <option value="trabalhista">Direito do Trabalho</option>
                <option value="previdenciario">Direito Previdenciário</option>
                <option value="civil">Direito Cível</option>
                <option value="penal">Direito Penal</option>
                <option value="tributario">Direito Tributário</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleUpdateThesis}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filtro */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <Label>Buscar teses</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por título ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de teses */}
      <Card>
        <CardHeader>
          <CardTitle>Teses ({filteredTheses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tese</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Criada em</TableHead>
                <TableHead>Atualizada em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTheses.map((thesis) => (
                <TableRow key={thesis.id}>
                  <TableCell>
                    <div className="font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      {thesis.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {thesis.description}
                    </div>
                  </TableCell>
                  <TableCell>{formatarTipo(thesis.type)}</TableCell>
                  <TableCell>{formatDate(thesis.created_at)}</TableCell>
                  <TableCell>{formatDate(thesis.updated_at)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadThesis}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(thesis)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteThesis(thesis.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
