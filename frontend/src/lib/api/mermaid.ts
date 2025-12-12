import { supabase } from "@/lib/supabase/client"

export interface GenerateMermaidRequest {
  workflow: string[]
  process_name?: string
  entities?: string[]
  description?: string
}

export interface GenerateMermaidResponse {
  success: boolean
  mermaid_diagram: string
  message?: string
  error?: string
}

export async function generateMermaidDiagram(
  request: GenerateMermaidRequest
): Promise<string> {
  const { data, error } = await supabase.functions.invoke('generate-mermaid-diagram', {
    body: request,
  })

  if (error) {
    throw new Error(error.message || 'Erro ao gerar diagrama Mermaid')
  }

  const response = data as GenerateMermaidResponse

  if (!response.success || !response.mermaid_diagram) {
    throw new Error(response.error || 'Erro ao gerar diagrama Mermaid')
  }

  return response.mermaid_diagram
}

