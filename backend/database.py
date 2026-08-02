"""
Database setup — PostgreSQL via SQLModel.
DATABASE_URL is injected from environment (Render sets it automatically).
Falls back to a local SQLite file for local development.
"""

import os
from sqlmodel import SQLModel, create_engine, Session

# Render provides DATABASE_URL as a postgres:// URI; SQLAlchemy needs postgresql://
_raw_url = os.getenv("DATABASE_URL", "sqlite:///./billing.db")
DATABASE_URL = _raw_url.replace("postgres://", "postgresql://", 1)

# check_same_thread only needed for SQLite
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)


def create_db_and_tables():
    """Create all tables if they don't exist yet."""
    SQLModel.metadata.create_all(engine)


def get_session():
    """FastAPI dependency — yields a DB session per request."""
    with Session(engine) as session:
        yield session
