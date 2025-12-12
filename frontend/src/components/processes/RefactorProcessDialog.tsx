"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, RotateCcw } from "lucide-react"

interface RefactorProcessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  processName: string
  onRefactor: (changeSummary?: string) => void
  isLoading?: boolean
}

export function RefactorProcessDialog({
  open,
  onOpenChange,
  processName,
  onRefactor,
  isLoading = false,
}: RefactorProcessDialogProps) {
  const [changeSummary, setChangeSummary] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onRefactor(changeSummary || undefined)
    setChangeSummary("")
  }

  const handleCancel = () => {
    setChangeSummary("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-warning" />
            Refazer Processo
          </DialogTitle>
          <DialogDescription>
            Você está prestes a criar uma nova versão do processo: <strong>{processName}</strong>
            <br />
            <br />
            Uma nova versão será criada baseada na versão atual, permitindo que você faça as correções necessárias e reenvie para aprovação.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="changeSummary">
              Resumo das Mudanças (Opcional)
            </Label>
            <Textarea
              id="changeSummary"
              placeholder="Descreva brevemente as mudanças que você fará nesta nova versão..."
              value={changeSummary}
              onChange={(e) => setChangeSummary(e.target.value)}
              rows={4}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Este resumo será salvo no histórico de versões para referência futura.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin stroke-1" />
                  Criando Nova Versão...
                </>
              ) : (
                <>
                  <RotateCcw className="mr-2 h-4 w-4 stroke-1" />
                  Criar Nova Versão
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}



