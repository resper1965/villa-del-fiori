"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { XCircle, AlertCircle } from "lucide-react"

interface RejectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  processName: string
  onReject: (reason: string) => void
}

export function RejectionDialog({
  open,
  onOpenChange,
  processName,
  onReject,
}: RejectionDialogProps) {
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleReject = async () => {
    if (!reason.trim()) {
      setError("O motivo da rejeição é obrigatório")
      return
    }

    setLoading(true)
    setError("")
    try {
      await onReject(reason)
      setReason("")
      onOpenChange(false)
    } catch (err) {
      console.error("Erro ao rejeitar:", err)
      setError("Erro ao rejeitar processo. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-400">
            <XCircle className="h-5 w-5" />
            Rejeitar Processo
          </DialogTitle>
          <DialogDescription>
            Você está prestes a rejeitar o processo: <strong>{processName}</strong>
            <br />
            <span className="text-yellow-400 mt-2 block">
              Por favor, explique o motivo da rejeição para que o processo possa ser corrigido.
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-foreground">
              Motivo da Rejeição <span className="text-red-400">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Descreva detalhadamente o motivo da rejeição. Este feedback será usado para corrigir o processo..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                setError("")
              }}
              rows={6}
              className={error ? "border-red-500" : ""}
              required
            />
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-400">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false)
              setReason("")
              setError("")
            }}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleReject}
            disabled={loading || !reason.trim()}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <XCircle className="h-4 w-4 mr-2" />
            {loading ? "Rejeitando..." : "Confirmar Rejeição"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

