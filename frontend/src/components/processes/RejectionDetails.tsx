"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { XCircle, User, Calendar } from "lucide-react"
import { formatDateTime } from "@/lib/utils"

interface Rejection {
  id: string
  stakeholder_id: string
  rejected_at: string
  reason: string
  additional_comments?: string | null
  stakeholder?: {
    id: string
    name: string
    email: string
  }
}

interface RejectionDetailsProps {
  rejections: Rejection[]
}

export function RejectionDetails({ rejections }: RejectionDetailsProps) {
  if (rejections.length === 0) {
    return null
  }

  // Ordenar por data (mais recente primeiro)
  const sortedRejections = [...rejections].sort(
    (a, b) => new Date(b.rejected_at).getTime() - new Date(a.rejected_at).getTime()
  )

  return (
    <Card className="card-elevated border-destructive/30 bg-red-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <XCircle className="h-5 w-5 stroke-1" />
          Motivos de Rejeição
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Feedback dos stakeholders que rejeitaram este processo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedRejections.map((rejection) => (
            <div
              key={rejection.id}
              className="p-4 rounded-lg bg-destructive/10 border border-destructive/20"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-destructive/20">
                    <User className="h-4 w-4 text-destructive stroke-1" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {rejection.stakeholder?.name || "Stakeholder"}
                    </p>
                    <p className="text-xs text-muted-foreground">{rejection.stakeholder?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 stroke-1" />
                  <span>{formatDateTime(rejection.rejected_at)}</span>
                </div>
              </div>

              <div className="mt-3">
                <p className="text-xs font-medium text-destructive mb-2">Motivo da Rejeição:</p>
                <p className="text-sm text-foreground leading-relaxed bg-card/50 p-3 rounded border border-border/50">
                  {rejection.reason}
                </p>
              </div>

              {rejection.additional_comments && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Comentários Adicionais:</p>
                  <p className="text-sm text-muted-foreground italic bg-card/30 p-3 rounded border border-border/30">
                    {rejection.additional_comments}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}



