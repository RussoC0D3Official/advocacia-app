import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  LogIn,
  UserPlus,
  FileText,
  Users,
  Building,
  BookOpen,
  LogOut,
  User,
  Shield,
  Scale,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const generateBubbles = () => {
  const bubbles = [];
  for (let i = 0; i < 15; i++) {
    const size = Math.random() * 40 + 10;
    bubbles.push({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: Math.random() * 10 + 5,
      size,
    });
  }
  return bubbles;
};

export function HomePage() {
  const [bubbles, setBubbles] = useState([]);
  const { user, logout } = useAuth();

  useEffect(() => {
    setBubbles(generateBubbles());
  }, []);

  const getRoleName = (role) => {
    switch (role) {
      case "advogado_redator":
        return "Advogado/Redator";
      case "advogado_administrador":
        return "Advogado/Administrador";
      case "dev":
        return "Desenvolvedor";
      default:
        return role;
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "dev":
        return <Shield className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen justify-center items-center overflow-hidden" style={{backgroundColor: '#F8F9FA'}}>
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className="absolute rounded-full blur-lg opacity-20"
          style={{
            background: `linear-gradient(to bottom right, #0F3D4A, #E7D6B0, #0F3D4A)`,
            width: bubble.size,
            height: bubble.size,
            left: `${bubble.left}%`,
            bottom: -50,
          }}
          animate={{
            y: -800,
            opacity: [0.3, 0.1, 0],
          }}
          transition={{
            duration: bubble.duration,
            delay: bubble.delay,
            repeat: Infinity,
            repeatType: "loop",
          }}
        />
      ))}

      <motion.div
        className="text-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2 }}
      >
        <motion.h1
          className="text-6xl font-extrabold text-transparent bg-clip-text mb-6"
          style={{
            backgroundImage:
              "linear-gradient(to right, #0F3D4A, #E7D6B0, #0F3D4A)",
            filter: "drop-shadow(0 0 20px rgba(15, 61, 74, 0.3))",
          }}
        >
          Eduardo Mota <br />
          Advocacia
        </motion.h1>

        <motion.div
          className="text-gray-600 text-lg mb-8 max-w-md mx-auto"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          {user ? (
            <>
              <p>
                Bem-vindo, <strong>{user.display_name || user.email}</strong>!
              </p>
              <div className="flex items-center justify-center gap-2 mt-2">
                {getRoleIcon(user.role)}
                <Badge
                  variant="outline"
                  style={{
                    borderColor: '#0F3D4A',
                    color: '#0F3D4A',
                    backgroundColor: 'rgba(231, 214, 176, 0.1)'
                  }}
                >
                  {getRoleName(user.role)}
                </Badge>
              </div>
            </>
          ) : (
            <p>Sistema inteligente para geração de petições advocatícias</p>
          )}
        </motion.div>

        {user ? (
          // Menu para usuários logados
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-20 flex-col"
              style={{
                borderColor: '#0F3D4A',
                color: '#0F3D4A',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(231, 214, 176, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              <Link to="/dashboard">
                <FileText className="h-6 w-6 mb-2" />
                Dashboard
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-20 flex-col"
              style={{
                borderColor: '#0F3D4A',
                color: '#0F3D4A',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(231, 214, 176, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              <Link to="/generate-petition">
                <FileText className="h-6 w-6 mb-2" />
                Gerar Petição
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-20 flex-col"
              style={{
                borderColor: '#0F3D4A',
                color: '#0F3D4A',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(231, 214, 176, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              <Link to="/my-petitions">
                <BookOpen className="h-6 w-6 mb-2" />
                Minhas Petições
              </Link>
            </Button>

            {(user.role === "advogado_administrador" ||
              user.role === "dev") && (
              <>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-20 flex-col"
                  style={{
                    borderColor: '#0F3D4A',
                    color: '#0F3D4A',
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(231, 214, 176, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  <Link to="/users">
                    <Users className="h-6 w-6 mb-2" />
                    Usuários
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-20 flex-col"
                  style={{
                    borderColor: '#0F3D4A',
                    color: '#0F3D4A',
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(231, 214, 176, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  <Link to="/register">
                    <UserPlus className="h-6 w-6 mb-2" />
                    Cadastrar Usuário
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-20 flex-col"
                  style={{
                    borderColor: '#0F3D4A',
                    color: '#0F3D4A',
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(231, 214, 176, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  <Link to="/clients">
                    <Building className="h-6 w-6 mb-2" />
                    Clientes
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-20 flex-col"
                  style={{
                    borderColor: '#0F3D4A',
                    color: '#0F3D4A',
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(231, 214, 176, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  <Link to="/theses">
                    <Scale className="h-6 w-6 mb-2" />
                    Teses
                  </Link>
                </Button>
              </>
            )}
          </motion.div>
        ) : (
          // Botões para usuários não logados
          <motion.div
            className="flex gap-4 justify-center"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <Button 
              asChild 
              size="lg" 
              style={{
                backgroundColor: '#0F3D4A',
                color: '#F8F9FA'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(15, 61, 74, 0.8)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#0F3D4A';
              }}
            >
              <Link to="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Entrar
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              style={{
                borderColor: '#0F3D4A',
                color: '#0F3D4A',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(231, 214, 176, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              <Link to="/login">
                <UserPlus className="mr-2 h-4 w-4" />
                Já tenho conta
              </Link>
            </Button>
          </motion.div>
        )}

        {user && (
          <motion.div
            className="absolute top-6 right-6"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <Button
              onClick={logout}
              variant="ghost"
              size="sm"
              style={{
                color: '#64748b'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#0F3D4A';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '#64748b';
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </motion.div>
        )}
      </motion.div>

      <motion.footer
        className="absolute bottom-0 w-full text-center py-4 flex flex-col md:flex-row justify-around items-center text-sm"
        style={{
          backgroundColor: '#0F3D4A',
          color: '#F8F9FA'
        }}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <p>© 2025 Sistema Advocacia</p>
        <p>Versão do sistema: v0.0.1</p>
        <p>
          Status: <span style={{color: '#4CAF50'}}>Online</span>
        </p>
      </motion.footer>
    </div>
  );
}
