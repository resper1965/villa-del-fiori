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
import { Unit, Stakeholder } from "@/types"
import { useToast } from "@/hooks/use-toast"

const petFormSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  species: z.enum(["cachorro", "gato", "ave", "outro"]),
  breed: z.string().optional(),
  color: z.string().optional(),
  size: z.enum(["pequeno", "medio", "grande"]).optional(),
  weight: z.number().min(0).optional().nullable(),
  birth_date: z.string().optional().nullable(),
  microchip_number: z.string().optional(),
  vaccination_status: z.enum(["em_dia", "atrasado", "nao_aplicavel"]).optional(),
  last_vaccination_date: z.string().optional().nullable(),
  notes: z.string().optional(),
  unit_id: z.string().min(1, "Unidade é obrigatória"),
  owner_id: z.string().optional().nullable(),
})

type PetFormValues = z.infer<typeof petFormSchema>

interface PetFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  petId?: string | null
  defaultUnitId?: string | null
  onSuccess?: () => void
}

export function PetForm({ open, onOpenChange, petId, defaultUnitId, onSuccess }: PetFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const isEditing = !!petId

  const form = useForm<PetFormValues>({
    resolver: zodResolver(petFormSchema),
    defaultValues: {
      name: "",
      species: "cachorro",
      breed: "",
      color: "",
      size: "medio",
      weight: null,
      birth_date: null,
      microchip_number: "",
      vaccination_status: "em_dia",
      last_vaccination_date: null,
      notes: "",
      unit_id: defaultUnitId || "",
      owner_id: null,
    },
  })

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

  const selectedUnitId = form.watch("unit_id")
  const { data: owners = [] } = useQuery<Stakeholder[]>({
    queryKey: ["pet-owners", selectedUnitId],
    queryFn: async () => {
      if (!selectedUnitId) return []
      const { data, error } = await supabase
        .from("stakeholders")
        .select("*")
        .eq("unit_id", selectedUnitId)
        .eq("is_active", true)
        .order("name", { ascending: true })
      if (error) throw error
      return data || []
    },
    enabled: open && !!selectedUnitId,
  })

  useEffect(() => {
    if (open && petId) {
      loadPetData()
    } else if (open && !petId) {
      form.reset({
        name: "",
        species: "cachorro",
        breed: "",
        color: "",
        size: "medio",
        weight: null,
        birth_date: null,
        microchip_number: "",
        vaccination_status: "em_dia",
        last_vaccination_date: null,
        notes: "",
        unit_id: defaultUnitId || "",
        owner_id: null,
      })
    }
  }, [open, petId, defaultUnitId])

  const loadPetData = async () => {
    if (!petId) return
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("pets")
        .select("*")
        .eq("id", petId)
        .single()
      if (error) throw error
      form.reset({
        ...data,
        birth_date: data.birth_date || null,
        last_vaccination_date: data.last_vaccination_date || null,
      })
    } catch (err: any) {
      console.error("Erro ao carregar pet:", err)
      const errorMessage = err.message || "Erro ao carregar dados do pet"
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Erro ao carregar",
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (values: PetFormValues) => {
    try {
      setIsLoading(true)
      setError(null)
      if (isEditing && petId) {
        const { error } = await supabase
          .from("pets")
          .update(values)
          .eq("id", petId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from("pets")
          .insert(values)
        if (error) throw error
      }
      toast({
        variant: "success",
        title: isEditing ? "Pet atualizado" : "Pet criado",
        description: isEditing
          ? "As informações do pet foram atualizadas com sucesso."
          : "O pet foi cadastrado com sucesso.",
      })
      onSuccess?.()
      onOpenChange(false)
      form.reset()
    } catch (err: any) {
      console.error("Erro ao salvar pet:", err)
      const errorMessage = err.message || "Erro ao salvar pet"
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Pet" : "Novo Pet"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Atualize as informações do pet" : "Cadastre um novo pet"}
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
                  <Select onValueChange={field.onChange} value={field.value}>
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
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do pet" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="species"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Espécie <span className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cachorro">Cachorro</SelectItem>
                        <SelectItem value="gato">Gato</SelectItem>
                        <SelectItem value="ave">Ave</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
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
                name="breed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Raça</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Golden Retriever" {...field} />
                    </FormControl>
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
                      <Input placeholder="Ex: Dourado" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Porte</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || "medio"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pequeno">Pequeno</SelectItem>
                        <SelectItem value="medio">Médio</SelectItem>
                        <SelectItem value="grande">Grande</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso (kg)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="birth_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Nascimento</FormLabel>
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
            </div>

            <FormField
              control={form.control}
              name="microchip_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número do Microchip</FormLabel>
                  <FormControl>
                    <Input placeholder="Número do microchip" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vaccination_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status de Vacinação</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || "em_dia"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="em_dia">Em Dia</SelectItem>
                        <SelectItem value="atrasado">Atrasado</SelectItem>
                        <SelectItem value="nao_aplicavel">Não Aplicável</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="last_vaccination_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Última Vacinação</FormLabel>
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
            </div>

            {owners.length > 0 && (
              <FormField
                control={form.control}
                name="owner_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proprietário</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                      value={field.value || "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o proprietário (opcional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {owners.map((owner) => (
                          <SelectItem key={owner.id} value={owner.id}>
                            {owner.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Informações adicionais sobre o pet"
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
                {isEditing ? "Salvar Alterações" : "Criar Pet"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}



