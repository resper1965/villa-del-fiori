"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCw, Database, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useRBAC } from "@/lib/hooks/useRBAC"

interface IngestionStatus {
  id: string
  process_id: string
  process_version_id: string
  status: "pending" | "processing" | "completed" | "failed"
  error_message?: string
  chunks_count: number
  started_at?: string
  completed_at?: string
  created_at: string
  process_name?: string
}

export default function KnowledgeBasePage() {
  const router = useRouter()
  const { canAccessDashboard } = useRBAC()
  const [ingestionStatuses, setIngestionStatuses] = useState<IngestionStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isIngesting, setIsIngesting] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    totalChunks: 0,
  })

  useEffect(() => {
    if (!canAccessDashboard()) {
      router.push("/auth/unauthorized")
      return
    }
    loadIngestionStatus()
  }, [canAccessDashboard, router])

  const loadIngestionStatus = async () => {
    try {
      setIsLoading(true)

      // Buscar status de ingestão com nome do processo
      const { data, error } = await supabase
        .from("knowledge_base_ingestion_status")
        .select(`
          *,
          processes:process_id (
            name
          )
        `)
        .order("created_at", { ascending: false })
        .limit(100)

      if (error) throw error

      // Buscar estatísticas de documentos
      const { count: totalChunks } = await supabase
        .from("knowledge_base_documents")
        .select("*", { count: "exact", head: true })

      const statuses = (data || []).map((item: any) => ({
        ...item,
        process_name: item.processes?.name || "Processo desconhecido",
      }))

      setIngestionStatuses(statuses)

      // Calcular estatísticas
      const stats = {
        total: statuses.length,
        pending: statuses.filter((s: IngestionStatus) => s.status === "pending").length,
        processing: statuses.filter((s: IngestionStatus) => s.status === "processing").length,
        completed: statuses.filter((s: IngestionStatus) => s.status === "completed").length,
        failed: statuses.filter((s: IngestionStatus) => s.status === "failed").length,
        totalChunks: totalChunks || 0,
      }

      setStats(stats)
    } catch (error) {
      console.error("Erro ao carregar status de ingestão:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const ingestPendingProcesses = async () => {
    try {
      setIsIngesting(true)

      // Buscar processos aprovados que ainda não foram ingeridos ou falharam
      const { data: processes, error: processesError } = await supabase
        .from("processes")
        .select("id, name, current_version_number, status")
        .eq("status", "aprovado")

      if (processesError) throw processesError

      if (!processes || processes.length === 0) {
        alert("Nenhum processo aprovado encontrado para ingerir.")
        return
      }

      let successCount = 0
      let errorCount = 0

      for (const process of processes) {
        try {
          // Buscar versão atual
          const { data: version, error: versionError } = await supabase
            .from("process_versions")
            .select("id")
            .eq("process_id", process.id)
            .eq("version_number", process.current_version_number)
            .single()

          if (versionError || !version) {
            console.error(`Versão não encontrada para processo ${process.name}`)
            errorCount++
            continue
          }

          // Chamar Edge Function para ingerir
          const { error: ingestError } = await supabase.functions.invoke("ingest-process", {
            body: {
              process_id: process.id,
              process_version_id: version.id,
            },
          })

          if (ingestError) {
            console.error(`Erro ao ingerir ${process.name}:`, ingestError)
            errorCount++
          } else {
            successCount++
          }

          // Pequeno delay para não sobrecarregar
          await new Promise((resolve) => setTimeout(resolve, 1000))
        } catch (error: any) {
          console.error(`Erro ao processar ${process.name}:`, error)
          errorCount++
        }
      }

      alert(
        `Ingestão concluída!\n✅ Sucesso: ${successCount}\n❌ Erros: ${errorCount}\n\nTotal: ${processes.length}`
      )

      // Recarregar status
      await loadIngestionStatus()
    } catch (error: any) {
      console.error("Erro ao ingerir processos:", error)
      alert(`Erro ao ingerir processos: ${error.message}`)
    } finally {
      setIsIngesting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      pending: { variant: "outline", label: "Pendente" },
      processing: { variant: "secondary", label: "Processando" },
      completed: { variant: "default", label: "Concluído" },
      failed: { variant: "destructive", label: "Falhou" },
    }

    const config = variants[status] || { variant: "outline" as const, label: status }

    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-success" />
      case "failed":
        return <XCircle className="h-4 w-4 text-destructive" />
      case "processing":
        return <Loader2 className="h-4 w-4 text-info animate-spin" />
      case "pending":
        return <Clock className="h-4 w-4 text-warning" />
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />
    }
  }

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-73px)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="px-4 md:px-6 py-4 md:py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Monitoramento e ingestão de processos na base de conhecimento
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadIngestionStatus}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button
            onClick={ingestPendingProcesses}
            disabled={isIngesting}
            className="bg-primary hover:bg-primary/90"
          >
            {isIngesting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Ingerindo...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Ingerir Processos
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Processos</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Concluídos</CardDescription>
            <CardTitle className="text-2xl text-success">{stats.completed}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pendentes</CardDescription>
            <CardTitle className="text-2xl text-warning">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Chunks</CardDescription>
            <CardTitle className="text-2xl">{stats.totalChunks}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Lista de Status */}
      <Card>
        <CardHeader>
          <CardTitle>Status de Ingestão</CardTitle>
          <CardDescription>
            Histórico de ingestão de processos na base de conhecimento
          </CardDescription>
        </CardHeader>
        <CardContent>
          {ingestionStatuses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum processo ingerido ainda.</p>
              <p className="text-sm mt-2">Clique em "Ingerir Processos" para começar.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {ingestionStatuses.map((status) => (
                <div
                  key={status.id}
                  className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-card/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {getStatusIcon(status.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{status.process_name}</p>
                        {getStatusBadge(status.status)}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        {status.chunks_count > 0 && (
                          <span>{status.chunks_count} chunks</span>
                        )}
                        {status.started_at && (
                          <span>
                            Iniciado: {new Date(status.started_at).toLocaleString("pt-BR")}
                          </span>
                        )}
                        {status.completed_at && (
                          <span>
                            Concluído: {new Date(status.completed_at).toLocaleString("pt-BR")}
                          </span>
                        )}
                      </div>
                      {status.error_message && (
                        <p className="text-xs text-destructive mt-1">{status.error_message}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

