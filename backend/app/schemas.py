from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    username: str
    password: str


class UserInfo(BaseModel):
    username: str
    role: str
    display_name: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = 'bearer'
    user: UserInfo


class UploadResponse(BaseModel):
    id: int
    original_name: str
    media_type: str
    content_text: Optional[str]
    created_at: datetime


class TaskCreateRequest(BaseModel):
    upload_id: int
    title: str = Field(min_length=2, max_length=255)


class EvidenceItem(BaseModel):
    step: str
    finding: str
    score: float


class TaskSummary(BaseModel):
    id: int
    title: str
    status: str
    risk_level: str
    media_type: str
    ai_probability: float
    deepfake_risk: float
    labels: list[str]
    summary: str
    recommendation: str
    created_by: str
    final_action: Optional[str]
    final_actor: Optional[str]
    created_at: datetime
    updated_at: datetime


class AuditLogItem(BaseModel):
    actor: str
    action: str
    detail: str
    created_at: datetime


class TaskDetail(TaskSummary):
    upload_id: int
    report: dict
    evidence_chain: list[EvidenceItem]
    logs: list[AuditLogItem]


class TaskActionRequest(BaseModel):
    action: str
    comment: str = Field(default='', max_length=500)


class TaskActionResponse(BaseModel):
    ok: bool
    task_id: int
    action: str
    status: str


class DashboardStats(BaseModel):
    total_tasks: int
    pending_tasks: int
    completed_tasks: int
    high_risk_tasks: int


class DistributionItem(BaseModel):
    label: str
    value: int


class TrendItem(BaseModel):
    date: str
    high: int
    medium: int
    low: int


class DemoCase(BaseModel):
    id: int
    title: str
    risk_level: str
    ai_probability: float
    deepfake_risk: float
    labels: list[str]
    recommendation: str
    conclusion: str


class DashboardResponse(BaseModel):
    stats: DashboardStats
    risk_distribution: list[DistributionItem]
    risk_trend: list[TrendItem]
    demo_cases: list[DemoCase]
