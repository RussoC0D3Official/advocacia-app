import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  FileText, 
  Users, 
  Building, 
  BookOpen, 
  Plus,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';

export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPetitions: 0,
    recentPetitions: [],
    totalClients: 0,
    totalTheses: 0,
    totalUsers: 0
  });

  useEffect(() => {
    // Aqui você faria as requisições para buscar as estatísticas
    // Por enquanto, vamos usar dados mockados
    setStats({
      totalPetitions: 24,
      recentPetitions: [
        {
          id: 1,
          title: 'Defesa Trabalhista - João Silva',
          client: 'Banco ABC',
          created_at: '2025-01-08T10:30:00Z',
          status: 'completed'
        },
        {
          id: 2,
          title: 'Recurso Previdenciário - Maria Santos',
          client: 'INSS',
          created_at: '2025-01-07T15:45:00Z',
          status: 'draft'
        },
        {
          id: 3,
          title: 'Ação de Cobrança - Pedro Costa',
          client: 'Empresa XYZ',
          created_at: '2025-01-06T09:15:00Z',
          status: 'completed'
        }
      ],
      totalClients: 8,
      totalTheses: 45,
      totalUsers: 12
    });
  }, []);

  const getRoleName = (role) => {
    switch (role) {
      case 'advogado_redator':
        return 'Advogado/Redator';
      case 'advogado_administrador':
        return 'Advogado/Administrador';
      case 'dev':
        return 'Desenvolvedor';
      default:
        return role;
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Bem-vindo, {user?.display_name || user?.email}
        </p>
        <Badge variant="outline" className="mt-2">
          {getRoleName(user?.role)}
        </Badge>
      </div>

      {/* Ações rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link to="/generate-petition">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gerar Nova Petição</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">+</div>
              <p className="text-xs text-muted-foreground">
                Criar petição a partir de formulário
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link to="/my-petitions">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Minhas Petições</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPetitions}</div>
              <p className="text-xs text-muted-foreground">
                Petições criadas por você
              </p>
            </CardContent>
          </Link>
        </Card>

        {(user?.role === 'advogado_administrador' || user?.role === 'dev') && (
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Link to="/clients">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gerenciar Clientes</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalClients}</div>
                <p className="text-xs text-muted-foreground">
                  Clientes cadastrados
                </p>
              </CardContent>
            </Link>
          </Card>
        )}
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Petições</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPetitions}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% desde o mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teses Disponíveis</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTheses}</div>
            <p className="text-xs text-muted-foreground">
              Documentos base para petições
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              Organizações cadastradas
            </p>
          </CardContent>
        </Card>

        {(user?.role === 'advogado_administrador' || user?.role === 'dev') && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários do Sistema</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Usuários cadastrados
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Petições recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Petições Recentes</CardTitle>
          <CardDescription>
            Suas últimas petições criadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentPetitions.map((petition) => (
              <div key={petition.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {petition.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{petition.title}</h4>
                    <p className="text-sm text-gray-500">Cliente: {petition.client}</p>
                    <p className="text-xs text-gray-400">{formatDate(petition.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(petition.status)}
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/my-petitions`}>Ver</Link>
                  </Button>
                </div>
              </div>
            ))}
            
            {stats.recentPetitions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhuma petição encontrada</p>
                <Button asChild className="mt-4">
                  <Link to="/generate-petition">
                    <Plus className="mr-2 h-4 w-4" />
                    Criar primeira petição
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

