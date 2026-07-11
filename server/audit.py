"""Helper for writing to the AuditLog table from request handlers."""

from fastapi import Request
from sqlmodel import Session

from models import AuditLog


def record(
    session: Session,
    *,
    event_type: str,
    request: Request,
    username: str | None = None,
    success: bool = True,
    detail: str | None = None,
) -> None:
    session.add(AuditLog(
        event_type=event_type,
        username=username,
        ip_address=request.client.host if request.client else None,
        success=success,
        detail=detail,
    ))
    session.commit()
