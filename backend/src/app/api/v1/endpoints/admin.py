from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from pathlib import Path

from app.core.database import get_db
from app.core.security import get_current_admin, get_password_hash
from app.models.stakeholder import Stakeholder, StakeholderType, UserRole

router = APIRouter()


class CreateUserRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    user_role: UserRole
    type: StakeholderType


@router.post("/create-admin")
async def create_admin_user(
    db: Session = Depends(get_db),
    # Temporariamente sem autenticação para criação inicial
    # current_user: Stakeholder = Depends(get_current_admin),
):
    """
    Endpoint temporário para criar usuário admin inicial
    REMOVER após criar o primeiro admin!
    """
    email = "resper@gmail.com"
    password = "cvdf2025"
    
    # Verificar se já existe
    existing = db.query(Stakeholder).filter(Stakeholder.email == email).first()
    if existing:
        # Atualizar senha
        existing.hashed_password = get_password_hash(password)
        existing.user_role = UserRole.ADMIN
        existing.type = StakeholderType.SINDICO
        existing.is_active = True
        existing.name = "Ricardo Esper"
        db.commit()
        db.refresh(existing)
        return {
            "message": "Usuário admin atualizado",
            "email": existing.email,
            "id": str(existing.id),
        }
    
    # Criar novo
    admin = Stakeholder(
        name="Ricardo Esper",
        email=email,
        hashed_password=get_password_hash(password),
        type=StakeholderType.SINDICO,
        user_role=UserRole.ADMIN,
        is_active=True,
    )
    
    db.add(admin)
    db.commit()
    db.refresh(admin)
    
    return {
        "message": "Usuário admin criado com sucesso",
        "email": admin.email,
        "id": str(admin.id),
        "password": password,  # Retornar apenas na criação inicial
    }


@router.post("/run-migrations")
async def run_migrations(
    db: Session = Depends(get_db),
    # Temporariamente sem autenticação para execução inicial
    # current_user: Stakeholder = Depends(get_current_admin),
):
    """
    Endpoint temporário para executar migrations do Alembic
    REMOVER após executar as migrations iniciais!
    """
    try:
        import os
        from pathlib import Path
        from alembic.config import Config
        from alembic import command
        from app.core.config import settings
        
        # Determinar o caminho do diretório alembic
        # Em serverless, o caminho pode variar
        backend_path = Path(__file__).parent.parent.parent.parent.parent
        alembic_path = backend_path / "alembic"
        
        # Se não encontrar, tentar caminho relativo
        if not alembic_path.exists():
            alembic_path = Path("alembic")
        
        # Configurar Alembic
        alembic_cfg = Config()
        alembic_cfg.set_main_option("script_location", str(alembic_path))
        alembic_cfg.set_main_option("sqlalchemy.url", settings.DATABASE_URL)
        
        # Executar upgrade head
        command.upgrade(alembic_cfg, "head")
        
        return {
            "message": "Migrations executadas com sucesso",
            "status": "ok"
        }
    except Exception as e:
        import traceback
        error_detail = f"Erro ao executar migrations: {str(e)}\n{traceback.format_exc()}"
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_detail
        )

