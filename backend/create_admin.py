import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.stakeholder import Stakeholder, StakeholderType, UserRole

db = SessionLocal()

email = "resper@gmail.com"
password = "cvdf2025"

# Verificar se já existe
existing = db.query(Stakeholder).filter(Stakeholder.email == email).first()
if existing:
    existing.hashed_password = get_password_hash(password)
    existing.user_role = UserRole.ADMIN
    existing.type = StakeholderType.SINDICO
    existing.is_active = True
    existing.name = "Ricardo Esper"
    db.commit()
    print(f"✅ Usuário admin atualizado: {email}")
else:
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
    print(f"✅ Usuário admin criado: {email}")

db.close()
