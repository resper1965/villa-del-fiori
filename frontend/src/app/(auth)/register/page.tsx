"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UserPlus, Loader2, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    type: "morador" as "sindico" | "conselheiro" | "administradora" | "morador" | "staff" | "outro",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Validações
    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem")
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      setLoading(false)
      return
    }

    try {
      // Mapear tipo para user_role
      const userRoleMap: Record<string, string> = {
        morador: "resident",
        sindico: "syndic",
        conselheiro: "council",
        administradora: "staff",
        staff: "staff",
        outro: "resident",
      }

      // 1. Criar usuário no Supabase Auth com roles em app_metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            type: formData.type,
          },
          // app_metadata é gerenciado apenas pelo admin (seguro para roles)
          // Por enquanto, definimos via admin após criação
        },
      })

      if (authError) {
        throw authError
      }

      if (!authData.user) {
        throw new Error("Erro ao criar usuário")
      }

      // 2. Definir app_metadata inicial via Edge Function
      const userRole = userRoleMap[formData.type] || "resident"
      
      // Atualizar app_metadata com role e aprovação inicial
      try {
        const { error: metadataError } = await supabase.functions.invoke("update-user-metadata", {
          body: {
            userId: authData.user.id,
            appMetadata: {
              user_role: userRole as any,
              is_approved: false, // Não aprovado por padrão
            },
          },
        })

        if (metadataError) {
          console.warn("Erro ao definir app_metadata (não crítico):", metadataError)
        }
      } catch (err) {
        console.warn("Erro ao chamar Edge Function:", err)
      }
      
      // 3. Criar stakeholder no banco (para dados adicionais, opcional)
      // Nota: unit_id não é definido no registro público - será definido pelo admin na aprovação
      try {
        await supabase.from("stakeholders").insert({
          name: formData.name,
          email: formData.email,
          type: formData.type,
          user_role: userRole,
          auth_user_id: authData.user.id,
          unit_id: null, // Será definido pelo admin na aprovação
          is_approved: false,
          is_active: true,
        })
      } catch (err) {
        // Não crítico - app_metadata é a fonte da verdade
        console.warn("Erro ao criar stakeholder (não crítico):", err)
      }

      setSuccess(true)
      
      // Redirecionar para página de aguardo após 2 segundos
      setTimeout(() => {
        router.push("/auth/waiting-approval")
      }, 2000)
    } catch (err: any) {
      console.error("Registration error:", err)
      let errorMessage = "Erro ao criar conta. Tente novamente."

      if (err.message?.includes("already registered")) {
        errorMessage = "Este email já está cadastrado. Faça login ou use outro email."
      } else if (err.message?.includes("Invalid email")) {
        errorMessage = "Email inválido. Verifique e tente novamente."
      } else if (err.code === "23505") {
        errorMessage = "Este email já está cadastrado."
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800/90 backdrop-blur-md border-gray-700/50 shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <CardTitle className="text-2xl font-light">Cadastro Realizado!</CardTitle>
            <CardDescription>
              Sua conta foi criada com sucesso. Aguarde a aprovação de um administrador.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-sm text-muted-foreground">
              <p>Você receberá um email quando sua conta for aprovada.</p>
              <p className="mt-2">Redirecionando...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800/90 backdrop-blur-md border-gray-700/50 shadow-2xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-[#00ade8]/10">
              <UserPlus className="h-6 w-6 text-[#00ade8] stroke-1" />
            </div>
          </div>
          <CardTitle className="text-2xl font-light text-center">
            Criar Conta
          </CardTitle>
          <CardDescription className="text-center">
            Cadastre-se para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome completo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Usuário</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morador">Morador</SelectItem>
                  <SelectItem value="sindico">Síndico</SelectItem>
                  <SelectItem value="conselheiro">Conselheiro</SelectItem>
                  <SelectItem value="administradora">Administradora</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={loading}
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Digite a senha novamente"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                disabled={loading}
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-[#00ade8] hover:bg-[#00ade8]/90"
              disabled={loading || !formData.name || !formData.email || !formData.password}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin stroke-1" />
                  Criando conta...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2 stroke-1" />
                  Criar Conta
                </>
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <p>
                Já tem uma conta?{" "}
                <Link href="/login" className="text-[#00ade8] hover:underline">
                  Fazer login
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

