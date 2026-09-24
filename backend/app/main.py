from __future__ import annotations
from typing import Optional

import uuid
from datetime import datetime, timedelta
from pathlib import Path

from fastapi import BackgroundTasks, Depends, FastAPI, File, Form, Header, HTTPException, Query, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.core.config import get_settings
from app.core.security import create_token, decode_token
from app.db import Base, SessionLocal, engine, get_db
from app.models import AuditLog, AuditTask, Upload, User
from app.schemas import DashboardResponse, DemoCase, DistributionItem, EvidenceItem, LoginRequest, LoginResponse, TaskActionRequest, TaskActionResponse, TaskCreateRequest, TaskDetail, TaskSummary, UploadResponse, UserInfo
from app.services.mock_analysis import MockModelService

settings = get_settings()
app = FastAPI(title='SentinelAI API', version='0.1.0')
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)
model_service = MockModelService()


def get_current_user(authorization: Optional[str] = Header(default=None), db: Session = Depends(get_db)) -> User:
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Missing bearer token')
    token = authorization.replace('Bearer ', '', 1)
    claims = decode_token(token)
    user = db.scalar(select(User).where(User.username == claims['username']))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='User not found')
    return user


def create_log(db: Session, task_id: int, actor: str, action: str, detail: str) -> None:
    db.add(AuditLog(task_id=task_id, actor=actor, action=action, detail=detail))


def task_to_summary(task: AuditTask) -> TaskSummary:
    return TaskSummary(
        id=task.id,
        title=task.title,
        status=task.status,
        risk_level=task.risk_level,
        media_type=task.media_type,
        ai_probability=task.ai_probability,
        deepfake_risk=task.deepfake_risk,
        labels=task.labels or [],
        summary=task.summary,
        recommendation=task.recommendation,
        created_by=task.created_by,
        final_action=task.final_action,
        final_actor=task.final_actor,
        created_at=task.created_at,
        updated_at=task.updated_at,
    )


def task_to_detail(task: AuditTask) -> TaskDetail:
    return TaskDetail(
        **task_to_summary(task).model_dump(),
        upload_id=task.upload_id,
        report=task.report or {},
        evidence_chain=[EvidenceItem(**item) for item in task.evidence_chain or []],
        logs=[
            {
                'actor': log.actor,
                'action': log.action,
                'detail': log.detail,
                'created_at': log.created_at,
            }
            for log in sorted(task.logs, key=lambda item: item.created_at)
        ],
    )


def process_task(task_id: int) -> None:
    with SessionLocal() as db:
        task = db.scalar(select(AuditTask).options(selectinload(AuditTask.upload)).where(AuditTask.id == task_id))
        if not task:
            return
        task.status = 'processing'
        create_log(db, task.id, 'system', 'processing', 'Agent workflow started')
        db.commit()

        upload = task.upload
        text = upload.content_text or upload.original_name
        output = model_service.analyze(upload.media_type, task.title, text)
        task.status = 'completed'
        task.risk_level = output.risk_level
        task.ai_probability = output.ai_probability
        task.deepfake_risk = output.deepfake_risk
        task.labels = output.labels
        task.summary = output.summary
        task.recommendation = output.recommendation
        task.evidence_chain = output.evidence_chain
        task.report = {
            **output.report,
            'conclusion': output.conclusion,
            'created_at': datetime.utcnow().isoformat(),
        }
        task.search_text = ' '.join([task.title, output.summary, ' '.join(output.labels), output.conclusion])
        create_log(db, task.id, 'agent', 'analysis_completed', output.conclusion)
        db.commit()


