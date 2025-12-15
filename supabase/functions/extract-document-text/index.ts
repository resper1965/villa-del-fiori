// Edge Function: Extract Document Text
// Descrição: Extrai texto de arquivos PDF e DOCX
// Data: 2025-01-15

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return new Response(
        JSON.stringify({ error: "Nenhum arquivo fornecido" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // Para arquivos de texto simples
    if (file.type === "text/plain" || file.type === "text/markdown" || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
      const text = await file.text()
      return new Response(
        JSON.stringify({ text }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // Para PDF - usar biblioteca de extração
    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      try {
        // Usar pdf-parse via npm (precisa ser instalado)
        // Por enquanto, retornar erro informando que precisa de biblioteca
        const arrayBuffer = await file.arrayBuffer()
        const uint8Array = new Uint8Array(arrayBuffer)
        
        // Tentar usar pdfjs-dist via CDN
        // Nota: Esta é uma implementação básica, pode precisar de ajustes
        return new Response(
          JSON.stringify({ 
            error: "Extração de PDF requer biblioteca adicional. Por favor, use arquivos TXT ou cole o conteúdo manualmente.",
            note: "Para implementar extração de PDF, instale pdf-parse ou use pdfjs-dist"
          }),
          {
            status: 501,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        )
      } catch (error: any) {
        return new Response(
          JSON.stringify({ error: `Erro ao processar PDF: ${error.message}` }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        )
      }
    }

    // Para DOCX - usar biblioteca de extração
    if (
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.type === "application/msword" ||
      file.name.endsWith(".docx") ||
      file.name.endsWith(".doc")
    ) {
      return new Response(
        JSON.stringify({ 
          error: "Extração de DOCX requer biblioteca adicional. Por favor, use arquivos TXT ou cole o conteúdo manualmente.",
          note: "Para implementar extração de DOCX, use mammoth.js ou docx-parser"
        }),
        {
          status: 501,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    return new Response(
      JSON.stringify({ error: "Tipo de arquivo não suportado" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  } catch (error: any) {
    console.error("Erro ao extrair texto:", error)
    return new Response(
      JSON.stringify({ error: error.message || "Erro ao processar arquivo" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})

