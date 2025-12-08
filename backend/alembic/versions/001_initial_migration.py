"""Initial migration: create all tables

Revision ID: 001_initial
Revises: 
Create Date: 2024-12-08

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create stakeholders table
    op.create_table(
        'stakeholders',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('email', sa.String(255), unique=True, nullable=False),
        sa.Column('type', sa.Enum('sindico', 'conselheiro', 'administradora', 'morador', 'outro', name='stakeholdertype'), nullable=False),
        sa.Column('role', sa.Enum('aprovador', 'visualizador', 'editor', name='stakeholderrole'), nullable=False, server_default='visualizador'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
    )
    op.create_index('ix_stakeholders_email', 'stakeholders', ['email'])
    op.create_index('ix_stakeholders_type', 'stakeholders', ['type'])
    op.create_index('ix_stakeholders_is_active', 'stakeholders', ['is_active'])

    # Create processes table
    op.create_table(
        'processes',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('category', sa.Enum('governanca', 'acesso_seguranca', 'operacao', 'areas_comuns', 'convivencia', 'eventos', 'emergencias', name='processcategory'), nullable=False),
        sa.Column('subcategory', sa.String(255), nullable=True),
        sa.Column('document_type', sa.Enum('pop', 'manual', 'regulamento', 'fluxograma', 'aviso', 'comunicado', 'checklist', 'formulario', 'politica', name='documenttype'), nullable=False),
        sa.Column('status', sa.Enum('rascunho', 'em_revisao', 'aprovado', 'rejeitado', name='processstatus'), nullable=False, server_default='rascunho'),
        sa.Column('current_version_number', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('creator_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['creator_id'], ['stakeholders.id']),
    )
    op.create_index('ix_processes_name', 'processes', ['name'])
    op.create_index('ix_processes_category', 'processes', ['category'])
    op.create_index('ix_processes_status', 'processes', ['status'])
    op.create_index('ix_processes_creator_id', 'processes', ['creator_id'])
    op.create_index('ix_processes_created_at', 'processes', ['created_at'])

    # Create process_versions table
    op.create_table(
        'process_versions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('process_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('version_number', sa.Integer(), nullable=False),
        sa.Column('content', postgresql.JSONB(), nullable=False),
        sa.Column('content_text', sa.Text(), nullable=True),
        sa.Column('variables_applied', postgresql.JSONB(), nullable=True),
        sa.Column('entities_involved', postgresql.JSONB(), nullable=True),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('status', sa.Enum('rascunho', 'em_revisao', 'aprovado', 'rejeitado', name='processstatus'), nullable=False, server_default='rascunho'),
        sa.Column('change_summary', sa.Text(), nullable=True),
        sa.Column('previous_version_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.ForeignKeyConstraint(['process_id'], ['processes.id']),
        sa.ForeignKeyConstraint(['created_by'], ['stakeholders.id']),
        sa.ForeignKeyConstraint(['previous_version_id'], ['process_versions.id']),
        sa.UniqueConstraint('process_id', 'version_number', name='uq_process_version'),
    )
    op.create_index('ix_process_versions_process_id', 'process_versions', ['process_id'])
    op.create_index('ix_process_versions_created_at', 'process_versions', ['created_at'])

    # Create approvals table
    op.create_table(
        'approvals',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('process_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('version_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('stakeholder_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('approved_at', sa.DateTime(), nullable=False),
        sa.Column('comments', sa.Text(), nullable=True),
        sa.Column('approval_type', sa.Enum('aprovado', 'aprovado_com_ressalvas', name='approvaltype'), nullable=False, server_default='aprovado'),
        sa.Column('ressalvas', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['process_id'], ['processes.id']),
        sa.ForeignKeyConstraint(['version_id'], ['process_versions.id']),
        sa.ForeignKeyConstraint(['stakeholder_id'], ['stakeholders.id']),
        sa.UniqueConstraint('version_id', 'stakeholder_id', name='uq_version_stakeholder_approval'),
    )
    op.create_index('ix_approvals_process_id', 'approvals', ['process_id'])
    op.create_index('ix_approvals_version_id', 'approvals', ['version_id'])
    op.create_index('ix_approvals_stakeholder_id', 'approvals', ['stakeholder_id'])
    op.create_index('ix_approvals_approved_at', 'approvals', ['approved_at'])

    # Create rejections table
    op.create_table(
        'rejections',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('process_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('version_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('stakeholder_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('rejected_at', sa.DateTime(), nullable=False),
        sa.Column('reason', sa.Text(), nullable=False),
        sa.Column('additional_comments', sa.Text(), nullable=True),
        sa.Column('addressed_in_version_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.ForeignKeyConstraint(['process_id'], ['processes.id']),
        sa.ForeignKeyConstraint(['version_id'], ['process_versions.id']),
        sa.ForeignKeyConstraint(['stakeholder_id'], ['stakeholders.id']),
        sa.ForeignKeyConstraint(['addressed_in_version_id'], ['process_versions.id']),
    )
    op.create_index('ix_rejections_process_id', 'rejections', ['process_id'])
    op.create_index('ix_rejections_version_id', 'rejections', ['version_id'])
    op.create_index('ix_rejections_stakeholder_id', 'rejections', ['stakeholder_id'])
    op.create_index('ix_rejections_rejected_at', 'rejections', ['rejected_at'])


def downgrade() -> None:
    op.drop_table('rejections')
    op.drop_table('approvals')
    op.drop_table('process_versions')
    op.drop_table('processes')
    op.drop_table('stakeholders')
    
    # Drop enums
    sa.Enum(name='stakeholdertype').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='stakeholderrole').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='processcategory').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='documenttype').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='processstatus').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='approvaltype').drop(op.get_bind(), checkfirst=True)

