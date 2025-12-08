from sqlalchemy import Column, String, Integer, DateTime, Enum as SQLEnum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy import UniqueConstraint
import uuid
from datetime import datetime
import enum

from app.core.database import Base
from app.models.process import ProcessStatus


class ProcessVersion(Base):
    __tablename__ = "process_versions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    process_id = Column(UUID(as_uuid=True), ForeignKey("processes.id"), nullable=False, index=True)
    version_number = Column(Integer, nullable=False)
    content = Column(JSONB, nullable=False)  # Estrutura flexível do conteúdo
    content_text = Column(Text, nullable=True)  # Versão texto para busca full-text
    variables_applied = Column(JSONB, nullable=True)  # Variáveis aplicadas nesta versão
    entities_involved = Column(JSONB, nullable=True)  # Entidades envolvidas
    created_by = Column(UUID(as_uuid=True), ForeignKey("stakeholders.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    status = Column(SQLEnum(ProcessStatus), nullable=False, default=ProcessStatus.RASCUNHO)
    change_summary = Column(Text, nullable=True)  # Resumo das mudanças
    previous_version_id = Column(UUID(as_uuid=True), ForeignKey("process_versions.id"), nullable=True)

    # Unique constraint: version_number deve ser único por processo
    __table_args__ = (
        UniqueConstraint('process_id', 'version_number', name='uq_process_version'),
    )

    # Relationships
    process = relationship("Process", back_populates="versions")
    previous_version = relationship("ProcessVersion", remote_side=[id], backref="next_version")
    approvals = relationship("Approval", back_populates="version")
    rejections = relationship("Rejection", back_populates="version")

