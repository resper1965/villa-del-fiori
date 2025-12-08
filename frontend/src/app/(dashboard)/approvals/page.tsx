"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"

export default function ApprovalsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-[73px] border-b border-border flex items-center px-6">
        <h1 className="text-lg font-semibold text-foreground">
          Aprovações
        </h1>
      </div>
      <div className="p-6">

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


