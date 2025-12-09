#!/usr/bin/env python3
"""
Script para criar usuário admin inicial
"""
import sys
import os

# Adicionar o diretório raiz ao path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.stakeholder import Stakeholder, StakeholderType, UserRole
from app.core.security import get_password_hash

def create_admin_user():
    """Criar usuário admin inicial"""
    db: Session = SessionLocal()
    
    try:
        # Verificar se já existe
        existing = db.query(Stakeholder).filter(Stakeholder.email == "resper@gmail.com").first()
        if existing:
            print(f"✅ Usuário {existing.email} já existe!")
            if existing.hashed_password:
                print("   Usuário já possui senha configurada.")
            else:
                # Atualizar senha se não tiver
                password = "cvdf2025"
                existing.hashed_password = get_password_hash(password)
                existing.user_role = UserRole.ADMIN
                existing.type = StakeholderType.SINDICO
                existing.is_active = True
                db.commit()
                print(f"   ✅ Senha atualizada: {password}")
            return existing
        
        # Criar novo usuário
        password = "cvdf2025"
        admin = Stakeholder(
            name="Ricardo Esper",
            email="resper@gmail.com",
            hashed_password=get_password_hash(password),
            type=StakeholderType.SINDICO,
            user_role=UserRole.ADMIN,
            is_active=True,
        )
        
        db.add(admin)
        db.commit()
        db.refresh(admin)
        
        print(f"✅ Usuário admin criado com sucesso!")
        print(f"   Nome: {admin.name}")
        print(f"   Email: {admin.email}")
        print(f"   Senha: {password}")
        print(f"   Role: {admin.user_role.value}")
        print(f"   ID: {admin.id}")
        
        return admin
        
    except Exception as e:
        db.rollback()
        print(f"❌ Erro ao criar usuário: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()

