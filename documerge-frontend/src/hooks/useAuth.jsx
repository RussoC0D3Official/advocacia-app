import { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Verificar se há um usuário logado no localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      // Simular login para demonstração
      // Em produção, você faria a requisição para o backend
      if (email === 'admin@advocacia.com' && password === '123456') {
        const userData = {
          id: 1,
          email: 'admin@advocacia.com',
          display_name: 'Administrador',
          role: 'advogado_administrador',
          is_active: true,
          two_factor_enabled: true
        };
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true };
      } else if (email === 'redator@advocacia.com' && password === '123456') {
        const userData = {
          id: 2,
          email: 'redator@advocacia.com',
          display_name: 'João Silva',
          role: 'advogado_redator',
          is_active: true,
          two_factor_enabled: false
        };
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true };
      } else if (email === 'dev@advocacia.com' && password === '123456') {
        const userData = {
          id: 3,
          email: 'dev@advocacia.com',
          display_name: 'Desenvolvedor',
          role: 'dev',
          is_active: true,
          two_factor_enabled: true
        };
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true };
      } else {
        throw new Error('Email ou senha inválidos');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } catch (err) {
      console.error('Erro no logout:', err);
    }
  };

  const getIdToken = async () => {
    // Em produção, você retornaria o token JWT do usuário
    return 'mock-jwt-token';
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    getIdToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

