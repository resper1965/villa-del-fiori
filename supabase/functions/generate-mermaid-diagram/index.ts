// Edge Function: Generate Mermaid Diagram
// Descrição: Gera código Mermaid automaticamente a partir do workflow do processo usando IA
// Uso: Recebe workflow e entidades, retorna código Mermaid

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'
const MODEL = 'gpt-4o-mini'

interface GenerateMermaidRequest {
  workflow: string[]
  process_name?: string
  entities?: string[]
  description?: string
}

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    // Verificar API key
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY não configurada')
    }

    // Parse request body
    const { workflow, process_name, entities, description }: GenerateMermaidRequest = await req.json()

    if (!workflow || !Array.isArray(workflow) || workflow.length === 0) {
      return new Response(
        JSON.stringify({ error: 'workflow é obrigatório e deve ser um array não vazio' }),
        {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

    // Construir prompt para gerar diagrama Mermaid
    let prompt = `Você é um especialista em criar diagramas de fluxo usando a sintaxe Mermaid.

Crie um diagrama flowchart TD (top-down) que represente o seguinte processo:

Nome do Processo: ${process_name || 'Processo'}

${description ? `Descrição: ${description}\n\n` : ''}Fluxo do Processo:
${workflow.map((step, index) => `${index + 1}. ${step}`).join('\n')}

${entities && entities.length > 0 ? `Entidades Envolvidas: ${entities.join(', ')}\n\n` : ''}Requisitos:
1. Use sintaxe Mermaid flowchart TD (top-down)
2. Cada passo do workflow deve ser um nó no diagrama
3. Use setas (-->) para conectar os passos sequencialmente
4. Se houver decisões (palavras como "se", "caso", "verificar", "confirmar"), use formato de decisão {Decisão?}
5. Use labels nas setas quando houver decisões (ex: |Sim|, |Não|)
6. Inclua as entidades responsáveis entre parênteses quando relevante (ex: "Passo<br/>(Entidade)")
7. Use cores: azul (#1e3a8a) para passos normais, verde (#166534) para ações finais/aprovações
8. Mantenha o código limpo e bem formatado
9. NÃO inclua markdown code blocks (```mermaid), apenas o código puro
10. Use quebras de linha <br/> dentro dos nós para textos longos

Exemplo de formato esperado:
flowchart TD
    A["Passo 1<br/>(Entidade)"] --> B["Passo 2<br/>(Entidade)"]
    B --> C{Decisão?}
    C -->|Sim| D["Ação 1<br/>(Entidade)"]
    C -->|Não| E["Ação 2<br/>(Entidade)"]
    D --> F["Fim<br/>(Entidade)"]
    E --> F
    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style D fill:#166534,stroke:#22c55e,color:#fff
    style E fill:#166534,stroke:#22c55e,color:#fff
    style F fill:#166534,stroke:#22c55e,color:#fff

Gere APENAS o código Mermaid, sem explicações adicionais.`

    // Chamar OpenAI API
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em criar diagramas Mermaid. Retorne APENAS o código Mermaid, sem markdown, sem explicações, sem code blocks.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3, // Baixa temperatura para consistência
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Erro ao chamar OpenAI:', error)
      throw new Error(`Erro ao gerar diagrama: ${response.status} ${error}`)
    }

    const data = await response.json()
    const mermaidCode = data.choices[0]?.message?.content?.trim() || ''

    if (!mermaidCode) {
      throw new Error('Resposta vazia da OpenAI')
    }

    // Limpar código Mermaid (remover markdown code blocks se houver)
    let cleanedCode = mermaidCode
      .replace(/^```mermaid\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()

    return new Response(
      JSON.stringify({
        success: true,
        mermaid_diagram: cleanedCode,
        message: 'Diagrama Mermaid gerado com sucesso',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  } catch (error) {
    console.error('Erro na função generate-mermaid-diagram:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro ao gerar diagrama Mermaid',
        details: error.toString()
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
})

