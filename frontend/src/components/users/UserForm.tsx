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
import { useQuery } from "@tanstack/react-query"
import { Unit, Stakeholder } from "@/types"

const userFormSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").optional().or(z.literal("")),
  user_role: z.enum(["admin", "syndic", "subsindico", "council", "staff", "resident"]),
  type: z.enum(["sindico", "conselheiro", "administradora", "morador", "staff", "outro"]),
  unit_id: z.string().optional().nullable(),
  relationship_type: z.enum(["proprietario", "morador", "proprietario_morador"]).optional().nullable(),
  is_owner: z.boolean().optional(),
  is_resident: z.boolean().optional(),
  owner_id: z.string().optional().nullable(),
  // Campos de contato
  phone: z.string().optional().nullable(),
  phone_secondary: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  has_whatsapp: z.boolean().optional(),
  address_street: z.string().optional().nullable(),
  address_number: z.string().optional().nullable(),
  address_complement: z.string().optional().nullable(),
  address_neighborhood: z.string().optional().nullable(),
  address_city: z.string().optional().nullable(),
  address_state: z.string().optional().nullable(),
  address_zipcode: z.string().optional().nullable(),
  emergency_contact_name: z.string().optional().nullable(),
  emergency_contact_phone: z.string().optional().nullable(),
  emergency_contact_relationship: z.string().optional().nullable(),
  // Campos de funcionário e cargo
  is_employee: z.boolean().optional(),
  employee_role: z.string().optional().nullable(),
  employee_unit_id: z.string().optional().nullable(),
  condominium_role: z.enum(["syndic", "subsindico", "council"]).optional().nullable(),
  is_approved: z.boolean(),
}).refine((data) => {
  // Unidade obrigatória para moradores, síndicos, subsíndicos e conselheiros
  const requiresUnit = ["morador", "sindico", "conselheiro"].includes(data.type) || 
                       ["syndic", "subsindico", "council", "resident"].includes(data.user_role)
  if (requiresUnit && !data.unit_id) {
    return false
  }
  return true
}, {
  message: "Unidade é obrigatória para moradores, síndicos, subsíndicos e conselheiros",
  path: ["unit_id"],
}).refine((data) => {
  // Se for locatário (morador), deve ter owner_id
  if (data.relationship_type === "morador" && !data.owner_id && data.unit_id) {
    return false
  }
  return true
}, {
  message: "Locatário deve ter um proprietário associado",
  path: ["owner_id"],
})

type UserFormValues = z.infer<typeof userFormSchema>

interface UserFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId?: string | null
  userEmail?: string
  defaultUnitId?: string | null
  onSuccess?: () => void
}

