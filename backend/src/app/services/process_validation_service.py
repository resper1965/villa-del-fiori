from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Dict
from uuid import UUID

from app.models.process import Process
from app.models.entity import Entity
from app.services.entity_validation_service import EntityValidationService
from app.schemas.validation import (
    BatchValidationReport,
    ProcessValidationIssue,
    EntityValidationIssue,
)


class ProcessValidationService:
    """Serviço para validação de processos em lote"""

    def __init__(self, db: Session):
        self.db = db
        self.entity_validator = EntityValidationService(db)

    def validate_all_processes(
        self, process_ids: List[UUID] = None
    ) -> BatchValidationReport:
        """
        Valida todos os processos ou processos específicos
        
        Args:
            process_ids: Lista de IDs de processos para validar (None = todos)
            
        Returns:
            BatchValidationReport com resultado da validação
        """
        # Buscar processos
        query = self.db.query(Process)
        if process_ids:
            query = query.filter(Process.id.in_(process_ids))
        
        processes = query.all()
        total_processes = len(processes)

        valid_count = 0
        invalid_count = 0
        processes_with_issues = []

        for process in processes:
            # Extrair entidades da versão atual do processo
            entities = []
            if process.versions:
                # Buscar versão atual (maior número de versão)
                current_version = max(process.versions, key=lambda v: v.version_number)
                if current_version and current_version.entities_involved:
                    if isinstance(current_version.entities_involved, list):
                        entities = current_version.entities_involved
                    elif isinstance(current_version.entities_involved, str):
                        # Se for string JSON, fazer parse
                        import json
                        try:
                            entities = json.loads(current_version.entities_involved)
                        except:
                            entities = []

            # Validar entidades
            validation_result = self.entity_validator.validate_entities(entities)

            if validation_result.valid:
                valid_count += 1
            else:
                invalid_count += 1
                processes_with_issues.append(
                    ProcessValidationIssue(
                        process_id=process.id,
                        process_name=process.name,
                        issues=validation_result.incomplete_entities,
                        missing_entities=validation_result.missing_entities,
                        incomplete_entities=validation_result.incomplete_entities,
                    )
                )

        return BatchValidationReport(
            total_processes=total_processes,
            valid_processes=valid_count,
            invalid_processes=invalid_count,
            processes_with_issues=processes_with_issues,
        )

    def calculate_integrity_metrics(self) -> Dict:
        """
        Calcula métricas de integridade do sistema
        
        Returns:
            Dicionário com métricas
        """
        from app.models.entity import Entity
        from sqlalchemy import func, case

        # Total de entidades
        total_entities = self.db.query(Entity).filter(Entity.is_active == True).count()

        # Entidades completas vs incompletas
        # Para simplificar, vamos considerar completa se tem name, type e pelo menos phone ou email
        complete_entities = self.db.query(Entity).filter(
            and_(
                Entity.is_active == True,
                Entity.name.isnot(None),
                Entity.type.isnot(None),
                func.or_(
                    Entity.phone.isnot(None),
                    Entity.email.isnot(None)
                )
            )
        ).count()

        incomplete_entities = total_entities - complete_entities

        # Total de processos
        total_processes = self.db.query(Process).count()

        # Processos validados (todos por enquanto, pode ser melhorado com cache)
        validated_processes = total_processes

        # Processos com problemas (precisa validar todos)
        validation_report = self.validate_all_processes()
        processes_with_issues = validation_report.invalid_processes

        # Entidades órfãs (não usadas em nenhum processo)
        # Buscar todas as entidades usadas em processos
        all_processes = self.db.query(Process).all()
        used_entity_names = set()
        for process in all_processes:
            if process.versions:
                current_version = max(process.versions, key=lambda v: v.version_number)
                if current_version and current_version.entities_involved:
                    if isinstance(current_version.entities_involved, list):
                        used_entity_names.update(current_version.entities_involved)
                    elif isinstance(current_version.entities_involved, str):
                        import json
                        try:
                            used_entity_names.update(json.loads(current_version.entities_involved))
                        except:
                            pass

        # Entidades que não são usadas
        all_entity_names = {
            name[0] for name in self.db.query(Entity.name).filter(Entity.is_active == True).all()
        }
        orphaned_entities = list(all_entity_names - used_entity_names)

        return {
            "total_entities": total_entities,
            "complete_entities": complete_entities,
            "incomplete_entities": incomplete_entities,
            "total_processes": total_processes,
            "validated_processes": validated_processes,
            "processes_with_issues": processes_with_issues,
            "orphaned_entities": orphaned_entities,
        }

