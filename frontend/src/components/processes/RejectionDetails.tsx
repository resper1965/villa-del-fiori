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
    <Card className="card-elevated border-red-500/30 bg-red-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-400">
          <XCircle className="h-5 w-5 stroke-1" />
          Motivos de Rejeição
        </CardTitle>
        <CardDescription className="text-gray-400">
          Feedback dos stakeholders que rejeitaram este processo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedRejections.map((rejection) => (
            <div
              key={rejection.id}
              className="p-4 rounded-lg bg-red-500/10 border border-red-500/20"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-red-500/20">
                    <User className="h-4 w-4 text-red-400 stroke-1" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-300">
                      {rejection.stakeholder?.name || "Stakeholder"}
                    </p>
                    <p className="text-xs text-gray-400">{rejection.stakeholder?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Calendar className="h-3 w-3 stroke-1" />
                  <span>{formatDateTime(rejection.rejected_at)}</span>
                </div>
              </div>

              <div className="mt-3">
                <p className="text-xs font-medium text-red-400 mb-2">Motivo da Rejeição:</p>
                <p className="text-sm text-gray-300 leading-relaxed bg-gray-800/50 p-3 rounded border border-gray-700/50">
                  {rejection.reason}
                </p>
              </div>

              {rejection.additional_comments && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-400 mb-2">Comentários Adicionais:</p>
                  <p className="text-sm text-gray-400 italic bg-gray-800/30 p-3 rounded border border-gray-700/30">
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



