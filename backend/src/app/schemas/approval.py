from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID

from app.models.approval import ApprovalType


class ApprovalCreate(BaseModel):
    comments: Optional[str] = None
    approval_type: ApprovalType = ApprovalType.APROVADO
    ressalvas: Optional[str] = None


class ApprovalResponse(BaseModel):
    id: UUID
    process_id: UUID
    version_id: UUID
    stakeholder_id: UUID
    approved_at: datetime
    comments: Optional[str] = None
    approval_type: ApprovalType
    ressalvas: Optional[str] = None

    class Config:
        from_attributes = True


class RejectionCreate(BaseModel):
    reason: str = Field(..., min_length=10, description="Motivo da rejeição é obrigatório")
    additional_comments: Optional[str] = None


class RejectionResponse(BaseModel):
    id: UUID
    process_id: UUID
    version_id: UUID
    stakeholder_id: UUID
    rejected_at: datetime
    reason: str
    additional_comments: Optional[str] = None
    addressed_in_version_id: Optional[UUID] = None

    class Config:
        from_attributes = True

