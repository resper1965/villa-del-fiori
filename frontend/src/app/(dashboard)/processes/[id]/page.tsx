"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle, Clock, FileText, AlertCircle, XCircle, History, User } from "lucide-react"
import { processesData } from "@/data/processes"
import { ApprovalDialog } from "@/components/approvals/ApprovalDialog"
import { RejectionDialog } from "@/components/approvals/RejectionDialog"

export default function ProcessDetailPage() {
  const params = useParams()
  const router = useRouter()
  const processId = parseInt(params.id as string)
  const process = processesData.find(p => p.id === processId)
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false)

  const handleApprove = async (comment?: string) => {
    if (!process) return
    console.log("Aprovando processo:", process.id, "Comentário:", comment)
    alert(`Processo "${process.name}" aprovado com sucesso!`)
  }

  const handleReject = async (reason: string) => {
    if (!process) return
    console.log("Rejeitando processo:", process.id, "Motivo:", reason)
    alert(`Processo "${process.name}" rejeitado.\n\nMotivo: ${reason}`)
  }

  if (!process) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-[73px] border-b border-border flex items-center px-6">
          <h1 className="text-lg font-semibold text-foreground">Processo não encontrado</h1>
        </div>
        <div className="p-6">
          <Button onClick={() => router.push("/processes")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Processos
          </Button>
        </div>
      </div>
    )
  }

  const Icon = process.icon
  const statusConfig = {
    aprovado: { icon: CheckCircle, color: "text-green-400", label: "Aprovado" },
    em_revisao: { icon: Clock, color: "text-yellow-400", label: "Em Revisão" },
    rascunho: { icon: FileText, color: "text-gray-400", label: "Rascunho" },
    rejeitado: { icon: AlertCircle, color: "text-red-400", label: "Rejeitado" },
  }
  const statusInfo = statusConfig[process.status as keyof typeof statusConfig] || statusConfig.aprovado
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
        <h1 className="text-lg font-semibold text-foreground">
          {process.name}
        </h1>
      </div>
      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-muted">
                    <Icon className="h-6 w-6 text-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-xl mb-2">{process.name}</CardTitle>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{process.category}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">{process.documentType}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusIcon className={`h-5 w-5 ${statusInfo.color}`} />
                  <span className={`text-sm font-medium ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed">{process.description}</p>
            </CardContent>
          </Card>

          {/* Workflow Card */}
          <Card>
            <CardHeader>
              <CardTitle>Fluxo do Processo</CardTitle>
              <CardDescription>Etapas sequenciais para execução deste processo</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {process.workflow.map((step, index) => (
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

          {/* Entities Card */}
          <Card>
            <CardHeader>
              <CardTitle>Entidades Envolvidas</CardTitle>
              <CardDescription>Pessoas, sistemas ou infraestrutura que participam deste processo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {process.entities.map((entity, index) => (
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

          {/* Variables Card */}
          <Card>
            <CardHeader>
              <CardTitle>Variáveis do Sistema</CardTitle>
              <CardDescription>Parâmetros configuráveis aplicados neste processo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {process.variables.map((variable, index) => (
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

          {/* History Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-muted-foreground" />
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
                      <User className="h-3 w-3" />
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
                        <User className="h-3 w-3" />
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
          {(process.status === "em_revisao" || process.status === "rascunho") && (
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
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Aprovar Processo
                  </Button>
                  <Button
                    onClick={() => setRejectionDialogOpen(true)}
                    variant="outline"
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeitar Processo
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {process && (
        <>
          <ApprovalDialog
            open={approvalDialogOpen}
            onOpenChange={setApprovalDialogOpen}
            processName={process.name}
            onApprove={handleApprove}
          />
          <RejectionDialog
            open={rejectionDialogOpen}
            onOpenChange={setRejectionDialogOpen}
            processName={process.name}
            onReject={handleReject}
          />
        </>
      )}
    </div>
  )
}

