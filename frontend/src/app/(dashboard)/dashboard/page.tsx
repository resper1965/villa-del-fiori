"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText, CheckCircle, XCircle, Clock, Loader2, TrendingUp, Activity, Building2 } from "lucide-react"
import { useProcessStatistics } from "@/lib/hooks/useProcesses"
import { useRBAC } from "@/lib/hooks/useRBAC"
import { useCondominium } from "@/lib/hooks/useCondominium"
import Link from "next/link"

export default function DashboardPage() {
  const router = useRouter()
  const { canAccessDashboard } = useRBAC()

  // Buscar apenas estatísticas (query otimizada, sem buscar dados completos)
  const { data: statistics, isLoading: isLoadingStats } = useProcessStatistics()
  const { data: condominium, isLoading: isLoadingCondominium } = useCondominium()

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

  const totalProcesses = statistics?.total || 0
  const approvedProcesses = statistics?.approved || 0
  const pendingProcesses = statistics?.pending || 0
  const rejectedProcesses = statistics?.rejected || 0
  
  // Calcular percentuais
  const approvalRate = totalProcesses > 0 ? Math.round((approvedProcesses / totalProcesses) * 100) : 0
  const pendingRate = totalProcesses > 0 ? Math.round((pendingProcesses / totalProcesses) * 100) : 0

  if (isLoadingStats || isLoadingCondominium) {
    return (
      <div className="px-4 md:px-6 py-4 md:py-6">
        {/* Skeleton do Condomínio */}
        <Card className="card-elevated mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skeleton dos Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="card-elevated">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-5 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 md:px-6 py-4 md:py-6">
      {/* Card do Condomínio - Destaque no topo */}
      {condominium && (
        <Card className="card-elevated mb-6 border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-foreground">{condominium.name}</h2>
                {condominium.address_street && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {condominium.address_street}
                    {condominium.address_number && `, ${condominium.address_number}`}
                    {condominium.address_neighborhood && ` - ${condominium.address_neighborhood}`}
                    {condominium.address_city && `, ${condominium.address_city}`}
                    {condominium.address_state && `/${condominium.address_state}`}
                  </p>
                )}
              </div>
              <Link href="/condominiums">
                <span className="text-sm text-primary hover:underline cursor-pointer">
                  Editar
                </span>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

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
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle className="h-5 w-5 text-success stroke-1" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-light text-foreground mb-1">{approvedProcesses}</div>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-xs text-muted-foreground">{approvalRate}% do total</p>
                <TrendingUp className="h-3 w-3 text-success" />
              </div>
            </CardContent>
          </Card>

          {/* Card Em Revisão */}
          <Card className="card-elevated">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Em Revisão
              </CardTitle>
              <div className="p-2 rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning stroke-1" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-light text-foreground mb-1">{pendingProcesses}</div>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-xs text-muted-foreground">{pendingRate}% do total</p>
                <Activity className="h-3 w-3 text-warning" />
              </div>
            </CardContent>
          </Card>

          {/* Card Rejeitados */}
          <Card className="card-elevated">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Rejeitados
              </CardTitle>
              <div className="p-2 rounded-lg bg-destructive/10">
                <XCircle className="h-5 w-5 text-destructive stroke-1" />
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
                  <div className="p-3 rounded-lg bg-warning/10 group-hover:bg-warning/20 transition-colors">
                    <Clock className="h-6 w-6 text-warning stroke-1" />
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
  )
}
