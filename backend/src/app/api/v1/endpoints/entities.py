from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from uuid import UUID

from app.core.database import get_db
from app.models.entity import Entity, EntityType, EntityCategory
from app.schemas.entity import (
    EntityCreate,
    EntityUpdate,
    EntityResponse,
    EntityListResponse,
)

router = APIRouter()


@router.get("", response_model=EntityListResponse)
def list_entities(
    type: Optional[EntityType] = Query(None, description="Filtrar por tipo"),
    category: Optional[EntityCategory] = Query(None, description="Filtrar por categoria"),
    is_active: Optional[bool] = Query(None, description="Filtrar por status ativo"),
    search: Optional[str] = Query(None, description="Buscar por nome"),
    page: int = Query(1, ge=1, description="Número da página"),
    page_size: int = Query(50, ge=1, le=100, description="Itens por página"),
    db: Session = Depends(get_db),
):
    """Lista todas as entidades com filtros opcionais"""
    query = db.query(Entity)

    # Aplicar filtros
    if type:
        query = query.filter(Entity.type == type)
    if category:
        query = query.filter(Entity.category == category)
    if is_active is not None:
        query = query.filter(Entity.is_active == is_active)
    if search:
        query = query.filter(
            or_(
                Entity.name.ilike(f"%{search}%"),
                Entity.contact_person.ilike(f"%{search}%"),
                Entity.email.ilike(f"%{search}%"),
            )
        )

    # Contar total
    total = query.count()

    # Paginação
    skip = (page - 1) * page_size
    entities = query.order_by(Entity.name).offset(skip).limit(page_size).all()

    total_pages = (total + page_size - 1) // page_size

    return EntityListResponse(
        items=entities,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/{entity_id}", response_model=EntityResponse)
def get_entity(entity_id: UUID, db: Session = Depends(get_db)):
    """Obtém uma entidade específica por ID"""
    entity = db.query(Entity).filter(Entity.id == entity_id).first()
    if not entity:
        raise HTTPException(status_code=404, detail="Entidade não encontrada")
    return entity


@router.post("", response_model=EntityResponse, status_code=201)
def create_entity(entity_data: EntityCreate, db: Session = Depends(get_db)):
    """Cria uma nova entidade"""
    entity = Entity(**entity_data.model_dump())
    db.add(entity)
    db.commit()
    db.refresh(entity)
    return entity


@router.put("/{entity_id}", response_model=EntityResponse)
def update_entity(
    entity_id: UUID,
    entity_data: EntityUpdate,
    db: Session = Depends(get_db),
):
    """Atualiza uma entidade existente"""
    entity = db.query(Entity).filter(Entity.id == entity_id).first()
    if not entity:
        raise HTTPException(status_code=404, detail="Entidade não encontrada")

    # Atualizar apenas campos fornecidos
    update_data = entity_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(entity, field, value)

    db.commit()
    db.refresh(entity)
    return entity


@router.delete("/{entity_id}", status_code=204)
def delete_entity(entity_id: UUID, db: Session = Depends(get_db)):
    """Deleta uma entidade (soft delete: marca como inativa)"""
    entity = db.query(Entity).filter(Entity.id == entity_id).first()
    if not entity:
        raise HTTPException(status_code=404, detail="Entidade não encontrada")

    entity.is_active = False
    db.commit()
    return None

