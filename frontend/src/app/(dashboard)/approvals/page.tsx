"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle, XCircle, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import { processesData } from "@/data/processes"
import { ApprovalDialog } from "@/components/approvals/ApprovalDialog"
import { RejectionDialog } from "@/components/approvals/RejectionDialog"

// Simulando processos pendentes de aprovação
const pendingProcesses = processesData
  .filter(p => p.status === "em_revisao" || p.status === "rascunho")
  .slice(0, 5)
  .map(p => ({
    ...p,
    submittedBy: "Síndico",
    submittedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    priority: Math.random() > 0.7 ? "alta" : "normal",
  }))

export default function ApprovalsPage() {
  const router = useRouter()
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false)
  const [selectedProcess, setSelectedProcess] = useState<typeof pendingProcesses[0] | null>(null)

  const handleApproveClick = (process: typeof pendingProcesses[0]) => {
    setSelectedProcess(process)
    setApprovalDialogOpen(true)
  }

  const handleRejectClick = (process: typeof pendingProcesses[0]) => {
    setSelectedProcess(process)
    setRejectionDialogOpen(true)
  }

  const handleApprove = async (comment?: string) => {
    if (!selectedProcess) return
    
    // TODO: Integrar com API
    console.log("Aprovando processo:", selectedProcess.id, "Comentário:", comment)
    
    // Simular atualização
    alert(`Processo "${selectedProcess.name}" aprovado com sucesso!`)
  }

  const handleReject = async (reason: string) => {
    if (!selectedProcess) return
    
    // TODO: Integrar com API
    console.log("Rejeitando processo:", selectedProcess.id, "Motivo:", reason)
    
    // Simular atualização
    alert(`Processo "${selectedProcess.name}" rejeitado.\n\nMotivo: ${reason}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="h-[73px] border-b border-border flex items-center px-6">
        <h1 className="text-lg font-semibold text-foreground">
          Aprovações
        </h1>
      </div>
      <div className="p-6">
        {pendingProcesses.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Aprovações Pendentes</CardTitle>
              <CardDescription>
                Processos aguardando sua revisão e aprovação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p>Nenhum processo pendente de aprovação.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-sm font-medium text-muted-foreground mb-1">
                  Processos Pendentes
                </h2>
                <p className="text-xs text-muted-foreground">
                  {pendingProcesses.length} processo(s) aguardando sua aprovação
                </p>
              </div>
            </div>

            {pendingProcesses.map((process) => {
              const Icon = process.icon
              const daysAgo = Math.floor(
                (Date.now() - process.submittedAt.getTime()) / (1000 * 60 * 60 * 24)
              )
              
              return (
                <Card key={process.id} className="hover:border-[#00ade8]/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 rounded-lg bg-muted">
                          <Icon className="h-5 w-5 text-foreground" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base mb-2">{process.name}</CardTitle>
                          <CardDescription className="mb-3">
                            {process.description.substring(0, 150)}...
                          </CardDescription>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Categoria: {process.category}</span>
                            <span>•</span>
                            <span>Enviado por: {process.submittedBy}</span>
                            <span>•</span>
                            <span>{daysAgo === 0 ? "Hoje" : `${daysAgo} dia(s) atrás`}</span>
                            {process.priority === "alta" && (
                              <>
                                <span>•</span>
                                <span className="text-red-400 font-medium">Prioridade Alta</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={() => router.push(`/processes/${process.id}`)}
                        variant="outline"
                        size="sm"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleApproveClick(process)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Aprovar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                        onClick={() => handleRejectClick(process)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Rejeitar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {selectedProcess && (
          <>
            <ApprovalDialog
              open={approvalDialogOpen}
              onOpenChange={setApprovalDialogOpen}
              processName={selectedProcess.name}
              onApprove={handleApprove}
            />
            <RejectionDialog
              open={rejectionDialogOpen}
              onOpenChange={setRejectionDialogOpen}
              processName={selectedProcess.name}
              onReject={handleReject}
            />
          </>
        )}
      </div>
    </div>
  )
}
