from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Dict, Set
from datetime import datetime, timedelta

from app.models.entity import Entity
from app.models.validation import ValidationResult
from app.schemas.validation import (
    ValidationResult as ValidationResultSchema,
    EntityValidationIssue,
)


class EntityValidationService:
    """Serviço para validação de entidades em processos"""

    # Campos obrigatórios por tipo de entidade
    REQUIRED_FIELDS_BY_TYPE = {
        "pessoa": ["name", "type"],
        "empresa": ["name", "type", "phone", "email"],
        "servico_emergencia": ["name", "type", "phone"],
        "infraestrutura": ["name", "type"],
    }

    # Campos obrigatórios por categoria específica
    REQUIRED_FIELDS_BY_CATEGORY = {
        "sindico": ["name", "phone", "email"],
        "administradora": ["name", "phone", "email", "contact_person"],
        "portaria_online": ["name", "phone", "email"],
        "bombeiros": ["name", "phone", "emergency_phone"],
        "policia": ["name", "phone", "emergency_phone"],
        "samu": ["name", "phone", "emergency_phone"],
    }

    def __init__(self, db: Session):
        self.db = db

    def validate_entities(self, entity_names: List[str]) -> ValidationResultSchema:
        """
        Valida se todas as entidades existem e estão completas
        
        Args:
            entity_names: Lista de nomes de entidades para validar
            
        Returns:
            ValidationResultSchema com resultado da validação
        """
        if not entity_names:
            return ValidationResultSchema(
                valid=True,
                missing_entities=[],
                incomplete_entities=[],
                errors=[],
                validated_entities=[],
            )

        # Buscar todas as entidades de uma vez
        entities = self.db.query(Entity).filter(
            and_(
                Entity.name.in_(entity_names),
                Entity.is_active == True
            )
        ).all()

        # Criar dicionário para busca rápida
        entity_dict = {entity.name: entity for entity in entities}
        found_entity_names = set(entity_dict.keys())

        # Identificar entidades faltantes
        missing_entities = [name for name in entity_names if name not in found_entity_names]

        # Validar completude das entidades encontradas
        incomplete_entities = []
        validated_entities = []

        for entity_name, entity in entity_dict.items():
            issues = self._check_entity_completeness(entity)
            if issues:
                incomplete_entities.append(
                    EntityValidationIssue(
                        entity_name=entity_name,
                        issue_type="incomplete",
                        missing_fields=issues,
                    )
                )
            else:
                validated_entities.append(entity_name)

        # Determinar se validação passou
        is_valid = len(missing_entities) == 0 and len(incomplete_entities) == 0

        return ValidationResultSchema(
            valid=is_valid,
            missing_entities=missing_entities,
            incomplete_entities=incomplete_entities,
            errors=[],
            validated_entities=validated_entities,
        )

    def _check_entity_completeness(self, entity: Entity) -> List[str]:
        """
        Verifica se entidade tem todos os campos obrigatórios preenchidos
        
        Args:
            entity: Entidade a verificar
            
        Returns:
            Lista de campos obrigatórios faltantes (vazia se completa)
        """
        missing_fields = []

        # Verificar campos obrigatórios por tipo
        required_by_type = self.REQUIRED_FIELDS_BY_TYPE.get(entity.type.value, [])
        for field in required_by_type:
            if not self._has_field_value(entity, field):
                missing_fields.append(field)

        # Verificar campos obrigatórios por categoria (mais específico)
        if entity.category:
            required_by_category = self.REQUIRED_FIELDS_BY_CATEGORY.get(
                entity.category.value, []
            )
            for field in required_by_category:
                if not self._has_field_value(entity, field):
                    if field not in missing_fields:
                        missing_fields.append(field)

        return missing_fields

    def _has_field_value(self, entity: Entity, field_name: str) -> bool:
        """Verifica se campo tem valor não vazio"""
        value = getattr(entity, field_name, None)
        if value is None:
            return False
        if isinstance(value, str):
            return value.strip() != ""
        return True

    def get_missing_entities(self, entity_names: List[str]) -> List[str]:
        """Retorna lista de entidades que não existem"""
        if not entity_names:
            return []

        existing = self.db.query(Entity.name).filter(
            and_(
                Entity.name.in_(entity_names),
                Entity.is_active == True
            )
        ).all()

        existing_names = {name[0] for name in existing}
        return [name for name in entity_names if name not in existing_names]

    def get_incomplete_entities(self, entity_names: List[str]) -> List[EntityValidationIssue]:
        """Retorna lista de entidades que existem mas estão incompletas"""
        if not entity_names:
            return []

        entities = self.db.query(Entity).filter(
            and_(
                Entity.name.in_(entity_names),
                Entity.is_active == True
            )
        ).all()

        incomplete = []
        for entity in entities:
            missing_fields = self._check_entity_completeness(entity)
            if missing_fields:
                incomplete.append(
                    EntityValidationIssue(
                        entity_name=entity.name,
                        issue_type="incomplete",
                        missing_fields=missing_fields,
                    )
                )

        return incomplete