def seed_data() -> None:
    settings.upload_path.mkdir(parents=True, exist_ok=True)
    Base.metadata.create_all(bind=engine)

    with SessionLocal() as db:
        existing_users = db.scalars(select(User)).all()
        if not existing_users:
            db.add_all([
                User(username='admin', password='admin123', role='admin', display_name='平台管理员'),
                User(username='reviewer', password='reviewer123', role='reviewer', display_name='内容审核员'),
            ])
            db.commit()

        existing_tasks = db.scalar(select(func.count(AuditTask.id))) or 0
        if existing_tasks:
            return

        demo_inputs = [
            ('抖音疑似AI换脸视频', 'link', 'video', '短视频链接疑似存在AI换脸、深度伪造与身份冒用风险。'),
            ('小红书AI商品宣传笔记', 'link', 'image', '图文笔记疑似使用AI商品图，并存在营销夸大和来源不明风险。'),
            ('新闻网页疑似AI生成图文', 'link', 'image', '新闻页面中配图疑似AI生成，正文来源和图片Metadata信息待核验。'),
            ('电商AI商品主图审核', 'image', 'image', '商品主图疑似由AI生成，存在展示效果与真实规格不一致风险。'),
            ('普通校园活动照片', 'image', 'image', '校园活动照片具备较高真实性信号，未发现明显AIGC生成或高风险内容。'),
            ('虚假投资营销文本', 'text', 'text', '稳赚不赔，老师带单，立即私聊进群等高风险营销表达。'),
        ]
        start_time = datetime.utcnow() - timedelta(days=1)
        total_inputs = len(demo_inputs)
        for index, (title, media_type, analyze_type, content) in enumerate(demo_inputs):
            created_at = start_time + timedelta(hours=total_inputs - index)
            upload = Upload(
                original_name=f'demo-{index + 1}.{"url" if media_type == "link" else media_type if media_type != "text" else "txt"}',
                media_type=media_type,
                storage_path=f'demo://{index + 1}',
                content_text=content,
                created_by='system',
                created_at=created_at,
            )
            db.add(upload)
            db.flush()
            output = model_service.analyze(analyze_type, title, content)
            task = AuditTask(
                title=title,
                status='completed',
                risk_level=output.risk_level,
                media_type=media_type,
                ai_probability=output.ai_probability,
                deepfake_risk=output.deepfake_risk,
                labels=output.labels,
                summary=output.summary,
                recommendation=output.recommendation,
                evidence_chain=output.evidence_chain,
                report={**output.report, 'conclusion': output.conclusion},
                search_text=' '.join([title, output.summary, ' '.join(output.labels), output.conclusion]),
                created_by='system',
                final_action='block' if output.risk_level == 'high' else 'release',
                final_actor='system',
                created_at=created_at,
                updated_at=created_at,
                upload_id=upload.id,
            )
            db.add(task)
            db.flush()
            create_log(db, task.id, 'system', 'seeded', 'Seed demo case created')
            create_log(db, task.id, 'agent', 'analysis_completed', output.conclusion)
        db.commit()


seed_data()


@app.on_event('startup')
def on_startup() -> None:
    seed_data()


@app.get('/health')
def health() -> dict:
    return {'status': 'ok', 'app': settings.app_name, 'time': datetime.utcnow().isoformat()}


