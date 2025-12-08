"""Add entities table

Revision ID: 002
Revises: 001
Create Date: 2024-12-08

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade():
    # Criar enum EntityType
    op.execute("""
        CREATE TYPE entitytype AS ENUM (
            'pessoa',
            'empresa',
            'servico_emergencia',
            'infraestrutura'
        )
    """)
    
    # Criar enum EntityCategory
    op.execute("""
        CREATE TYPE entitycategory AS ENUM (
            'sindico',
            'conselheiro',
            'administradora',
            'faxineiro',
            'morador',
            'portaria_online',
            'seguranca',
            'manutencao_elevador',
            'jardinagem',
            'dedetizacao',
            'manutencao',
            'gas',
            'energia',
            'outro_fornecedor',
            'bombeiros',
            'policia',
            'samu',
            'portao',
            'elevador',
            'sistema_biometria',
            'sistema_cameras'
        )
    """)
    
    # Criar tabela entities
    op.create_table(
        'entities',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('type', postgresql.ENUM('pessoa', 'empresa', 'servico_emergencia', 'infraestrutura', name='entitytype'), nullable=False),
        sa.Column('category', postgresql.ENUM('sindico', 'conselheiro', 'administradora', 'faxineiro', 'morador', 'portaria_online', 'seguranca', 'manutencao_elevador', 'jardinagem', 'dedetizacao', 'manutencao', 'gas', 'energia', 'outro_fornecedor', 'bombeiros', 'policia', 'samu', 'portao', 'elevador', 'sistema_biometria', 'sistema_cameras', name='entitycategory'), nullable=True),
        sa.Column('phone', sa.String(50), nullable=True),
        sa.Column('email', sa.String(255), nullable=True),
        sa.Column('contact_person', sa.String(255), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('emergency_phone', sa.String(50), nullable=True),
        sa.Column('meeting_point', sa.String(255), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    
    # Criar índices
    op.create_index('ix_entities_name', 'entities', ['name'])
    op.create_index('ix_entities_type', 'entities', ['type'])
    op.create_index('ix_entities_category', 'entities', ['category'])
    op.create_index('ix_entities_is_active', 'entities', ['is_active'])


def downgrade():
    op.drop_index('ix_entities_is_active', table_name='entities')
    op.drop_index('ix_entities_category', table_name='entities')
    op.drop_index('ix_entities_type', table_name='entities')
    op.drop_index('ix_entities_name', table_name='entities')
    op.drop_table('entities')
    op.execute('DROP TYPE entitycategory')
    op.execute('DROP TYPE entitytype')

