"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileText, X, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface DocumentUploadProps {
  onContentExtracted: (content: string, fileName: string, fileSize: number) => void
  onError?: (error: string) => void
  maxSizeMB?: number
  acceptedTypes?: string[]
}

const DEFAULT_MAX_SIZE_MB = 10
const DEFAULT_ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
]

export function DocumentUpload({
  onContentExtracted,
  onError,
  maxSizeMB = DEFAULT_MAX_SIZE_MB,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
}: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo
    if (!acceptedTypes.includes(file.type)) {
      const errorMsg = `Tipo de arquivo não suportado. Tipos aceitos: PDF, DOCX, DOC, TXT, MD`
      onError?.(errorMsg)
      toast({
        variant: "destructive",
        title: "Erro",
        description: errorMsg,
      })
      return
    }

    // Validar tamanho
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSizeMB) {
      const errorMsg = `Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`
      onError?.(errorMsg)
      toast({
        variant: "destructive",
        title: "Erro",
        description: errorMsg,
      })
      return
    }

    setUploadedFile(file)
    await handleFileUpload(file)
  }

  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true)
      setUploadProgress(0)

      // Upload para Supabase Storage (opcional - apenas para armazenar o arquivo original)
      // Se o bucket não existir, continuamos sem fazer upload (apenas extraímos o conteúdo)
      let filePath: string | null = null
      
      try {
        const fileExt = file.name.split(".").pop()
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
        filePath = `documents/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from("documents")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          })

        if (uploadError && !uploadError.message.includes("Bucket not found")) {
          // Se não for erro de bucket não encontrado, logar mas continuar
          console.warn("Erro ao fazer upload para storage (continuando com extração):", uploadError)
        } else if (!uploadError) {
          setUploadProgress(100)
        }
      } catch (storageError) {
        // Se houver erro no storage, continuar com extração de conteúdo
        console.warn("Erro ao acessar storage (continuando com extração):", storageError)
      }

      // Extrair conteúdo do arquivo
      setIsExtracting(true)
      const content = await extractFileContent(file, filePath)

      onContentExtracted(content, file.name, file.size)
      toast({
        variant: "success",
        title: "Arquivo processado",
        description: `Conteúdo extraído com sucesso de ${file.name}`,
      })
    } catch (error: any) {
      console.error("Erro ao fazer upload:", error)
      const errorMsg = error.message || "Erro ao processar arquivo"
      onError?.(errorMsg)
      toast({
        variant: "destructive",
        title: "Erro",
        description: errorMsg,
      })
      setUploadedFile(null)
    } finally {
      setIsUploading(false)
      setIsExtracting(false)
      setUploadProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const extractFileContent = async (file: File, filePath: string): Promise<string> => {
    const fileType = file.type

    // Texto simples
    if (fileType === "text/plain" || fileType === "text/markdown") {
      return await file.text()
    }

    // PDF - usar API route para extrair
    if (fileType === "application/pdf") {
      return await extractPDFContent(file)
    }

    // DOCX - usar API route para extrair
    if (
      fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileType === "application/msword"
    ) {
      return await extractDOCXContent(file)
    }

    // Fallback: tentar ler como texto
    try {
      return await file.text()
    } catch {
      throw new Error("Não foi possível extrair conteúdo deste tipo de arquivo")
    }
  }

  const extractPDFContent = async (file: File): Promise<string> => {
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/extract-pdf", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao extrair PDF")
      }

      const data = await response.json()
      return data.content || ""
    } catch (error: any) {
      console.error("Erro ao extrair PDF:", error)
      throw new Error(`Erro ao extrair conteúdo do PDF: ${error.message}`)
    }
  }

  const extractDOCXContent = async (file: File): Promise<string> => {
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/extract-docx", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao extrair DOCX")
      }

      const data = await response.json()
      return data.content || ""
    } catch (error: any) {
      console.error("Erro ao extrair DOCX:", error)
      throw new Error(`Erro ao extrair conteúdo do DOCX: ${error.message}`)
    }
  }

  const handleRemoveFile = () => {
    setUploadedFile(null)
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB"
    return (bytes / (1024 * 1024)).toFixed(2) + " MB"
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="file-upload">Upload de Arquivo</Label>
        <div className="mt-2 flex items-center gap-4">
          <Input
            id="file-upload"
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(",")}
            onChange={handleFileSelect}
            disabled={isUploading || isExtracting}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isExtracting}
          >
            {isUploading || isExtracting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isUploading ? "Enviando..." : "Extraindo..."}
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Selecionar Arquivo
              </>
            )}
          </Button>
          {uploadedFile && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>{uploadedFile.name}</span>
              <span className="text-xs">({formatFileSize(uploadedFile.size)})</span>
              {!isUploading && !isExtracting && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleRemoveFile}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Formatos suportados: PDF, DOCX, DOC, TXT, MD (máx. {maxSizeMB}MB)
        </p>
        {isUploading && uploadProgress > 0 && (
          <div className="mt-2">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

