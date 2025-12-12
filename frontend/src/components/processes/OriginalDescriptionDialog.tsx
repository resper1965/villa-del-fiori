"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, X } from "lucide-react"

interface OriginalDescriptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contentText: string | null | undefined
  processName: string
}

export function OriginalDescriptionDialog({
  open,
  onOpenChange,
  contentText,
  processName,
}: OriginalDescriptionDialogProps) {
  if (!contentText) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground stroke-1" />
            Descrição Original do Processo
          </DialogTitle>
          <DialogDescription>
            Conteúdo completo e estruturado de "{processName}" no formato original
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
              <pre className="whitespace-pre-wrap text-sm text-foreground font-mono leading-relaxed">
                {contentText}
              </pre>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end pt-4 border-t border-border/50">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-2 stroke-1" />
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

