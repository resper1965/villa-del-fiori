"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react"
import { useValidateEntities } from "@/lib/hooks/useValidation"
import { ValidationResult } from "@/lib/api/validation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useCreateEntity } from "@/lib/hooks/useEntities"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EntityType } from "@/types/entity"

const quickEntitySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  type: z.nativeEnum(EntityType).default(EntityType.SERVICO_PUBLICO),
  phone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
})

interface EntityValidationProps {
  entityNames: string[]
  onValidationChange?: (isValid: boolean) => void
  showQuickCreate?: boolean
}

export function EntityValidation({
  entityNames,
  onValidationChange,
  showQuickCreate = true,
}: EntityValidationProps) {
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([])
  const [isValidating, setIsValidating] = useState(false)
  const [quickCreateEntity, setQuickCreateEntity] = useState<string | null>(null)
  const validateEntities = useValidateEntities()

  useEffect(() => {
    if (entityNames.length === 0) {
      setValidationResults([])
      onValidationChange?.(true)
      return
    }

    const validate = async () => {
      setIsValidating(true)
      try {
        const response = await validateEntities.mutateAsync(entityNames)
        setValidationResults(response.results)
        const isValid = response.valid
        onValidationChange?.(isValid)
      } catch (error) {
        console.error("Erro ao validar entidades:", error)
        // Em caso de erro, considerar como válido para não bloquear o formulário
        onValidationChange?.(true)
      } finally {
        setIsValidating(false)
      }
    }

    // Debounce de 500ms
    const timeoutId = setTimeout(validate, 500)
    return () => clearTimeout(timeoutId)
  }, [entityNames.join(",")])

  if (entityNames.length === 0) {
    return null
  }

  const missingEntities = validationResults.filter((r) => !r.exists)
  const incompleteEntities = validationResults.filter((r) => r.exists && !r.is_complete)
  const validEntities = validationResults.filter((r) => r.exists && r.is_complete)

  const hasErrors = missingEntities.length > 0 || incompleteEntities.length > 0

  if (isValidating) {
    return (
      <Alert>
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertTitle>Validando entidades...</AlertTitle>
        <AlertDescription>Verificando se todas as entidades existem e estão completas.</AlertDescription>
      </Alert>
    )
  }

  if (!hasErrors && validEntities.length > 0) {
    return (
      <Alert className="border-green-500/50 bg-success/10">
        <CheckCircle2 className="h-4 w-4 text-success" />
        <AlertTitle className="text-success">Todas as entidades são válidas</AlertTitle>
        <AlertDescription>
          {validEntities.length} entidade(s) validada(s) com sucesso.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-3">
      {missingEntities.length > 0 && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Entidades não encontradas</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>As seguintes entidades não existem no cadastro:</p>
            <div className="flex flex-wrap gap-2">
              {missingEntities.map((result) => (
                <div key={result.entity_name} className="flex items-center gap-2">
                  <Badge variant="destructive">{result.entity_name}</Badge>
                  {showQuickCreate && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setQuickCreateEntity(result.entity_name)}
                    >
                      Criar
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {incompleteEntities.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Entidades incompletas</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>As seguintes entidades existem mas estão incompletas:</p>
            <div className="space-y-2">
              {incompleteEntities.map((result) => (
                <div key={result.entity_name} className="flex items-start gap-2">
                  <Badge variant="outline">{result.entity_name}</Badge>
                  <div className="text-sm text-muted-foreground">
                    Campos faltando: {result.missing_fields.join(", ")}
                  </div>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Modal de criação rápida de entidade */}
      {quickCreateEntity && (
        <QuickEntityCreateModal
          entityName={quickCreateEntity}
          open={!!quickCreateEntity}
          onOpenChange={(open) => !open && setQuickCreateEntity(null)}
          onSuccess={() => {
            setQuickCreateEntity(null)
            setTimeout(() => {
              validateEntities.mutate(entityNames)
            }, 1000)
          }}
        />
      )}
    </div>
  )
}

type QuickEntityFormData = z.infer<typeof quickEntitySchema>

interface QuickEntityCreateModalProps {
  entityName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

function QuickEntityCreateModal({
  entityName,
  open,
  onOpenChange,
  onSuccess,
}: QuickEntityCreateModalProps) {
  const createEntity = useCreateEntity()
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<QuickEntityFormData>({
    resolver: zodResolver(quickEntitySchema),
    defaultValues: {
      name: entityName,
      type: EntityType.SERVICO_PUBLICO,
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        name: entityName,
        type: EntityType.SERVICO_PUBLICO,
        phone: "",
        email: "",
      })
    }
  }, [open, entityName, reset])

  const onSubmit = async (data: QuickEntityFormData) => {
    try {
      await createEntity.mutateAsync({
        name: data.name,
        type: data.type,
        phone: data.phone || undefined,
        email: data.email || undefined,
        is_active: true,
      })
      onSuccess()
    } catch (error) {
      console.error("Erro ao criar entidade:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Entidade: {entityName}</DialogTitle>
          <DialogDescription>
            Preencha os dados básicos para criar a entidade rapidamente.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" {...register("phone")} placeholder="(00) 00000-0000" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} placeholder="email@exemplo.com" />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createEntity.isPending}>
              {createEntity.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

