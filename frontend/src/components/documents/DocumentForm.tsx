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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"

const documentFormSchema = z.object({
  title: z.string().min(2, "Título deve ter pelo menos 2 caracteres"),
  content: z.string().min(10, "Conteúdo deve ter pelo menos 10 caracteres"),
  document_type: z.enum(["regulamento", "convencao", "ata", "assembleia", "edital", "comunicado", "outro"]),
  category: z.string().min(1, "Categoria é obrigatória"),
  description: z.string().optional(),
})

type DocumentFormValues = z.infer<typeof documentFormSchema>

interface DocumentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  documentId?: string | null
  onSuccess?: () => void
}

const DOCUMENT_TYPE_OPTIONS = [
  { value: "regulamento", label: "Regulamento" },
  { value: "convencao", label: "Convenção" },
  { value: "ata", label: "Ata" },
  { value: "assembleia", label: "Assembleia" },
  { value: "edital", label: "Edital" },
  { value: "comunicado", label: "Comunicado" },
  { value: "outro", label: "Outro" },
]

const CATEGORY_OPTIONS = [
  "Governança",
  "Acesso e Segurança",
  "Operação",
  "Áreas Comuns",
  "Convivência",
  "Eventos",
  "Emergências",
  "Financeiro",
  "Jurídico",
  "Outro",
]

export function DocumentForm({ open, onOpenChange, documentId, onSuccess }: DocumentFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()
  const isEditing = !!documentId

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      title: "",
      content: "",
      document_type: "outro",
      category: "",
      description: "",
    },
  })

  useEffect(() => {
    if (open && documentId) {
      loadDocumentData()
    } else if (open && !documentId) {
      form.reset()
    }
  }, [open, documentId])

  const loadDocumentData = async () => {
    if (!documentId) return

    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("id", documentId)
        .single()

      if (error) throw error

      form.reset({
        title: data.title || "",
        content: data.content || "",
        document_type: (data.document_type as any) || "outro",
        category: data.category || "",
        description: data.description || "",
      })
    } catch (err: any) {
      console.error("Erro ao carregar documento:", err)
      const errorMessage = err.message || "Erro ao carregar dados do documento"
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

  const onSubmit = async (values: DocumentFormValues) => {
    try {
      setIsLoading(true)
      setError(null)

      if (isEditing && documentId) {
        const { error } = await supabase
          .from("documents")
          .update({
            title: values.title,
            content: values.content,
            document_type: values.document_type,
            category: values.category,
            description: values.description || null,
            updated_at: new Date().toISOString(),
            // Resetar status de ingestão se conteúdo mudou
            ingestion_status: "pending",
            ingestion_error: null,
            chunks_count: 0,
            ingested_at: null,
          })
          .eq("id", documentId)

        if (error) throw error

        toast({
          variant: "success",
          title: "Documento atualizado",
          description: "O documento foi atualizado e será reindexado na base de conhecimento.",
        })
      } else {
        const { data: insertedData, error } = await supabase
          .from("documents")
          .insert({
            title: values.title,
            content: values.content,
            document_type: values.document_type,
            category: values.category,
            description: values.description || null,
            uploaded_by: user?.id || null,
            ingestion_status: "pending",
            mime_type: "text/plain",
          })
          .select()
          .single()

        if (error) throw error

        toast({
          variant: "success",
          title: "Documento criado",
          description: "O documento foi cadastrado e será indexado na base de conhecimento.",
        })

        // Trigger ingestão (chamada assíncrona, não bloqueia)
        if (insertedData?.id) {
          fetch("/api/ingest-document", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ document_id: insertedData.id }),
          }).catch((err) => console.error("Erro ao iniciar ingestão:", err))
        }
      }

      onSuccess?.()
      onOpenChange(false)
      form.reset()
    } catch (err: any) {
      console.error("Erro ao salvar documento:", err)
      const errorMessage = err.message || "Erro ao salvar documento"
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Documento" : "Novo Documento"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Edite as informações do documento. O documento será reindexado na base de conhecimento."
              : "Cadastre um novo documento. Ele será automaticamente indexado na base de conhecimento para o chat."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Regulamento Interno do Condomínio" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="document_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Documento *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DOCUMENT_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
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
                    <FormLabel>Categoria *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORY_OPTIONS.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      placeholder="Descrição opcional do documento..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Descrição breve do documento (opcional)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conteúdo *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Cole ou digite o conteúdo do documento aqui..."
                      className="min-h-[300px] font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    O conteúdo será dividido em chunks e indexado na base de conhecimento
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                {error}
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Atualizar" : "Cadastrar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

