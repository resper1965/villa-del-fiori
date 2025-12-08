from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.schemas.approval import ApprovalCreate, ApprovalResponse, RejectionCreate, RejectionResponse
from app.services.approval_service import ApprovalService

router = APIRouter()


@router.post("/processes/{process_id}/versions/{version_id}/approve", response_model=ApprovalResponse, status_code=status.HTTP_201_CREATED)
async def approve_process(
    process_id: UUID,
    version_id: UUID,
    approval_data: ApprovalCreate,
    db: Session = Depends(get_db),
    # TODO: Adicionar get_current_user quando autenticação estiver completa
    # current_user: dict = Depends(get_current_user),
):
    """Aprovar processo/versão"""
    # Por enquanto, usar um stakeholder_id fixo
    # TODO: Usar current_user["id"] quando autenticação estiver completa
    stakeholder_id = UUID("00000000-0000-0000-0000-000000000001")  # Admin default

    service = ApprovalService(db)
    try:
        approval = service.approve_process(
            process_id=process_id,
            version_id=version_id,
            stakeholder_id=stakeholder_id,
            approval_data=approval_data,
        )
        return ApprovalResponse.model_validate(approval)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/processes/{process_id}/versions/{version_id}/reject", response_model=RejectionResponse, status_code=status.HTTP_201_CREATED)
async def reject_process(
    process_id: UUID,
    version_id: UUID,
    rejection_data: RejectionCreate,
    db: Session = Depends(get_db),
    # TODO: Adicionar get_current_user quando autenticação estiver completa
    # current_user: dict = Depends(get_current_user),
):
    """Rejeitar processo/versão"""
    # Por enquanto, usar um stakeholder_id fixo
    # TODO: Usar current_user["id"] quando autenticação estiver completa
    stakeholder_id = UUID("00000000-0000-0000-0000-000000000001")  # Admin default

    service = ApprovalService(db)
    try:
        rejection = service.reject_process(
            process_id=process_id,
            version_id=version_id,
            stakeholder_id=stakeholder_id,
            rejection_data=rejection_data,
        )
        return RejectionResponse.model_validate(rejection)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/processes/{process_id}/approvals", response_model=list[ApprovalResponse])
async def get_process_approvals(
    process_id: UUID,
    db: Session = Depends(get_db),
):
    """Listar aprovações de um processo"""
    service = ApprovalService(db)
    approvals = service.get_process_approvals(process_id)
    return [ApprovalResponse.model_validate(a) for a in approvals]


@router.get("/processes/{process_id}/rejections", response_model=list[RejectionResponse])
async def get_process_rejections(
    process_id: UUID,
    db: Session = Depends(get_db),
):
    """Listar rejeições de um processo"""
    service = ApprovalService(db)
    rejections = service.get_process_rejections(process_id)
    return [RejectionResponse.model_validate(r) for r in rejections]

