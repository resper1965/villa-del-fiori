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
import { Loader2 } from "lucide-react"
import { Process } from "@/types"

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
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      onOpenChange(false)
      reset()
    } catch (error) {
      console.error("Erro ao salvar processo:", error)
    } finally {
      setIsSubmitting(false)
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
              Nome do Processo <span className="text-red-400">*</span>
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Ex: Definição e Revisão de Processos"
            />
            {errors.name && (
              <p className="text-sm text-red-400">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">
                Categoria <span className="text-red-400">*</span>
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
                <p className="text-sm text-red-400">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="document_type">
                Tipo de Documento <span className="text-red-400">*</span>
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
                <p className="text-sm text-red-400">{errors.document_type.message}</p>
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
            <Label htmlFor="mermaid_diagram">Diagrama Mermaid</Label>
            <Textarea
              id="mermaid_diagram"
              {...register("mermaid_diagram")}
              placeholder={`Exemplo de diagrama de fluxo:
flowchart TD
    A[Início] --> B{Decisão}
    B -->|Sim| C[Ação 1]
    B -->|Não| D[Ação 2]
    C --> E[Fim]
    D --> E`}
              rows={8}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Use a sintaxe Mermaid para criar diagramas de fluxo, sequência, etc.
              <a
                href="https://mermaid.js.org/intro/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00ade8] hover:underline ml-1"
              >
                Documentação Mermaid
              </a>
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
            <Button type="submit" disabled={isSubmitting}>
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

