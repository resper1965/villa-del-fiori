from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from uuid import UUID

from app.models.entity import EntityType, EntityCategory


class EntityBase(BaseModel):
    """Schema base para Entity"""
    name: str = Field(..., max_length=255, description="Nome da entidade")
    type: EntityType = Field(..., description="Tipo da entidade")
    category: Optional[EntityCategory] = Field(None, description="Categoria específica")
    phone: Optional[str] = Field(None, max_length=50, description="Telefone")
    email: Optional[EmailStr] = Field(None, description="Email")
    contact_person: Optional[str] = Field(None, max_length=255, description="Pessoa de contato (para empresas)")
    description: Optional[str] = Field(None, description="Descrição adicional")
    address: Optional[str] = Field(None, description="Endereço")
    emergency_phone: Optional[str] = Field(None, max_length=50, description="Telefone de emergência")
    meeting_point: Optional[str] = Field(None, max_length=255, description="Ponto de encontro (ex: incêndio)")
    is_active: bool = Field(True, description="Status ativo/inativo")


class EntityCreate(EntityBase):
    """Schema para criação de Entity"""
    pass


class EntityUpdate(BaseModel):
    """Schema para atualização de Entity"""
    name: Optional[str] = Field(None, max_length=255)
    type: Optional[EntityType] = None
    category: Optional[EntityCategory] = None
    phone: Optional[str] = Field(None, max_length=50)
    email: Optional[EmailStr] = None
    contact_person: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    address: Optional[str] = None
    emergency_phone: Optional[str] = Field(None, max_length=50)
    meeting_point: Optional[str] = Field(None, max_length=255)
    is_active: Optional[bool] = None


class EntityResponse(EntityBase):
    """Schema para resposta de Entity"""
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        use_enum_values = True


class EntityListResponse(BaseModel):
    """Schema para lista de entidades"""
    items: list[EntityResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

