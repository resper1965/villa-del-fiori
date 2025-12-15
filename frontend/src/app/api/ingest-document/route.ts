import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const { document_id } = await request.json()

    if (!document_id) {
      return NextResponse.json({ error: "document_id é obrigatório" }, { status: 400 })
    }

    // Chamar Edge Function do Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data, error } = await supabase.functions.invoke("ingest-document", {
      body: { document_id },
    })

    if (error) {
      console.error("Erro ao chamar Edge Function:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json({ error: error.message || "Erro desconhecido" }, { status: 500 })
  }
}

