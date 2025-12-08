from sqlalchemy import Column, String, Integer, DateTime, Enum as SQLEnum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
import enum

from app.core.database import Base


class ProcessCategory(str, enum.Enum):
    GOVERNANCA = "governanca"
    ACESSO_SEGURANCA = "acesso_seguranca"
    OPERACAO = "operacao"
    AREAS_COMUNS = "areas_comuns"
    CONVIVENCIA = "convivencia"
    EVENTOS = "eventos"
    EMERGENCIAS = "emergencias"


class DocumentType(str, enum.Enum):
    POP = "pop"
    MANUAL = "manual"
    REGULAMENTO = "regulamento"
    FLUXOGRAMA = "fluxograma"
    AVISO = "aviso"
    COMUNICADO = "comunicado"
    CHECKLIST = "checklist"
    FORMULARIO = "formulario"
    POLITICA = "politica"


class ProcessStatus(str, enum.Enum):
    RASCUNHO = "rascunho"
    EM_REVISAO = "em_revisao"
    APROVADO = "aprovado"
    REJEITADO = "rejeitado"


class Process(Base):
    __tablename__ = "processes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, index=True)
    category = Column(SQLEnum(ProcessCategory), nullable=False, index=True)
    subcategory = Column(String(255), nullable=True)
    document_type = Column(SQLEnum(DocumentType), nullable=False)
    status = Column(SQLEnum(ProcessStatus), nullable=False, default=ProcessStatus.RASCUNHO, index=True)
    current_version_number = Column(Integer, default=1, nullable=False)
    creator_id = Column(UUID(as_uuid=True), ForeignKey("stakeholders.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    creator = relationship("Stakeholder", back_populates="created_processes", foreign_keys=[creator_id])
    versions = relationship("ProcessVersion", back_populates="process", order_by="ProcessVersion.version_number")
    approvals = relationship("Approval", back_populates="process")
    rejections = relationship("Rejection", back_populates="process")

