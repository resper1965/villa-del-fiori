"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, FileUp, Loader2, FileText, CheckCircle, XCircle, Clock, Edit } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { DocumentForm } from "@/components/documents/DocumentForm"

interface Document {
  id: string
  title: string
  content: string
  category: string
  document_type: string
  description?: string
  file_path?: string
  file_size?: number
  mime_type?: string
  ingestion_status: string
  ingestion_error?: string
  chunks_count?: number
  ingested_at?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  regulamento: "Regulamento",
  convencao: "Convenção",
  ata: "Ata",
  assembleia: "Assembleia",
  edital: "Edital",
  comunicado: "Comunicado",
  outro: "Outro",
}

const INGESTION_STATUS_LABELS: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  pending: { label: "Pendente", icon: Clock, color: "text-yellow-500" },
  processing: { label: "Processando", icon: Loader2, color: "text-blue-500" },
  completed: { label: "Indexado", icon: CheckCircle, color: "text-green-500" },
  failed: { label: "Erro", icon: XCircle, color: "text-red-500" },
}

export default function DocumentsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [formOpen, setFormOpen] = useState(false)
  const [editingDocumentId, setEditingDocumentId] = useState<string | null>(null)

  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ["documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("documents")
        .update({ is_active: false })
        .eq("id", id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] })
      toast({
        variant: "success",
        title: "Documento removido",
        description: "O documento foi removido com sucesso.",
      })
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error?.message || "Erro ao remover documento.",
      })
    },
  })

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja remover este documento?")) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const handleEdit = (id: string) => {
    setEditingDocumentId(id)
    setFormOpen(true)
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setEditingDocumentId(null)
  }

  const handleFormSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["documents"] })
    handleFormClose()
  }

  const pendingCount = documents.filter((d) => d.ingestion_status === "pending").length
  const processingCount = documents.filter((d) => d.ingestion_status === "processing").length
  const completedCount = documents.filter((d) => d.ingestion_status === "completed").length
  const failedCount = documents.filter((d) => d.ingestion_status === "failed").length

  return (
    <div className="px-4 md:px-6 py-4 md:py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Documentos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie regulamentos, convenções, atas, assembleias e outros documentos. Eles serão indexados na base de conhecimento.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2 stroke-1" />
          Novo Documento
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
            <p className="text-xs text-muted-foreground">Documentos cadastrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Indexados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
            <p className="text-xs text-muted-foreground">Na base de conhecimento</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Aguardando indexação</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Com Erro</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failedCount}</div>
            <p className="text-xs text-muted-foreground">Falha na indexação</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Documentos */}
      {isLoading ? (
        <Card>
          <CardContent className="py-12">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      ) : documents.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={FileUp}
              title="Nenhum documento cadastrado"
              description="Cadastre regulamentos, convenções, atas, assembleias e outros documentos. Eles serão automaticamente indexados na base de conhecimento para o chat."
              action={
                <Button onClick={() => setFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2 stroke-1" />
                  Cadastrar Primeiro Documento
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Lista de Documentos</CardTitle>
            <CardDescription>
              Visualize e gerencie todos os documentos cadastrados. Documentos indexados aparecem na base de conhecimento.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documents.map((doc) => {
                const StatusIcon = INGESTION_STATUS_LABELS[doc.ingestion_status]?.icon || Clock
                const statusColor = INGESTION_STATUS_LABELS[doc.ingestion_status]?.color || "text-muted-foreground"
                const statusLabel = INGESTION_STATUS_LABELS[doc.ingestion_status]?.label || "Desconhecido"

                return (
                  <div
                    key={doc.id}
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <h3 className="font-semibold">{doc.title}</h3>
                        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                          {DOCUMENT_TYPE_LABELS[doc.document_type] || doc.document_type}
                        </span>
                      </div>
                      {doc.description && (
                        <p className="text-sm text-muted-foreground mb-2">{doc.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Categoria: {doc.category}</span>
                        {doc.chunks_count !== undefined && doc.chunks_count > 0 && (
                          <span>Chunks: {doc.chunks_count}</span>
                        )}
                        <div className="flex items-center gap-1">
                          <StatusIcon className={`h-3 w-3 ${statusColor} ${doc.ingestion_status === "processing" ? "animate-spin" : ""}`} />
                          <span className={statusColor}>{statusLabel}</span>
                        </div>
                        {doc.ingested_at && (
                          <span>Indexado em: {new Date(doc.ingested_at).toLocaleDateString("pt-BR")}</span>
                        )}
                      </div>
                      {doc.ingestion_error && (
                        <p className="text-xs text-red-500 mt-2">Erro: {doc.ingestion_error}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(doc.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <XCircle className="h-4 w-4 stroke-1" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <DocumentForm
        open={formOpen}
        onOpenChange={handleFormClose}
        documentId={editingDocumentId}
        onSuccess={handleFormSuccess}
      />
    </div>
  )
}

