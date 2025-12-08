from sqlalchemy import Column, String, DateTime, Boolean, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy import ForeignKey
import uuid
from typing import Dict, List, Any

from app.core.database import Base


class ValidationResult(Base):
    """Cache de resultados de validação de processos"""
    __tablename__ = "validation_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    process_id = Column(UUID(as_uuid=True), ForeignKey("processes.id"), nullable=True, index=True)
    
    # Resultado da validação
    is_valid = Column(Boolean, nullable=False, default=False)
    missing_entities = Column(JSON, nullable=True)  # Lista de entidades faltantes
    incomplete_entities = Column(JSON, nullable=True)  # Lista de entidades incompletas com campos faltantes
    errors = Column(JSON, nullable=True)  # Lista de erros detalhados
    
    # Metadata
    validated_entities = Column(JSON, nullable=True)  # Lista de entidades validadas
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=True)  # Para cache

    def __repr__(self):
        return f"<ValidationResult(id={self.id}, process_id={self.process_id}, is_valid={self.is_valid})>"

