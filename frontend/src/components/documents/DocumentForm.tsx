"use client"

import { useState, useEffect, useRef } from "react"
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
import { Loader2, Upload, FileText, X } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"

const documentFormSchema = z.object({
  title: z.string().min(2, "Título deve ter pelo menos 2 caracteres"),
  content: z.string().min(10, "Conteúdo deve ter pelo menos 10 caracteres").optional(),
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

const ACCEPTED_FILE_TYPES = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/msword": [".doc"],
  "text/plain": [".txt"],
  "text/markdown": [".md"],
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function DocumentForm({ open, onOpenChange, documentId, onSuccess }: DocumentFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [extractedContent, setExtractedContent] = useState<string>("")
  const [isExtracting, setIsExtracting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
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

  const content = form.watch("content")

  useEffect(() => {
    if (open && documentId) {
      loadDocumentData()
    } else if (open && !documentId) {
      form.reset()
      setUploadedFile(null)
      setExtractedContent("")
    }
  }, [open, documentId])

  useEffect(() => {
    if (extractedContent && !content) {
      form.setValue("content", extractedContent)
    }
  }, [extractedContent, content, form])

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

  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer

          if (file.type === "application/pdf") {
            // Para PDF, vamos usar uma API route que extrai o texto
            const formData = new FormData()
            formData.append("file", file)

            const response = await fetch("/api/extract-text", {
              method: "POST",
              body: formData,
            })

            if (!response.ok) {
              throw new Error("Erro ao extrair texto do PDF")
            }

            const data = await response.json()
            resolve(data.text || "")
          } else if (
            file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
            file.type === "application/msword"
          ) {
            // Para DOCX/DOC, também usar API route
            const formData = new FormData()
            formData.append("file", file)

            const response = await fetch("/api/extract-text", {
              method: "POST",
              body: formData,
            })

            if (!response.ok) {
              throw new Error("Erro ao extrair texto do documento")
            }

            const data = await response.json()
            resolve(data.text || "")
          } else if (file.type === "text/plain" || file.type === "text/markdown") {
            // Para TXT e MD, ler diretamente
            const text = new TextDecoder("utf-8").decode(arrayBuffer)
            resolve(text)
          } else {
            reject(new Error("Tipo de arquivo não suportado"))
          }
        } catch (err) {
          reject(err)
        }
      }

      reader.onerror = () => reject(new Error("Erro ao ler arquivo"))
      reader.readAsArrayBuffer(file)
    })
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo
    if (!Object.keys(ACCEPTED_FILE_TYPES).includes(file.type) && !file.name.match(/\.(pdf|docx|doc|txt|md)$/i)) {
      toast({
        variant: "destructive",
        title: "Tipo de arquivo inválido",
        description: "Apenas PDF, DOCX, DOC, TXT e MD são suportados.",
      })
      return
    }

    // Validar tamanho
    if (file.size > MAX_FILE_SIZE) {
      toast({
        variant: "destructive",
        title: "Arquivo muito grande",
        description: `O arquivo deve ter no máximo ${MAX_FILE_SIZE / 1024 / 1024}MB.`,
      })
      return
    }

    setUploadedFile(file)
    setIsExtracting(true)

    try {
      // Se o título estiver vazio, usar o nome do arquivo
      if (!form.getValues("title")) {
        const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "")
        form.setValue("title", fileNameWithoutExt)
      }

      // Extrair conteúdo
      const text = await extractTextFromFile(file)
      setExtractedContent(text)
      form.setValue("content", text)

      toast({
        variant: "success",
        title: "Arquivo processado",
        description: `Conteúdo extraído com sucesso (${text.length} caracteres).`,
      })
    } catch (err: any) {
      console.error("Erro ao extrair texto:", err)
      toast({
        variant: "destructive",
        title: "Erro ao processar arquivo",
        description: err.message || "Não foi possível extrair o conteúdo do arquivo.",
      })
      setUploadedFile(null)
      setExtractedContent("")
    } finally {
      setIsExtracting(false)
    }
  }

  const handleRemoveFile = () => {
    setUploadedFile(null)
    setExtractedContent("")
    form.setValue("content", "")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const onSubmit = async (values: DocumentFormValues) => {
    try {
      setIsLoading(true)
      setError(null)

      // Validar que há conteúdo (de arquivo ou manual)
      const finalContent = values.content || extractedContent
      if (!finalContent || finalContent.trim().length < 10) {
        throw new Error("Conteúdo é obrigatório. Faça upload de um arquivo ou digite o conteúdo.")
      }

      let filePath: string | null = null
      let fileSize: number | null = null
      let mimeType: string = "text/plain"

      // Se houver arquivo, fazer upload para Storage
      if (uploadedFile) {
        try {
          const fileExt = uploadedFile.name.split(".").pop()
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
          const filePathStorage = `documents/${user?.id || "anonymous"}/${fileName}`

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("documents")
            .upload(filePathStorage, uploadedFile, {
              cacheControl: "3600",
              upsert: false,
            })

          if (uploadError) throw uploadError

          filePath = filePathStorage
          fileSize = uploadedFile.size
          mimeType = uploadedFile.type
        } catch (uploadErr: any) {
          console.error("Erro ao fazer upload:", uploadErr)
          // Continuar mesmo se o upload falhar, salvar apenas o conteúdo extraído
          toast({
            variant: "default",
            title: "Aviso",
            description: "Arquivo não foi salvo, mas o conteúdo extraído será salvo.",
          })
        }
      }

      if (isEditing && documentId) {
        const { error } = await supabase
          .from("documents")
          .update({
            title: values.title,
            content: finalContent,
            document_type: values.document_type,
            category: values.category,
            description: values.description || null,
            file_path: filePath,
            file_size: fileSize,
            mime_type: mimeType,
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

        // Trigger re-ingestão (chamada assíncrona, não bloqueia)
        try {
          fetch("/api/ingest-document", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ document_id: documentId }),
          }).catch((err) => console.error("Erro ao iniciar re-ingestão:", err))
        } catch (err) {
          console.error("Erro ao iniciar re-ingestão:", err)
        }
      } else {
        const { data: insertedData, error } = await supabase
          .from("documents")
          .insert({
            title: values.title,
            content: finalContent,
            document_type: values.document_type,
            category: values.category,
            description: values.description || null,
            uploaded_by: user?.id || null,
            file_path: filePath,
            file_size: fileSize,
            mime_type: mimeType,
            ingestion_status: "pending",
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
      setUploadedFile(null)
      setExtractedContent("")
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
              : "Cadastre um novo documento. Você pode fazer upload de um arquivo (PDF, DOCX, TXT) ou digitar o conteúdo manualmente."}
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

            {/* Upload de Arquivo */}
            <div className="space-y-2">
              <FormLabel>Arquivo (Opcional)</FormLabel>
              <div className="flex items-center gap-4">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc,.txt,.md"
                  onChange={handleFileSelect}
                  disabled={isExtracting || isLoading}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="flex items-center gap-2 px-4 py-2 border border-border rounded-md cursor-pointer hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processando...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      <span>Fazer Upload</span>
                    </>
                  )}
                </label>
                {uploadedFile && (
                  <div className="flex items-center gap-2 flex-1">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground flex-1 truncate">{uploadedFile.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {(uploadedFile.size / 1024).toFixed(1)} KB
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={handleRemoveFile}
                      disabled={isExtracting || isLoading}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
              <FormDescription>
                Suporta PDF, DOCX, DOC, TXT e MD (máx. 10MB). O conteúdo será extraído automaticamente.
              </FormDescription>
            </div>

            {/* Conteúdo (pode ser editado após extração) */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conteúdo *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Cole ou digite o conteúdo do documento aqui, ou faça upload de um arquivo para extração automática..."
                      className="min-h-[300px] font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    O conteúdo será dividido em chunks e indexado na base de conhecimento. Você pode editar o
                    conteúdo extraído de arquivos.
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
              <Button type="submit" disabled={isLoading || isExtracting}>
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
