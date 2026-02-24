"""add ai_jobs and relax report photo nullability

Revision ID: 20260223_0002
Revises: 20260223_0001
Create Date: 2026-02-23 00:02:00
"""
from __future__ import annotations

from alembic import op


revision = "20260223_0002"
down_revision = "20260223_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS ai_jobs (
            id BIGSERIAL PRIMARY KEY,
            case_id VARCHAR NOT NULL UNIQUE REFERENCES pothole_reports(case_id) ON DELETE CASCADE,
            status VARCHAR NOT NULL DEFAULT 'QUEUED',
            attempts INTEGER NOT NULL DEFAULT 0,
            max_attempts INTEGER NOT NULL DEFAULT 3,
            error_message TEXT,
            queued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            started_at TIMESTAMPTZ,
            finished_at TIMESTAMPTZ,
            next_retry_at TIMESTAMPTZ
        );
        """
    )
    op.execute("CREATE INDEX IF NOT EXISTS ix_ai_jobs_id ON ai_jobs(id);")
    op.execute("CREATE INDEX IF NOT EXISTS ix_ai_jobs_case_id ON ai_jobs(case_id);")
    op.execute("CREATE INDEX IF NOT EXISTS ix_ai_jobs_status ON ai_jobs(status);")
    op.execute("ALTER TABLE pothole_reports ALTER COLUMN photo_top DROP NOT NULL;")
    op.execute("ALTER TABLE pothole_reports ALTER COLUMN photo_far DROP NOT NULL;")
    op.execute("ALTER TABLE pothole_reports ALTER COLUMN photo_close DROP NOT NULL;")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS ai_jobs;")

