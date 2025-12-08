from sqlalchemy import Column, DateTime, Enum as SQLEnum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy import UniqueConstraint
import uuid
from datetime import datetime
import enum

from app.core.database import Base


class ApprovalType(str, enum.Enum):
    APROVADO = "aprovado"
    APROVADO_COM_RESSALVAS = "aprovado_com_ressalvas"


class Approval(Base):
    __tablename__ = "approvals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    process_id = Column(UUID(as_uuid=True), ForeignKey("processes.id"), nullable=False, index=True)
    version_id = Column(UUID(as_uuid=True), ForeignKey("process_versions.id"), nullable=False, index=True)
    stakeholder_id = Column(UUID(as_uuid=True), ForeignKey("stakeholders.id"), nullable=False, index=True)
    approved_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    comments = Column(Text, nullable=True)
    approval_type = Column(SQLEnum(ApprovalType), nullable=False, default=ApprovalType.APROVADO)
    ressalvas = Column(Text, nullable=True)  # Se aprovado_com_ressalvas

    # Unique constraint: um stakeholder só pode aprovar uma vez por versão
    __table_args__ = (
        UniqueConstraint('version_id', 'stakeholder_id', name='uq_version_stakeholder_approval'),
    )

    # Relationships
    process = relationship("Process", back_populates="approvals")
    version = relationship("ProcessVersion", back_populates="approvals")
    stakeholder = relationship("Stakeholder", back_populates="approvals")

