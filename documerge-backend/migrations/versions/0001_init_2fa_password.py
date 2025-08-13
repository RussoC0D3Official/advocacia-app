"""Initial migration: add 2FA session and password change fields"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0001_init_2fa_password'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    with op.batch_alter_table('users') as batch_op:
        batch_op.add_column(sa.Column('must_change_password', sa.Boolean(), nullable=True))
        batch_op.add_column(sa.Column('last_password_change', sa.DateTime(), nullable=True))
    op.create_table(
        'two_factor_sessions',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('valid_until', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
    )


def downgrade():
    op.drop_table('two_factor_sessions')
    with op.batch_alter_table('users') as batch_op:
        batch_op.drop_column('last_password_change')
        batch_op.drop_column('must_change_password')

