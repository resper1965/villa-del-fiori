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
import { Loader2, Plus, X, Sparkles } from "lucide-react"
import { Process } from "@/types"
import { EntityValidation } from "@/components/validation/EntityValidation"
import { generateMermaidDiagram } from "@/lib/api/mermaid"
import { useToast } from "@/hooks/use-toast"

const processSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  category: z.enum([
    "governanca",
    "acesso_seguranca",
    "operacao",
    "areas_comuns",
    "convivencia",
    "eventos",
    "emergencias",
  ]),
  subcategory: z.string().optional(),
  document_type: z.enum([
    "pop",
    "manual",
    "regulamento",
    "fluxograma",
    "aviso",
    "comunicado",
    "checklist",
    "formulario",
    "politica",
  ]),
  description: z.string().optional(),
  workflow: z.array(z.string()).optional(),
  entities: z.array(z.string()).optional(),
  variables: z.array(z.string()).optional(),
  mermaid_diagram: z.string().optional(),
})

type ProcessFormData = z.infer<typeof processSchema>

interface ProcessFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  process?: Process
  initialData?: Partial<ProcessFormData>
  onSubmit: (data: ProcessFormData) => Promise<void>
}

const categoryMap: Record<string, string> = {
  governanca: "Governança",
  acesso_seguranca: "Acesso e Segurança",
  operacao: "Operação",
  areas_comuns: "Áreas Comuns",
  convivencia: "Convivência",
  eventos: "Eventos",
  emergencias: "Emergências",
}

const documentTypeMap: Record<string, string> = {
  pop: "POP",
  manual: "Manual",
  regulamento: "Regulamento",
  fluxograma: "Fluxograma",
  aviso: "Aviso",
  comunicado: "Comunicado",
  checklist: "Checklist",
  formulario: "Formulário",
  politica: "Política",
}

