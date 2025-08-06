import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.jsx';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { UsersPage } from './pages/UsersPage';
import { ClientsPage } from './pages/ClientsPage';
import { ThesesPage } from './pages/ThesesPage';
import { PetitionModelsPage } from './pages/PetitionModelsPage';
import { GeneratePetitionPage } from './pages/GeneratePetitionPage';
import { PetitionsPage } from './pages/PetitionsPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Loader2 } from 'lucide-react';
import { Toaster } from 'sonner';
import './App.css';

function App() {
  const { user, loading, error, login, logout, getIdToken } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
        
        <Routes>
          {/* Rota de login */}
          <Route 
            path="/login" 
            element={
              user ? <Navigate to="/dashboard" replace /> : 
              <LoginPage onLogin={login} loading={loading} error={error} />
            } 
          />
          
          {/* Rotas protegidas */}
          <Route 
            path="/*" 
            element={
              <ProtectedRoute user={user}>
                <Layout user={user} onLogout={logout} getIdToken={getIdToken}>
                  <Routes>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    
                    {/* Rotas para Advogado/Redator */}
                    <Route path="/generate-petition" element={<GeneratePetitionPage />} />
                    <Route path="/my-petitions" element={<PetitionsPage />} />
                    
                    {/* Rotas para Advogado/Administrador */}
                    <Route 
                      path="/users" 
                      element={
                        <ProtectedRoute user={user} requiredRole="advogado_administrador">
                          <UsersPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/clients" 
                      element={
                        <ProtectedRoute user={user} requiredRole="advogado_administrador">
                          <ClientsPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/clients/:clientId/theses" 
                      element={
                        <ProtectedRoute user={user} requiredRole="advogado_administrador">
                          <ThesesPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/clients/:clientId/petition-models" 
                      element={
                        <ProtectedRoute user={user} requiredRole="advogado_administrador">
                          <PetitionModelsPage />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Rota padrão */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

