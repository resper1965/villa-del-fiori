#!/usr/bin/env python3
"""
Script para atualizar a senha do usuário admin com hash correto
Execute após instalar as dependências: pip install -r requirements.txt
"""
import sys
import os

# Adicionar o diretório raiz ao path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.stakeholder import Stakeholder
from app.core.security import get_password_hash

def update_admin_password():
    """Atualizar senha do usuário admin com hash correto"""
    db: Session = SessionLocal()
    
    try:
        admin = db.query(Stakeholder).filter(Stakeholder.email == "resper@gmail.com").first()
        
        if not admin:
            print("❌ Usuário admin não encontrado. Execute a migration 005 primeiro.")
            return
        
        password = "cvdf2025"
        admin.hashed_password = get_password_hash(password)
        admin.user_role = "admin"
        admin.type = "sindico"
        admin.is_active = True
        
        db.commit()
        db.refresh(admin)
        
        print(f"✅ Senha do usuário admin atualizada com sucesso!")
        print(f"   Email: {admin.email}")
        print(f"   Senha: {password}")
        print(f"   Hash: {admin.hashed_password[:20]}...")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Erro ao atualizar senha: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    update_admin_password()

