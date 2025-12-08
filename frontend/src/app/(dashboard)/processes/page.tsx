"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { processesData } from "@/data/processes"

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
  const router = useRouter()
  const categories = Array.from(new Set(processesData.map(p => p.category)))
  
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
                    <Card 
                      key={process.id} 
                      className="hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/processes/${process.id}`)}
                    >
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


