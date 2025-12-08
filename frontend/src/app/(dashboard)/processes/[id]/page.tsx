"use client"

import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle, Clock, FileText, AlertCircle } from "lucide-react"
import { processesData } from "@/data/processes"

export default function ProcessDetailPage() {
  const params = useParams()
  const router = useRouter()
  const processId = parseInt(params.id as string)
  const process = processesData.find(p => p.id === processId)

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
        </div>
      </div>
    </div>
  )
}

