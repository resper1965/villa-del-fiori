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
import { CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ApprovalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  processName: string
  onApprove: (comment?: string) => void
}

export function ApprovalDialog({
  open,
  onOpenChange,
  processName,
  onApprove,
}: ApprovalDialogProps) {
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleApprove = async () => {
    setLoading(true)
    try {
      await onApprove(comment || undefined)
      toast({
        variant: "success",
        title: "Processo aprovado",
        description: `O processo "${processName}" foi aprovado com sucesso.`,
      })
      setComment("")
      onOpenChange(false)
    } catch (error: any) {
      console.error("Erro ao aprovar:", error)
      toast({
        variant: "destructive",
        title: "Erro ao aprovar",
        description: error?.message || "Ocorreu um erro ao aprovar o processo. Tente novamente.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Aprovar Processo</DialogTitle>
          <DialogDescription>
            Você está prestes a aprovar o processo: <strong>{processName}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="comment">Comentário (opcional)</Label>
            <Textarea
              id="comment"
              placeholder="Adicione um comentário sobre a aprovação..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleApprove}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {loading ? "Aprovando..." : "Confirmar Aprovação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

