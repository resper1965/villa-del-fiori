import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo fornecido" }, { status: 400 })
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Arquivo deve ser um PDF" }, { status: 400 })
    }

    // Converter PDF para texto usando biblioteca no servidor
    // Por enquanto, retornar erro informando que precisa de biblioteca
    // Em produção, usar pdf-parse ou similar
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Tentar usar pdf-parse se disponível, senão retornar erro
    try {
      // pdf-parse não tem default export, usar require
      const pdfParse = require("pdf-parse")
      const data = await pdfParse(buffer)
      return NextResponse.json({ content: data.text })
    } catch (error: any) {
      console.error("Erro ao extrair PDF:", error)
      return NextResponse.json(
        { error: `Erro ao extrair conteúdo do PDF: ${error.message}` },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json({ error: error.message || "Erro desconhecido" }, { status: 500 })
  }
}

