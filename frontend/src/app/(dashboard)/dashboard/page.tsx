"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, CheckCircle, XCircle, Clock, Loader2, TrendingUp, Activity } from "lucide-react"
import { useProcesses } from "@/lib/hooks/useProcesses"
import { useRBAC } from "@/lib/hooks/useRBAC"
import Link from "next/link"

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
  
  // Calcular percentuais
  const approvalRate = totalProcesses > 0 ? Math.round((approvedProcesses / totalProcesses) * 100) : 0
  const pendingRate = totalProcesses > 0 ? Math.round((pendingProcesses / totalProcesses) * 100) : 0

  if (isLoadingAll) {
    return (
      <div className="min-h-screen">
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
    <div className="min-h-screen">
      <div className="h-[73px] border-b border-border flex items-center px-6">
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            Dashboard
          </h1>
        </div>
      </div>
      <div className="px-1 sm:px-2 md:px-3 py-4 md:py-6">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Card Total - Span 2 em telas grandes */}
          <Card className="card-elevated md:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Processos
              </CardTitle>
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary stroke-1" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-light text-foreground mb-1">{totalProcesses}</div>
              <p className="text-xs text-muted-foreground">Processos cadastrados</p>
            </CardContent>
          </Card>

          {/* Card Aprovados */}
          <Card className="card-elevated">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Aprovados
              </CardTitle>
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-400 stroke-1" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-light text-foreground mb-1">{approvedProcesses}</div>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-xs text-muted-foreground">{approvalRate}% do total</p>
                <TrendingUp className="h-3 w-3 text-green-400" />
              </div>
            </CardContent>
          </Card>

          {/* Card Em Revisão */}
          <Card className="card-elevated">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Em Revisão
              </CardTitle>
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Clock className="h-5 w-5 text-yellow-400 stroke-1" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-light text-foreground mb-1">{pendingProcesses}</div>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-xs text-muted-foreground">{pendingRate}% do total</p>
                <Activity className="h-3 w-3 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          {/* Card Rejeitados */}
          <Card className="card-elevated">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Rejeitados
              </CardTitle>
              <div className="p-2 rounded-lg bg-red-500/10">
                <XCircle className="h-5 w-5 text-red-400 stroke-1" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-light text-foreground mb-1">{rejectedProcesses}</div>
              <p className="text-xs text-muted-foreground mt-2">
                {totalProcesses > 0 ? Math.round((rejectedProcesses / totalProcesses) * 100) : 0}% do total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Ações Rápidas - Bento Grid 2 colunas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/processes">
            <Card className="card-elevated h-full cursor-pointer group">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <FileText className="h-6 w-6 text-primary stroke-1" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Ver Todos os Processos</CardTitle>
                    <CardDescription>Explore e gerencie processos condominiais</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/processes?status=em_revisao">
            <Card className="card-elevated h-full cursor-pointer group">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-colors">
                    <Clock className="h-6 w-6 text-yellow-400 stroke-1" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Processos Pendentes</CardTitle>
                    <CardDescription>{pendingProcesses} processos aguardando aprovação</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
