from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import JSON, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class User(Base):
    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    password: Mapped[str] = mapped_column(String(128))
    role: Mapped[str] = mapped_column(String(32))
    display_name: Mapped[str] = mapped_column(String(100))


class Upload(Base):
    __tablename__ = 'uploads'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    original_name: Mapped[str] = mapped_column(String(255))
    media_type: Mapped[str] = mapped_column(String(32))
    storage_path: Mapped[str] = mapped_column(String(512))
    content_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_by: Mapped[str] = mapped_column(String(50))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    tasks: Mapped[list['AuditTask']] = relationship(back_populates='upload')


class AuditTask(Base):
    __tablename__ = 'audit_tasks'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(32), default='queued', index=True)
    risk_level: Mapped[str] = mapped_column(String(32), default='pending')
    media_type: Mapped[str] = mapped_column(String(32), index=True)
    ai_probability: Mapped[float] = mapped_column(Float, default=0.0)
    deepfake_risk: Mapped[float] = mapped_column(Float, default=0.0)
    summary: Mapped[str] = mapped_column(Text, default='')
    recommendation: Mapped[str] = mapped_column(Text, default='')
    labels: Mapped[list[str]] = mapped_column(JSON, default=list)
    evidence_chain: Mapped[list[dict]] = mapped_column(JSON, default=list)
    report: Mapped[dict] = mapped_column(JSON, default=dict)
    search_text: Mapped[str] = mapped_column(Text, default='')
    created_by: Mapped[str] = mapped_column(String(50))
    final_action: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    final_actor: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    upload_id: Mapped[int] = mapped_column(ForeignKey('uploads.id'))

    upload: Mapped[Upload] = relationship(back_populates='tasks')
    logs: Mapped[list['AuditLog']] = relationship(back_populates='task', cascade='all, delete-orphan')


class AuditLog(Base):
    __tablename__ = 'audit_logs'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    task_id: Mapped[int] = mapped_column(ForeignKey('audit_tasks.id'), index=True)
    actor: Mapped[str] = mapped_column(String(50))
    action: Mapped[str] = mapped_column(String(50))
    detail: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    task: Mapped[AuditTask] = relationship(back_populates='logs')
