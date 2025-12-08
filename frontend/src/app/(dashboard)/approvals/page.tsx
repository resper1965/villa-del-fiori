"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"

export default function ApprovalsPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Aprovações
          </h1>
          <p className="text-muted-foreground">
            Processos pendentes de sua aprovação
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Aprovações Pendentes</CardTitle>
            <CardDescription>
              Processos aguardando sua revisão e aprovação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p>Nenhum processo pendente de aprovação.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


