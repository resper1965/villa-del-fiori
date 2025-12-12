"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Users } from "lucide-react"
import { formatDateTime } from "@/lib/utils"

interface Approval {
  id: string
  stakeholder_id: string
  approved_at: string
  comments?: string | null
  stakeholder?: {
    id: string
    name: string
    email: string
  }
}

interface ApprovalProgressProps {
  processId: string
  versionId: string
  approvals: Approval[]
  requiredApprovals?: number // Número de aprovações necessárias (padrão: 1)
}

export function ApprovalProgress({
  processId,
  versionId,
  approvals,
  requiredApprovals = 1,
}: ApprovalProgressProps) {
  const currentApprovals = approvals.length
  const progress = Math.min((currentApprovals / requiredApprovals) * 100, 100)
  const isComplete = currentApprovals >= requiredApprovals

  if (approvals.length === 0 && !isComplete) {
    return null
  }

  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-5 w-5 text-gray-400 stroke-1" />
          Progresso de Aprovações
        </CardTitle>
        <CardDescription className="text-xs">
          {isComplete
            ? "Processo aprovado por todos os stakeholders necessários"
            : `${currentApprovals} de ${requiredApprovals} aprovações necessárias`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Barra de Progresso */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">
                {currentApprovals} / {requiredApprovals} aprovações
              </span>
              <span className={`font-medium ${isComplete ? "text-green-400" : "text-yellow-400"}`}>
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Lista de Aprovações */}
          {approvals.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-400 mb-2">Aprovações Recebidas:</p>
              {approvals.map((approval) => (
                <div
                  key={approval.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-green-500/10 border border-green-500/20"
                >
                  <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0 stroke-1" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-300">
                      {approval.stakeholder?.name || "Stakeholder"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDateTime(approval.approved_at)}
                    </p>
                    {approval.comments && (
                      <p className="text-xs text-gray-400 italic mt-1">{approval.comments}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Mensagem quando completo */}
          {isComplete && (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
              <p className="text-sm font-medium text-green-400">
                ✓ Processo aprovado e pronto para uso
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}



