"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, FileText, Shield, Lock, Wrench, Building2, Users, Calendar, AlertTriangle } from "lucide-react"

const processes = [
  // Governança
  { id: 1, name: "Definição e Revisão de Processos", category: "Governança", icon: FileText, status: "aprovado" },
  { id: 2, name: "Aprovação do Conselho Consultivo", category: "Governança", icon: FileText, status: "aprovado" },
  { id: 3, name: "Emissão de Documentos Formais", category: "Governança", icon: FileText, status: "aprovado" },
  
  // Acesso e Segurança
  { id: 4, name: "Uso de Biometria (Entradas Sociais)", category: "Acesso e Segurança", icon: Lock, status: "aprovado" },
  { id: 5, name: "Uso de Controle Remoto (Garagem)", category: "Acesso e Segurança", icon: Lock, status: "aprovado" },
  { id: 6, name: "Cadastro, Bloqueio e Substituição", category: "Acesso e Segurança", icon: Lock, status: "aprovado" },
  { id: 7, name: "Câmeras: Uso, Privacidade e Auditoria", category: "Acesso e Segurança", icon: Shield, status: "aprovado" },
  { id: 8, name: "Acesso de Visitantes", category: "Acesso e Segurança", icon: Lock, status: "aprovado" },
  { id: 9, name: "Relatórios de Incidentes", category: "Acesso e Segurança", icon: Shield, status: "aprovado" },
  
  // Operação
  { id: 10, name: "Portaria Online", category: "Operação", icon: Wrench, status: "aprovado" },
  { id: 11, name: "Rotina de Limpeza (Faxineiro)", category: "Operação", icon: Wrench, status: "aprovado" },
  { id: 12, name: "Gestão de Fornecedores", category: "Operação", icon: Wrench, status: "aprovado" },
  { id: 13, name: "Manutenção de Elevadores", category: "Operação", icon: Wrench, status: "aprovado" },
  { id: 14, name: "Manutenção do Portão Automático", category: "Operação", icon: Wrench, status: "aprovado" },
  { id: 15, name: "Gestão de Materiais", category: "Operação", icon: Wrench, status: "aprovado" },
  
  // Áreas Comuns
  { id: 16, name: "Escritório Compartilhado", category: "Áreas Comuns", icon: Building2, status: "aprovado" },
  { id: 17, name: "Academia", category: "Áreas Comuns", icon: Building2, status: "aprovado" },
  { id: 18, name: "SPA - Sala de Massagem", category: "Áreas Comuns", icon: Building2, status: "aprovado" },
  { id: 19, name: "Área de Recreação", category: "Áreas Comuns", icon: Building2, status: "aprovado" },
  { id: 20, name: "Jardins", category: "Áreas Comuns", icon: Building2, status: "aprovado" },
  { id: 21, name: "Estacionamento de Visitantes", category: "Áreas Comuns", icon: Building2, status: "aprovado" },
  
  // Convivência
  { id: 22, name: "Gestão de Pets", category: "Convivência", icon: Users, status: "aprovado" },
  { id: 23, name: "Regras de Silêncio", category: "Convivência", icon: Users, status: "aprovado" },
  { id: 24, name: "Obras Internas", category: "Convivência", icon: Users, status: "aprovado" },
  
  // Eventos
  { id: 25, name: "Assembleias", category: "Eventos", icon: Calendar, status: "aprovado" },
  { id: 26, name: "Manutenções Programadas", category: "Eventos", icon: Calendar, status: "aprovado" },
  { id: 27, name: "Festas e Reuniões Privadas", category: "Eventos", icon: Calendar, status: "aprovado" },
  { id: 28, name: "Reservas de Áreas", category: "Eventos", icon: Calendar, status: "aprovado" },
  
  // Emergências
  { id: 29, name: "Incêndio", category: "Emergências", icon: AlertTriangle, status: "aprovado" },
  { id: 30, name: "Vazamento de Gás", category: "Emergências", icon: AlertTriangle, status: "aprovado" },
  { id: 31, name: "Falta de Energia", category: "Emergências", icon: AlertTriangle, status: "aprovado" },
  { id: 32, name: "Elevador Preso", category: "Emergências", icon: AlertTriangle, status: "aprovado" },
  { id: 33, name: "Ameaça à Segurança", category: "Emergências", icon: AlertTriangle, status: "aprovado" },
  { id: 34, name: "Emergências Médicas", category: "Emergências", icon: AlertTriangle, status: "aprovado" },
  { id: 35, name: "Alagamentos", category: "Emergências", icon: AlertTriangle, status: "aprovado" },
]

const categoryColors: Record<string, string> = {
  "Governança": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Acesso e Segurança": "bg-red-500/10 text-red-400 border-red-500/20",
  "Operação": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "Áreas Comuns": "bg-green-500/10 text-green-400 border-green-500/20",
  "Convivência": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "Eventos": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "Emergências": "bg-pink-500/10 text-pink-400 border-pink-500/20",
}

export default function ProcessesPage() {
  const categories = Array.from(new Set(processes.map(p => p.category)))
  
  return (
    <div className="min-h-screen bg-background">
      <div className="h-[73px] border-b border-border flex items-center justify-between px-6">
        <h1 className="text-lg font-semibold text-foreground">
          Processos
        </h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Processo
        </Button>
      </div>
      <div className="p-6">
        {categories.map((category) => {
          const categoryProcesses = processes.filter(p => p.category === category)
          return (
            <div key={category} className="mb-6">
              <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                {category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryProcesses.map((process) => {
                  const Icon = process.icon
                  return (
                    <Card key={process.id} className="hover:border-primary/50 transition-colors">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-md bg-muted">
                              <Icon className="h-4 w-4 text-foreground" />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-sm font-medium text-foreground line-clamp-2">
                                {process.name}
                              </CardTitle>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs px-2 py-1 rounded border ${categoryColors[category]}`}>
                            {category}
                          </span>
                          <span className="text-xs text-muted-foreground capitalize">
                            {process.status}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}


