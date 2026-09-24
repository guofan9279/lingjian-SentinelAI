﻿'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { FormEventHandler } from 'react';
import { useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { inputClass } from '@/lib/ui';
import { JudgeModeToggle } from '@/components/judge-mode-toggle';

const primaryNavItems = [
  { href: '/', icon: 'DS', label: '真实性驾驶舱', description: '总览真实性、AIGC风险与治理态势' },
  { href: '/audit', icon: 'AI', label: '内容鉴别', description: '上传内容并启动多Agent分析' },
  { href: '/tasks', icon: 'TK', label: '审核任务', description: '查看鉴别记录与复核状态' },
  { href: '/agents', icon: 'AG', label: 'Agent协同', description: '查看Agent链路与风险贡献' },
] as const;

const pageMetaMap: Record<string, { title: string; description: string }> = {
  '/': { title: '真实性驾驶舱', description: '从真实性分析、AIGC风险与治理状态三个维度查看平台整体态势。' },
  '/audit': { title: '内容鉴别', description: '接入图片、视频或文本内容，启动多 Agent 真实性分析与风险推理。' },
  '/tasks': { title: '审核任务', description: '浏览所有内容鉴别任务，筛选待处置案例并进入证据报告。' },
  '/agents': { title: 'Agent协同', description: '理解多 Agent 如何分工协作，输出证据链与治理建议。' },
  '/governance-center': { title: '真实性驾驶舱', description: '平台统一总览页，聚合真实性、AIGC风险、治理态势与 Agent 状态。' },
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, login, logout, error, loading } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleLogin: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setLocalError('');
    try {
      await login(username, password);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : '登录失败');
    } finally {
      setSubmitting(false);
    }
  };

  const pageMeta = resolvePageMeta(pathname);
  const reloginRequired = error === '登录已过期，请重新登录。';
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1680px] flex-col px-4 py-5 lg:px-6">
      <header className="glass rounded-[28px] px-5 py-4 lg:px-7">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-3">
            <div className="text-sm uppercase tracking-[0.32em] text-sky-200/80">灵鉴 SentinelAI</div>
            <div className="text-2xl font-semibold text-white">内容真实性与AIGC风险治理智能体</div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="uppercase tracking-[0.22em] text-slate-500">当前页面</span>
              <span className="rounded-full border border-sky-400/25 bg-sky-500/10 px-3 py-1 text-sky-100">
                {pageMeta.title}
              </span>
            </div>
            <div className="max-w-3xl text-sm leading-7 text-slate-300">{pageMeta.description}</div>
          </div>

          <div className="w-full xl:max-w-[320px]">
            <div className="mb-2 flex justify-end"><JudgeModeToggle /></div>
            {loading ? (
              <HeaderStatusCard title="登录状态" description="正在恢复登录态..." />
            ) : user ? (
              <div className="rounded-2xl border border-white/8 bg-white/4 p-3 text-xs text-slate-300">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">当前用户</div>
                    <div className="mt-1.5 text-base font-semibold text-white">{user.display_name}</div>
                    <div className="mt-0.5 text-sky-100">{formatRole(user.role)}</div>
                  </div>
                  <button
                    type="button"
                    onClick={logout}
                    className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white transition hover:border-sky-400 hover:bg-sky-500/10"
                  >
                    退出登录
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/8 bg-white/4 p-3 text-xs text-slate-300">
                <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">登录状态</div>
                <div className="mt-1.5 text-base font-semibold text-white">未登录</div>
                <form className="mt-3 grid gap-2" onSubmit={handleLogin}>
                  <input value={username} onChange={(event) => setUsername(event.target.value)} className={inputClass} placeholder="用户名" />
                  <input value={password} type="password" onChange={(event) => setPassword(event.target.value)} className={inputClass} placeholder="密码" />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-full bg-sky-500 px-4 py-2 text-xs font-medium text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-sky-900"
                  >
                    {submitting ? '登录中...' : reloginRequired ? '重新登录' : '登录'}
                  </button>
                </form>
                <div className="mt-2 text-[10px] leading-5 text-slate-500">默认账号：admin / admin123</div>
                {localError || error ? <div className="mt-2 text-xs text-rose-200">{localError || error}</div> : null}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="mt-6 grid flex-1 gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="glass h-fit rounded-[28px] p-5 lg:p-6 xl:sticky xl:top-5">
          <SidebarSection title="主路径">
            {primaryNavItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                description={item.description}
                active={pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`))}
              />
            ))}
          </SidebarSection>
        </aside>

        <main className="min-w-0 pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function resolvePageMeta(pathname: string) {
  if (pathname.startsWith('/tasks/')) {
    return {
      title: '证据报告',
      description: '查看单个任务的真实性评分、AIGC概率、风险评分、Agent证据链与治理建议。',
    };
  }

  return pageMetaMap[pathname] ?? pageMetaMap['/'];
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-sm uppercase tracking-[0.28em] text-sky-200/80">{title}</div>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}

function NavItem({
  href,
  icon,
  label,
  description,
  active,
}: {
  href: string;
  icon: string;
  label: string;
  description: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group block rounded-2xl border p-3.5 transition duration-200 hover:-translate-y-0.5 ${
        active
          ? 'nav-active-glow border-sky-300/45 bg-gradient-to-r from-sky-500/24 to-violet-500/18'
          : 'border-white/8 bg-white/4 hover:border-sky-400/25 hover:bg-white/7'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border text-xs font-semibold transition group-hover:border-sky-300/50 group-hover:text-sky-100 ${active ? 'border-sky-200/45 bg-white/14 text-white' : 'border-white/10 bg-slate-950/35 text-slate-300'}`}>
          {icon}
        </span>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-white">{label}</div>
          <div className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400 group-hover:text-slate-300">{description}</div>
        </div>
      </div>
    </Link>
  );
}

function HeaderStatusCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-3xl border border-white/8 bg-white/4 p-4 text-sm text-slate-300">
      <div className="text-xs uppercase tracking-[0.22em] text-slate-500">{title}</div>
      <div className="mt-2 text-lg font-semibold text-white">{description}</div>
    </div>
  );
}

function formatRole(role: string) {
  if (role === 'admin') return '管理员';
  if (role === 'reviewer') return '审核员';
  return role;
}


