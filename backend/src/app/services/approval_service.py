from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID
from datetime import datetime

from app.models.process import Process, ProcessStatus
from app.models.version import ProcessVersion
from app.models.approval import Approval, ApprovalType
from app.models.rejection import Rejection
from app.schemas.approval import ApprovalCreate, RejectionCreate


class ApprovalService:
    def __init__(self, db: Session):
        self.db = db

    def approve_process(
        self,
        process_id: UUID,
        version_id: UUID,
        stakeholder_id: UUID,
        approval_data: ApprovalCreate,
    ) -> Approval:
        """Aprovar processo/versão"""
        # Verificar se processo e versão existem
        process = self.db.query(Process).filter(Process.id == process_id).first()
        if not process:
            raise ValueError("Processo não encontrado")

        version = self.db.query(ProcessVersion).filter(
            ProcessVersion.id == version_id,
            ProcessVersion.process_id == process_id,
        ).first()
        if not version:
            raise ValueError("Versão não encontrada")

        # Verificar se já existe aprovação deste stakeholder para esta versão
        existing = self.db.query(Approval).filter(
            Approval.version_id == version_id,
            Approval.stakeholder_id == stakeholder_id,
        ).first()
        if existing:
            raise ValueError("Stakeholder já aprovou esta versão")

        # Criar aprovação
        approval = Approval(
            process_id=process_id,
            version_id=version_id,
            stakeholder_id=stakeholder_id,
            comments=approval_data.comments,
            approval_type=approval_data.approval_type,
            ressalvas=approval_data.ressalvas,
        )
        self.db.add(approval)

        # TODO: Verificar se todos os stakeholders necessários aprovaram
        # Se sim, atualizar status do processo para "aprovado"
        # Por enquanto, apenas marcar versão como aprovada se for a primeira aprovação
        if version.status == ProcessStatus.EM_REVISAO:
            # Verificar quantas aprovações existem para esta versão
            approval_count = self.db.query(Approval).filter(
                Approval.version_id == version_id
            ).count()
            # Por enquanto, considerar aprovado com 1 aprovação (simplificado)
            # TODO: Implementar lógica de workflow completo
            if approval_count == 0:  # Esta será a primeira
                version.status = ProcessStatus.APROVADO
                process.status = ProcessStatus.APROVADO

        self.db.commit()
        self.db.refresh(approval)

        return approval

    def reject_process(
        self,
        process_id: UUID,
        version_id: UUID,
        stakeholder_id: UUID,
        rejection_data: RejectionCreate,
    ) -> Rejection:
        """Rejeitar processo/versão"""
        # Verificar se processo e versão existem
        process = self.db.query(Process).filter(Process.id == process_id).first()
        if not process:
            raise ValueError("Processo não encontrado")

        version = self.db.query(ProcessVersion).filter(
            ProcessVersion.id == version_id,
            ProcessVersion.process_id == process_id,
        ).first()
        if not version:
            raise ValueError("Versão não encontrada")

        # Criar rejeição
        rejection = Rejection(
            process_id=process_id,
            version_id=version_id,
            stakeholder_id=stakeholder_id,
            reason=rejection_data.reason,
            additional_comments=rejection_data.additional_comments,
        )
        self.db.add(rejection)

        # Atualizar status do processo e versão para rejeitado
        version.status = ProcessStatus.REJEITADO
        process.status = ProcessStatus.REJEITADO

        self.db.commit()
        self.db.refresh(rejection)

        return rejection

    def get_process_approvals(self, process_id: UUID) -> list[Approval]:
        """Listar aprovações de um processo"""
        return self.db.query(Approval).filter(
            Approval.process_id == process_id
        ).order_by(Approval.approved_at.desc()).all()

    def get_process_rejections(self, process_id: UUID) -> list[Rejection]:
        """Listar rejeições de um processo"""
        return self.db.query(Rejection).filter(
            Rejection.process_id == process_id
        ).order_by(Rejection.rejected_at.desc()).all()

    def get_version_approvals(self, version_id: UUID) -> list[Approval]:
        """Listar aprovações de uma versão"""
        return self.db.query(Approval).filter(
            Approval.version_id == version_id
        ).order_by(Approval.approved_at.desc()).all()

    def get_version_rejections(self, version_id: UUID) -> list[Rejection]:
        """Listar rejeições de uma versão"""
        return self.db.query(Rejection).filter(
            Rejection.version_id == version_id
        ).order_by(Rejection.rejected_at.desc()).all()

