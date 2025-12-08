from sqlalchemy import Column, String, Enum, Text, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
import enum

from app.core.database import Base


class EntityType(str, enum.Enum):
    """Tipos de entidades do condomínio"""
    PESSOA = "pessoa"  # Síndico, Conselheiro, Faxineiro, etc.
    EMPRESA = "empresa"  # Administradora, Fornecedores, etc.
    SERVICO_EMERGENCIA = "servico_emergencia"  # Bombeiros, Polícia, SAMU
    INFRAESTRUTURA = "infraestrutura"  # Portão, Elevador, Sistema, etc.


class EntityCategory(str, enum.Enum):
    """Categorias específicas de entidades"""
    # Pessoas
    SINDICO = "sindico"
    CONSELHEIRO = "conselheiro"
    ADMINISTRADORA = "administradora"
    FAXINEIRO = "faxineiro"
    MORADOR = "morador"
    
    # Empresas
    PORTARIA_ONLINE = "portaria_online"
    SEGURANCA = "seguranca"
    MANUTENCAO_ELEVADOR = "manutencao_elevador"
    JARDINAGEM = "jardinagem"
    DEDETIZACAO = "dedetizacao"
    MANUTENCAO = "manutencao"
    GAS = "gas"
    ENERGIA = "energia"
    OUTRO_FORNECEDOR = "outro_fornecedor"
    
    # Serviços de Emergência
    BOMBEIROS = "bombeiros"
    POLICIA = "policia"
    SAMU = "samu"
    
    # Infraestrutura
    PORTAO = "portao"
    ELEVADOR = "elevador"
    SISTEMA_BIOMETRIA = "sistema_biometria"
    SISTEMA_CAMERAS = "sistema_cameras"


class Entity(Base):
    """Modelo para entidades do condomínio (pessoas, empresas, serviços, infraestrutura)"""
    __tablename__ = "entities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, index=True)
    type = Column(Enum(EntityType), nullable=False, index=True)
    category = Column(Enum(EntityCategory), nullable=True, index=True)
    
    # Informações de contato
    phone = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    contact_person = Column(String(255), nullable=True)  # Pessoa de contato (para empresas)
    
    # Informações adicionais
    description = Column(Text, nullable=True)
    address = Column(Text, nullable=True)
    
    # Configurações específicas
    emergency_phone = Column(String(50), nullable=True)  # Para serviços de emergência
    meeting_point = Column(String(255), nullable=True)  # Ponto de encontro (ex: incêndio)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    def __repr__(self):
        return f"<Entity(id={self.id}, name='{self.name}', type={self.type.value})>"

