from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from app.models.process import Process, ProcessStatus, ProcessCategory, DocumentType
from app.models.version import ProcessVersion
from app.schemas.process import ProcessCreate, ProcessUpdate


class ProcessService:
    def __init__(self, db: Session):
        self.db = db

    def get_processes(
        self,
        category: Optional[ProcessCategory] = None,
        status: Optional[ProcessStatus] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[List[Process], int]:
        """Listar processos com filtros e paginação"""
        query = self.db.query(Process)

        if category:
            query = query.filter(Process.category == category)
        if status:
            query = query.filter(Process.status == status)

        total = query.count()
        processes = query.order_by(Process.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

        return processes, total

    def get_process_by_id(self, process_id: UUID) -> Optional[Process]:
        """Buscar processo por ID"""
        return self.db.query(Process).filter(Process.id == process_id).first()

    def create_process(self, process_data: ProcessCreate, creator_id: UUID) -> Process:
        """Criar novo processo"""
        # Criar processo
        process = Process(
            name=process_data.name,
            category=process_data.category,
            subcategory=process_data.subcategory,
            document_type=process_data.document_type,
            status=ProcessStatus.RASCUNHO,
            creator_id=creator_id,
        )
        self.db.add(process)
        self.db.flush()

        # Criar versão inicial
        content = {
            "description": process_data.description or "",
            "workflow": process_data.workflow or [],
            "entities": process_data.entities or [],
            "variables": process_data.variables or [],
        }
        
        # Adicionar diagrama Mermaid se fornecido
        if hasattr(process_data, "mermaid_diagram") and process_data.mermaid_diagram:
            content["mermaid_diagram"] = process_data.mermaid_diagram
        
        version = ProcessVersion(
            process_id=process.id,
            version_number=1,
            content=content,
            content_text=process_data.description or "",
            entities_involved=process_data.entities or [],
            variables_applied={var: None for var in (process_data.variables or [])},
            created_by=creator_id,
            status=ProcessStatus.RASCUNHO,
        )
        self.db.add(version)
        self.db.commit()
        self.db.refresh(process)

        return process

    def update_process(self, process_id: UUID, process_data: ProcessUpdate) -> Optional[Process]:
        """Atualizar processo"""
        process = self.get_process_by_id(process_id)
        if not process:
            return None

        update_data = process_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            if hasattr(process, field):
                setattr(process, field, value)

        process.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(process)

        return process

    def delete_process(self, process_id: UUID) -> bool:
        """Deletar processo"""
        process = self.get_process_by_id(process_id)
        if not process:
            return False

        self.db.delete(process)
        self.db.commit()
        return True

