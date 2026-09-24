'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ContentTypeBadge,
  RecommendationBadge,
  RiskBadge,
} from '@/components/visual-components';
import { useAuth } from '@/components/auth-provider';
import { api, isAuthExpiredError } from '@/lib/api';
import {
  type AuditTask,
  getTaskSourceType,
  mapApiTaskToAuditTask,
  mockAuditTasks,
  recommendationShortLabel,
  sourceTypeLabel,
  statusLabel,
  taskContentTypeLabel,
} from '@/lib/mockAuditData';
import { inputClass, statusClassMap } from '@/lib/ui';

const mediaTypeOptions = [
  { value: '', label: '全部类型' },
  { value: 'image', label: '图片' },
  { value: 'video', label: '视频' },
  { value: 'document', label: '文档' },
  { value: 'text', label: '文本' },
  { value: 'link', label: '链接' },
] as const;

const sourceTypeOptions = [
  { value: '', label: '全部来源' },
  { value: 'media', label: '媒体素材' },
  { value: 'document_text', label: '文档与文本' },
  { value: 'url', label: '链接分析' },
] as const;

const platformOptions = [
  { value: '', label: '全部平台' },
  { value: '抖音', label: '抖音' },
  { value: '小红书', label: '小红书' },
  { value: '微博', label: '微博' },
  { value: 'B站', label: 'B站' },
  { value: '电商', label: '电商' },
  { value: '普通网页', label: '普通网页' },
] as const;

const riskLevelOptions = [
  { value: '', label: '全部风险' },
  { value: 'low', label: '低风险' },
  { value: 'medium', label: '中风险' },
  { value: 'high', label: '高风险' },
  { value: 'severe', label: '严重风险' },
] as const;

const governanceOptions = [
  { value: '', label: '全部建议' },
  { value: 'release', label: '放行' },
  { value: 'throttle', label: '限流' },
  { value: 'review', label: '人工复审' },
  { value: 'block', label: '拦截' },
] as const;

const statusOptions = [
  { value: '', label: '全部状态' },
  { value: 'processing', label: '分析中' },
  { value: 'completed', label: '已完成' },
  { value: 'reviewed', label: '已复核' },
  { value: 'queued', label: '排队中' },
  { value: 'escalated', label: '升级处理' },
] as const;

