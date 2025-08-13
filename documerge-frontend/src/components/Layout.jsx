import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Home,
  FileText,
  Users,
  Building,
  BookOpen,
  Settings,
  LogOut,
  User,
  Shield,
  Scale,
  UserPlus,
} from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";

export function Layout({ children, user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
      roles: ["advogado_redator", "advogado_administrador", "dev"],
      description: "Página inicial com visão geral",
    },
    {
      name: "Gerar Petição",
      href: "/generate-petition",
      icon: FileText,
      roles: ["advogado_redator", "advogado_administrador", "dev"],
      description: "Criar nova petição",
    },
    {
      name: "Minhas Petições",
      href: "/my-petitions",
      icon: BookOpen,
      roles: ["advogado_redator", "advogado_administrador", "dev"],
      description: "Visualizar petições criadas",
    },
    {
      name: "Usuários",
      href: "/users",
      icon: Users,
      roles: ["advogado_administrador", "dev"],
      description: "Gerenciar usuários do sistema",
    },
    {
      name: "Cadastrar Usuário",
      href: "/register",
      icon: UserPlus,
      roles: ["advogado_administrador", "dev"],
      description: "Cadastrar novo usuário no sistema",
    },
    {
      name: "Clientes",
      href: "/clients",
      icon: Building,
      roles: ["advogado_administrador", "dev"],
      description: "Gerenciar clientes e organizações",
    },
    {
      name: "Teses",
      href: "/theses",
      icon: Scale,
      roles: ["advogado_administrador", "dev"],
      description: "Gerenciar teses jurídicas",
    },
  ];

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(user?.role)
  );

  const displayNavigation =
    filteredNavigation.length > 0
      ? filteredNavigation
      : [
          {
            name: "Dashboard",
            href: "/dashboard",
            icon: Home,
            roles: ["*"],
            description: "Página inicial com visão geral",
          },
          {
            name: "Gerar Petição",
            href: "/generate-petition",
            icon: FileText,
            roles: ["*"],
            description: "Criar nova petição",
          },
          {
            name: "Minhas Petições",
            href: "/my-petitions",
            icon: BookOpen,
            roles: ["*"],
            description: "Visualizar petições criadas",
          },
        ];

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
    <div className="flex h-screen" style={{backgroundColor: '#F8F9FA'}}>
      {/* Sidebar desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto border-r" style={{backgroundColor: '#F8F9FA', borderColor: '#e2e8f0'}}>
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-xl font-bold" style={{color: '#0F3D4A'}}>
              Eduardo Mota <br />
              Advocacia
            </h1>
          </div>
          <div className="mt-8 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {displayNavigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      isActive
                        ? "border-l-4 transition-colors duration-200"
                        : "border-transparent transition-colors duration-200 hover:text-gray-900"
                    } group flex items-center px-2 py-2 text-sm font-medium border-l-4 transition-colors duration-200`}
                    style={{
                      backgroundColor: isActive ? '#E7D6B0' : 'transparent',
                      borderLeftColor: isActive ? '#0F3D4A' : 'transparent',
                      color: isActive ? '#0F3D4A' : '#64748b'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.target.style.backgroundColor = '#f1f5f9';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.target.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <item.icon
                      className="mr-3 h-5 w-5 transition-colors duration-200"
                      style={{
                        color: isActive ? '#0F3D4A' : '#94a3b8'
                      }}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Sidebar mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="text-white hover:text-white hover:bg-gray-600"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <h1 className="text-xl font-bold text-gray-900">
                  Sistema Advocacia
                </h1>
              </div>

              <nav className="mt-5 px-2 space-y-1">
                {displayNavigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`${
                        isActive
                          ? "bg-blue-50 border-blue-500 text-blue-700"
                          : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      } group flex items-center px-2 py-2 text-base font-medium border-l-4`}
                    >
                      <item.icon
                        className={`${
                          isActive
                            ? "text-blue-500"
                            : "text-gray-400 group-hover:text-gray-500"
                        } mr-4 h-6 w-6`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Header */}
        <div className="relative z-10 flex-shrink-0 flex h-16 shadow border-b" style={{backgroundColor: '#0F3D4A', borderColor: '#0F3D4A'}}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="px-4 border-r text-white hover:bg-opacity-20 hover:bg-white focus:outline-none focus:ring-2 focus:ring-inset md:hidden"
            style={{borderColor: 'rgba(255,255,255,0.2)'}}
          >
            <Menu className="h-6 w-6" />
          </Button>

          <div className="flex-1 px-4 flex justify-between items-center">
            <div className="flex-1" />

            {/* User menu */}
            <div className="ml-4 flex items-center md:ml-6">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {user?.display_name?.charAt(0) ||
                          user?.email?.charAt(0) ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.display_name || user?.email}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {getRoleIcon(user?.role)}
                        {getRoleName(user?.role)}
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => setConfirmLogoutOpen(true)}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Página */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Modal de confirmação de logout */}
      <Dialog open={confirmLogoutOpen} onOpenChange={setConfirmLogoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deseja sair da conta?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Você será desconectado do sistema.
          </p>
          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmLogoutOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setConfirmLogoutOpen(false);
                onLogout();
              }}
            >
              Sair
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
