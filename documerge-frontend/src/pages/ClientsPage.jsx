import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Building,
  BookOpen,
  FileText,
  Search,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

export function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      // Aqui você faria a requisição para a API
      // const response = await api.get('/api/legal/clients');
      // setClients(response.data.clients);
      
      // Dados mockados para demonstração
      setClients([
        {
          id: 1,
          name: 'Banco ABC',
          description: 'Instituição financeira - casos trabalhistas',
          created_at: '2025-01-01T10:00:00Z',
          theses_count: 15,
          petition_models_count: 3
        },
        {
          id: 2,
          name: 'INSS',
          description: 'Instituto Nacional do Seguro Social - casos previdenciários',
          created_at: '2025-01-02T14:30:00Z',
          theses_count: 22,
          petition_models_count: 5
        },
        {
          id: 3,
          name: 'Empresa XYZ',
          description: 'Empresa privada - casos diversos',
          created_at: '2025-01-03T09:15:00Z',
          theses_count: 8,
          petition_models_count: 2
        }
      ]);
    } catch (error) {
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error('Nome é obrigatório');
        return;
      }

      // Aqui você faria a requisição para criar o cliente
      // const response = await api.post('/api/legal/clients', formData);
      
      const newClient = {
        id: Date.now(),
        ...formData,
        created_at: new Date().toISOString(),
        theses_count: 0,
        petition_models_count: 0
      };

      setClients([...clients, newClient]);
      setFormData({ name: '', description: '' });
      setIsCreateDialogOpen(false);
      toast.success('Cliente criado com sucesso');
    } catch (error) {
      toast.error('Erro ao criar cliente');
    }
  };

  const handleUpdateClient = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error('Nome é obrigatório');
        return;
      }

      // Aqui você faria a requisição para atualizar o cliente
      // await api.put(`/api/legal/clients/${selectedClient.id}`, formData);
      
      setClients(clients.map(client => 
        client.id === selectedClient.id 
          ? { ...client, ...formData }
          : client
      ));
      
      setFormData({ name: '', description: '' });
      setSelectedClient(null);
      setIsEditDialogOpen(false);
      toast.success('Cliente atualizado com sucesso');
    } catch (error) {
      toast.error('Erro ao atualizar cliente');
    }
  };

  const handleDeleteClient = async (clientId) => {
    try {
      if (!confirm('Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.')) {
        return;
      }

      // Aqui você faria a requisição para deletar o cliente
      // await api.delete(`/api/legal/clients/${clientId}`);
      
      setClients(clients.filter(client => client.id !== clientId));
      toast.success('Cliente excluído com sucesso');
    } catch (error) {
      toast.error('Erro ao excluir cliente');
    }
  };

  const openEditDialog = (client) => {
    setSelectedClient(client);
    setFormData({ name: client.name, description: client.description });
    setIsEditDialogOpen(true);
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Clientes</h1>
          <p className="mt-2 text-gray-600">
            Gerencie clientes e organizações do sistema
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Cliente</DialogTitle>
              <DialogDescription>
                Adicione um novo cliente ou organização ao sistema
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  placeholder="Nome do cliente ou organização"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descrição opcional do cliente"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateClient}>
                Criar Cliente
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
              <Label htmlFor="search">Buscar clientes</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Buscar por nome ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de clientes */}
      <Card>
        <CardHeader>
          <CardTitle>Clientes ({filteredClients.length})</CardTitle>
          <CardDescription>
            Lista de todos os clientes cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Teses</TableHead>
                <TableHead>Modelos</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-500" />
                        {client.name}
                      </div>
                      {client.description && (
                        <div className="text-sm text-gray-500 mt-1">
                          {client.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4 text-gray-500" />
                      {client.theses_count}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4 text-gray-500" />
                      {client.petition_models_count}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(client.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/clients/${client.id}/theses`}>
                          <BookOpen className="h-4 w-4 mr-1" />
                          Teses
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/clients/${client.id}/petition-models`}>
                          <FileText className="h-4 w-4 mr-1" />
                          Modelos
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(client)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClient(client.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredClients.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum cliente encontrado</p>
              {searchTerm === '' && (
                <Button 
                  className="mt-4"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Criar primeiro cliente
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
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>
              Altere as informações do cliente
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nome *</Label>
              <Input
                id="edit-name"
                placeholder="Nome do cliente ou organização"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                placeholder="Descrição opcional do cliente"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateClient}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

