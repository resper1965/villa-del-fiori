from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.core.database import get_db
from app.services.entity_validation_service import EntityValidationService
from app.services.process_validation_service import ProcessValidationService
from app.schemas.validation import (
    ValidationRequest,
    ValidationResult,
    BatchValidationRequest,
    BatchValidationReport,
    IntegrityMetrics,
)

router = APIRouter()


@router.post("/validate", response_model=ValidationResult)
def validate_entities(
    request: ValidationRequest,
    db: Session = Depends(get_db),
):
    """
    Valida se todas as entidades mencionadas existem e estão completas
    
    - Verifica existência de cada entidade
    - Verifica se entidades têm campos obrigatórios preenchidos
    - Retorna lista de entidades faltantes e incompletas
    """
    validator = EntityValidationService(db)
    result = validator.validate_entities(request.entities)
    
    return result


@router.post("/validate-batch", response_model=BatchValidationReport)
def validate_batch(
    request: BatchValidationRequest,
    db: Session = Depends(get_db),
):
    """
    Valida todos os processos ou processos específicos em lote
    
    - Valida entidades de todos os processos
    - Retorna relatório com processos válidos e inválidos
    - Lista problemas encontrados em cada processo
    """
    validator = ProcessValidationService(db)
    report = validator.validate_all_processes(request.process_ids)
    
    return report


@router.post("/missing-entities", response_model=List[str])
def get_missing_entities(
    entities: List[str],
    db: Session = Depends(get_db),
):
    """
    Retorna lista de entidades que não existem no cadastro
    """
    validator = EntityValidationService(db)
    missing = validator.get_missing_entities(entities)
    
    return missing


@router.get("/dashboard", response_model=IntegrityMetrics)
def get_integrity_dashboard(
    db: Session = Depends(get_db),
):
    """
    Retorna métricas de integridade do sistema
    
    - Total de entidades e processos
    - Entidades completas vs incompletas
    - Processos validados vs com problemas
    - Entidades órfãs (não usadas)
    """
    validator = ProcessValidationService(db)
    metrics = validator.calculate_integrity_metrics()
    
    return IntegrityMetrics(**metrics)

