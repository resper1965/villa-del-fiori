"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle, XCircle, Eye, Loader2, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import { useProcesses } from "@/lib/hooks/useProcesses"
import { useApproveProcess, useRejectProcess } from "@/lib/hooks/useApprovals"
import { ApprovalDialog } from "@/components/approvals/ApprovalDialog"
import { RejectionDialog } from "@/components/approvals/RejectionDialog"
import { processesData } from "@/data/processes" // Fallback

export default function ApprovalsPage() {
  const router = useRouter()
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false)
  const [selectedProcess, setSelectedProcess] = useState<any | null>(null)

  // Buscar processos pendentes de aprovação
  const { data: apiData, isLoading } = useProcesses({
    status: "em_revisao",
    page: 1,
    page_size: 100,
  })

  const approveMutation = useApproveProcess()
  const rejectMutation = useRejectProcess()

  // Usar dados da API ou fallback para mock
  const pendingProcesses = apiData?.items || processesData
    .filter(p => p.status === "em_revisao" || p.status === "rascunho")
    .slice(0, 5)
    .map(p => ({
      id: p.id.toString(),
      name: p.name,
      category: p.category,
      status: p.status,
      description: p.description,
      current_version: { id: "1" }, // Mock version ID
    }))

  const handleApproveClick = (process: any) => {
    setSelectedProcess(process)
    setApprovalDialogOpen(true)
  }

  const handleRejectClick = (process: any) => {
    setSelectedProcess(process)
    setRejectionDialogOpen(true)
  }

  const handleApprove = async (comment?: string) => {
    if (!selectedProcess || !selectedProcess.current_version?.id) return
    
    try {
      await approveMutation.mutateAsync({
        processId: selectedProcess.id,
        versionId: selectedProcess.current_version.id,
        data: { comments: comment },
      })
      setApprovalDialogOpen(false)
      setSelectedProcess(null)
    } catch (error) {
      console.error("Erro ao aprovar:", error)
    }
  }

  const handleReject = async (reason: string) => {
    if (!selectedProcess || !selectedProcess.current_version?.id) return
    
    try {
      await rejectMutation.mutateAsync({
        processId: selectedProcess.id,
        versionId: selectedProcess.current_version.id,
        data: { reason },
      })
      setRejectionDialogOpen(false)
      setSelectedProcess(null)
    } catch (error) {
      console.error("Erro ao rejeitar:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="h-[73px] border-b border-border flex items-center px-6">
        <h1 className="text-lg font-semibold text-foreground">
          Aprovações
        </h1>
      </div>
      <div className="p-6">
        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Carregando processos pendentes...</p>
            </CardContent>
          </Card>
        ) : pendingProcesses.length === 0 ? (
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

            {pendingProcesses.map((process: any) => {
              const daysAgo = process.created_at
                ? Math.floor(
                    (Date.now() - new Date(process.created_at).getTime()) / (1000 * 60 * 60 * 24)
                  )
                : 0
              
              return (
                <Card key={process.id} className="hover:border-[#00ade8]/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 rounded-lg bg-muted">
                          <FileText className="h-5 w-5 text-foreground" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base mb-2">{process.name}</CardTitle>
                          <CardDescription className="mb-3">
                            {process.description ? process.description.substring(0, 150) + "..." : "Sem descrição"}
                          </CardDescription>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Categoria: {process.category}</span>
                            {process.created_at && (
                              <>
                                <span>•</span>
                                <span>{daysAgo === 0 ? "Hoje" : `${daysAgo} dia(s) atrás`}</span>
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
                        disabled={approveMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {approveMutation.isPending ? "Aprovando..." : "Aprovar"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                        onClick={() => handleRejectClick(process)}
                        disabled={rejectMutation.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        {rejectMutation.isPending ? "Rejeitando..." : "Rejeitar"}
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
