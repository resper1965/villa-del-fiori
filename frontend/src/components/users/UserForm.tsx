"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { updateUserAppMetadata } from "@/lib/api/user-metadata"

const userFormSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").optional().or(z.literal("")),
  user_role: z.enum(["admin", "syndic", "subsindico", "council", "staff", "resident"]),
  type: z.enum(["sindico", "conselheiro", "administradora", "morador", "staff", "outro"]),
  is_approved: z.boolean(),
})

type UserFormValues = z.infer<typeof userFormSchema>

interface UserFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId?: string | null
  userEmail?: string
  onSuccess?: () => void
}

export function UserForm({ open, onOpenChange, userId, userEmail, onSuccess }: UserFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isEditing = !!userId

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      user_role: "resident",
      type: "morador",
      is_approved: false,
    },
  })

  // Carregar dados do usuário se estiver editando
  useEffect(() => {
    if (open && userId && userEmail) {
      loadUserData()
    } else if (open && !userId) {
      form.reset({
        name: "",
        email: "",
        password: "",
        user_role: "resident",
        type: "morador",
        is_approved: false,
      })
    }
  }, [open, userId, userEmail])

  const loadUserData = async () => {
    if (!userId) return

    try {
      setIsLoading(true)
      // Buscar dados do usuário
      const { data: userData, error: userError } = await supabase
        .from("auth_users_with_metadata")
        .select("*")
        .eq("id", userId)
        .single()

      if (userError) {
        // Fallback: buscar da tabela stakeholders
        const { data: stakeholderData, error: stakeholderError } = await supabase
          .from("stakeholders")
          .select("*")
          .eq("auth_user_id", userId)
          .single()

        if (stakeholderError) throw stakeholderError

        form.reset({
          name: stakeholderData.name || "",
          email: stakeholderData.email || userEmail || "",
          password: "",
          user_role: (stakeholderData.user_role as any) || "resident",
          type: (stakeholderData.type as any) || "morador",
          is_approved: stakeholderData.is_approved || false,
        })
      } else {
        form.reset({
          name: userData.name || userData.email?.split("@")[0] || "",
          email: userData.email || "",
          password: "",
          user_role: (userData.user_role as any) || "resident",
          type: (userData.type as any) || "morador",
          is_approved: userData.is_approved || false,
        })
      }
    } catch (err: any) {
      console.error("Erro ao carregar usuário:", err)
      setError(err.message || "Erro ao carregar dados do usuário")
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (values: UserFormValues) => {
    try {
      setIsLoading(true)
      setError(null)

      if (isEditing && userId) {
        // Atualizar usuário existente
        await updateUser(userId, values)
      } else {
        // Criar novo usuário
        await createUser(values)
      }

      onSuccess?.()
      onOpenChange(false)
      form.reset()
    } catch (err: any) {
      console.error("Erro ao salvar usuário:", err)
      setError(err.message || "Erro ao salvar usuário")
    } finally {
      setIsLoading(false)
    }
  }

  const createUser = async (values: UserFormValues) => {
    if (!values.password || values.password.length < 6) {
      throw new Error("Senha é obrigatória e deve ter pelo menos 6 caracteres")
    }

    // Criar usuário via Edge Function
    const { data, error } = await supabase.functions.invoke("create-user", {
      body: {
        email: values.email,
        password: values.password,
        name: values.name,
        type: values.type,
        user_role: values.user_role,
        is_approved: values.is_approved,
      },
    })

    if (error) throw error
    if (!data?.user) throw new Error("Usuário não foi criado")
  }

  const updateUser = async (userId: string, values: UserFormValues) => {
    // Atualizar app_metadata (role e aprovação)
    await updateUserAppMetadata(userId, {
      user_role: values.user_role,
      is_approved: values.is_approved,
      approved_at: values.is_approved ? new Date().toISOString() : undefined,
    })

    // Atualizar user_metadata (nome e tipo) - precisa de Edge Function ou Admin API
    // Por enquanto, atualizamos apenas na tabela stakeholders
    const { error: stakeholderError } = await supabase
      .from("stakeholders")
      .update({
        name: values.name,
        type: values.type,
        user_role: values.user_role,
        is_approved: values.is_approved,
        approved_at: values.is_approved ? new Date().toISOString() : null,
      })
      .eq("auth_user_id", userId)

    if (stakeholderError) {
      console.warn("Erro ao atualizar stakeholder:", stakeholderError)
    }

    // Se houver senha, atualizar (requer Admin API)
    if (values.password && values.password.length > 0) {
      // Nota: Atualização de senha requer Admin API ou Edge Function
      // Por enquanto, apenas logamos que seria necessário
      console.log("Atualização de senha requer Admin API")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Usuário" : "Criar Novo Usuário"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações do usuário abaixo."
              : "Preencha os dados para criar um novo usuário no sistema."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md">
                {error}
              </div>
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="email@exemplo.com"
                      {...field}
                      disabled={isEditing}
                    />
                  </FormControl>
                  <FormDescription>
                    {isEditing ? "Email não pode ser alterado" : "Email usado para login"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha {isEditing && "(opcional)"}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={isEditing ? "Deixe em branco para não alterar" : "Mínimo 6 caracteres"}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {isEditing
                      ? "Deixe em branco para manter a senha atual"
                      : "Senha mínima de 6 caracteres"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="user_role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Função no Sistema</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a função" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="syndic">Síndico</SelectItem>
                      <SelectItem value="subsindico">Subsíndico</SelectItem>
                      <SelectItem value="council">Conselheiro</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="resident">Morador</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="sindico">Síndico</SelectItem>
                      <SelectItem value="conselheiro">Conselheiro</SelectItem>
                      <SelectItem value="administradora">Administradora</SelectItem>
                      <SelectItem value="morador">Morador</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_approved"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Usuário Aprovado</FormLabel>
                    <FormDescription>
                      Usuários aprovados têm acesso imediato ao sistema
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Salvar Alterações" : "Criar Usuário"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