export default function TasksPage() {
  const { token } = useAuth();
  const [tasks, setTasks] = useState<AuditTask[]>(mockAuditTasks);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [mediaType, setMediaType] = useState('');
  const [sourceType, setSourceType] = useState('');
  const [platform, setPlatform] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [governance, setGovernance] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<AuditTask | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) {
        return;
      }
      setLoading(true);
      api
        .listTasks(token, { q: keyword, status, media_type: mediaType })
        .then((response) => {
          if (cancelled) {
            return;
          }
          setTasks(mergeAuditTasks(mockAuditTasks, response.map(mapApiTaskToAuditTask)));
          setError('');
        })
        .catch((err) => {
          if (!cancelled) {
            setTasks(mockAuditTasks);
            setError(
              isAuthExpiredError(err)
                ? '登录已过期，请重新登录，当前展示演示数据。'
                : '服务连接异常，已切换演示数据。',
            );
          }
        })
        .finally(() => {
          if (!cancelled) {
            setLoading(false);
          }
        });
    });
    return () => {
      cancelled = true;
    };
  }, [keyword, mediaType, status, token]);

  const visibleTasks = token ? tasks : mockAuditTasks;
  const visibleError = error;
  const visibleLoading = token ? loading : false;

  const filteredTasks = useMemo(() => {
    return visibleTasks.filter((task) => {
      if (keyword) {
        const source = `${task.title} ${task.tags.join(' ')} ${task.conclusion} ${task.pageTitle ?? ''} ${task.pageAuthor ?? ''} ${task.sourceUrl ?? ''}`.toLowerCase();
        if (!source.includes(keyword.toLowerCase())) {
          return false;
        }
      }

      if (mediaType && task.contentType !== mediaType) return false;
      if (status && task.status !== status) return false;
      if (sourceType && getTaskSourceType(task) !== sourceType) return false;
      if (platform && task.sourcePlatform !== platform) return false;

      if (riskLevel) {
        if (riskLevel === 'severe') {
          const severe = task.riskLevel === 'severe' || task.riskScore >= 85 || recommendationShortLabel(task.recommendation) === '拦截';
          if (!severe) return false;
        } else if (task.riskLevel !== riskLevel) {
          return false;
        }
      }

      if (governance && task.recommendation !== governance) return false;
      return true;
    });
  }, [governance, keyword, mediaType, platform, riskLevel, sourceType, status, visibleTasks]);

  const emptyState = useMemo(() => !visibleLoading && filteredTasks.length === 0, [filteredTasks.length, visibleLoading]);
  const kpis = useMemo(() => buildTaskKpis(filteredTasks), [filteredTasks]);

  return (
    <div className="tasks-dashboard-shell space-y-6">
      <section className="dashboard-soft-card overflow-hidden p-6 lg:p-7">
        <div className="relative z-10 grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-end">
          <div>
            <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100">Audit Mission Center</div>
            <h1 className="mt-5 text-3xl font-semibold text-white lg:text-4xl">灵鉴审核任务页面</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">集中管理内容鉴别记录，用真实性评分、AIGC概率、综合风险分和治理状态快速定位优先级。</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4 text-sm text-slate-300 shadow-[0_18px_50px_rgba(8,20,42,0.28)]">
            <div className="flex items-center justify-between gap-3"><span className="text-xs uppercase tracking-[0.22em] text-slate-500">当前视图</span><span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-100">实时筛选</span></div>
            <div className="mt-3 text-2xl font-semibold text-white">{filteredTasks.length}</div>
            <div className="mt-1 text-xs text-slate-400">符合当前条件的审核任务</div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">{kpis.map((item) => <KpiCard key={item.label} {...item} />)}</section>

      <section className="dashboard-soft-card p-4 lg:p-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
          <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="搜索内容名称、标签、证据结论" className={inputClass} />
          <select value={mediaType} onChange={(event) => setMediaType(event.target.value)} className={inputClass}>{mediaTypeOptions.map((option) => <option key={option.value || 'all'} value={option.value}>{option.label}</option>)}</select>
          <select value={riskLevel} onChange={(event) => setRiskLevel(event.target.value)} className={inputClass}>{riskLevelOptions.map((option) => <option key={option.value || 'all'} value={option.value}>{option.label}</option>)}</select>
          <select value={sourceType} onChange={(event) => setSourceType(event.target.value)} className={inputClass}>{sourceTypeOptions.map((option) => <option key={option.value || 'all'} value={option.value}>{option.label}</option>)}</select>
          <select value={platform} onChange={(event) => setPlatform(event.target.value)} className={inputClass}>{platformOptions.map((option) => <option key={option.value || 'all'} value={option.value}>{option.label}</option>)}</select>
          <select value={governance} onChange={(event) => setGovernance(event.target.value)} className={inputClass}>{governanceOptions.map((option) => <option key={option.value || 'all'} value={option.value}>{option.label}</option>)}</select>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className={inputClass}>{statusOptions.map((option) => <option key={option.value || 'all'} value={option.value}>{option.label}</option>)}</select>
        </div>
      </section>

      {visibleLoading ? <section className="dashboard-soft-card p-5 text-slate-200">正在加载审核任务...</section> : null}
      {visibleError ? <section className="dashboard-soft-card border-rose-500/40 p-5 text-rose-200">{visibleError}</section> : null}
      {emptyState ? <section className="dashboard-soft-card p-10 text-center"><h2 className="text-xl font-semibold text-white">还没有内容鉴别任务</h2><p className="mt-3 text-sm leading-7 text-slate-300">上传一条内容，开始真实性与 AIGC 风险分析。</p><Link href="/audit" className="mt-5 inline-flex rounded-full bg-sky-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-sky-400">开始内容鉴别</Link></section> : null}

      {filteredTasks.length > 0 ? (
        <section className="space-y-3">
          <div className="grid grid-cols-[minmax(0,1fr)_310px_240px] gap-4 px-4 text-xs uppercase tracking-[0.18em] text-slate-500 max-xl:hidden"><span>内容与来源</span><span>评分指标</span><span>治理状态</span></div>
          {filteredTasks.map((task) => <TaskCard key={task.id} task={task} onOpen={() => setSelectedTask(task)} />)}
        </section>
      ) : null}

      {selectedTask ? <TaskDetailDrawer task={selectedTask} onClose={() => setSelectedTask(null)} /> : null}
    </div>
  );
}

