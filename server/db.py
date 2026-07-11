"""Database engine, schema init, and session handling."""

import logging
from typing import Iterator

from sqlalchemy import inspect, text
from sqlmodel import Session, SQLModel, create_engine

from config import settings

logger = logging.getLogger(__name__)

IS_POSTGRES = settings.database_url.startswith("postgres")
_connect_args = {"check_same_thread": False} if not IS_POSTGRES else {}
engine = create_engine(settings.database_url, connect_args=_connect_args)


def _sync_missing_columns() -> None:
    """Poor-man's migration.

    SQLModel.metadata.create_all() only creates tables that don't exist yet
    — it never alters an existing table to add a column a newer model
    definition introduced (e.g. CommunityPost.is_anonymous on a database
    that already had a communitypost table from before that field
    existed). There's no Alembic/migration framework in this project, so
    on every startup we diff each table's live columns against the
    SQLModel metadata and additively patch anything missing. Existing rows
    are backfilled with the column's Python-side default so they don't
    come back as NULL against a non-Optional field.
    """
    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())

    with engine.begin() as conn:
        for table_name, table in SQLModel.metadata.tables.items():
            if table_name not in existing_tables:
                continue  # brand-new table — create_all() already made it

            existing_columns = {col["name"] for col in inspector.get_columns(table_name)}
            for column in table.columns:
                if column.name in existing_columns:
                    continue

                logger.info("Adding missing column %s.%s", table_name, column.name)
                col_type = column.type.compile(dialect=engine.dialect)
                conn.execute(text(f'ALTER TABLE "{table_name}" ADD COLUMN "{column.name}" {col_type}'))

                if column.default is not None and column.default.is_scalar:
                    conn.execute(
                        text(f'UPDATE "{table_name}" SET "{column.name}" = :default WHERE "{column.name}" IS NULL'),
                        {"default": column.default.arg},
                    )


def init_db() -> None:
    if IS_POSTGRES:
        with engine.begin() as conn:
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
    SQLModel.metadata.create_all(engine)
    _sync_missing_columns()


def get_session() -> Iterator[Session]:
    with Session(engine) as session:
        yield session
