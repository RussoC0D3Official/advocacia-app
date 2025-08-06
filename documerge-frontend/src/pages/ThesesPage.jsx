import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { 
  Plus, 
  Edit, 
  Trash2, 
  BookOpen,
  Upload,
  Download,
  Search,
  ArrowLeft,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

export function ThesesPage() {
  const { clientId } = useParams();
  const [client, setClient] = useState(null);
  const [theses, setTheses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedThesis, setSelectedThesis] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', file: null });

  useEffect(() => {
    fetchClient();
    fetchTheses();
  }, [clientId]);

  const fetchClient = async () => {
    try {
      // Aqui você faria a requisição para buscar o cliente
      // const response = await api.get(`/api/legal/clients/${clientId}`);
      // setClient(response.data.client);
      
      // Dados mockados
      setClient({
        id: parseInt(clientId),
        name: 'Banco ABC',
        description: 'Instituição financeira - casos trabalhistas'
      });
    } catch (error) {
      toast.error('Erro ao carregar cliente');
    }
  };

  const fetchTheses = async () => {
    try {
      setLoading(true);
      // Aqui você faria a requisição para a API
      // const response = await api.get(`/api/legal/clients/${clientId}/theses`);
      // setTheses(response.data.theses);
      
      // Dados mockados para demonstração
      setTheses([
        {
          id: 1,
          title: 'Horas extras Netcursos',
          description: 'Tese sobre direito a horas extras em cursos online',
          gcs_path: 'client_1/theses/20250101_horas_extras.docx',
          created_at: '2025-01-01T10:00:00Z',
          updated_at: '2025-01-01T10:00:00Z'
        },
        {
          id: 2,
          title: 'Indenização por dano material (celular próprio)',
          description: 'Tese sobre indenização por uso de equipamento pessoal',
          gcs_path: 'client_1/theses/20250102_indenizacao_celular.docx',
          created_at: '2025-01-02T14:30:00Z',
          updated_at: '2025-01-02T14:30:00Z'
        },
        {
          id: 3,
          title: 'Adicional de insalubridade',
          description: 'Tese sobre direito ao adicional de insalubridade',
          gcs_path: 'client_1/theses/20250103_insalubridade.docx',
          created_at: '2025-01-03T09:15:00Z',
          updated_at: '2025-01-03T09:15:00Z'
        }
      ]);
    } catch (error) {
      toast.error('Erro ao carregar teses');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateThesis = async () => {
    try {
      if (!formData.title.trim()) {
        toast.error('Título é obrigatório');
        return;
      }

      if (!formData.file) {
        toast.error('Arquivo .docx é obrigatório');
        return;
      }

      // Aqui você faria o upload do arquivo e criação da tese
      // const formDataToSend = new FormData();
      // formDataToSend.append('title', formData.title);
      // formDataToSend.append('description', formData.description);
      // formDataToSend.append('file', formData.file);
      // const response = await api.post(`/api/legal/clients/${clientId}/theses`, formDataToSend);
      
      const newThesis = {
        id: Date.now(),
        title: formData.title,
        description: formData.description,
        gcs_path: `client_${clientId}/theses/${Date.now()}_${formData.file.name}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setTheses([...theses, newThesis]);
      setFormData({ title: '', description: '', file: null });
      setIsCreateDialogOpen(false);
      toast.success('Tese criada com sucesso');
    } catch (error) {
      toast.error('Erro ao criar tese');
    }
  };

  const handleUpdateThesis = async () => {
    try {
      if (!formData.title.trim()) {
        toast.error('Título é obrigatório');
        return;
      }

      // Aqui você faria a requisição para atualizar a tese
      // const formDataToSend = new FormData();
      // formDataToSend.append('title', formData.title);
      // formDataToSend.append('description', formData.description);
      // if (formData.file) {
      //   formDataToSend.append('file', formData.file);
      // }
      // await api.put(`/api/legal/theses/${selectedThesis.id}`, formDataToSend);
      
      setTheses(theses.map(thesis => 
        thesis.id === selectedThesis.id 
          ? { ...thesis, title: formData.title, description: formData.description, updated_at: new Date().toISOString() }
          : thesis
      ));
      
      setFormData({ title: '', description: '', file: null });
      setSelectedThesis(null);
      setIsEditDialogOpen(false);
      toast.success('Tese atualizada com sucesso');
    } catch (error) {
      toast.error('Erro ao atualizar tese');
    }
  };

  const handleDeleteThesis = async (thesisId) => {
    try {
      if (!confirm('Tem certeza que deseja excluir esta tese? Esta ação não pode ser desfeita.')) {
        return;
      }

      // Aqui você faria a requisição para deletar a tese
      // await api.delete(`/api/legal/theses/${thesisId}`);
      
      setTheses(theses.filter(thesis => thesis.id !== thesisId));
      toast.success('Tese excluída com sucesso');
    } catch (error) {
      toast.error('Erro ao excluir tese');
    }
  };

  const handleDownloadThesis = async (thesis) => {
    try {
      // Aqui você faria o download do arquivo
      // const response = await api.get(`/api/legal/theses/${thesis.id}/download`, { responseType: 'blob' });
      // const url = window.URL.createObjectURL(new Blob([response.data]));
      // const link = document.createElement('a');
      // link.href = url;
      // link.setAttribute('download', `${thesis.title}.docx`);
      // document.body.appendChild(link);
      // link.click();
      // link.remove();
      
      toast.success('Download iniciado');
    } catch (error) {
      toast.error('Erro ao fazer download da tese');
    }
  };

  const openEditDialog = (thesis) => {
    setSelectedThesis(thesis);
    setFormData({ 
      title: thesis.title, 
      description: thesis.description, 
      file: null 
    });
    setIsEditDialogOpen(true);
  };

  const filteredTheses = theses.filter(thesis =>
    thesis.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    thesis.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/clients">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Teses - {client?.name}</h1>
            <p className="mt-2 text-gray-600">
              Gerencie as teses jurídicas para {client?.name}
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
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  placeholder="Título da tese"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descrição da tese"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="file">Arquivo .docx *</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".docx"
                  onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Apenas arquivos .docx são aceitos
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateThesis}>
                Criar Tese
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Label htmlFor="search">Buscar teses</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Buscar por título ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de teses */}
      <Card>
        <CardHeader>
          <CardTitle>Teses ({filteredTheses.length})</CardTitle>
          <CardDescription>
            Lista de todas as teses cadastradas para {client?.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tese</TableHead>
                <TableHead>Criada em</TableHead>
                <TableHead>Atualizada em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTheses.map((thesis) => (
                <TableRow key={thesis.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        {thesis.title}
                      </div>
                      {thesis.description && (
                        <div className="text-sm text-gray-500 mt-1">
                          {thesis.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(thesis.created_at)}</TableCell>
                  <TableCell>{formatDate(thesis.updated_at)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadThesis(thesis)}
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

          {filteredTheses.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma tese encontrada</p>
              {searchTerm === '' && (
                <Button 
                  className="mt-4"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Criar primeira tese
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Tese</DialogTitle>
            <DialogDescription>
              Altere as informações da tese
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Título *</Label>
              <Input
                id="edit-title"
                placeholder="Título da tese"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                placeholder="Descrição da tese"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-file">Novo arquivo .docx (opcional)</Label>
              <Input
                id="edit-file"
                type="file"
                accept=".docx"
                onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
              />
              <p className="text-sm text-gray-500 mt-1">
                Deixe em branco para manter o arquivo atual
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateThesis}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

