import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export const LoginForm = ({
  onLogin,
  onRegister,
  loading,
  error,
  isLogin = true,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      await onLogin(email, password);
    } else {
      await onRegister(email, password);
    }
  };

  const handleRedirect = () => {
    if (location.pathname === "/login") {
      navigate("/register");
    } else {
      navigate("/login");
    }
  };

  const isLoginPage = location.pathname === "/login";

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md rounded-lg shadow-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {isLoginPage ? "Entrar" : "Criar Conta"}
          </CardTitle>
          <CardDescription className="text-center text-gray-600">
            {isLoginPage
              ? "Acesse sua conta com e-mail e senha"
              : "Preencha os dados para criar sua conta"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoginPage ? "Entrar" : "Registrar"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={handleRedirect}
              disabled={loading}
              className="text-sm"
            >
              {isLoginPage
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </Button>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            <p>Sistema de Gestão de Petições Jurídicas</p>
            <p>Suporte a autenticação de dois fatores</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
