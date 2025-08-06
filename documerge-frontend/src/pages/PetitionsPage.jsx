import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import { 
  Plus, 
  Edit, 
  Trash2, 
  FileText,
  Download,
  Eye,
  Search,
  Filter,
  Calendar,
  User,
  Building
} from 'lucide-react';
import { toast } from 'sonner';

export function PetitionsPage() {
  const [petitions, setPetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPetition, setSelectedPetition] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ title: '', description: '', content: '' });

  useEffect(() => {
    fetchPetitions();
  }, []);

  const fetchPetitions = async () => {
    try {
      setLoading(true);
      // Aqui você faria a requisição para a API
      // const response = await api.get('/api/petitions/my');
      // setPetitions(response.data.petitions);
      
      // Dados mockados para demonstração
      setPetitions([
        {
          id: 1,
          title: 'Defesa Trabalhista - João Silva',
          description: 'Defesa em processo trabalhista sobre horas extras',
          client_name: 'Banco ABC',
          petition_model_name: 'Defesa Trabalhista',
          status: 'completed',
          created_at: '2025-01-08T10:30:00Z',
          updated_at: '2025-01-08T10:30:00Z',
          content: `# Defesa Trabalhista - João Silva

## Dados do Processo
- Cliente: Banco ABC
- Modelo: Defesa Trabalhista

## Respostas do Formulário
- O reclamante faz jus a horas extras?: Sim
- Houve uso de equipamento pessoal?: Sim
- O ambiente de trabalho é insalubre?: Não

## Conteúdo da Petição
[Conteúdo gerado automaticamente baseado nas respostas e teses vinculadas]

Lorem ipsum dolor sit amet, consectetur adipiscing elit...`
        },
        {
          id: 2,
          title: 'Recurso Previdenciário - Maria Santos',
          description: 'Recurso contra indeferimento de benefício',
          client_name: 'INSS',
          petition_model_name: 'Recurso Ordinário',
          status: 'draft',
          created_at: '2025-01-07T15:45:00Z',
          updated_at: '2025-01-07T15:45:00Z',
          content: `# Recurso Previdenciário - Maria Santos

## Dados do Processo
- Cliente: INSS
- Modelo: Recurso Ordinário

[Conteúdo em elaboração...]`
        },
        {
          id: 3,
          title: 'Ação de Cobrança - Pedro Costa',
          description: 'Cobrança de valores em atraso',
          client_name: 'Empresa XYZ',
          petition_model_name: 'Defesa Trabalhista',
          status: 'completed',
          created_at: '2025-01-06T09:15:00Z',
          updated_at: '2025-01-06T09:15:00Z',
          content: `# Ação de Cobrança - Pedro Costa

## Dados do Processo
- Cliente: Empresa XYZ
- Modelo: Defesa Trabalhista

Petição completa para cobrança de valores...`
        }
      ]);
    } catch (error) {
      toast.error('Erro ao carregar petições');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPetition = (petition) => {
    setSelectedPetition(petition);
    setIsViewDialogOpen(true);
  };

  const handleEditPetition = (petition) => {
    setSelectedPetition(petition);
    setEditFormData({
      title: petition.title,
      description: petition.description,
      content: petition.content
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdatePetition = async () => {
    try {
      if (!editFormData.title.trim()) {
        toast.error('Título é obrigatório');
        return;
      }

      // Aqui você faria a requisição para atualizar a petição
      // await api.put(`/api/petitions/${selectedPetition.id}`, editFormData);
      
      setPetitions(petitions.map(petition => 
        petition.id === selectedPetition.id 
          ? { 
              ...petition, 
              ...editFormData,
              updated_at: new Date().toISOString()
            }
          : petition
      ));
      
      setEditFormData({ title: '', description: '', content: '' });
      setSelectedPetition(null);
      setIsEditDialogOpen(false);
      toast.success('Petição atualizada com sucesso');
    } catch (error) {
      toast.error('Erro ao atualizar petição');
    }
  };

  const handleDeletePetition = async (petitionId) => {
    try {
      if (!confirm('Tem certeza que deseja excluir esta petição? Esta ação não pode ser desfeita.')) {
        return;
      }

      // Aqui você faria a requisição para deletar a petição
      // await api.delete(`/api/petitions/${petitionId}`);
      
      setPetitions(petitions.filter(petition => petition.id !== petitionId));
      toast.success('Petição excluída com sucesso');
    } catch (error) {
      toast.error('Erro ao excluir petição');
    }
  };

  const handleDownloadPetition = async (petition) => {
    try {
      // Aqui você faria o download da petição em formato .docx
      // const response = await api.get(`/api/petitions/${petition.id}/download`, { responseType: 'blob' });
      // const url = window.URL.createObjectURL(new Blob([response.data]));
      // const link = document.createElement('a');
      // link.href = url;
      // link.setAttribute('download', `${petition.title}.docx`);
      // document.body.appendChild(link);
      // link.click();
      // link.remove();
      
      toast.success('Download iniciado');
    } catch (error) {
      toast.error('Erro ao fazer download da petição');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Concluída</Badge>;
      case 'draft':
        return <Badge variant="secondary">Rascunho</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const filteredPetitions = petitions.filter(petition => {
    const matchesSearch = petition.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         petition.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         petition.client_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || petition.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusCount = (status) => {
    if (status === 'all') return petitions.length;
    return petitions.filter(p => p.status === status).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Minhas Petições</h1>
          <p className="mt-2 text-gray-600">
            Visualize e gerencie suas petições criadas
          </p>
        </div>
        <Button asChild>
          <Link to="/generate-petition">
            <Plus className="mr-2 h-4 w-4" />
            Nova Petição
          </Link>
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Petições</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{petitions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getStatusCount('completed')}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rascunhos</CardTitle>
            <FileText className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getStatusCount('draft')}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Buscar petições</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Buscar por título, descrição ou cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="w-full md:w-48">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos ({getStatusCount('all')})</SelectItem>
                  <SelectItem value="completed">Concluídas ({getStatusCount('completed')})</SelectItem>
                  <SelectItem value="draft">Rascunhos ({getStatusCount('draft')})</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de petições */}
      <Card>
        <CardHeader>
          <CardTitle>Petições ({filteredPetitions.length})</CardTitle>
          <CardDescription>
            Lista de todas as suas petições
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Petição</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criada em</TableHead>
                <TableHead>Atualizada em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPetitions.map((petition) => (
                <TableRow key={petition.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{petition.title}</div>
                      {petition.description && (
                        <div className="text-sm text-gray-500 mt-1">
                          {petition.description}
                        </div>
                      )}
                      <div className="text-xs text-gray-400 mt-1">
                        Modelo: {petition.petition_model_name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Building className="h-4 w-4 text-gray-500" />
                      {petition.client_name}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(petition.status)}</TableCell>
                  <TableCell>{formatDate(petition.created_at)}</TableCell>
                  <TableCell>{formatDate(petition.updated_at)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewPetition(petition)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadPetition(petition)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPetition(petition)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePetition(petition.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredPetitions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma petição encontrada</p>
              {searchTerm === '' && statusFilter === 'all' && (
                <Button asChild className="mt-4">
                  <Link to="/generate-petition">
                    <Plus className="mr-2 h-4 w-4" />
                    Criar primeira petição
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de visualização */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{selectedPetition?.title}</DialogTitle>
            <DialogDescription>
              Cliente: {selectedPetition?.client_name} | Status: {selectedPetition?.status}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPetition && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Criada em:</strong> {formatDate(selectedPetition.created_at)}
                </div>
                <div>
                  <strong>Atualizada em:</strong> {formatDate(selectedPetition.updated_at)}
                </div>
              </div>
              
              <div className="border rounded-lg p-4 max-h-96 overflow-y-auto bg-gray-50">
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-sm">{selectedPetition.content}</pre>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Fechar
            </Button>
            <Button onClick={() => handleDownloadPetition(selectedPetition)}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Editar Petição</DialogTitle>
            <DialogDescription>
              Altere as informações da petição
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div>
              <Label htmlFor="edit-title">Título *</Label>
              <Input
                id="edit-title"
                value={editFormData.title}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-content">Conteúdo</Label>
              <Textarea
                id="edit-content"
                rows={10}
                value={editFormData.content}
                onChange={(e) => setEditFormData({ ...editFormData, content: e.target.value })}
                className="font-mono text-sm"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdatePetition}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