@app.post('/api/auth/login', response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> LoginResponse:
    user = db.scalar(select(User).where(User.username == payload.username))
    if not user or user.password != payload.password:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid credentials')
    token = create_token(user.username, user.role)
    return LoginResponse(access_token=token, user=UserInfo(username=user.username, role=user.role, display_name=user.display_name))


@app.post('/api/uploads', response_model=UploadResponse)
async def upload_asset(
    file: Optional[UploadFile] = File(default=None),
    text_content: Optional[str] = Form(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UploadResponse:
    if not file and not text_content:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Provide either a file or text content')

    media_type = 'text'
    original_name = 'inline-text.txt'
    storage_path = 'inline://text'
    content_value = text_content

    if file:
        suffix = Path(file.filename or 'upload.bin').suffix or '.bin'
        original_name = file.filename or f'upload{suffix}'
        content_type = file.content_type or ''
        if content_type.startswith('video'):
            media_type = 'video'
        elif content_type.startswith('image'):
            media_type = 'image'
        else:
            media_type = 'text'
        filename = f'{uuid.uuid4().hex}{suffix}'
        target = settings.upload_path / filename
        target.parent.mkdir(parents=True, exist_ok=True)
        content_bytes = await file.read()
        with target.open('wb') as buffer:
            buffer.write(content_bytes)
        storage_path = str(target)
        if media_type == 'text':
            content_value = content_bytes.decode('utf-8', errors='ignore')

    upload = Upload(
        original_name=original_name,
        media_type=media_type,
        storage_path=storage_path,
        content_text=content_value,
        created_by=current_user.username,
    )
    db.add(upload)
    db.commit()
    db.refresh(upload)
    return UploadResponse.model_validate(upload, from_attributes=True)


@app.post('/api/tasks', response_model=TaskSummary)
def create_task(
    payload: TaskCreateRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TaskSummary:
    upload = db.get(Upload, payload.upload_id)
    if not upload:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Upload not found')
    task = AuditTask(
        title=payload.title,
        status='queued',
        risk_level='pending',
        media_type=upload.media_type,
        created_by=current_user.username,
        upload_id=upload.id,
        search_text=payload.title,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    create_log(db, task.id, current_user.username, 'task_created', f'Task created for upload {upload.id}')
    db.commit()
    background_tasks.add_task(process_task, task.id)
    db.refresh(task)
    return task_to_summary(task)


@app.get('/api/tasks', response_model=list[TaskSummary])
def list_tasks(
    q: str = Query(default=''),
    status_value: str = Query(default='', alias='status'),
    media_type: str = Query(default=''),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[TaskSummary]:
    _ = current_user
    query = select(AuditTask).order_by(AuditTask.created_at.desc())
    if q:
        like_value = f'%{q}%'
        query = query.where((AuditTask.title.ilike(like_value)) | (AuditTask.search_text.ilike(like_value)))
    if status_value:
        query = query.where(AuditTask.status == status_value)
    if media_type:
        query = query.where(AuditTask.media_type == media_type)
    tasks = db.scalars(query).all()
    return [task_to_summary(task) for task in tasks]


@app.get('/api/tasks/{task_id}', response_model=TaskDetail)
def get_task(task_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> TaskDetail:
    _ = current_user
    task = db.scalar(select(AuditTask).options(selectinload(AuditTask.logs)).where(AuditTask.id == task_id))
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Task not found')
    return task_to_detail(task)


@app.get('/api/tasks/{task_id}/report')
def get_task_report(task_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    _ = current_user
    task = db.get(AuditTask, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Task not found')
    return {
        'task_id': task.id,
        'title': task.title,
        'status': task.status,
        'risk_level': task.risk_level,
        'report': task.report or {},
        'recommendation': task.recommendation,
        'summary': task.summary,
    }


@app.post('/api/tasks/{task_id}/actions', response_model=TaskActionResponse)
def apply_action(
    task_id: int,
    payload: TaskActionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TaskActionResponse:
    task = db.scalar(select(AuditTask).options(selectinload(AuditTask.logs)).where(AuditTask.id == task_id))
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Task not found')

    status_map = {
        'release': 'reviewed',
        'throttle': 'reviewed',
        'review': 'escalated',
        'block': 'reviewed',
    }
    if payload.action not in status_map:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Unsupported action')

    task.status = status_map[payload.action]
    task.final_action = payload.action
    task.final_actor = current_user.username
    detail = payload.comment or f'{current_user.display_name} executed {payload.action}'
    create_log(db, task.id, current_user.username, payload.action, detail)
    db.commit()
    return TaskActionResponse(ok=True, task_id=task.id, action=payload.action, status=task.status)


@app.get('/api/dashboard', response_model=DashboardResponse)
def dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> DashboardResponse:
    _ = current_user
    tasks = db.scalars(select(AuditTask).order_by(AuditTask.created_at.desc())).all()
    total_tasks = len(tasks)
    pending_tasks = sum(1 for task in tasks if task.status in {'queued', 'processing'})
    completed_tasks = sum(1 for task in tasks if task.status in {'completed', 'reviewed', 'escalated'})
    high_risk_tasks = sum(1 for task in tasks if task.risk_level == 'high')

    distribution_map: dict[str, int] = {}
    for task in tasks:
        for label in task.labels or ['未分类']:
            distribution_map[label] = distribution_map.get(label, 0) + 1

    trend_map: dict[str, dict[str, int]] = {}
    for task in tasks:
        key = task.created_at.strftime('%Y-%m-%d')
        trend_map.setdefault(key, {'high': 0, 'medium': 0, 'low': 0})
        if task.risk_level in trend_map[key]:
            trend_map[key][task.risk_level] += 1

    demo_cases = [
        DemoCase(
            id=task.id,
            title=task.title,
            risk_level=task.risk_level,
            ai_probability=task.ai_probability,
            deepfake_risk=task.deepfake_risk,
            labels=task.labels or [],
            recommendation=task.recommendation,
            conclusion=(task.report or {}).get('conclusion', task.summary),
        )
        for task in tasks[:4]
    ]

    return DashboardResponse(
        stats={
            'total_tasks': total_tasks,
            'pending_tasks': pending_tasks,
            'completed_tasks': completed_tasks,
            'high_risk_tasks': high_risk_tasks,
        },
        risk_distribution=[DistributionItem(label=label, value=value) for label, value in sorted(distribution_map.items(), key=lambda item: item[1], reverse=True)[:6]],
        risk_trend=[{'date': date, **counts} for date, counts in sorted(trend_map.items())],
        demo_cases=demo_cases,
    )
