"use client"

import { useEffect, useRef } from "react"
import mermaid from "mermaid"

interface MermaidDiagramProps {
  diagram: string
  id?: string
}

export function MermaidDiagram({ diagram, id }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null)
  const diagramId = id || `mermaid-${Math.random().toString(36).substr(2, 9)}`

  useEffect(() => {
    if (!diagram || !ref.current) return

    // Inicializar Mermaid com tema dark
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      themeVariables: {
        primaryColor: "#00ade8",
        primaryTextColor: "#ffffff",
        primaryBorderColor: "#00ade8",
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
        titleColor: "#00ade8",
        edgeLabelBackground: "#1f2937",
        actorBorder: "#00ade8",
        actorBkg: "#1f2937",
        actorTextColor: "#f9fafb",
        actorLineColor: "#6b7280",
        signalColor: "#f9fafb",
        signalTextColor: "#f9fafb",
        labelBoxBkgColor: "#1f2937",
        labelBoxBorderColor: "#00ade8",
        labelTextColor: "#f9fafb",
        loopTextColor: "#f9fafb",
        noteBorderColor: "#00ade8",
        noteBkgColor: "#1f2937",
        noteTextColor: "#f9fafb",
        activationBorderColor: "#00ade8",
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

    // Limpar conteúdo anterior
    ref.current.innerHTML = ""

    // Renderizar diagrama
    mermaid
      .render(diagramId, diagram)
      .then((result) => {
        if (ref.current) {
          ref.current.innerHTML = result.svg
        }
      })
      .catch((error) => {
        console.error("Erro ao renderizar diagrama Mermaid:", error)
        if (ref.current) {
          ref.current.innerHTML = `
            <div class="p-4 border border-red-500/50 rounded-lg bg-red-500/10">
              <p class="text-red-400 text-sm">Erro ao renderizar diagrama Mermaid</p>
              <pre class="text-xs text-muted-foreground mt-2">${error.message}</pre>
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
      <div ref={ref} className="mermaid-container flex justify-center items-center min-h-[200px] p-4" />
    </div>
  )
}

