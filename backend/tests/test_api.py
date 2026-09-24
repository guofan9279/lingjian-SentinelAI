from pathlib import Path
import sys

from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.main import app  # noqa: E402

client = TestClient(app)


def login_headers() -> dict[str, str]:
    response = client.post('/api/auth/login', json={'username': 'admin', 'password': 'admin123'})
    token = response.json()['access_token']
    return {'Authorization': f'Bearer {token}'}


def test_health() -> None:
    response = client.get('/health')
    assert response.status_code == 200
    assert response.json()['status'] == 'ok'


def test_login_and_dashboard() -> None:
    headers = login_headers()
    response = client.get('/api/dashboard', headers=headers)
    assert response.status_code == 200
    payload = response.json()
    assert payload['stats']['total_tasks'] >= 4
    assert len(payload['demo_cases']) >= 1


def test_create_task_flow() -> None:
    headers = login_headers()
    upload_response = client.post('/api/uploads', headers=headers, data={'text_content': '这是一个新的投资营销文本，稳赚不赔。'})
    assert upload_response.status_code == 200
    upload_id = upload_response.json()['id']

    task_response = client.post('/api/tasks', headers=headers, json={'upload_id': upload_id, 'title': '新增投资文本审核'})
    assert task_response.status_code == 200
    task_id = task_response.json()['id']

    detail_response = client.get(f'/api/tasks/{task_id}', headers=headers)
    assert detail_response.status_code == 200
    assert detail_response.json()['status'] in {'completed', 'queued', 'processing'}

    action_response = client.post(
        f'/api/tasks/{task_id}/actions',
        headers=headers,
        json={'action': 'block', 'comment': '测试执行拦截'},
    )
    assert action_response.status_code == 200
    assert action_response.json()['ok'] is True