function mergeAuditTasks(base: AuditTask[], incoming: AuditTask[]) {
  const taskMap = new Map<number, AuditTask>();
  base.forEach((task) => {
    taskMap.set(task.id, task);
  });
  incoming.forEach((task) => {
    const existing = taskMap.get(task.id);
    if (!existing) {
      taskMap.set(task.id, task);
      return;
    }
    taskMap.set(task.id, {
      ...existing,
      ...task,
      contentType: existing.contentType,
      sourceType: existing.sourceType ?? task.sourceType,
      sourceUrl: existing.sourceUrl ?? task.sourceUrl,
      sourcePlatform: existing.sourcePlatform ?? task.sourcePlatform,
      pageTitle: existing.pageTitle ?? task.pageTitle,
      pageAuthor: existing.pageAuthor ?? task.pageAuthor,
      publishedAt: existing.publishedAt ?? task.publishedAt,
      extractedText: existing.extractedText ?? task.extractedText,
      extractedImages: existing.extractedImages ?? task.extractedImages,
      extractedVideo: existing.extractedVideo ?? task.extractedVideo,
      linkPreview: existing.linkPreview ?? task.linkPreview,
      tags: existing.tags.length > 0 ? existing.tags : task.tags,
      agentResults: existing.agentResults.length > 0 ? existing.agentResults : task.agentResults,
      evidenceChain: existing.evidenceChain.length > 0 ? existing.evidenceChain : task.evidenceChain,
      auditLogs: existing.auditLogs.length > 0 ? existing.auditLogs : task.auditLogs,
      conclusion: existing.conclusion || task.conclusion,
    });
  });
  return [...taskMap.values()].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function buildTaskKpis(tasks: AuditTask[]) {
  const highRiskCount = tasks.filter((task) => isHighRiskTask(task)).length;
  const avgAuthenticity = Math.round(tasks.reduce((sum, task) => sum + task.authenticityScore, 0) / Math.max(tasks.length, 1));
  const autoHandled = tasks.filter((task) => task.recommendation === 'release' || task.recommendation === 'throttle').length;
  const autoRate = Math.round((autoHandled / Math.max(tasks.length, 1)) * 100);
  return [
    { label: '今日审核数', value: tasks.length.toLocaleString('zh-CN'), hint: '当前筛选范围内任务', accent: 'from-sky-400 to-violet-400' },
    { label: '高风险数', value: highRiskCount.toLocaleString('zh-CN'), hint: '高风险与严重风险', accent: 'from-rose-400 to-amber-300' },
    { label: '平均准确率', value: `${avgAuthenticity}%`, hint: `自动处置率 ${autoRate}%`, accent: 'from-emerald-300 to-cyan-300' },
  ];
}

function KpiCard({ label, value, hint, accent }: { label: string; value: string; hint: string; accent: string }) {
  return (
    <div className="dashboard-soft-card hover-lift p-5">
      <div className={`h-1.5 w-16 rounded-full bg-gradient-to-r ${accent}`} />
      <div className="mt-5 text-sm text-slate-400">{label}</div>
      <div className="mt-2 text-3xl font-semibold text-white">{value}</div>
      <div className="mt-2 text-xs text-slate-500">{hint}</div>
    </div>
  );
}

function TaskCard({ task, onOpen }: { task: AuditTask; onOpen: () => void }) {
  const aigcPercent = Math.round(task.aigcProbability * 100);
  const highRisk = isHighRiskTask(task);
  return (
    <article className={`dashboard-task-card hover-lift grid cursor-pointer gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_310px_240px] ${highRisk ? 'risk-glow-high' : ''}`} onClick={onOpen} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onOpen(); } }}>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <ContentTypeBadge contentType={taskContentTypeLabel(task)} />
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">{sourceTypeLabel(getTaskSourceType(task))}</span>
          {task.sourcePlatform ? <span className="rounded-full bg-sky-400/10 px-3 py-1 text-xs text-sky-100">{task.sourcePlatform}</span> : null}
        </div>
        <h2 className="mt-4 truncate text-lg font-semibold text-white">{task.title}</h2>
        <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-slate-400">{task.conclusion || '等待 Agent 分析完成。'}</p>
        <div className="mt-4 flex flex-wrap gap-2">{task.tags.slice(0, 4).map((tag) => <span key={tag} className="rounded-full border border-white/10 bg-slate-950/40 px-2.5 py-1 text-xs text-slate-300">{tag}</span>)}</div>
      </div>
      <div className="grid gap-4 rounded-2xl border border-white/8 bg-slate-950/30 p-4">
        <MetricBar label="真实评分" value={task.authenticityScore} tone="emerald" />
        <MetricBar label="AIGC概率" value={aigcPercent} suffix="%" tone="sky" />
        <MetricBar label="综合风险分" value={task.riskScore} tone="risk" />
      </div>
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/8 bg-slate-950/30 p-4">
        <div className="flex flex-wrap items-center gap-2"><RiskBadge level={task.riskLevel} /><RecommendationBadge recommendation={task.recommendation} /></div>
        <div className="space-y-3 text-sm text-slate-300">
          <div className="flex items-center justify-between gap-3"><span className="text-slate-500">状态</span><span className={`status-pill ${statusClassMap[task.status] ?? statusClassMap.completed}`}>{statusLabel(task.status)}</span></div>
          <div className="flex items-center justify-between gap-3"><span className="text-slate-500">时间</span><span className="text-right text-xs text-slate-300">{new Date(task.createdAt).toLocaleString('zh-CN')}</span></div>
        </div>
        <Link href={`/tasks/${task.id}`} onClick={(event) => event.stopPropagation()} className="inline-flex justify-center rounded-full border border-sky-300/25 bg-sky-400/10 px-4 py-2 text-sm font-medium text-sky-100 transition hover:border-sky-300/60 hover:bg-sky-400/18">查看证据报告</Link>
      </div>
    </article>
  );
}

