"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle, Clock, FileText, AlertCircle, XCircle, History, User, Loader2, GitBranch } from "lucide-react"
import { MermaidDiagram } from "@/components/processes/MermaidDiagram"
import { useProcess } from "@/lib/hooks/useProcesses"
import { useApproveProcess, useRejectProcess } from "@/lib/hooks/useApprovals"
import { ApprovalDialog } from "@/components/approvals/ApprovalDialog"
import { RejectionDialog } from "@/components/approvals/RejectionDialog"
import { processesData } from "@/data/processes" // Fallback

export default function ProcessDetailPage() {
  const params = useParams()
  const router = useRouter()
  const processId = params.id as string
  
  // Buscar processo da API
  const { data: process, isLoading, error } = useProcess(processId)
  const approveMutation = useApproveProcess()
  const rejectMutation = useRejectProcess()
  
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false)

  // Fallback para dados iniciais se API não disponível
  const initialProcess = processesData.find(p => p.id === parseInt(processId))
  const displayProcess = process || (initialProcess ? {
    id: initialProcess.id.toString(),
    name: initialProcess.name,
    category: initialProcess.category,
    status: initialProcess.status,
    document_type: initialProcess.documentType,
    description: initialProcess.description,
    workflow: initialProcess.workflow,
    entities: initialProcess.entities,
    variables: initialProcess.variables,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    current_version_number: 1,
    creator_id: "1",
    current_version: initialProcess.mermaid_diagram ? {
      id: "1",
      process_id: initialProcess.id.toString(),
      version_number: 1,
      content: {
        mermaid_diagram: initialProcess.mermaid_diagram,
      },
      status: initialProcess.status,
      created_by: "1",
      created_at: new Date().toISOString(),
    } : undefined,
  } : null)

  const handleApprove = async (comment?: string) => {
    if (!displayProcess || !process?.current_version?.id) return
    
    try {
      await approveMutation.mutateAsync({
        processId: displayProcess.id,
        versionId: process.current_version.id,
        data: { comments: comment },
      })
      setApprovalDialogOpen(false)
    } catch (error) {
      console.error("Erro ao aprovar:", error)
    }
  }

  const handleReject = async (reason: string) => {
    if (!displayProcess || !process?.current_version?.id) return
    
    try {
      await rejectMutation.mutateAsync({
        processId: displayProcess.id,
        versionId: process.current_version.id,
        data: { reason },
      })
      setRejectionDialogOpen(false)
    } catch (error) {
      console.error("Erro ao rejeitar:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-[73px] border-b border-border flex items-center px-6">
          <h1 className="text-lg font-semibold text-foreground">Carregando...</h1>
        </div>
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (!displayProcess) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-[73px] border-b border-border flex items-center px-6">
          <h1 className="text-lg font-light text-gray-200">Processo não encontrado</h1>
        </div>
        <div className="p-6">
          <Button onClick={() => router.push("/processes")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2 stroke-1" />
            Voltar para Processos
          </Button>
        </div>
      </div>
    )
  }

  const statusConfig = {
    aprovado: { icon: CheckCircle, color: "text-green-400", label: "Aprovado" },
    em_revisao: { icon: Clock, color: "text-yellow-400", label: "Em Revisão" },
    rascunho: { icon: FileText, color: "text-gray-400", label: "Rascunho" },
    rejeitado: { icon: AlertCircle, color: "text-red-400", label: "Rejeitado" },
  }
  const statusInfo = statusConfig[displayProcess.status as keyof typeof statusConfig] || statusConfig.aprovado
  const StatusIcon = statusInfo.icon

  return (
    <div className="min-h-screen bg-background">
      <div className="h-[73px] border-b border-border flex items-center px-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/processes")}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-lg font-light text-gray-200">
          {displayProcess.name}
        </h1>
      </div>
      <div className="p-3">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Header Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-muted">
                    <FileText className="h-6 w-6 text-foreground stroke-1" />
                  </div>
                  <div>
                    <CardTitle className="text-xl mb-2">{displayProcess.name}</CardTitle>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{displayProcess.category}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">{displayProcess.document_type}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusIcon className={`h-5 w-5 ${statusInfo.color} stroke-1`} />
                  <span className={`text-sm font-medium ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed">{displayProcess.description || "Sem descrição"}</p>
            </CardContent>
          </Card>

          {/* Mermaid Diagram Card */}
          {(process?.current_version?.content?.mermaid_diagram || displayProcess?.current_version?.content?.mermaid_diagram) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5 text-muted-foreground stroke-1" />
                  Diagrama do Processo
                </CardTitle>
                <CardDescription>Visualização do fluxo do processo em diagrama</CardDescription>
              </CardHeader>
              <CardContent>
                <MermaidDiagram
                  diagram={process?.current_version?.content?.mermaid_diagram || displayProcess?.current_version?.content?.mermaid_diagram || ""}
                  id={`process-${displayProcess.id}-diagram`}
                />
              </CardContent>
            </Card>
          )}

          {/* Workflow Card */}
          {displayProcess.workflow && displayProcess.workflow.length > 0 && (
            <Card className="bg-gray-800/50 border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-xl font-light text-gray-200">Fluxo do Processo</CardTitle>
                <CardDescription className="text-gray-400 font-light">Etapas sequenciais para execução deste processo</CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  {displayProcess.workflow.map((step, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="text-foreground pt-0.5">{step}</span>
                  </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}

          {/* Entities Card */}
          {displayProcess.entities && displayProcess.entities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Entidades Envolvidas</CardTitle>
                <CardDescription>Pessoas, sistemas ou infraestrutura que participam deste processo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {displayProcess.entities.map((entity, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 rounded-md bg-muted text-foreground text-sm border border-border"
                  >
                    {entity}
                  </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Variables Card */}
          {displayProcess.variables && displayProcess.variables.length > 0 && (
            <Card className="bg-gray-800/50 border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-xl font-light text-gray-200">Variáveis do Sistema</CardTitle>
                <CardDescription className="text-gray-400 font-light">Parâmetros configuráveis aplicados neste processo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {displayProcess.variables.map((variable, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 rounded-md bg-accent text-accent-foreground text-sm border border-border"
                  >
                    {variable}
                  </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* History Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-muted-foreground stroke-1" />
                Histórico de Versões
              </CardTitle>
              <CardDescription>Versões anteriores e histórico de alterações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Versão Atual */}
                <div className="flex items-start gap-4 p-4 rounded-lg border border-[#00ade8]/30 bg-[#00ade8]/5">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#00ade8] text-white flex items-center justify-center text-sm font-medium">
                    v1
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">
                        Versão Atual
                      </span>
                      <span className="text-xs px-2 py-1 rounded bg-[#00ade8]/20 text-[#00ade8] border border-[#00ade8]/30">
                        Atual
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Criada em {new Date().toLocaleDateString("pt-BR")}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="h-3 w-3 stroke-1" />
                      <span>Síndico</span>
                    </div>
                  </div>
                </div>

                {/* Versões Anteriores (Mock) */}
                {[1, 2].map((version) => (
                  <div key={version} className="flex items-start gap-4 p-4 rounded-lg border border-border bg-muted/30">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted text-foreground flex items-center justify-center text-sm font-medium">
                      v{version}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">
                          Versão {version}
                        </span>
                        <span className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20">
                          Aprovada
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        Criada em {new Date(Date.now() - version * 30 * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR")}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <User className="h-3 w-3 stroke-1" />
                        <span>Síndico</span>
                      </div>
                      {version === 2 && (
                        <p className="text-xs text-muted-foreground italic">
                          Correções baseadas em feedback: ajustes na descrição do fluxo
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Mensagem se não houver histórico */}
                <div className="text-center py-4 text-sm text-muted-foreground">
                  <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Esta é a primeira versão do processo</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions Card - Mostrar apenas se processo está em revisão ou rascunho */}
          {(displayProcess.status === "em_revisao" || displayProcess.status === "rascunho") && (
            <Card>
              <CardHeader>
                <CardTitle>Ações</CardTitle>
                <CardDescription>Revisar e aprovar ou rejeitar este processo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => setApprovalDialogOpen(true)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-2 stroke-1" />
                    Aprovar Processo
                  </Button>
                  <Button
                    onClick={() => setRejectionDialogOpen(true)}
                    variant="outline"
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                  >
                    <XCircle className="h-4 w-4 mr-2 stroke-1" />
                    Rejeitar Processo
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {displayProcess && (
        <>
          <ApprovalDialog
            open={approvalDialogOpen}
            onOpenChange={setApprovalDialogOpen}
            processName={displayProcess.name}
            onApprove={handleApprove}
          />
          <RejectionDialog
            open={rejectionDialogOpen}
            onOpenChange={setRejectionDialogOpen}
            processName={displayProcess.name}
            onReject={handleReject}
          />
        </>
      )}
    </div>
  )
}

