# SentinelAI API

Base URL: `http://localhost:8000`

## Health

- `GET /health`

## Authentication

- `POST /api/auth/login`
  - request

    ```json
    {
      "username": "admin",
      "password": "admin123"
    }
    ```

## Uploads

- `POST /api/uploads`
  - multipart form with `file` or `text_content`
  - requires `Authorization: Bearer <token>`

## Tasks

- `POST /api/tasks`

  ```json
  {
    "upload_id": 1,
    "title": "AI换脸短视频审核"
  }
  ```

- `GET /api/tasks?q=&status=&media_type=`
- `GET /api/tasks/{task_id}`
- `GET /api/tasks/{task_id}/report`
- `POST /api/tasks/{task_id}/actions`

  ```json
  {
    "action": "block",
    "comment": "疑似深度伪造，建议拦截"
  }
  ```

## Dashboard

- `GET /api/dashboard`

## Action Values

- `release`: 放行
- `throttle`: 限流
- `review`: 转复审
- `block`: 拦截
