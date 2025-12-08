from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID

from app.models.process import ProcessCategory, DocumentType, ProcessStatus


class ProcessBase(BaseModel):
    name: str = Field(..., max_length=255)
    category: ProcessCategory
    subcategory: Optional[str] = Field(None, max_length=255)
    document_type: DocumentType
    description: Optional[str] = None
    workflow: Optional[List[str]] = None
    entities: Optional[List[str]] = None
    variables: Optional[List[str]] = None


class ProcessCreate(ProcessBase):
    pass


class ProcessUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    category: Optional[ProcessCategory] = None
    subcategory: Optional[str] = Field(None, max_length=255)
    document_type: Optional[DocumentType] = None
    description: Optional[str] = None
    workflow: Optional[List[str]] = None
    entities: Optional[List[str]] = None
    variables: Optional[List[str]] = None
    mermaid_diagram: Optional[str] = None
    status: Optional[ProcessStatus] = None


class ProcessVersionBase(BaseModel):
    content: Dict[str, Any]
    content_text: Optional[str] = None
    variables_applied: Optional[Dict[str, Any]] = None
    entities_involved: Optional[List[str]] = None
    change_summary: Optional[str] = None


class ProcessVersionCreate(ProcessVersionBase):
    pass


class ProcessVersionResponse(ProcessVersionBase):
    id: UUID
    process_id: UUID
    version_number: int
    status: ProcessStatus
    created_by: UUID
    created_at: datetime

    class Config:
        from_attributes = True
        use_enum_values = True


class ProcessResponse(ProcessBase):
    id: UUID
    status: ProcessStatus
    current_version_number: int
    creator_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        use_enum_values = True


class ProcessListResponse(BaseModel):
    items: List[ProcessResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class ProcessDetailResponse(ProcessResponse):
    description: Optional[str] = None
    workflow: Optional[List[str]] = None
    entities: Optional[List[str]] = None
    variables: Optional[List[str]] = None
    current_version: Optional[ProcessVersionResponse] = None

    class Config:
        from_attributes = True

