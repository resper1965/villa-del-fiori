"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, FileText } from "lucide-react"

export default function ProcessesPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Processos
            </h1>
            <p className="text-muted-foreground">
              Gerencie todos os processos condominiais
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Processo
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Processos</CardTitle>
            <CardDescription>
              Todos os processos organizados por categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p>Nenhum processo cadastrado ainda.</p>
              <p className="text-sm mt-2">Clique em &quot;Novo Processo&quot; para começar.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


