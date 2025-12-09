"""create admin user

Revision ID: 005
Revises: 004
Create Date: 2024-12-09 12:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid
from datetime import datetime

# revision identifiers, used by Alembic.
revision = '005'
down_revision = '004'
branch_labels = None
depends_on = None


def upgrade():
    # Hash bcrypt de 'cvdf2025' 
    # IMPORTANTE: Este hash precisa ser gerado corretamente com passlib
    # Hash temporário - será atualizado quando o script Python for executado
    # Por enquanto, vamos usar um hash placeholder que será atualizado
    password_hash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY5Y5Y5Y5Y5Y'
    
    # Verificar se usuário já existe e inserir ou atualizar
    op.execute(f"""
        INSERT INTO stakeholders (
            id,
            name,
            email,
            hashed_password,
            type,
            role,
            user_role,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            gen_random_uuid(),
            'Ricardo Esper',
            'resper@gmail.com',
            '{password_hash}',
            'sindico'::stakeholdertype,
            'aprovador'::stakeholderrole,
            'admin'::userrole,
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (email) DO UPDATE
        SET
            hashed_password = EXCLUDED.hashed_password,
            user_role = EXCLUDED.user_role,
            type = EXCLUDED.type,
            is_active = true,
            updated_at = NOW()
    """)


def downgrade():
    # Remover usuário admin (opcional - comentado para segurança)
    # op.execute("DELETE FROM stakeholders WHERE email = 'resper@gmail.com'")
    pass