export function ProcessForm({ open, onOpenChange, process, initialData, onSubmit }: ProcessFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGeneratingMermaid, setIsGeneratingMermaid] = useState(false)
  const { toast } = useToast()
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ProcessFormData>({
    resolver: zodResolver(processSchema),
    defaultValues: {
      name: "",
      category: "governanca",
      document_type: "pop",
      description: "",
      workflow: [],
      entities: [],
      variables: [],
      mermaid_diagram: "",
    },
  })

  const category = watch("category")
  const documentType = watch("document_type")
  const entities = watch("entities") || []
  const workflow = watch("workflow") || []
  const processName = watch("name")
  const description = watch("description")
  const [isEntitiesValid, setIsEntitiesValid] = useState(true)

  useEffect(() => {
    if (process && open) {
      reset({
        name: process.name,
        category: process.category as any,
        subcategory: process.subcategory,
        document_type: process.document_type as any,
        description: process.description,
        workflow: process.workflow || [],
        entities: process.entities || [],
        variables: process.variables || [],
        mermaid_diagram: (process as any).mermaid_diagram || "",
      })
    } else if (initialData && open) {
      reset({
        name: initialData.name || "",
        category: initialData.category || "governanca",
        subcategory: initialData.subcategory,
        document_type: initialData.document_type || "pop",
        description: initialData.description || "",
        workflow: initialData.workflow || [],
        entities: initialData.entities || [],
        variables: initialData.variables || [],
        mermaid_diagram: initialData.mermaid_diagram || "",
      })
    } else if (open) {
      reset({
        name: "",
        category: "governanca",
        document_type: "pop",
        description: "",
        workflow: [],
        entities: [],
        variables: [],
        mermaid_diagram: "",
      })
    }
  }, [process, initialData, open, reset])

  const onFormSubmit = async (data: ProcessFormData) => {
    // Validar entidades antes de submeter
    if (!isEntitiesValid) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(data)
      toast({
        variant: "success",
        title: process ? "Processo atualizado" : "Processo criado",
        description: process
          ? "O processo foi atualizado com sucesso."
          : "O processo foi criado com sucesso.",
      })
      onOpenChange(false)
      reset()
    } catch (error: any) {
      console.error("Erro ao salvar processo:", error)
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: error?.message || "Ocorreu um erro ao salvar o processo. Tente novamente.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const addEntity = () => {
    const newEntity = prompt("Digite o nome da entidade:")
    if (newEntity && newEntity.trim()) {
      const currentEntities = entities || []
      if (!currentEntities.includes(newEntity.trim())) {
        setValue("entities", [...currentEntities, newEntity.trim()])
      }
    }
  }

  const removeEntity = (index: number) => {
    const currentEntities = entities || []
    setValue("entities", currentEntities.filter((_, i) => i !== index))
  }

  const handleGenerateMermaid = async () => {
    if (!workflow || workflow.length === 0) {
      alert("Adicione pelo menos um passo no workflow antes de gerar o diagrama")
      return
    }

    setIsGeneratingMermaid(true)
    try {
      const mermaidCode = await generateMermaidDiagram({
        workflow,
        process_name: processName,
        entities,
        description,
      })
      setValue("mermaid_diagram", mermaidCode)
    } catch (error: any) {
      console.error("Erro ao gerar diagrama Mermaid:", error)
      alert(error.message || "Erro ao gerar diagrama Mermaid. Tente novamente.")
    } finally {
      setIsGeneratingMermaid(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{process ? "Editar Processo" : "Novo Processo"}</DialogTitle>
          <DialogDescription>
            {process
              ? "Atualize as informações do processo"
              : "Preencha os dados para criar um novo processo"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Nome do Processo <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Ex: Definição e Revisão de Processos"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">
                Categoria <span className="text-destructive">*</span>
              </Label>
              <Select
                value={category}
                onValueChange={(value) => setValue("category", value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryMap).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="document_type">
                Tipo de Documento <span className="text-destructive">*</span>
              </Label>
              <Select
                value={documentType}
                onValueChange={(value) => setValue("document_type", value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(documentTypeMap).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.document_type && (
                <p className="text-sm text-destructive">{errors.document_type.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subcategory">Subcategoria (opcional)</Label>
            <Input
              id="subcategory"
              {...register("subcategory")}
              placeholder="Ex: Gestão de Documentos"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Descreva o processo..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="entities">Entidades Envolvidas</Label>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {entities.map((entity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 px-2 py-1 bg-card rounded-md text-sm"
                  >
                    <span>{entity}</span>
                    <button
                      type="button"
                      onClick={() => removeEntity(index)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addEntity}
                  className="h-8"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Adicionar
                </Button>
              </div>
              {entities.length > 0 && (
                <EntityValidation
                  entityNames={entities}
                  onValidationChange={setIsEntitiesValid}
                  showQuickCreate={true}
                />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="mermaid_diagram">Diagrama Mermaid</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateMermaid}
                disabled={isGeneratingMermaid || !workflow || workflow.length === 0}
                className="text-xs"
              >
                {isGeneratingMermaid ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1.5 animate-spin stroke-1" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3 mr-1.5 stroke-1" />
                    Gerar Automaticamente
                  </>
                )}
              </Button>
            </div>
            <Textarea
              id="mermaid_diagram"
              {...register("mermaid_diagram")}
              placeholder={`Exemplo de diagrama de fluxo:
flowchart TD
    A[Início] --> B{Decisão}
    B -->|Sim| C[Ação 1]
    B -->|Não| D[Ação 2]
    C --> E[Fim]
    D --> E

Ou clique em "Gerar Automaticamente" para criar a partir do workflow.`}
              rows={8}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              {workflow && workflow.length > 0 ? (
                <>
                  Clique em "Gerar Automaticamente" para criar o diagrama a partir do workflow, ou{" "}
                  <a
                    href="https://mermaid.js.org/intro/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    edite manualmente
                  </a>
                  .
                </>
              ) : (
                <>
                  Adicione passos no workflow e clique em "Gerar Automaticamente", ou{" "}
                  <a
                    href="https://mermaid.js.org/intro/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    crie manualmente
                  </a>
                  .
                </>
              )}
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !isEntitiesValid}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                process ? "Atualizar" : "Criar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

