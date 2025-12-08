"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, CheckCircle, XCircle, Clock } from "lucide-react"
import { processesData } from "@/data/processes"

export default function DashboardPage() {
  const totalProcesses = processesData.length
  const approvedProcesses = processesData.filter(p => p.status === "aprovado").length
  const pendingProcesses = processesData.filter(p => p.status === "em_revisao" || p.status === "rascunho").length
  const rejectedProcesses = processesData.filter(p => p.status === "rejeitado").length

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

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Como Funciona o Sistema</CardTitle>
            <CardDescription>
              Sistema de Gestão de Processos Condominiais com Workflow de Aprovação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-light text-gray-200 mb-2">1. Processos Organizados por Categoria</h3>
              <p className="text-sm text-gray-400 font-light leading-relaxed">
                Todos os processos do condomínio estão organizados em 7 categorias principais: Governança, Acesso e Segurança, Operação, Áreas Comuns, Convivência, Eventos e Emergências. Cada processo possui descrição detalhada, fluxo de execução, entidades envolvidas e variáveis configuráveis.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-light text-gray-200 mb-2">2. Workflow de Aprovação</h3>
              <p className="text-sm text-gray-400 font-light leading-relaxed">
                Stakeholders (síndico, conselho consultivo, administradora) podem revisar processos, aprovar ou rejeitar. Em caso de rejeição, devem fornecer motivos detalhados para que o processo possa ser refeito com base no feedback recebido.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-light text-gray-200 mb-2">3. Geração de Documentos Oficiais</h3>
              <p className="text-sm text-gray-400 font-light leading-relaxed">
                Processos aprovados podem gerar automaticamente documentos oficiais (POPs, manuais, regulamentos, avisos, comunicados) aplicando variáveis configuradas (horários, contatos, políticas) e em formato pronto para publicação no website do condomínio.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-light text-gray-200 mb-2">4. Histórico e Rastreabilidade</h3>
              <p className="text-sm text-gray-400 font-light leading-relaxed">
                O sistema mantém histórico completo de todas as ações (criação, edição, aprovação, rejeição) em cada processo, permitindo rastreabilidade completa e navegação entre versões anteriores.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-light text-gray-200 mb-2">5. Variáveis Configuráveis</h3>
              <p className="text-sm text-gray-400 font-light leading-relaxed">
                O sistema utiliza variáveis configuráveis (horários de áreas comuns, contatos, políticas) que são aplicadas automaticamente nos documentos gerados, permitindo personalização sem reescrever processos.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


