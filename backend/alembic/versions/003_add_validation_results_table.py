"""add validation results table

Revision ID: 003
Revises: 002
Create Date: 2024-12-08 20:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade():
    # Create validation_results table
    op.create_table(
        'validation_results',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('process_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('is_valid', sa.Boolean(), nullable=False, default=False),
        sa.Column('missing_entities', postgresql.JSON, nullable=True),
        sa.Column('incomplete_entities', postgresql.JSON, nullable=True),
        sa.Column('errors', postgresql.JSON, nullable=True),
        sa.Column('validated_entities', postgresql.JSON, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['process_id'], ['processes.id'], ondelete='CASCADE'),
    )
    op.create_index('ix_validation_results_process_id', 'validation_results', ['process_id'])


def downgrade():
    op.drop_index('ix_validation_results_process_id', table_name='validation_results')
    op.drop_table('validation_results')

