from sqlalchemy import Column, String, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
import enum

from app.core.database import Base


class StakeholderType(str, enum.Enum):
    SINDICO = "sindico"
    CONSELHEIRO = "conselheiro"
    ADMINISTRADORA = "administradora"
    MORADOR = "morador"
    STAFF = "staff"
    OUTRO = "outro"


class UserRole(str, enum.Enum):
    """Roles para RBAC - baseado em permissões do sistema"""
    ADMIN = "admin"  # Administrador do sistema
    SYNDIC = "syndic"  # Síndico
    COUNCIL = "council"  # Conselho consultivo
    RESIDENT = "resident"  # Morador
    STAFF = "staff"  # Funcionário/Staff


class StakeholderRole(str, enum.Enum):
    """Roles antigas - mantidas para compatibilidade"""
    APROVADOR = "aprovador"
    VISUALIZADOR = "visualizador"
    EDITOR = "editor"


class Stakeholder(Base):
    __tablename__ = "stakeholders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=True)  # Nullable para migração gradual
    type = Column(SQLEnum(StakeholderType), nullable=False, index=True)
    role = Column(SQLEnum(StakeholderRole), nullable=False, default=StakeholderRole.VISUALIZADOR)
    user_role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.RESIDENT, index=True)  # Nova role para RBAC
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    approvals = relationship("Approval", back_populates="stakeholder")
    rejections = relationship("Rejection", back_populates="stakeholder")
    created_processes = relationship("Process", back_populates="creator", foreign_keys="Process.creator_id")

