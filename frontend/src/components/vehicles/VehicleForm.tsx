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
import { useQuery } from "@tanstack/react-query"
import { Unit } from "@/types"

const vehicleFormSchema = z.object({
  unit_id: z.string().min(1, "Unidade é obrigatória"),
  brand: z.string().min(2, "Marca deve ter pelo menos 2 caracteres"),
  model: z.string().min(2, "Modelo deve ter pelo menos 2 caracteres"),
  license_plate: z.string()
    .min(7, "Placa inválida")
    .max(8, "Placa inválida")
    .regex(/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$|^[A-Z]{3}[0-9]{4}$/i, "Formato de placa inválido (ABC1234 ou ABC1D23)"),
  color: z.string().optional(),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional().nullable(),
  vehicle_type: z.enum(["carro", "moto", "caminhao", "van", "outro"]).default("carro"),
  notes: z.string().optional(),
})

type VehicleFormValues = z.infer<typeof vehicleFormSchema>

interface VehicleFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicleId?: string | null
  defaultUnitId?: string | null
  onSuccess?: () => void
}

export function VehicleForm({ 
  open, 
  onOpenChange, 
  vehicleId, 
  defaultUnitId,
  onSuccess 
}: VehicleFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isEditing = !!vehicleId

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

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      unit_id: defaultUnitId || "",
      brand: "",
      model: "",
      license_plate: "",
      color: "",
      year: null,
      vehicle_type: "carro",
      notes: "",
    },
  })

  // Carregar dados do veículo se estiver editando
  useEffect(() => {
    if (open && vehicleId) {
      loadVehicleData()
    } else if (open && !vehicleId) {
      form.reset({
        unit_id: defaultUnitId || "",
        brand: "",
        model: "",
        license_plate: "",
        color: "",
        year: null,
        vehicle_type: "carro",
        notes: "",
      })
    }
  }, [open, vehicleId, defaultUnitId])

  const loadVehicleData = async () => {
    if (!vehicleId) return

    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("id", vehicleId)
        .single()

      if (error) throw error

      form.reset({
        unit_id: data.unit_id || "",
        brand: data.brand || "",
        model: data.model || "",
        license_plate: data.license_plate || "",
        color: data.color || "",
        year: data.year || null,
        vehicle_type: (data.vehicle_type as any) || "carro",
        notes: data.notes || "",
      })
    } catch (err: any) {
      console.error("Erro ao carregar veículo:", err)
      setError(err.message || "Erro ao carregar dados do veículo")
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (values: VehicleFormValues) => {
    try {
      setIsLoading(true)
      setError(null)

      if (isEditing && vehicleId) {
        // Atualizar veículo existente
        const { error: updateError } = await supabase
          .from("vehicles")
          .update({
            unit_id: values.unit_id,
            brand: values.brand,
            model: values.model,
            license_plate: values.license_plate.toUpperCase().replace(/[^A-Z0-9]/g, ""),
            color: values.color || null,
            year: values.year || null,
            vehicle_type: values.vehicle_type,
            notes: values.notes || null,
          })
          .eq("id", vehicleId)

        if (updateError) throw updateError
      } else {
        // Criar novo veículo
        const { error: createError } = await supabase
          .from("vehicles")
          .insert({
            unit_id: values.unit_id,
            brand: values.brand,
            model: values.model,
            license_plate: values.license_plate.toUpperCase().replace(/[^A-Z0-9]/g, ""),
            color: values.color || null,
            year: values.year || null,
            vehicle_type: values.vehicle_type,
            notes: values.notes || null,
            is_active: true,
          })

        if (createError) throw createError
      }

      onSuccess?.()
      onOpenChange(false)
      form.reset()
    } catch (err: any) {
      console.error("Erro ao salvar veículo:", err)
      if (err.code === "23505") {
        setError("Esta placa já está cadastrada no sistema")
      } else {
        setError(err.message || "Erro ao salvar veículo")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Veículo" : "Cadastrar Novo Veículo"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações do veículo abaixo."
              : "Preencha os dados para cadastrar um novo veículo no sistema."}
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
              name="unit_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unidade <span className="text-destructive">*</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a unidade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
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
                    Unidade (apartamento) à qual o veículo pertence
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Toyota, Honda, Fiat" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Corolla, Civic, Uno" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="license_plate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Placa <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="ABC1234 ou ABC1D23" 
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")
                          field.onChange(value)
                        }}
                        maxLength={8}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Formato: ABC1234 (antigo) ou ABC1D23 (Mercosul)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Branco, Preto, Prata" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ano</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="Ex: 2020"
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const value = e.target.value ? parseInt(e.target.value) : null
                          field.onChange(value)
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        min={1900}
                        max={new Date().getFullYear() + 1}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vehicle_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Veículo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="carro">Carro</SelectItem>
                        <SelectItem value="moto">Moto</SelectItem>
                        <SelectItem value="caminhao">Caminhão</SelectItem>
                        <SelectItem value="van">Van</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
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
                      placeholder="Observações adicionais sobre o veículo..."
                      {...field}
                      disabled={isLoading}
                      rows={3}
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
                {isEditing ? "Salvar Alterações" : "Cadastrar Veículo"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

