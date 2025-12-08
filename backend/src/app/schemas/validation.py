from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime


class EntityValidationIssue(BaseModel):
    """Problema encontrado em uma entidade"""
    entity_name: str = Field(..., description="Nome da entidade com problema")
    issue_type: str = Field(..., description="Tipo do problema: 'missing' ou 'incomplete'")
    missing_fields: Optional[List[str]] = Field(None, description="Campos obrigatórios faltantes (se incomplete)")


class ValidationResult(BaseModel):
    """Resultado de validação de entidades"""
    valid: bool = Field(..., description="Se todas as entidades são válidas")
    missing_entities: List[str] = Field(default_factory=list, description="Lista de entidades que não existem")
    incomplete_entities: List[EntityValidationIssue] = Field(
        default_factory=list, 
        description="Lista de entidades que existem mas estão incompletas"
    )
    errors: List[str] = Field(default_factory=list, description="Lista de erros gerais")
    validated_entities: List[str] = Field(default_factory=list, description="Lista de entidades validadas com sucesso")

    class Config:
        from_attributes = True


class ValidationRequest(BaseModel):
    """Request para validação de entidades"""
    process_id: Optional[UUID] = Field(None, description="ID do processo (opcional, para cache)")
    entities: List[str] = Field(..., description="Lista de nomes de entidades para validar")


class BatchValidationRequest(BaseModel):
    """Request para validação em lote"""
    process_ids: Optional[List[UUID]] = Field(None, description="IDs específicos de processos (opcional, valida todos se vazio)")


class ProcessValidationIssue(BaseModel):
    """Problema encontrado em um processo"""
    process_id: UUID
    process_name: str
    issues: List[EntityValidationIssue]
    missing_entities: List[str]
    incomplete_entities: List[EntityValidationIssue]


class BatchValidationReport(BaseModel):
    """Relatório de validação em lote"""
    total_processes: int = Field(..., description="Total de processos validados")
    valid_processes: int = Field(..., description="Número de processos válidos")
    invalid_processes: int = Field(..., description="Número de processos inválidos")
    processes_with_issues: List[ProcessValidationIssue] = Field(
        default_factory=list,
        description="Lista de processos com problemas"
    )
    created_at: datetime = Field(default_factory=datetime.now)


class IntegrityMetrics(BaseModel):
    """Métricas de integridade do sistema"""
    total_entities: int = Field(..., description="Total de entidades cadastradas")
    complete_entities: int = Field(..., description="Número de entidades completas")
    incomplete_entities: int = Field(..., description="Número de entidades incompletas")
    total_processes: int = Field(..., description="Total de processos")
    validated_processes: int = Field(..., description="Número de processos validados")
    processes_with_issues: int = Field(..., description="Número de processos com problemas")
    orphaned_entities: List[str] = Field(default_factory=list, description="Entidades não usadas em nenhum processo")

