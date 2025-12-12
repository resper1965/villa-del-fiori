"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { History, CheckCircle, XCircle, Clock, FileText, User } from "lucide-react"
import { formatDateTime } from "@/lib/utils"

interface Version {
  id: string
  version_number: number
  status: string
  created_at: string
  created_by?: string
  change_summary?: string | null
  previous_version_id?: string | null
}

interface Approval {
  id: string
  stakeholder_id: string
  version_id?: string
  approved_at: string
  comments?: string | null
  stakeholder?: {
    id: string
    name: string
    email: string
  }
}

interface Rejection {
  id: string
  stakeholder_id: string
  version_id?: string
  rejected_at: string
  reason: string
  additional_comments?: string | null
  stakeholder?: {
    id: string
    name: string
    email: string
  }
}

interface VersionHistoryProps {
  processId: string
  versions: Version[]
  approvals?: Approval[]
  rejections?: Rejection[]
  currentVersionNumber: number
}

const statusConfig = {
  aprovado: { icon: CheckCircle, color: "text-success", bgColor: "bg-success/10", borderColor: "border-success/20", label: "Aprovado" },
  em_revisao: { icon: Clock, color: "text-warning", bgColor: "bg-warning/10", borderColor: "border-warning/20", label: "Em Revisão" },
  rascunho: { icon: FileText, color: "text-muted-foreground", bgColor: "bg-gray-500/10", borderColor: "border-gray-500/20", label: "Rascunho" },
  rejeitado: { icon: XCircle, color: "text-destructive", bgColor: "bg-destructive/10", borderColor: "border-destructive/20", label: "Rejeitado" },
}

export function VersionHistory({
  processId,
  versions,
  approvals = [],
  rejections = [],
  currentVersionNumber,
}: VersionHistoryProps) {
  // Ordenar versões por número (mais recente primeiro)
  const sortedVersions = [...versions].sort((a, b) => b.version_number - a.version_number)

  // Agrupar aprovações e rejeições por versão
  const getVersionApprovals = (versionId: string) => {
    return approvals.filter((a: any) => a.version_id === versionId)
  }

  const getVersionRejections = (versionId: string) => {
    return rejections.filter((r: any) => r.version_id === versionId)
  }

  if (sortedVersions.length === 0) {
    return (
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-muted-foreground stroke-1" />
            Histórico de Versões
          </CardTitle>
          <CardDescription>Versões anteriores e histórico de alterações</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <History className="h-8 w-8 mx-auto mb-2 opacity-50 stroke-1" />
            <p className="text-sm">Nenhuma versão encontrada</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-muted-foreground stroke-1" />
          Histórico de Versões
        </CardTitle>
        <CardDescription>Versões anteriores e histórico de alterações</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedVersions.map((version, index) => {
            const isCurrent = version.version_number === currentVersionNumber
            const StatusIcon = statusConfig[version.status as keyof typeof statusConfig]?.icon || FileText
            const statusInfo = statusConfig[version.status as keyof typeof statusConfig] || statusConfig.rascunho
            const versionApprovals = getVersionApprovals(version.id)
            const versionRejections = getVersionRejections(version.id)

            return (
              <div
                key={version.id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  isCurrent
                    ? "border-primary/30 bg-primary/5"
                    : `${statusInfo.borderColor} ${statusInfo.bgColor}`
                }`}
              >
                {/* Versão Number */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    isCurrent
                      ? "bg-primary text-primary-foreground"
                      : "bg-gray-700 text-foreground"
                  }`}
                >
                  v{version.version_number}
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`h-4 w-4 ${statusInfo.color} stroke-1`} />
                      <span className="text-sm font-medium text-foreground">
                        Versão {version.version_number}
                      </span>
                      {isCurrent && (
                        <Badge variant="outline" className="text-xs">
                          Atual
                        </Badge>
                      )}
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs ${statusInfo.borderColor} ${statusInfo.bgColor} ${statusInfo.color}`}
                    >
                      {statusInfo.label}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground mb-2">
                    Criada em {formatDateTime(version.created_at)}
                  </p>

                  {version.change_summary && (
                    <div className="mb-2 p-2 rounded bg-card/50 border border-border/50">
                      <p className="text-xs font-medium text-foreground mb-1">Resumo das Mudanças:</p>
                      <p className="text-xs text-muted-foreground italic">{version.change_summary}</p>
                    </div>
                  )}

                  {/* Aprovações */}
                  {versionApprovals.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {versionApprovals.map((approval: any) => (
                        <div
                          key={approval.id}
                          className="flex items-center gap-2 text-xs text-success bg-success/10 border border-success/20 rounded px-2 py-1"
                        >
                          <CheckCircle className="h-3 w-3 stroke-1" />
                          <span>
                            Aprovado por {approval.stakeholder?.name || "Stakeholder"} em{" "}
                            {formatDateTime(approval.approved_at)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Rejeições */}
                  {versionRejections.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {versionRejections.map((rejection: any) => (
                        <div
                          key={rejection.id}
                          className="p-2 rounded bg-destructive/10 border border-destructive/20"
                        >
                          <div className="flex items-center gap-2 text-xs text-destructive mb-1">
                            <XCircle className="h-3 w-3 stroke-1" />
                            <span className="font-medium">
                              Rejeitado por {rejection.stakeholder?.name || "Stakeholder"} em{" "}
                              {formatDateTime(rejection.rejected_at)}
                            </span>
                          </div>
                          <p className="text-xs text-foreground mt-1">{rejection.reason}</p>
                          {rejection.additional_comments && (
                            <p className="text-xs text-muted-foreground mt-1 italic">
                              {rejection.additional_comments}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Linha conectora (exceto última versão) */}
                  {index < sortedVersions.length - 1 && (
                    <div className="mt-3 ml-4 w-0.5 h-4 bg-gray-700" />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

