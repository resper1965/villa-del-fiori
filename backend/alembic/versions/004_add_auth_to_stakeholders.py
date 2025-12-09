"""add authentication to stakeholders

Revision ID: 004
Revises: 003
Create Date: 2024-12-09 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '004'
down_revision = '003'
branch_labels = None
depends_on = None


def upgrade():
    # Criar enum UserRole
    op.execute("""
        CREATE TYPE userrole AS ENUM (
            'admin',
            'syndic',
            'council',
            'resident',
            'staff'
        )
    """)
    
    # Adicionar colunas de autenticação
    op.add_column('stakeholders', sa.Column('hashed_password', sa.String(255), nullable=True))
    op.add_column('stakeholders', sa.Column('user_role', postgresql.ENUM(
        'admin', 'syndic', 'council', 'resident', 'staff', name='userrole'
    ), nullable=False, server_default='resident'))
    
    # Criar índice para user_role
    op.create_index('ix_stakeholders_user_role', 'stakeholders', ['user_role'])
    
    # Atualizar roles existentes baseado no type
    op.execute("""
        UPDATE stakeholders
        SET user_role = CASE
            WHEN type = 'sindico' THEN 'syndic'::userrole
            WHEN type = 'conselheiro' THEN 'council'::userrole
            WHEN type = 'administradora' THEN 'staff'::userrole
            WHEN type = 'morador' THEN 'resident'::userrole
            ELSE 'resident'::userrole
        END
    """)


def downgrade():
    op.drop_index('ix_stakeholders_user_role', table_name='stakeholders')
    op.drop_column('stakeholders', 'user_role')
    op.drop_column('stakeholders', 'hashed_password')
    op.execute('DROP TYPE userrole')

