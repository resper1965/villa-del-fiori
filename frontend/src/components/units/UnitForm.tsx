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
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { Unit } from "@/types"
import { useCondominium } from "@/lib/hooks/useCondominium"

const unitFormSchema = z.object({
  number: z.string().min(1, "Número da unidade é obrigatório"),
  block: z.string().optional(),
  floor: z.number().int().min(0).optional().nullable(),
  area: z.number().min(0).optional().nullable(),
  parking_spots: z.number().int().min(0).optional().nullable(),
  description: z.string().optional(),
  condominium_id: z.string().optional().nullable(),
})

type UnitFormValues = z.infer<typeof unitFormSchema>

interface UnitFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  unitId?: string | null
  onSuccess?: (unitId?: string) => void
}

export function UnitForm({ open, onOpenChange, unitId, onSuccess }: UnitFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isEditing = !!unitId

  // Single-tenant: buscar o único condomínio
  const { data: condominium } = useCondominium()

  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitFormSchema),
    defaultValues: {
      number: "",
      block: "",
      floor: null,
      area: null,
      parking_spots: null,
      description: "",
      condominium_id: null,
    },
  })

  // Carregar dados da unidade se estiver editando
  useEffect(() => {
    if (open && unitId) {
      loadUnitData()
    } else if (open && !unitId) {
        form.reset({
          number: "",
          block: "",
          floor: null,
          area: null,
          parking_spots: null,
          description: "",
          condominium_id: condominium?.id || null,
        })
    }
  }, [open, unitId, condominium?.id, form])

  const loadUnitData = async () => {
    if (!unitId) return

    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("units")
        .select("*")
        .eq("id", unitId)
        .single()

      if (error) throw error

      form.reset({
        number: data.number || "",
        block: data.block || "",
        floor: data.floor || null,
        area: data.area ? parseFloat(data.area.toString()) : null,
        parking_spots: data.parking_spots || null,
        description: data.description || "",
        condominium_id: data.condominium_id || condominium?.id || null,
      })
    } catch (err: any) {
      console.error("Erro ao carregar unidade:", err)
      setError(err.message || "Erro ao carregar dados da unidade")
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (values: UnitFormValues) => {
    try {
      setIsLoading(true)
      setError(null)

      if (isEditing && unitId) {
        // Atualizar unidade existente
        const { error: updateError } = await supabase
          .from("units")
          .update({
            number: values.number,
            block: values.block || null,
            floor: values.floor || null,
            area: values.area || null,
            parking_spots: values.parking_spots || null,
            description: values.description || null,
            condominium_id: values.condominium_id || null,
          })
          .eq("id", unitId)

        if (updateError) throw updateError
      } else {
        // Criar nova unidade
        const { data: newUnit, error: createError } = await supabase
          .from("units")
          .insert({
            number: values.number,
            block: values.block || null,
            floor: values.floor || null,
            area: values.area || null,
            parking_spots: values.parking_spots || null,
            description: values.description || null,
            condominium_id: values.condominium_id || condominium?.id || null,
            is_active: true,
          })
          .select()
          .single()

        if (createError) {
          if (createError.code === "23505") {
            throw new Error("Já existe uma unidade com este número")
          }
          throw createError
        }

        onSuccess?.(newUnit?.id)
        onOpenChange(false)
        form.reset()
        return
      }

      onSuccess?.()
      onOpenChange(false)
      form.reset()
    } catch (err: any) {
      console.error("Erro ao salvar unidade:", err)
      setError(err.message || "Erro ao salvar unidade")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Unidade" : "Cadastrar Nova Unidade"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações da unidade abaixo."
              : "Preencha os dados para cadastrar uma nova unidade no condomínio."}
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número da Unidade <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 101, Apto 201, Casa 1" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormDescription>
                      Identificador único da unidade
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="block"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bloco</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: A, B, 1" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="floor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Andar</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="Ex: 1, 2, 3"
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const value = e.target.value ? parseInt(e.target.value) : null
                          field.onChange(value)
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        min={0}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Área (m²)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="0.01"
                        placeholder="Ex: 75.5"
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const value = e.target.value ? parseFloat(e.target.value) : null
                          field.onChange(value)
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        min={0}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parking_spots"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vagas de Garagem</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="Ex: 1, 2"
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const value = e.target.value ? parseInt(e.target.value) : 0
                          field.onChange(value)
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        min={0}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Observações adicionais sobre a unidade..."
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
                {isEditing ? "Salvar Alterações" : "Cadastrar Unidade"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