export function UserForm({ open, onOpenChange, userId, userEmail, defaultUnitId, onSuccess }: UserFormProps) {
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
      unit_id: null,
      relationship_type: "proprietario_morador",
      is_owner: true,
      is_resident: true,
      owner_id: null,
      phone: null,
      phone_secondary: null,
      whatsapp: null,
      has_whatsapp: false,
      address_street: null,
      address_number: null,
      address_complement: null,
      address_neighborhood: null,
      address_city: null,
      address_state: null,
      address_zipcode: null,
      emergency_contact_name: null,
      emergency_contact_phone: null,
      emergency_contact_relationship: null,
      is_employee: false,
      employee_role: null,
      employee_unit_id: null,
      condominium_role: null,
      is_approved: false,
    },
  })

  // Buscar lista de unidades
  const { data: units = [] } = useQuery<Unit[]>({
    queryKey: ["units"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("units")
        .select("*")
        .eq("is_active", true)
        .order("number", { ascending: true })
      
      if (error) throw error
      return data || []
    },
    enabled: open,
  })

  // Buscar proprietários da unidade selecionada (para locatários)
  const selectedUnitId = form.watch("unit_id")
  const { data: owners = [] } = useQuery<Stakeholder[]>({
    queryKey: ["owners", selectedUnitId],
    queryFn: async () => {
      if (!selectedUnitId) return []
      
      const { data, error } = await supabase
        .from("stakeholders")
        .select("*")
        .eq("unit_id", selectedUnitId)
        .eq("is_owner", true)
        .eq("is_active", true)
        .order("name", { ascending: true })
      
      if (error) throw error
      return data || []
    },
    enabled: open && !!selectedUnitId,
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
        unit_id: defaultUnitId || null,
        relationship_type: "proprietario_morador",
        is_owner: true,
        is_resident: true,
        owner_id: null,
        phone: null,
        phone_secondary: null,
        whatsapp: null,
        has_whatsapp: false,
        address_street: null,
        address_number: null,
        address_complement: null,
        address_neighborhood: null,
        address_city: null,
        address_state: null,
        address_zipcode: null,
        emergency_contact_name: null,
        emergency_contact_phone: null,
        emergency_contact_relationship: null,
        is_employee: false,
        employee_role: null,
        employee_unit_id: null,
        condominium_role: null,
        is_approved: false,
      })
    }
  }, [open, userId, userEmail, defaultUnitId])

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
          .select(`
            *,
            owner:stakeholders!stakeholders_owner_id_fkey(id, name, email)
          `)
          .eq("auth_user_id", userId)
          .single()

        if (stakeholderError) throw stakeholderError

        form.reset({
          name: stakeholderData.name || "",
          email: stakeholderData.email || userEmail || "",
          password: "",
          user_role: (stakeholderData.user_role as any) || "resident",
          type: (stakeholderData.type as any) || "morador",
          unit_id: stakeholderData.unit_id || null,
          relationship_type: stakeholderData.relationship_type || "proprietario_morador",
          is_owner: stakeholderData.is_owner ?? true,
          is_resident: stakeholderData.is_resident ?? true,
          owner_id: stakeholderData.owner_id || null,
          phone: stakeholderData.phone || null,
          phone_secondary: stakeholderData.phone_secondary || null,
          whatsapp: stakeholderData.whatsapp || null,
          has_whatsapp: stakeholderData.has_whatsapp || false,
          address_street: stakeholderData.address_street || null,
          address_number: stakeholderData.address_number || null,
          address_complement: stakeholderData.address_complement || null,
          address_neighborhood: stakeholderData.address_neighborhood || null,
          address_city: stakeholderData.address_city || null,
          address_state: stakeholderData.address_state || null,
          address_zipcode: stakeholderData.address_zipcode || null,
          emergency_contact_name: stakeholderData.emergency_contact_name || null,
          emergency_contact_phone: stakeholderData.emergency_contact_phone || null,
          emergency_contact_relationship: stakeholderData.emergency_contact_relationship || null,
          is_employee: stakeholderData.is_employee || false,
          employee_role: stakeholderData.employee_role || null,
          employee_unit_id: stakeholderData.employee_unit_id || null,
          condominium_role: stakeholderData.condominium_role || null,
          is_approved: stakeholderData.is_approved || false,
        })
      } else {
        // Buscar dados completos do stakeholder
        const { data: stakeholderData } = await supabase
          .from("stakeholders")
          .select(`
            *,
            owner:stakeholders!stakeholders_owner_id_fkey(id, name, email)
          `)
          .eq("auth_user_id", userId)
          .single()

        form.reset({
          name: userData.name || userData.email?.split("@")[0] || "",
          email: userData.email || "",
          password: "",
          user_role: (userData.user_role as any) || "resident",
          type: (userData.type as any) || "morador",
          unit_id: stakeholderData?.unit_id || userData.unit_id || null,
          relationship_type: stakeholderData?.relationship_type || "proprietario_morador",
          is_owner: stakeholderData?.is_owner ?? true,
          is_resident: stakeholderData?.is_resident ?? true,
          owner_id: stakeholderData?.owner_id || null,
          phone: stakeholderData?.phone || null,
          phone_secondary: stakeholderData?.phone_secondary || null,
          whatsapp: stakeholderData?.whatsapp || null,
          has_whatsapp: stakeholderData?.has_whatsapp || false,
          address_street: stakeholderData?.address_street || null,
          address_number: stakeholderData?.address_number || null,
          address_complement: stakeholderData?.address_complement || null,
          address_neighborhood: stakeholderData?.address_neighborhood || null,
          address_city: stakeholderData?.address_city || null,
          address_state: stakeholderData?.address_state || null,
          address_zipcode: stakeholderData?.address_zipcode || null,
          emergency_contact_name: stakeholderData?.emergency_contact_name || null,
          emergency_contact_phone: stakeholderData?.emergency_contact_phone || null,
          emergency_contact_relationship: stakeholderData?.emergency_contact_relationship || null,
          is_employee: stakeholderData?.is_employee || false,
          employee_role: stakeholderData?.employee_role || null,
          employee_unit_id: stakeholderData?.employee_unit_id || null,
          condominium_role: stakeholderData?.condominium_role || null,
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

    // Determinar is_owner e is_resident baseado em relationship_type
    let is_owner = false
    let is_resident = true
    
    if (values.relationship_type === "proprietario") {
      is_owner = true
      is_resident = false
    } else if (values.relationship_type === "proprietario_morador") {
      is_owner = true
      is_resident = true
    } else if (values.relationship_type === "morador") {
      is_owner = false
      is_resident = true
    }

    // Criar usuário via Edge Function
    const { data, error } = await supabase.functions.invoke("create-user", {
      body: {
        email: values.email,
        password: values.password,
        name: values.name,
        type: values.type,
        user_role: values.user_role,
        unit_id: values.unit_id || null,
        relationship_type: values.relationship_type || null,
        is_owner,
        is_resident,
        owner_id: values.owner_id || null,
        phone: values.phone || null,
        phone_secondary: values.phone_secondary || null,
        whatsapp: values.whatsapp || null,
        has_whatsapp: values.has_whatsapp || false,
        address_street: values.address_street || null,
        address_number: values.address_number || null,
        address_complement: values.address_complement || null,
        address_neighborhood: values.address_neighborhood || null,
        address_city: values.address_city || null,
        address_state: values.address_state || null,
        address_zipcode: values.address_zipcode || null,
        emergency_contact_name: values.emergency_contact_name || null,
        emergency_contact_phone: values.emergency_contact_phone || null,
        emergency_contact_relationship: values.emergency_contact_relationship || null,
        is_employee: values.is_employee || false,
        employee_role: values.employee_role || null,
        employee_unit_id: values.employee_unit_id || null,
        condominium_role: values.condominium_role || null,
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

    // Determinar is_owner e is_resident baseado em relationship_type
    let is_owner = false
    let is_resident = true
    
    if (values.relationship_type === "proprietario") {
      is_owner = true
      is_resident = false
    } else if (values.relationship_type === "proprietario_morador") {
      is_owner = true
      is_resident = true
    } else if (values.relationship_type === "morador") {
      is_owner = false
      is_resident = true
    }

    // Atualizar user_metadata (nome e tipo) - precisa de Edge Function ou Admin API
    // Por enquanto, atualizamos apenas na tabela stakeholders
    const { error: stakeholderError } = await supabase
      .from("stakeholders")
      .update({
        name: values.name,
        type: values.type,
        user_role: values.user_role,
        unit_id: values.unit_id || null,
        relationship_type: values.relationship_type || null,
        is_owner,
        is_resident,
        owner_id: values.owner_id || null,
        phone: values.phone || null,
        phone_secondary: values.phone_secondary || null,
        whatsapp: values.whatsapp || null,
        has_whatsapp: values.has_whatsapp || false,
        address_street: values.address_street || null,
        address_number: values.address_number || null,
        address_complement: values.address_complement || null,
        address_neighborhood: values.address_neighborhood || null,
        address_city: values.address_city || null,
        address_state: values.address_state || null,
        address_zipcode: values.address_zipcode || null,
        emergency_contact_name: values.emergency_contact_name || null,
        emergency_contact_phone: values.emergency_contact_phone || null,
        emergency_contact_relationship: values.emergency_contact_relationship || null,
        is_employee: values.is_employee || false,
        employee_role: values.employee_role || null,
        employee_unit_id: values.employee_unit_id || null,
        condominium_role: values.condominium_role || null,
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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
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
              <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
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
              name="unit_id"
              render={({ field }) => {
                const type = form.watch("type")
                const userRole = form.watch("user_role")
                // Unidade obrigatória para moradores, síndicos, subsíndicos e conselheiros
                const isRequired = ["morador", "sindico", "conselheiro"].includes(type) || 
                                  ["syndic", "subsindico", "council", "resident"].includes(userRole)
                
                return (
                  <FormItem>
                    <FormLabel>
                      Unidade {isRequired && <span className="text-destructive">*</span>}
                    </FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value || null)
                        // Reset owner_id quando mudar unidade
                        if (value !== field.value) {
                          form.setValue("owner_id", null)
                        }
                      }} 
                      value={field.value || ""}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a unidade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Nenhuma (Staff/Administradora)</SelectItem>
                        {units.map((unit) => (
                          <SelectItem key={unit.id} value={unit.id}>
                            {unit.number}
                            {unit.block && ` - Bloco ${unit.block}`}
                            {unit.floor && ` - ${unit.floor}º andar`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {isRequired 
                        ? "Unidade obrigatória para moradores, síndicos, subsíndicos e conselheiros"
                        : "Opcional para staff e administradora"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />

            {/* Tipo de Vínculo - apenas se tiver unidade */}
            {form.watch("unit_id") && (
              <>
                <FormField
                  control={form.control}
                  name="relationship_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Vínculo</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value)
                          // Atualizar is_owner e is_resident automaticamente
                          if (value === "proprietario") {
                            form.setValue("is_owner", true)
                            form.setValue("is_resident", false)
                            form.setValue("owner_id", null)
                          } else if (value === "proprietario_morador") {
                            form.setValue("is_owner", true)
                            form.setValue("is_resident", true)
                            form.setValue("owner_id", null)
                          } else if (value === "morador") {
                            form.setValue("is_owner", false)
                            form.setValue("is_resident", true)
                          }
                        }}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo de vínculo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="proprietario_morador">Proprietário que mora</SelectItem>
                          <SelectItem value="proprietario">Proprietário que não mora (aluga)</SelectItem>
                          <SelectItem value="morador">Locatário (morador)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Defina se é proprietário, morador ou ambos
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Select de Proprietário - apenas se for locatário */}
                {form.watch("relationship_type") === "morador" && owners.length > 0 && (
                  <FormField
                    control={form.control}
                    name="owner_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Proprietário <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o proprietário" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {owners.map((owner) => (
                              <SelectItem key={owner.id} value={owner.id}>
                                {owner.name} ({owner.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Selecione o proprietário da unidade (obrigatório para locatários)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </>
            )}

            {/* Seção de Contato */}
            <div className="space-y-4 pt-4 border-t border-border/50">
              <h3 className="text-sm font-semibold text-foreground">Informações de Contato</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone Celular</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="(11) 99999-9999"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone_secondary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone Secundário/Fixo</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="(11) 3333-3333"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="whatsapp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="(11) 99999-9999"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Número do WhatsApp (pode ser igual ao telefone celular)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="has_whatsapp"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value || false}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Telefone tem WhatsApp</FormLabel>
                        <FormDescription>
                          Marque se o telefone celular tem WhatsApp
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Endereço (se diferente da unidade) */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-medium text-muted-foreground">Endereço (se diferente da unidade)</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="address_street"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Rua</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Rua, Avenida, etc."
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="123"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address_complement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complemento</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Apto, Bloco, etc."
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="address_neighborhood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bairro</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Bairro"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address_city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Cidade"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address_state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="SP"
                            maxLength={2}
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address_zipcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="00000-000"
                          maxLength={10}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Contato de Emergência */}
              <div className="space-y-4 pt-2 border-t border-border/30">
                <h4 className="text-xs font-medium text-muted-foreground">Contato de Emergência</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="emergency_contact_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Contato</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nome completo"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emergency_contact_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="(11) 99999-9999"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emergency_contact_relationship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relação</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Pai, Mãe, Cônjuge, etc."
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Campos de Funcionário e Cargo */}
            <div className="space-y-4 pt-4 border-t border-border/50">
              <h3 className="text-sm font-semibold text-foreground">Cargo e Funcionário</h3>
              
              <FormField
                control={form.control}
                name="condominium_role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo no Condomínio</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o cargo (opcional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Nenhum</SelectItem>
                        <SelectItem value="syndic">Síndico</SelectItem>
                        <SelectItem value="subsindico">Subsíndico</SelectItem>
                        <SelectItem value="council">Conselheiro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Cargo ocupado no condomínio (qualificação do morador/proprietário)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_employee"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value || false}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>É Funcionário do Condomínio</FormLabel>
                      <FormDescription>
                        Marque se é funcionário (porteiro, zelador, faxineiro, etc.)
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {form.watch("is_employee") && (
                <>
                  <FormField
                    control={form.control}
                    name="employee_role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Função do Funcionário</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Porteiro, Zelador, Faxineiro"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="employee_unit_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unidade de Trabalho</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a unidade onde trabalha (opcional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Nenhuma (trabalha em todas)</SelectItem>
                            {units.map((unit) => (
                              <SelectItem key={unit.id} value={unit.id}>
                                {unit.number}
                                {unit.block && ` - Bloco ${unit.block}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Unidade específica onde o funcionário trabalha (deixe vazio se trabalha em todas)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>

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

