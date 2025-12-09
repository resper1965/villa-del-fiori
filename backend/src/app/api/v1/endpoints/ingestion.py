from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from typing import Optional

from app.services.ai_ingestion_service import AIIngestionService
from app.schemas.ingestion import ContractExtractionResponse

router = APIRouter()


@router.post("/analyze", response_model=ContractExtractionResponse)
async def analyze_contract(
    file: UploadFile = File(..., description="Arquivo PDF do contrato a ser analisado"),
):
    """
    Analisa um contrato PDF e extrai informações estruturadas para criar um processo
    
    - Converte PDF para Markdown preservando estrutura e tabelas
    - Usa IA (GPT-4o) para extrair informações estruturadas
    - Retorna JSON validado com título, descrição, entidades, workflow, RACI e ambiguidades
    - NÃO salva no banco de dados (human-in-the-loop)
    
    O resultado deve ser revisado e editado no frontend antes de ser salvo como processo.
    """
    try:
        service = AIIngestionService()
        result = await service.extract_from_pdf(file)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Configuração de IA inválida: {str(e)}"
        )
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao processar contrato: {str(e)}"
        )

