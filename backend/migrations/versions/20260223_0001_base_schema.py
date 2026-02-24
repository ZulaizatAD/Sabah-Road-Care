"""base schema for users and pothole_reports

Revision ID: 20260223_0001
Revises:
Create Date: 2026-02-23 00:01:00
"""
from __future__ import annotations

from alembic import op


revision = "20260223_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            full_name VARCHAR(255),
            password_hash VARCHAR(255) NOT NULL,
            profile_picture VARCHAR(255),
            is_active BOOLEAN NOT NULL DEFAULT TRUE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        """
    )
    op.execute("CREATE INDEX IF NOT EXISTS ix_users_id ON users(id);")
    op.execute("CREATE INDEX IF NOT EXISTS ix_users_email ON users(email);")

    op.execute(
        """
        CREATE TABLE IF NOT EXISTS pothole_reports (
            case_id VARCHAR PRIMARY KEY,
            email VARCHAR NOT NULL,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            location JSON NOT NULL,
            district VARCHAR NOT NULL,
            latitude DOUBLE PRECISION NOT NULL,
            longitude DOUBLE PRECISION NOT NULL,
            description TEXT,
            date_created TIMESTAMPTZ DEFAULT NOW(),
            last_date_status_update TIMESTAMPTZ DEFAULT NOW(),
            severity VARCHAR NOT NULL DEFAULT 'Analyzing',
            status VARCHAR NOT NULL DEFAULT 'Under Review',
            priority VARCHAR NOT NULL DEFAULT 'Medium',
            ai_analysis_completed BOOLEAN NOT NULL DEFAULT FALSE,
            ai_confidence DOUBLE PRECISION DEFAULT 0.0,
            pothole_length_cm DOUBLE PRECISION,
            pothole_width_cm DOUBLE PRECISION,
            pothole_depth_cm DOUBLE PRECISION,
            similar_reports_count INTEGER DEFAULT 0,
            unique_users_count INTEGER DEFAULT 0,
            community_multiplier DOUBLE PRECISION DEFAULT 1.0,
            ai_analysis_details JSON,
            photo_top TEXT,
            photo_far TEXT,
            photo_close TEXT
        );
        """
    )
    op.execute("CREATE INDEX IF NOT EXISTS ix_pothole_reports_case_id ON pothole_reports(case_id);")
    op.execute("CREATE INDEX IF NOT EXISTS ix_pothole_reports_email ON pothole_reports(email);")
    op.execute("CREATE INDEX IF NOT EXISTS ix_pothole_reports_district ON pothole_reports(district);")
    op.execute("CREATE INDEX IF NOT EXISTS ix_pothole_reports_latitude ON pothole_reports(latitude);")
    op.execute("CREATE INDEX IF NOT EXISTS ix_pothole_reports_longitude ON pothole_reports(longitude);")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS pothole_reports;")
    op.execute("DROP TABLE IF EXISTS users;")

