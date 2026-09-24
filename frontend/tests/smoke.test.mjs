import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

test('关键页面与共享库文件存在', () => {
  const expectedFiles = [
    'app/page.tsx',
    'app/agents/page.tsx',
    'app/audit/page.tsx',
    'app/governance-center/page.tsx',
    'app/tasks/page.tsx',
    'app/tasks/[id]/page.tsx',
    'app/workflow/page.tsx',
    'components/auth-provider.tsx',
    'lib/api.ts',
  ];
  expectedFiles.forEach((file) => {
    assert.equal(fs.existsSync(path.join(root, file)), true, `${file} should exist`);
  });
});

test('布局文件包含产品标题', () => {
  const layout = fs.readFileSync(path.join(root, 'app/layout.tsx'), 'utf8');
  assert.match(layout, /SentinelAI/);
  assert.match(layout, /AuthProvider/);
});

test('API 客户端配置了核心接口', () => {
  const api = fs.readFileSync(path.join(root, 'lib/api.ts'), 'utf8');
  ['/api/auth/login', '/api/uploads', '/api/tasks', '/api/dashboard'].forEach((segment) => {
    assert.equal(api.includes(segment), true, `${segment} should exist`);
  });
});

test('审核任务页包含现代数据看板结构', () => {
  const tasksPage = fs.readFileSync(path.join(root, 'app/tasks/page.tsx'), 'utf8');
  assert.match(tasksPage, /tasks-dashboard-shell/);
  assert.match(tasksPage, /今日审核数/);
  assert.match(tasksPage, /高风险数/);
  assert.match(tasksPage, /平均准确率/);
  assert.match(tasksPage, /selectedTask/);
  assert.match(tasksPage, /task-detail-drawer/);
});

test('共享导航包含图标与激活态发光样式', () => {
  const shell = fs.readFileSync(path.join(root, 'components/app-shell.tsx'), 'utf8');
  assert.match(shell, /icon:/);
  assert.match(shell, /nav-active-glow/);
  assert.match(shell, /group-hover/);
});

test('评委模式核心结构存在', () => {
  const expectedFiles = [
    'components/judge-mode-provider.tsx',
    'components/judge-mode-toggle.tsx',
    'components/judge-demo-flow.tsx',
  ];
  expectedFiles.forEach((file) => {
    assert.equal(fs.existsSync(path.join(root, file)), true, `${file} should exist`);
  });
  const layout = fs.readFileSync(path.join(root, 'app/layout.tsx'), 'utf8');
  assert.match(layout, /JudgeModeProvider/);
  const shell = fs.readFileSync(path.join(root, 'components/app-shell.tsx'), 'utf8');
  assert.match(shell, /JudgeModeToggle/);
  const provider = fs.readFileSync(path.join(root, 'components/judge-mode-provider.tsx'), 'utf8');
  assert.match(provider, /judge-demo-token/);
  assert.match(provider, /AI换脸短视频/);
});

test('评委模式覆盖首页、Agent、任务和报告页', () => {
  const home = fs.readFileSync(path.join(root, 'app/page.tsx'), 'utf8');
  assert.match(home, /体验完整智能体决策链路/);
  assert.match(home, /judge-mode-home/);
  const agents = fs.readFileSync(path.join(root, 'app/agents/page.tsx'), 'utf8');
  assert.match(agents, /JudgeDemoFlow/);
  assert.match(agents, /live execution/);
  const tasks = fs.readFileSync(path.join(root, 'app/tasks/page.tsx'), 'utf8');
  assert.match(tasks, /评委模式筛选/);
  assert.match(tasks, /用于评审展示/);
  const report = fs.readFileSync(path.join(root, 'app/tasks/[id]/page.tsx'), 'utf8');
  assert.match(report, /结论强化区/);
  assert.match(report, /贡献最大/);
});
