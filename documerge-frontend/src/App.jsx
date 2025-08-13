import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth, AuthProvider } from "./hooks/useAuth";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { UsersPage } from "./pages/UsersPage";
import { ClientsPage } from "./pages/ClientsPage";
import { ThesesPage } from "./pages/ThesesPage";
import { PetitionModelsPage } from "./pages/PetitionModelsPage";
import { GeneratePetitionPage } from "./pages/GeneratePetitionPage";
import { PetitionsPage } from "./pages/PetitionsPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { Loader2 } from "lucide-react";
import { Toaster } from "sonner";
import "./App.css";

// Autenticação via Firebase
import { loginUser, registerUser } from "./lib/auth";

function AppRoutes() {
  const { user, loading, error, logout, getIdToken } = useAuth();

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
    <Routes>
      {/* Redirecionar para login se não estiver autenticado */}
      <Route
        path="/"
        element={
          <ProtectedRoute user={user}>
            <HomePage />
          </ProtectedRoute>
        }
      />

      {/* Login */}
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to="/" replace />
          ) : (
            <LoginPage
              onLogin={loginUser}
              onRegister={registerUser}
              loading={loading}
              error={error}
            />
          )
        }
      />

      {/* Rotas protegidas com layout */}
      <Route
        path="/*"
        element={
          <ProtectedRoute user={user}>
            <Layout user={user} onLogout={logout} getIdToken={getIdToken}>
              <Routes>
                <Route path="/dashboard" element={<DashboardPage />} />

                {/* Redator */}
                <Route path="/generate-petition" element={<GeneratePetitionPage />} />
                <Route path="/my-petitions" element={<PetitionsPage />} />

                {/* Administrador */}
                <Route
                  path="/users"
                  element={
                    <ProtectedRoute user={user} requiredRole="advogado_administrador">
                      <UsersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <ProtectedRoute user={user} requiredRole="advogado_administrador">
                      <RegisterPage
                        onRegister={registerUser}
                        loading={loading}
                        error={error}
                      />
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
                <Route
                  path="/theses"
                  element={
                    <ProtectedRoute user={user} requiredRole="advogado_administrador">
                      <ThesesPage />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
