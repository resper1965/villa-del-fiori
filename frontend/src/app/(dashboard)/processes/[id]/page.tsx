"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle, Clock, FileText, AlertCircle, XCircle, History, User, Loader2, GitBranch } from "lucide-react"
import { MermaidDiagram } from "@/components/processes/MermaidDiagram"
import { RACIMatrix } from "@/components/processes/RACIMatrix"
import { useProcess } from "@/lib/hooks/useProcesses"
import { useApproveProcess, useRejectProcess } from "@/lib/hooks/useApprovals"
import { ApprovalDialog } from "@/components/approvals/ApprovalDialog"
import { RejectionDialog } from "@/components/approvals/RejectionDialog"

export default function ProcessDetailPage() {
  const params = useParams()
  const router = useRouter()
  const processId = params.id as string
  
  // Buscar processo da API (sem fallback mock)
  const { data: process, isLoading, error } = useProcess(processId)
  const approveMutation = useApproveProcess()
  const rejectMutation = useRejectProcess()
  
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false)

  const displayProcess = process

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
        <div className="h-[73px] border-b border-border flex items-center px-4">
          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="px-1 sm:px-2 md:px-3 py-2">
          <div className="w-full space-y-2">
            <Card>
              <CardHeader>
                <div className="h-6 w-3/4 bg-muted animate-pulse rounded mb-2" />
                <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-4 w-full bg-muted animate-pulse rounded mb-2" />
                <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="h-5 w-1/3 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!displayProcess) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-[73px] border-b border-border flex items-center px-4">
          <h1 className="text-lg font-light text-gray-200">Processo não encontrado</h1>
        </div>
        <div className="p-2">
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

  // Versão do processo
  const processVersion = displayProcess?.current_version_number || 1

  return (
    <div className="min-h-screen bg-background">
      <div className="h-[73px] border-b border-border flex items-center px-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/processes")}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[#00ade8] bg-[#00ade8]/10 px-2 py-1 rounded">
            v{processVersion}
          </span>
          <h1 className="text-lg font-light text-gray-200">
            {displayProcess.name}
          </h1>
        </div>
      </div>
      <div className="px-1 sm:px-2 md:px-3 py-2">
        <div className="w-full space-y-2">
          {/* Header Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="p-2 rounded-lg bg-muted flex-shrink-0">
                    <FileText className="h-5 w-5 text-foreground stroke-1" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base sm:text-lg mb-1 break-words">{displayProcess.name}</CardTitle>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm text-muted-foreground">{displayProcess.category}</span>
                      <span className="text-muted-foreground hidden sm:inline">•</span>
                      <span className="text-xs sm:text-sm text-muted-foreground">{displayProcess.document_type}</span>
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

          {/* Mermaid Diagram Card - Sempre mostrar se houver diagrama */}
          {(() => {
            const diagram = process?.current_version?.content?.mermaid_diagram || "";
            return diagram ? (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <GitBranch className="h-4 w-4 text-muted-foreground stroke-1" />
                    Diagrama do Processo
                  </CardTitle>
                  <CardDescription className="text-xs">Visualização do fluxo do processo em diagrama</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <MermaidDiagram
                    diagram={diagram}
                    id={`process-${displayProcess.id}-diagram`}
                  />
                </CardContent>
              </Card>
            ) : null;
          })()}

          {/* Workflow Card */}
          {displayProcess.workflow && displayProcess.workflow.length > 0 && (
            <Card className="bg-gray-800/50 border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-xl font-light text-gray-200">Fluxo do Processo</CardTitle>
                <CardDescription className="text-gray-400 font-light">Etapas sequenciais para execução deste processo</CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {displayProcess.workflow.map((step, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="text-sm text-foreground pt-0.5">{step}</span>
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
                <div className="flex flex-wrap gap-1.5">
                  {displayProcess.entities.map((entity, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 rounded-md bg-muted text-foreground text-xs border border-border"
                  >
                    {entity}
                  </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* RACI Matrix Card */}
          {displayProcess.raci && displayProcess.raci.length > 0 && (
            <RACIMatrix raci={displayProcess.raci} entities={displayProcess.entities || []} />
          )}

          {/* Variables Card */}
          {displayProcess.variables && displayProcess.variables.length > 0 && (
            <Card className="bg-gray-800/50 border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-xl font-light text-gray-200">Variáveis do Sistema</CardTitle>
                <CardDescription className="text-gray-400 font-light">Parâmetros configuráveis aplicados neste processo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {displayProcess.variables.map((variable, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 rounded-md bg-accent text-accent-foreground text-xs border border-border"
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
              <div className="space-y-2">
                {/* Versão Atual */}
                <div className="flex items-start gap-2 p-2 rounded-lg border border-[#00ade8]/30 bg-[#00ade8]/5">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#00ade8] text-white flex items-center justify-center text-xs font-medium">
                    v{displayProcess.current_version_number || 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-foreground">
                        Versão {displayProcess.current_version_number || 1} - {statusInfo.label}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        displayProcess.status === "aprovado" 
                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                          : displayProcess.status === "em_revisao"
                          ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                          : displayProcess.status === "rejeitado"
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : "bg-[#00ade8]/20 text-[#00ade8] border border-[#00ade8]/30"
                      }`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Criada em {new Date(displayProcess.created_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric"
                      })}
                    </p>
                    {displayProcess.current_version?.change_summary && (
                      <p className="text-xs text-muted-foreground italic mt-1">
                        {displayProcess.current_version.change_summary}
                      </p>
                    )}
                  </div>
                </div>

                {/* Mensagem se não houver histórico de aprovações */}
                {displayProcess.status === "rascunho" && (
                  <div className="text-center py-3 text-xs text-muted-foreground">
                    <History className="h-6 w-6 mx-auto mb-1 opacity-50 stroke-1" />
                    <p>Processo em rascunho - aguardando revisão e aprovação</p>
                  </div>
                )}
                {displayProcess.status === "em_revisao" && (
                  <div className="text-center py-3 text-xs text-muted-foreground">
                    <Clock className="h-6 w-6 mx-auto mb-1 opacity-50 stroke-1" />
                    <p>Processo em revisão pelo conselho consultivo</p>
                  </div>
                )}
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

