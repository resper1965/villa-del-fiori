from sqlalchemy import Column, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from app.core.database import Base


class Rejection(Base):
    __tablename__ = "rejections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    process_id = Column(UUID(as_uuid=True), ForeignKey("processes.id"), nullable=False, index=True)
    version_id = Column(UUID(as_uuid=True), ForeignKey("process_versions.id"), nullable=False, index=True)
    stakeholder_id = Column(UUID(as_uuid=True), ForeignKey("stakeholders.id"), nullable=False, index=True)
    rejected_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    reason = Column(Text, nullable=False)  # Motivo obrigatório
    additional_comments = Column(Text, nullable=True)
    addressed_in_version_id = Column(UUID(as_uuid=True), ForeignKey("process_versions.id"), nullable=True)

    # Relationships
    process = relationship("Process", back_populates="rejections")
    version = relationship("ProcessVersion", back_populates="rejections", foreign_keys=[version_id])
    stakeholder = relationship("Stakeholder", back_populates="rejections")
    addressed_version = relationship("ProcessVersion", foreign_keys=[addressed_in_version_id])

