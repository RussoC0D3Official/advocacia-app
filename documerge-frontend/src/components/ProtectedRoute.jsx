import { Navigate } from 'react-router-dom';

export function ProtectedRoute({ children, user, requiredRole = null }) {
  // Se não há usuário, redireciona para login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se há um papel específico requerido, verifica permissões
  if (requiredRole) {
    const hasPermission = checkUserPermission(user, requiredRole);
    
    if (!hasPermission) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h2>
            <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
          </div>
        </div>
      );
    }
  }

  return children;
}

function checkUserPermission(user, requiredRole) {
  if (!user || !user.is_active) {
    return false;
  }

  // Dev tem todas as permissões
  if (user.role === 'dev') {
    return true;
  }

  // Advogado Administrador tem permissões de administração
  if (user.role === 'advogado_administrador' && 
      ['advogado_administrador', 'advogado_redator'].includes(requiredRole)) {
    return true;
  }

  // Advogado Redator tem apenas suas próprias permissões
  if (user.role === 'advogado_redator' && requiredRole === 'advogado_redator') {
    return true;
  }

  return false;
}

