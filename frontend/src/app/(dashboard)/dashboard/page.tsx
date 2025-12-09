"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react"
import { useProcesses } from "@/lib/hooks/useProcesses"
import { useRBAC } from "@/lib/hooks/useRBAC"

export default function DashboardPage() {
  const router = useRouter()
  const { canAccessDashboard } = useRBAC()

  // Buscar todos os processos do Supabase (hooks devem ser chamados antes de qualquer return)
  const { data: allProcessesData, isLoading: isLoadingAll } = useProcesses({
    page: 1,
    page_size: 1000, // Buscar todos
  })

  // Redirecionar se não tiver permissão
  useEffect(() => {
    if (!canAccessDashboard()) {
      router.push("/auth/unauthorized")
    }
  }, [canAccessDashboard, router])
  
  // Se não pode acessar dashboard, não mostrar nada (será redirecionado)
  if (!canAccessDashboard()) {
    return null
  }

  const processes = allProcessesData?.items || []
  const totalProcesses = processes.length
  const approvedProcesses = processes.filter(p => p.status === "aprovado").length
  const pendingProcesses = processes.filter(p => p.status === "em_revisao" || p.status === "rascunho").length
  const rejectedProcesses = processes.filter(p => p.status === "rejeitado").length

  if (isLoadingAll) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-[73px] border-b border-border flex items-center px-6">
          <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
        </div>
        <div className="px-1 sm:px-2 md:px-3 py-2 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Carregando estatísticas...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="h-[73px] border-b border-border flex items-center px-6">
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            Dashboard
          </h1>
        </div>
      </div>
      <div className="px-1 sm:px-2 md:px-3 py-2">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Processos
              </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground stroke-1" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-light text-gray-200">{totalProcesses}</div>
              <p className="text-xs text-gray-400 font-light mt-1">Processos cadastrados</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700/50 hover:bg-gray-800/70 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-light text-gray-400">
                Aprovados
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-400 stroke-1" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-light text-gray-200">{approvedProcesses}</div>
              <p className="text-xs text-gray-400 font-light mt-1">Processos aprovados</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700/50 hover:bg-gray-800/70 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-light text-gray-400">
                Em Revisão
              </CardTitle>
              <Clock className="h-4 w-4 text-yellow-400 stroke-1" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-light text-gray-200">{pendingProcesses}</div>
              <p className="text-xs text-gray-400 font-light mt-1">Aguardando aprovação</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700/50 hover:bg-gray-800/70 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-light text-gray-400">
                Rejeitados
              </CardTitle>
              <XCircle className="h-4 w-4 text-red-400 stroke-1" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-light text-gray-200">{rejectedProcesses}</div>
              <p className="text-xs text-gray-400 font-light mt-1">Processos rejeitados</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
