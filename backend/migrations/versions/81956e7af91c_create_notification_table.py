"""create notification table

Revision ID: 81956e7af91c
Revises: <previous_revision_id>  # Replace <previous_revision_id> with the actual previous revision ID
Create Date: 2025-05-14 10:00:00
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from typing import Sequence, Union

# Add the revision and down_revision variables
revision = '81956e7af91c'
down_revision: Union[str, None] = 'fd7a9ffa5d77' # Or the ID of the previous migration, if any


def upgrade():
    op.create_table(
        'tbl_notifications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('message', sa.String(), nullable=True),
        sa.Column('is_read', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['tbl_user.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade():
    op.drop_table('tbl_notifications')
