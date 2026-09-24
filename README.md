# 灵鉴 SentinelAI

灵鉴（SentinelAI）是一个用于演示 AIGC 内容治理流程的全栈 MVP，包含 FastAPI 后端、Next.js 前端、模拟分析流程、人工复核、结构化报告和审计日志。

> 当前项目使用 Mock 分析服务，输出仅用于演示，不代表真实的 AI 内容检测能力，也不适合用于生产决策。

## 功能概览

- 内容审核任务、风险摘要和结构化分析报告
- 管理员与审核员角色，以及人工复核操作
- 操作审计日志
- SQLite 本地存储；Docker Compose 可选启动 PostgreSQL
- FastAPI API 文档：启动后访问 <http://localhost:8000/docs>

## 本地运行

要求：Python 3.12+、Node.js 22+、npm，以及 Bash（macOS、Linux 或 WSL）。

```bash
cp .env.example .env
```

编辑 `.env`，将 `AUTH_SECRET` 改成随机长密钥。可用以下命令生成：

```bash
openssl rand -hex 32
```

然后安装依赖并启动：

```bash
bash scripts/setup.sh
bash scripts/dev.sh
```

- 前端：<http://localhost:3000>
- 后端：<http://localhost:8000>
- 健康检查：<http://localhost:8000/health>

本地演示账号由后端首次启动时创建：`admin / admin123`、`reviewer / reviewer123`。这些是固定演示账号；不要将服务暴露到公网或用于生产环境。

## Docker Compose

```bash
cp .env.example .env
```

在 `.env` 中设置自己的 `AUTH_SECRET`，然后运行：

```bash
docker compose up --build
```

如需启动可选 PostgreSQL 服务：

```bash
docker compose --profile postgres up --build
```

## 项目结构

```text
backend/       FastAPI 应用、数据模型和后端测试
frontend/      Next.js 应用、组件和前端测试
docs/          API 文档
scripts/       本地安装、开发启动和检查脚本
docker-compose.yml
```

运行已有检查：`bash scripts/check.sh`（需要先安装项目依赖）。

## 配置和数据

- `.env.example` 是配置模板；本地 `.env` 不应提交。
- 数据库和上传文件保存在 `backend/data/`，均为本地运行数据，不应提交。
- 如需保留有价值的演示数据，请在分享仓库前确认其中没有个人信息、真实用户内容或凭据。

## 安全提示

此项目是开发演示 MVP。默认演示账号、模拟分析服务和当前认证实现都不适合生产使用。请勿上传真实敏感内容或把实例直接部署到公网。发现安全问题请先通过 GitHub 私下联系维护者，不要在公开 Issue 中粘贴密钥或个人数据。

## 许可证

本项目目前尚未指定开源许可证。添加 `LICENSE` 文件并确认项目中第三方素材的使用权后，再发布为开源项目。
