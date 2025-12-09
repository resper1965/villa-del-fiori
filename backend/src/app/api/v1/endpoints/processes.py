from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID

from app.core.database import get_db
from app.core.security import get_current_active_user, get_current_active_syndic
from app.models.process import ProcessCategory, ProcessStatus
from app.models.stakeholder import Stakeholder
from app.schemas.process import (
    ProcessCreate,
    ProcessUpdate,
    ProcessResponse,
    ProcessDetailResponse,
    ProcessListResponse,
)
from app.services.process_service import ProcessService

router = APIRouter()


@router.get("", response_model=ProcessListResponse)
async def list_processes(
    category: Optional[ProcessCategory] = Query(None, description="Filtrar por categoria"),
    status: Optional[ProcessStatus] = Query(None, description="Filtrar por status"),
    page: int = Query(1, ge=1, description="Número da página"),
    page_size: int = Query(20, ge=1, le=100, description="Itens por página"),
    db: Session = Depends(get_db),
):
    """Listar processos com filtros e paginação"""
    service = ProcessService(db)
    processes, total = service.get_processes(category=category, status=status, page=page, page_size=page_size)

    total_pages = (total + page_size - 1) // page_size

    return ProcessListResponse(
        items=[ProcessResponse.model_validate(p) for p in processes],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/{process_id}", response_model=ProcessDetailResponse)
async def get_process(
    process_id: UUID,
    db: Session = Depends(get_db),
):
    """Buscar processo por ID com detalhes completos"""
    service = ProcessService(db)
    process = service.get_process_by_id(process_id)

    if not process:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Processo não encontrado",
        )

    # Buscar versão atual
    current_version = None
    if process.versions:
        current_version = process.versions[-1]  # Última versão

    response = ProcessDetailResponse.model_validate(process)
    if current_version:
        from app.schemas.process import ProcessVersionResponse
        response.current_version = ProcessVersionResponse.model_validate(current_version)
        # Extrair dados do content
        if current_version.content:
            response.description = current_version.content.get("description")
            response.workflow = current_version.content.get("workflow", [])
            response.entities = current_version.content.get("entities", [])
            response.variables = list(current_version.content.get("variables_applied", {}).keys())
            # mermaid_diagram está no content, será acessado via current_version.content.mermaid_diagram

    return response


@router.post("", response_model=ProcessResponse, status_code=status.HTTP_201_CREATED)
async def create_process(
    process_data: ProcessCreate,
    db: Session = Depends(get_db),
    current_user: Stakeholder = Depends(get_current_active_user),
):
    """Criar novo processo - Requer autenticação"""
    creator_id = current_user.id

    service = ProcessService(db)
    process = service.create_process(process_data, creator_id)

    return ProcessResponse.model_validate(process)


@router.put("/{process_id}", response_model=ProcessResponse)
async def update_process(
    process_id: UUID,
    process_data: ProcessUpdate,
    db: Session = Depends(get_db),
    current_user: Stakeholder = Depends(get_current_active_user),
):
    """Atualizar processo - Requer autenticação"""
    service = ProcessService(db)
    process = service.update_process(process_id, process_data)

    if not process:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Processo não encontrado",
        )

    return ProcessResponse.model_validate(process)


@router.delete("/{process_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_process(
    process_id: UUID,
    db: Session = Depends(get_db),
    current_user: Stakeholder = Depends(get_current_active_syndic),
):
    """Deletar processo - Apenas Síndico ou Admin"""
    service = ProcessService(db)
    success = service.delete_process(process_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Processo não encontrado",
        )

    return None