function MetricBar({ label, value, tone, suffix = '' }: { label: string; value: number; tone: 'emerald' | 'sky' | 'risk'; suffix?: string }) {
  const clamped = Math.max(0, Math.min(value, 100));
  const toneClassMap = { emerald: 'from-emerald-300 to-cyan-300', sky: 'from-sky-400 to-indigo-400', risk: 'from-amber-300 via-orange-400 to-rose-500' } as const;
  return <div><div className="flex items-center justify-between text-xs text-slate-400"><span>{label}</span><span className="font-semibold text-white">{value}{suffix}</span></div><div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-900/90"><div className={`h-full rounded-full bg-gradient-to-r ${toneClassMap[tone]} shadow-[0_0_18px_rgba(56,189,248,0.22)]`} style={{ width: `${Math.max(clamped, 4)}%` }} /></div></div>;
}

function TaskDetailDrawer({ task, onClose }: { task: AuditTask; onClose: () => void }) {
  return (
    <div className="task-detail-drawer fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm" onClick={onClose}>
      <aside className="h-full w-full max-w-xl overflow-y-auto border-l border-white/10 bg-[#0b1628]/95 p-6 shadow-[-24px_0_80px_rgba(0,0,0,0.36)]" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4"><div><div className="text-xs uppercase tracking-[0.22em] text-cyan-200/70">Task Detail</div><h2 className="mt-3 text-2xl font-semibold text-white">{task.title}</h2></div><button type="button" onClick={onClose} className="rounded-full border border-white/10 px-3 py-2 text-sm text-slate-200 transition hover:border-sky-300/50 hover:bg-white/8">关闭</button></div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3"><MetricTile label="真实评分" value={task.authenticityScore} /><MetricTile label="AIGC概率" value={`${Math.round(task.aigcProbability * 100)}%`} /><MetricTile label="风险分" value={task.riskScore} /></div>
        <div className="mt-6 flex flex-wrap gap-2"><RiskBadge level={task.riskLevel} /><RecommendationBadge recommendation={task.recommendation} /><span className={`status-pill ${statusClassMap[task.status] ?? statusClassMap.completed}`}>{statusLabel(task.status)}</span></div>
        <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4"><h3 className="text-sm font-semibold text-white">审核结论</h3><p className="mt-3 text-sm leading-7 text-slate-300">{task.conclusion || '等待 Agent 分析完成。'}</p></section>
        <section className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4"><h3 className="text-sm font-semibold text-white">来源信息</h3><div className="mt-3 grid gap-2 text-sm text-slate-300"><div>来源类型：{sourceTypeLabel(getTaskSourceType(task))}</div><div>平台来源：{task.sourcePlatform ?? '未标注'}</div><div>创建时间：{new Date(task.createdAt).toLocaleString('zh-CN')}</div>{task.sourceUrl ? <a href={task.sourceUrl} target="_blank" rel="noreferrer" className="text-sky-200 transition hover:text-sky-100">查看原始链接</a> : null}</div></section>
        <section className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4"><h3 className="text-sm font-semibold text-white">风险标签</h3><div className="mt-3 flex flex-wrap gap-2">{task.tags.map((tag) => <span key={tag} className="rounded-full border border-white/10 bg-slate-950/50 px-3 py-1 text-xs text-slate-200">{tag}</span>)}</div></section>
        <Link href={`/tasks/${task.id}`} className="mt-6 inline-flex w-full justify-center rounded-full bg-gradient-to-r from-sky-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_0_28px_rgba(56,189,248,0.22)] transition hover:brightness-110">进入完整证据报告</Link>
      </aside>
    </div>
  );
}

function MetricTile({ label, value }: { label: string; value: number | string }) {
  return <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4"><div className="text-xs text-slate-500">{label}</div><div className="mt-2 text-2xl font-semibold text-white">{value}</div></div>;
}

function isHighRiskTask(task: AuditTask) {
  return task.riskLevel === 'high' || task.riskLevel === 'severe' || task.riskScore >= 70;
}


