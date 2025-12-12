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
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useCondominium } from "@/lib/hooks/useCondominium"

const supplierFormSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  cnpj: z.string().optional(),
  cpf: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  address_street: z.string().optional(),
  address_number: z.string().optional(),
  address_complement: z.string().optional(),
  address_neighborhood: z.string().optional(),
  address_city: z.string().optional(),
  address_state: z.string().max(2).optional(),
  address_zipcode: z.string().optional(),
  supplier_type: z.enum(["administradora", "portaria_virtual", "elevador", "gerador", "limpeza", "seguranca", "outro"]),
  category: z.enum(["servico", "manutencao", "administracao"]).optional(),
  contact_person: z.string().optional(),
  contact_phone: z.string().optional(),
  contract_start_date: z.string().optional().nullable(),
  contract_end_date: z.string().optional().nullable(),
  monthly_value: z.number().min(0).optional().nullable(),
  payment_day: z.number().int().min(1).max(31).optional().nullable(),
  notes: z.string().optional(),
  condominium_id: z.string().optional(),
}).refine((data) => {
  return !data.cnpj || !data.cpf || (data.cnpj && !data.cpf) || (!data.cnpj && data.cpf)
}, {
  message: "Informe CNPJ ou CPF, não ambos",
  path: ["cnpj"],
})

type SupplierFormValues = z.infer<typeof supplierFormSchema>

interface SupplierFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplierId?: string | null
  defaultCondominiumId?: string | null
  onSuccess?: () => void
}

export function SupplierForm({ open, onOpenChange, supplierId, defaultCondominiumId, onSuccess }: SupplierFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isEditing = !!supplierId

  // Single-tenant: buscar o único condomínio
  const { data: condominium } = useCondominium()

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      name: "",
      cnpj: "",
      cpf: "",
      email: "",
      phone: "",
      address_street: "",
      address_number: "",
      address_complement: "",
      address_neighborhood: "",
      address_city: "",
      address_state: "",
      address_zipcode: "",
      supplier_type: "outro",
      category: "servico",
      contact_person: "",
      contact_phone: "",
      contract_start_date: null,
      contract_end_date: null,
      monthly_value: null,
      payment_day: null,
      notes: "",
      condominium_id: defaultCondominiumId || "",
    },
  })

  useEffect(() => {
    if (open && supplierId) {
      loadSupplierData()
    } else if (open && !supplierId) {
      form.reset({
        name: "",
        cnpj: "",
        cpf: "",
        email: "",
        phone: "",
        address_street: "",
        address_number: "",
        address_complement: "",
        address_neighborhood: "",
        address_city: "",
        address_state: "",
        address_zipcode: "",
        supplier_type: "outro",
        category: "servico",
        contact_person: "",
        contact_phone: "",
        contract_start_date: null,
        contract_end_date: null,
        monthly_value: null,
        payment_day: null,
        notes: "",
        condominium_id: defaultCondominiumId || condominium?.id || "",
      })
    }
  }, [open, supplierId, defaultCondominiumId, condominium?.id])

  const loadSupplierData = async () => {
    if (!supplierId) return
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .eq("id", supplierId)
        .single()
      if (error) throw error
      form.reset({
        ...data,
        contract_start_date: data.contract_start_date || null,
        contract_end_date: data.contract_end_date || null,
      })
    } catch (err: any) {
      console.error("Erro ao carregar fornecedor:", err)
      setError(err.message || "Erro ao carregar dados do fornecedor")
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (values: SupplierFormValues) => {
    try {
      setIsLoading(true)
      setError(null)
      const dataToSave = {
        ...values,
        email: values.email || null,
        cnpj: values.cnpj || null,
        cpf: values.cpf || null,
        condominium_id: values.condominium_id || condominium?.id || null,
      }
      if (isEditing && supplierId) {
        const { error } = await supabase
          .from("suppliers")
          .update(dataToSave)
          .eq("id", supplierId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from("suppliers")
          .insert(dataToSave)
        if (error) throw error
      }
      onSuccess?.()
      onOpenChange(false)
      form.reset()
    } catch (err: any) {
      console.error("Erro ao salvar fornecedor:", err)
      setError(err.message || "Erro ao salvar fornecedor")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Fornecedor" : "Novo Fornecedor"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Atualize as informações do fornecedor" : "Cadastre um novo fornecedor"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                {error}
              </div>
            )}

            {/* Single-tenant: condomínio é automático, não precisa selecionar */}
            {condominium && (
              <div className="p-3 bg-card/30 rounded-md border border-border/50">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Condomínio:</span> {condominium.name}
                </p>
              </div>
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome/Razão Social <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do fornecedor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ</FormLabel>
                    <FormControl>
                      <Input placeholder="00.000.000/0000-00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input placeholder="000.000.000-00" {...field} />
                    </FormControl>
                    <FormDescription>Se pessoa física</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="supplier_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo <span className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="administradora">Administradora</SelectItem>
                        <SelectItem value="portaria_virtual">Portaria Virtual</SelectItem>
                        <SelectItem value="elevador">Elevador</SelectItem>
                        <SelectItem value="gerador">Gerador</SelectItem>
                        <SelectItem value="limpeza">Limpeza</SelectItem>
                        <SelectItem value="seguranca">Segurança</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || "servico"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="servico">Serviço</SelectItem>
                        <SelectItem value="manutencao">Manutenção</SelectItem>
                        <SelectItem value="administracao">Administração</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="contato@fornecedor.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(11) 3333-3333" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contact_person"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pessoa de Contato</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do contato" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone de Contato</FormLabel>
                    <FormControl>
                      <Input placeholder="(11) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4 pt-4 border-t border-border/50">
              <h3 className="text-sm font-semibold text-foreground">Contrato</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="contract_start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Início do Contrato</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
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
                  name="contract_end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fim do Contrato</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
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
                  name="payment_day"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dia de Pagamento</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={31}
                          placeholder="Dia do mês"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
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
                name="monthly_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Mensal (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Informações adicionais sobre o fornecedor"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
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
                {isEditing ? "Salvar Alterações" : "Criar Fornecedor"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

