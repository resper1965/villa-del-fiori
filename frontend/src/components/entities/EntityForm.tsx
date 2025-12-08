"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEntity, useCreateEntity, useUpdateEntity } from "@/lib/hooks/useEntities"
import { EntityType, EntityCategory, EntityTypeLabels, EntityCategoryLabels, CategoriesByType } from "@/types/entity"
import { Loader2 } from "lucide-react"

const entitySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  type: z.nativeEnum(EntityType),
  category: z.nativeEnum(EntityCategory).optional(),
  phone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  contact_person: z.string().optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  emergency_phone: z.string().optional(),
  meeting_point: z.string().optional(),
  is_active: z.boolean().default(true),
})

type EntityFormData = z.infer<typeof entitySchema>

interface EntityFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entityId?: string | null
}

export function EntityForm({ open, onOpenChange, entityId }: EntityFormProps) {
  const { data: entity, isLoading: isLoadingEntity } = useEntity(entityId || null)
  const createMutation = useCreateEntity()
  const updateMutation = useUpdateEntity()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<EntityFormData>({
    resolver: zodResolver(entitySchema),
    defaultValues: {
      type: EntityType.PESSOA,
      is_active: true,
    },
  })

  const selectedType = watch("type")

  useEffect(() => {
    if (entity && open) {
      reset({
        name: entity.name,
        type: entity.type,
        category: entity.category,
        phone: entity.phone || "",
        email: entity.email || "",
        contact_person: entity.contact_person || "",
        description: entity.description || "",
        address: entity.address || "",
        emergency_phone: entity.emergency_phone || "",
        meeting_point: entity.meeting_point || "",
        is_active: entity.is_active,
      })
    } else if (!entityId && open) {
      reset({
        name: "",
        type: EntityType.PESSOA,
        category: undefined,
        phone: "",
        email: "",
        contact_person: "",
        description: "",
        address: "",
        emergency_phone: "",
        meeting_point: "",
        is_active: true,
      })
    }
  }, [entity, entityId, open, reset])

  const onSubmit = async (data: EntityFormData) => {
    try {
      const formData = {
        ...data,
        email: data.email || undefined,
        phone: data.phone || undefined,
        contact_person: data.contact_person || undefined,
        description: data.description || undefined,
        address: data.address || undefined,
        emergency_phone: data.emergency_phone || undefined,
        meeting_point: data.meeting_point || undefined,
        category: data.category || undefined,
      }

      if (entityId) {
        await updateMutation.mutateAsync({ id: entityId, data: formData })
      } else {
        await createMutation.mutateAsync(formData)
      }
      onOpenChange(false)
    } catch (error) {
      console.error("Erro ao salvar entidade:", error)
    }
  }

  const isLoading = isLoadingEntity || createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {entityId ? "Editar Entidade" : "Nova Entidade"}
          </DialogTitle>
          <DialogDescription>
            {entityId
              ? "Atualize as informações da entidade"
              : "Cadastre uma nova entidade (pessoa, empresa, serviço ou infraestrutura)"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Nome da entidade"
            />
            {errors.name && (
              <p className="text-sm text-red-400">{errors.name.message}</p>
            )}
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipo *</Label>
            <Select
              value={watch("type")}
              onValueChange={(value) => {
                setValue("type", value as EntityType)
                setValue("category", undefined) // Reset category when type changes
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(EntityTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Categoria */}
          {CategoriesByType[selectedType] && CategoriesByType[selectedType].length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={watch("category") || undefined}
                onValueChange={(value) => setValue("category", value ? (value as EntityCategory) : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {CategoriesByType[selectedType].map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {EntityCategoryLabels[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Telefone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              {...register("phone")}
              placeholder="(00) 00000-0000"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="email@exemplo.com"
            />
            {errors.email && (
              <p className="text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>

          {/* Pessoa de Contato (para empresas) */}
          {selectedType === EntityType.EMPRESA && (
            <div className="space-y-2">
              <Label htmlFor="contact_person">Pessoa de Contato</Label>
              <Input
                id="contact_person"
                {...register("contact_person")}
                placeholder="Nome do contato"
              />
            </div>
          )}

          {/* Telefone de Emergência */}
          {selectedType === EntityType.SERVICO_EMERGENCIA && (
            <div className="space-y-2">
              <Label htmlFor="emergency_phone">Telefone de Emergência</Label>
              <Input
                id="emergency_phone"
                {...register("emergency_phone")}
                placeholder="193, 190, 192, etc."
              />
            </div>
          )}

          {/* Ponto de Encontro */}
          {(selectedType === EntityType.SERVICO_EMERGENCIA || selectedType === EntityType.EMPRESA) && (
            <div className="space-y-2">
              <Label htmlFor="meeting_point">Ponto de Encontro</Label>
              <Input
                id="meeting_point"
                {...register("meeting_point")}
                placeholder="Local de encontro em emergências"
              />
            </div>
          )}

          {/* Endereço */}
          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <Textarea
              id="address"
              {...register("address")}
              placeholder="Endereço completo"
              rows={2}
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Informações adicionais"
              rows={3}
            />
          </div>

          {/* Status Ativo */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_active"
              {...register("is_active")}
              className="rounded border-gray-600 bg-gray-800"
            />
            <Label htmlFor="is_active" className="cursor-pointer">
              Entidade ativa
            </Label>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin stroke-1" />
                  Salvando...
                </>
              ) : (
                entityId ? "Atualizar" : "Criar"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

