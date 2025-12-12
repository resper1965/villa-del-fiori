"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Upload, FileText, AlertTriangle, CheckCircle, X } from "lucide-react"
import { ingestionApi } from "@/lib/api/ingestion"
import { ContractExtractionResponse } from "@/types/ingestion"
import { ProcessForm } from "@/components/processes/ProcessForm"
import { useCreateProcess } from "@/lib/hooks/useProcesses"

export default function ImportProcessPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractionResult, setExtractionResult] = useState<ContractExtractionResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const createMutation = useCreateProcess()

  const handleFileSelect = useCallback((selectedFile: File) => {
    if (!selectedFile.name.endsWith(".pdf")) {
      setError("Apenas arquivos PDF são suportados")
      return
    }
    setFile(selectedFile)
    setError(null)
    setExtractionResult(null)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile) {
        handleFileSelect(droppedFile)
      }
    },
    [handleFileSelect]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0]
      if (selectedFile) {
        handleFileSelect(selectedFile)
      }
    },
    [handleFileSelect]
  )

  const handleAnalyze = async () => {
    if (!file) return

    setIsProcessing(true)
    setError(null)
    setExtractionResult(null)

    try {
      const result = await ingestionApi.analyzeContract(file)
      setExtractionResult(result)
      setShowForm(true)
    } catch (err: any) {
      setError(
        err.response?.data?.detail || err.message || "Erro ao processar contrato. Tente novamente."
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFormSubmit = async (data: any) => {
    try {
      await createMutation.mutateAsync(data)
      router.push("/processes")
    } catch (err) {
      console.error("Erro ao criar processo:", err)
    }
  }

  const handleReset = () => {
    setFile(null)
    setExtractionResult(null)
    setError(null)
    setShowForm(false)
  }

  // Converter resultado da extração para formato do formulário
  const getFormData = (): any => {
    if (!extractionResult) return null

    return {
      name: extractionResult.suggested_title,
      category: extractionResult.suggested_category || "operacao",
      document_type: extractionResult.suggested_document_type || "pop",
      description: extractionResult.suggested_description,
      workflow: extractionResult.steps.map(
        (step) => `${step.order}. ${step.description}${step.role ? ` (${step.role})` : ""}`
      ),
      entities: extractionResult.detected_entities.map((e) => e.name),
      variables: [],
      mermaid_diagram: undefined, // Será gerado depois se necessário
    }
  }

  return (
    <div className="min-h-screen bg-transparent">
      <div className="h-[73px] border-b border-border/50 flex items-center justify-between px-4">
        <h1 className="text-lg font-semibold text-foreground">Importar Processo de Contrato</h1>
        <Button variant="ghost" onClick={() => router.push("/processes")}>
          <X className="h-4 w-4 mr-2 stroke-1" />
          Cancelar
        </Button>
      </div>

      <div className="px-1 sm:px-2 md:px-3 py-4 max-w-4xl mx-auto">
        {!showForm ? (
          <div className="space-y-4">
            {/* Upload Area */}
            <Card>
              <CardHeader>
                <CardTitle>Upload de Contrato</CardTitle>
                <CardDescription>
                  Faça upload de um contrato em PDF para extrair automaticamente as informações do
                  processo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    file
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-muted-foreground/50"
                  }`}
                >
                  {file ? (
                    <div className="space-y-2">
                      <FileText className="h-12 w-12 mx-auto text-primary stroke-1" />
                      <p className="font-medium text-foreground">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <Button variant="outline" size="sm" onClick={handleReset} className="mt-2">
                        Remover arquivo
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground stroke-1" />
                      <div>
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer text-primary hover:underline"
                        >
                          Clique para selecionar
                        </label>
                        <span className="text-muted-foreground"> ou arraste o arquivo aqui</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Apenas arquivos PDF</p>
                      <input
                        id="file-upload"
                        type="file"
                        accept=".pdf"
                        onChange={handleFileInput}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>

                {error && (
                  <Card className="mt-4 border-destructive/50 bg-destructive/10">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                        <div>
                          <p className="font-medium text-destructive">Erro</p>
                          <p className="text-sm text-red-300">{error}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Button
                  onClick={handleAnalyze}
                  disabled={!file || isProcessing}
                  className="w-full mt-4"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin stroke-1" />
                      Processando Contrato...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2 stroke-1" />
                      Analisar Contrato
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Processing Status */}
            {isProcessing && (
              <Card>
                <CardContent className="py-8 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary stroke-1" />
                  <p className="text-muted-foreground">
                    Analisando contrato com IA... Isso pode levar alguns segundos.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Ambiguities Alert */}
            {extractionResult && extractionResult.ambiguities.length > 0 && (
              <Card className="border-yellow-500/50 bg-warning/10">
                <CardHeader>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
                    <div>
                      <CardTitle className="text-warning">Revisão Necessária</CardTitle>
                      <CardDescription className="text-warning/80">
                        <p className="mb-2">A IA identificou os seguintes pontos que precisam de revisão:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {extractionResult.ambiguities.map((ambiguity, idx) => (
                            <li key={idx} className="text-sm">
                              {ambiguity}
                            </li>
                          ))}
                        </ul>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            )}

            {/* Success Message */}
            <Card className="border-green-500/50 bg-success/10">
              <CardHeader>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                  <div>
                    <CardTitle className="text-success">Extração Concluída</CardTitle>
                    <CardDescription className="text-success/80">
                      O contrato foi analisado com sucesso. Revise e ajuste as informações abaixo antes de
                      salvar o processo.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Form */}
            <ProcessForm
              open={true}
              onOpenChange={(open) => {
                if (!open) {
                  handleReset()
                }
              }}
              initialData={getFormData()}
              onSubmit={handleFormSubmit}
            />
          </div>
        )}
      </div>
    </div>
  )
}

