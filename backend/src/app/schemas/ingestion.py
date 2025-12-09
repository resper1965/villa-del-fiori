from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


class EntityCategory(str, Enum):
    """Categorias de entidades detectadas"""
    SINDICO = "sindico"
    CONSELHEIRO = "conselheiro"
    ADMINISTRADORA = "administradora"
    FAXINEIRO = "faxineiro"
    MORADOR = "morador"
    PORTARIA_ONLINE = "portaria_online"
    SEGURANCA = "seguranca"
    MANUTENCAO_ELEVADOR = "manutencao_elevador"
    JARDINAGEM = "jardinagem"
    DEDETIZACAO = "dedetizacao"
    MANUTENCAO = "manutencao"
    GAS = "gas"
    ENERGIA = "energia"
    OUTRO_FORNECEDOR = "outro_fornecedor"
    BOMBEIROS = "bombeiros"
    POLICIA = "policia"
    SAMU = "samu"
    PORTAO = "portao"
    ELEVADOR = "elevador"
    SISTEMA_BIOMETRIA = "sistema_biometria"
    SISTEMA_CAMERAS = "sistema_cameras"


class DetectedEntity(BaseModel):
    """Entidade detectada no contrato"""
    name: str = Field(..., description="Nome da entidade")
    category: Optional[EntityCategory] = Field(None, description="Categoria da entidade se identificável")
    suggested_type: str = Field(..., description="Tipo sugerido: 'pessoa', 'empresa', 'servico_emergencia' ou 'infraestrutura'")
    context: Optional[str] = Field(None, description="Contexto onde a entidade foi mencionada")


class WorkflowStep(BaseModel):
    """Etapa do workflow extraída do contrato"""
    order: int = Field(..., description="Ordem sequencial da etapa", ge=1)
    description: str = Field(..., description="Descrição detalhada da etapa")
    role: Optional[str] = Field(None, description="Papel/responsável principal da etapa")
    sla: Optional[str] = Field(None, description="SLA ou prazo mencionado (ex: '24 horas', '5 dias úteis')")
    periodicity: Optional[str] = Field(None, description="Periodicidade se aplicável (ex: 'mensal', 'semanal', 'diário')")


class RACIEntry(BaseModel):
    """Entrada da matriz RACI"""
    step: str = Field(..., description="Descrição da etapa")
    responsible: List[str] = Field(default_factory=list, description="Lista de entidades responsáveis (R)")
    accountable: List[str] = Field(default_factory=list, description="Lista de entidades aprovadoras (A)")
    consulted: List[str] = Field(default_factory=list, description="Lista de entidades consultadas (C)")
    informed: List[str] = Field(default_factory=list, description="Lista de entidades informadas (I)")


class ContractExtractionResponse(BaseModel):
    """Resposta da extração de contrato"""
    suggested_title: str = Field(..., description="Título sugerido para o processo")
    suggested_description: str = Field(..., description="Descrição detalhada do processo extraída do contrato")
    detected_entities: List[DetectedEntity] = Field(default_factory=list, description="Lista de entidades detectadas no contrato")
    steps: List[WorkflowStep] = Field(default_factory=list, description="Etapas do workflow extraídas do contrato")
    raci: List[RACIEntry] = Field(default_factory=list, description="Matriz RACI sugerida baseada nas etapas e entidades")
    ambiguities: List[str] = Field(default_factory=list, description="Lista de ambiguidades ou dúvidas que precisam de revisão humana")
    suggested_category: Optional[str] = Field(None, description="Categoria sugerida: 'governanca', 'acesso_seguranca', 'operacao', 'areas_comuns', 'convivencia', 'eventos', 'emergencias'")
    suggested_document_type: Optional[str] = Field(None, description="Tipo de documento sugerido: 'pop', 'manual', 'regulamento', etc.")

    class Config:
        json_schema_extra = {
            "example": {
                "suggested_title": "Manutenção Preventiva de Elevadores",
                "suggested_description": "Processo para manutenção preventiva mensal dos elevadores...",
                "detected_entities": [
                    {
                        "name": "Empresa de Manutenção dos Elevadores",
                        "category": "manutencao_elevador",
                        "suggested_type": "empresa",
                        "context": "Responsável pela manutenção mensal"
                    }
                ],
                "steps": [
                    {
                        "order": 1,
                        "description": "Agendamento da manutenção com 7 dias de antecedência",
                        "role": "Administradora",
                        "sla": "7 dias",
                        "periodicity": "mensal"
                    }
                ],
                "raci": [
                    {
                        "step": "Agendamento da manutenção",
                        "responsible": ["Administradora"],
                        "accountable": ["Síndico"],
                        "consulted": [],
                        "informed": ["Moradores"]
                    }
                ],
                "ambiguities": [
                    "Não ficou claro se a manutenção deve ser notificada aos moradores com antecedência"
                ],
                "suggested_category": "operacao",
                "suggested_document_type": "pop"
            }
        }

