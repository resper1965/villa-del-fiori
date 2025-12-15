import { NextRequest, NextResponse } from "next/server"
import mammoth from "mammoth"

// pdf-parse não tem default export, usar require dinâmico
const pdfParse = require("pdf-parse")

// Esta API route extrai texto de arquivos PDF, DOCX, DOC, TXT e MD

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo fornecido" }, { status: 400 })
    }

    const fileType = file.type
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let extractedText = ""

    if (fileType === "application/pdf") {
      try {
        const pdfData = await pdfParse(buffer)
        extractedText = pdfData.text
      } catch (pdfError: any) {
        console.error("Erro ao extrair PDF:", pdfError)
        return NextResponse.json(
          {
            error: "Erro ao extrair texto do PDF",
            message: pdfError.message || "Não foi possível extrair o texto do arquivo PDF.",
          },
          { status: 500 }
        )
      }
    } else if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      // DOCX
      try {
        const result = await mammoth.extractRawText({ arrayBuffer })
        extractedText = result.value
      } catch (docxError: any) {
        console.error("Erro ao extrair DOCX:", docxError)
        return NextResponse.json(
          {
            error: "Erro ao extrair texto do DOCX",
            message: docxError.message || "Não foi possível extrair o texto do arquivo DOCX.",
          },
          { status: 500 }
        )
      }
    } else if (fileType === "application/msword") {
      // DOC (formato antigo) - não suportado diretamente por mammoth
      return NextResponse.json(
        {
          error: "Formato DOC não suportado",
          message:
            "Arquivos .doc (formato antigo) não são suportados. Por favor, converta para .docx ou copie e cole o conteúdo manualmente.",
        },
        { status: 400 }
      )
    } else if (fileType === "text/plain" || fileType === "text/markdown") {
      // TXT e MD
      const decoder = new TextDecoder("utf-8")
      extractedText = decoder.decode(arrayBuffer)
    } else {
      return NextResponse.json(
        { error: "Tipo de arquivo não suportado", message: "Apenas PDF, DOCX, TXT e MD são suportados." },
        { status: 400 }
      )
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        {
          error: "Nenhum texto encontrado",
          message: "O arquivo não contém texto extraível ou está vazio.",
        },
        { status: 400 }
      )
    }

    return NextResponse.json({ text: extractedText })
  } catch (error: any) {
    console.error("Erro ao extrair texto:", error)
    return NextResponse.json({ error: error.message || "Erro ao extrair texto" }, { status: 500 })
  }
}

