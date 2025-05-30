"""add otp_hash and otp_expiry to users

Revision ID: 43e6478ac8b0
Revises: c6176908982f
Create Date: 2025-05-05 22:42:21.915724

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '43e6478ac8b0'
down_revision: Union[str, None] = 'c6176908982f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('users', sa.Column('otp_hash', sa.String(), nullable=True))
    op.add_column('users', sa.Column('otp_expiry', sa.Float(), nullable=True))
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('users', 'otp_expiry')
    op.drop_column('users', 'otp_hash')
    # ### end Alembic commands ###
