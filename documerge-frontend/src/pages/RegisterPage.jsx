import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputMask from "@mona-health/react-input-mask";
import zxcvbn from "zxcvbn";
import { z } from "zod";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Loader2, UserPlus } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const registerSchema = z
  .object({
    nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    email: z.string().email("Email inválido"),
    cpf: z.string().min(14, "CPF inválido"),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string().min(6, "Confirme sua senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export function RegisterPage({ onRegister, loading, error }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const [creating, setCreating] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const passwordValue = watch("password");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const result = zxcvbn(passwordValue || "");
    const score = result.score;
    const levels = ["Fraca", "Fraca", "Média", "Forte", "Muito forte"];
    setPasswordStrength(levels[score]);
  }, [passwordValue]);

  const isPasswordStrongEnough = ["Forte", "Muito forte"].includes(
    passwordStrength
  );

  const onSubmit = async (data) => {
    if (!isPasswordStrongEnough) {
      toast.error("A senha precisa ser forte ou muito forte");
      return;
    }

    setCreating(true);
    try {
      await onRegister(data.nome, data.email, data.password, data.cpf);
      toast.success("Conta criada com sucesso! Você pode fazer login agora.");
    } catch (err) {
      toast.error(err.message || "Erro ao criar conta");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{backgroundColor: '#F8F9FA'}}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold" style={{color: '#0F3D4A'}}>Criar Conta</CardTitle>
          <CardDescription>
            Preencha seus dados para acessar o Sistema de Advocacia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* NOME + CPF EM LINHA */}
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="nome">Nome completo</Label>
                <Input
                  id="nome"
                  type="text"
                  placeholder="Seu nome completo"
                  {...register("nome")}
                  className={errors.nome ? "border-red-500" : ""}
                />
                {errors.nome && (
                  <p className="text-sm text-red-500">{errors.nome.message}</p>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <InputMask
                  id="cpf"
                  mask="999.999.999-99"
                  placeholder="000.000.000-00"
                  {...register("cpf")}
                  element={Input}
                  className={errors.cpf ? "border-red-500" : ""}
                />
                {errors.cpf && (
                  <p className="text-sm text-red-500">{errors.cpf.message}</p>
                )}
              </div>
            </div>

            {/* EMAIL - LINHA INTEIRA */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                {...register("email")}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-800"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
              {passwordValue && (
                <p
                  className={`text-sm font-medium ${
                    isPasswordStrongEnough
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  Força da senha: {passwordStrength}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  className={
                    errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-800"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={creating || loading || !isPasswordStrongEnough}
              className="w-full"
            >
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Criar Conta
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
