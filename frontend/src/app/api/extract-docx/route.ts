import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo fornecido" }, { status: 400 })
    }

    const validTypes = [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ]

    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "Arquivo deve ser DOCX ou DOC" }, { status: 400 })
    }

    // Converter DOCX para texto usando biblioteca no servidor
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    try {
      // Dynamic import para evitar erro se não estiver instalado
      const mammoth = await import("mammoth").catch(() => null)

      if (!mammoth) {
        return NextResponse.json(
          {
            error:
              "Extração de DOCX não disponível. Por favor, instale mammoth: npm install mammoth",
          },
          { status: 501 }
        )
      }

      const result = await mammoth.default.extractRawText({ buffer })
      return NextResponse.json({ content: result.value })
    } catch (error: any) {
      console.error("Erro ao extrair DOCX:", error)
      return NextResponse.json(
        { error: `Erro ao extrair conteúdo do DOCX: ${error.message}` },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json({ error: error.message || "Erro desconhecido" }, { status: 500 })
  }
}

