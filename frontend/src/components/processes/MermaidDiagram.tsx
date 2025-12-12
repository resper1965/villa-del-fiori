"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import mermaid from "mermaid"

interface MermaidDiagramProps {
  diagram: string
  id?: string
}

// Inicializar Mermaid apenas uma vez (fora do componente)
let mermaidInitialized = false

const initMermaid = () => {
  if (mermaidInitialized) return
  
  mermaid.initialize({
    startOnLoad: false,
    theme: "dark",
    themeVariables: {
      primaryColor: "hsl(var(--primary))",
      primaryTextColor: "#ffffff",
      primaryBorderColor: "hsl(var(--primary))",
      lineColor: "#6b7280",
      secondaryColor: "#1f2937",
      tertiaryColor: "#111827",
      background: "#111827",
      mainBkg: "#1f2937",
      secondBkg: "#111827",
      textColor: "#f9fafb",
      border1: "#374151",
      border2: "#4b5563",
      arrowheadColor: "#9ca3af",
      clusterBkg: "#1f2937",
      clusterBorder: "#374151",
      defaultLinkColor: "#60a5fa",
      titleColor: "hsl(var(--primary))",
      edgeLabelBackground: "#1f2937",
      actorBorder: "hsl(var(--primary))",
      actorBkg: "#1f2937",
      actorTextColor: "#f9fafb",
      actorLineColor: "#6b7280",
      signalColor: "#f9fafb",
      signalTextColor: "#f9fafb",
      labelBoxBkgColor: "#1f2937",
      labelBoxBorderColor: "hsl(var(--primary))",
      labelTextColor: "#f9fafb",
      loopTextColor: "#f9fafb",
      noteBorderColor: "hsl(var(--primary))",
      noteBkgColor: "#1f2937",
      noteTextColor: "#f9fafb",
      activationBorderColor: "hsl(var(--primary))",
      activationBkgColor: "#374151",
      sequenceNumberColor: "#111827",
      sectionBkgColor: "#1f2937",
      altBkgColor: "#111827",
      altTextColor: "#f9fafb",
    },
    flowchart: {
      useMaxWidth: true,
      htmlLabels: true,
      curve: "basis",
    },
  })
  
  mermaidInitialized = true
}

export function MermaidDiagram({ diagram, id }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Memoizar diagramId para evitar recriação
  const diagramId = useMemo(() => id || `mermaid-${Math.random().toString(36).substr(2, 9)}`, [id])

  useEffect(() => {
    if (!diagram || !ref.current) {
      setIsLoading(false)
      return
    }

    // Inicializar Mermaid apenas uma vez
    initMermaid()

    setIsLoading(true)
    setError(null)

    // Limpar conteúdo anterior
    ref.current.innerHTML = ""

    // Renderizar diagrama
    mermaid
      .render(diagramId, diagram)
      .then((result) => {
        if (ref.current) {
          ref.current.innerHTML = result.svg
          setIsLoading(false)
        }
      })
      .catch((err) => {
        console.error("Erro ao renderizar diagrama Mermaid:", err)
        setError(err.message)
        setIsLoading(false)
        if (ref.current) {
          ref.current.innerHTML = `
            <div class="p-4 border border-destructive/50 rounded-lg bg-destructive/10">
              <p class="text-destructive text-sm">Erro ao renderizar diagrama Mermaid</p>
              <pre class="text-xs text-muted-foreground mt-2">${err.message}</pre>
            </div>
          `
        }
      })
  }, [diagram, diagramId])

  if (!diagram || diagram.trim() === "") {
    return (
      <div className="p-8 border border-dashed border-border rounded-lg text-center">
        <p className="text-muted-foreground text-sm">Nenhum diagrama definido</p>
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto">
      {isLoading && (
        <div className="flex justify-center items-center min-h-[200px] p-4">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <div ref={ref} className={`mermaid-container flex justify-center items-center min-h-[200px] p-4 ${isLoading ? 'hidden' : ''}`} />
    </div>
  )
}

