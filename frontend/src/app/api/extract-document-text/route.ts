import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo fornecido" }, { status: 400 })
    }

    // Para arquivos de texto simples, extrair diretamente
    if (file.type === "text/plain" || file.type === "text/markdown" || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
      const text = await file.text()
      return NextResponse.json({ text })
    }

    // Para PDF e DOCX, vamos chamar uma Edge Function do Supabase
    // Por enquanto, retornar erro informando que precisa ser implementado
    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      // TODO: Implementar extração de PDF via Edge Function
      return NextResponse.json(
        { error: "Extração de PDF ainda não implementada. Por favor, cole o conteúdo manualmente ou converta para TXT." },
        { status: 501 }
      )
    }

    if (
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.type === "application/msword" ||
      file.name.endsWith(".docx") ||
      file.name.endsWith(".doc")
    ) {
      // TODO: Implementar extração de DOCX via Edge Function
      return NextResponse.json(
        { error: "Extração de DOCX ainda não implementada. Por favor, cole o conteúdo manualmente ou converta para TXT." },
        { status: 501 }
      )
    }

    return NextResponse.json({ error: "Tipo de arquivo não suportado" }, { status: 400 })
  } catch (error: any) {
    console.error("Erro ao extrair texto:", error)
    return NextResponse.json({ error: error.message || "Erro ao processar arquivo" }, { status: 500 })
  }
}

