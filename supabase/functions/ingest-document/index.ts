// Edge Function: Ingest Document
// Descrição: Processa documentos e os indexa na base de conhecimento
// Data: 2025-01-15

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface DocumentChunk {
  content: string
  metadata: {
    document_id: string
    document_title: string
    document_type: string
    category: string
    chunk_index: number
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  let document_id: string | null = null

  try {
    const { document_id: docId } = await req.json()
    document_id = docId

    if (!document_id) {
      return new Response(
        JSON.stringify({ error: "document_id é obrigatório" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      )
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Buscar documento
    const { data: document, error: docError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", document_id)
      .single()

    if (docError || !document) {
      return new Response(
        JSON.stringify({ error: "Documento não encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      )
    }

    // Atualizar status para processing
    await supabase
      .from("documents")
      .update({ ingestion_status: "processing", ingestion_error: null })
      .eq("id", document_id)

    // Dividir conteúdo em chunks (aproximadamente 1000 caracteres por chunk, com overlap de 200)
    const chunks: DocumentChunk[] = []
    const chunkSize = 1000
    const overlap = 200
    const content = document.content || ""

    for (let i = 0; i < content.length; i += chunkSize - overlap) {
      const chunkContent = content.slice(i, i + chunkSize).trim()
      if (chunkContent.length > 0) {
        chunks.push({
          content: chunkContent,
          metadata: {
            document_id: document.id,
            document_title: document.title,
            document_type: document.document_type || "outro",
            category: document.category || "Outro",
            chunk_index: chunks.length,
          },
        })
      }
    }

    // Gerar embeddings para cada chunk
    const embeddings: number[][] = []
    for (const chunk of chunks) {
      try {
        const response = await fetch("https://api.openai.com/v1/embeddings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "text-embedding-3-small",
            input: chunk.content,
          }),
        })

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.statusText}`)
        }

        const data = await response.json()
        embeddings.push(data.data[0].embedding)
      } catch (error) {
        console.error(`Erro ao gerar embedding para chunk ${chunk.metadata.chunk_index}:`, error)
        // Continuar com outros chunks mesmo se um falhar
        embeddings.push([])
      }
    }

    // Remover chunks sem embedding
    const validChunks = chunks.filter((_, index) => embeddings[index].length > 0)
    const validEmbeddings = embeddings.filter((emb) => emb.length > 0)

    // Deletar chunks antigos deste documento (usando metadata JSONB)
    const { data: existingChunks } = await supabase
      .from("knowledge_base_documents")
      .select("id")
      .is("process_id", null)
      .is("process_version_id", null)

    if (existingChunks && existingChunks.length > 0) {
      // Filtrar chunks que pertencem a este documento
      const chunksToDelete = existingChunks.filter((chunk) => {
        // Verificar metadata via query separada
        return true // Será filtrado pela query abaixo
      })

      // Deletar usando filtro JSONB
      await supabase
        .from("knowledge_base_documents")
        .delete()
        .is("process_id", null)
        .is("process_version_id", null)
        .eq("metadata->>document_id", document_id)
    }

    // Inserir novos chunks na base de conhecimento
    // Converter embeddings para formato PostgreSQL vector
    const chunksToInsert = validChunks.map((chunk, index) => {
      const embedding = validEmbeddings[index]
      // Formato: [0.1,0.2,0.3,...] para PostgreSQL vector
      const embeddingString = `[${embedding.join(",")}]`
      
      return {
        process_id: null,
        process_version_id: null,
        chunk_index: chunk.metadata.chunk_index,
        chunk_type: "content",
        content: chunk.content,
        metadata: {
          ...chunk.metadata,
          source: "document",
        },
        embedding: embeddingString,
      }
    })

    if (chunksToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from("knowledge_base_documents")
        .insert(chunksToInsert)

      if (insertError) {
        throw insertError
      }
    }

    // Atualizar documento com status completed
    await supabase
      .from("documents")
      .update({
        ingestion_status: "completed",
        chunks_count: validChunks.length,
        ingested_at: new Date().toISOString(),
        ingestion_error: null,
      })
      .eq("id", document_id)

    return new Response(
      JSON.stringify({
        success: true,
        document_id,
        chunks_count: validChunks.length,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    )
  } catch (error: any) {
    console.error("Erro ao processar documento:", error)

    // Atualizar documento com status failed
    if (document_id) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
      await supabase
        .from("documents")
        .update({
          ingestion_status: "failed",
          ingestion_error: error.message || "Erro desconhecido",
        })
        .eq("id", document_id)
    }

    return new Response(
      JSON.stringify({ error: error.message || "Erro ao processar documento" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    )
  }
})

