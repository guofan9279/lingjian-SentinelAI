'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  EvidenceCard,
  PageTitleBlock,
  RecommendationBadge,
  RiskBadge,
  ScoreCard,
  SectionHeading,
} from '@/components/visual-components';
import { useAuth } from '@/components/auth-provider';
import { api, isAuthExpiredError } from '@/lib/api';
import {
  type AuditTask,
  type Recommendation,
  contentTypeLabel,
  getAgentBlueprint,
  getMockAuditTaskById,
  getTaskSourceType,
  mapApiTaskDetailToAuditTask,
  recommendationLabel,
  sourceTypeLabel,
  statusLabel,
} from '@/lib/mockAuditData';
import { cardClass, formatPercent, inputClass, statusClassMap } from '@/lib/ui';

const actions = [
  { value: 'release', label: '确认放行' },
  { value: 'throttle', label: '标记限流' },
  { value: 'review', label: '转人工复审' },
  { value: 'block', label: '风险拦截' },
] as const;

type AgentReportBlock = {
  id: string;
  title: string;
  finding: string;
  evidence: string[];
  contribution: number;
  confidence: number;
  explanation: string;
  extraTitle?: string;
  extraValue?: string;
};

export default function TaskDetailPage() {
  const { token, user } = useAuth();
  const params = useParams<{ id: string }>();
  const taskId = params?.id ? Number(params.id) : null;
  const [task, setTask] = useState<AuditTask | null>(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [busyAction, setBusyAction] = useState('');
  const [usingMock, setUsingMock] = useState(false);

  const loadTask = useCallback(async () => {
    if (!taskId) {
      return;
    }

    const mockTask = getMockAuditTaskById(taskId);
    if (mockTask) {
      setTask(mockTask);
      setUsingMock(true);
      setError('');
      return;
    }

    if (!token) {
      setTask(null);
      setError('请先登录后查看证据报告。');
      return;
    }

    try {
      const response = await api.getTask(token, taskId);
      setTask(mapApiTaskDetailToAuditTask(response));
      setUsingMock(false);
      setError('');
    } catch (err) {
      setTask(null);
      setError(
        isAuthExpiredError(err)
          ? '登录已过期，请重新登录。'
          : '服务连接异常，当前无法加载证据报告。',
      );
    }
  }, [taskId, token]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadTask();
    });
  }, [loadTask]);

  async function handleAction(action: string) {
    if (!task) {
      return;
    }

    if (usingMock || !token) {
      const normalized = normalizeAction(action);
      setTask({
        ...task,
        status: 'reviewed',
        recommendation: normalized,
        reviewerAction: normalized,
        auditLogs: [
          ...task.auditLogs,
          {
            actor: user?.display_name ?? '当前审核员',
            action: recommendationLabel(normalized),
            detail: comment || '基于证据报告执行人工复核处置。',
            createdAt: new Date().toISOString(),
          },
        ],
      });
      setComment('');
      return;
    }

    setBusyAction(action);
    try {
      await api.applyAction(token, task.id, { action, comment });
      await loadTask();
      setComment('');
    } catch (err) {
      setError(
        isAuthExpiredError(err)
          ? '登录已过期，请重新登录。'
          : '服务连接异常，复核动作暂未提交成功。',
      );
    } finally {
      setBusyAction('');
    }
  }

  if (!token && !getMockAuditTaskById(taskId ?? -1)) {
    return <section className={cardClass}>{error || '请先登录后查看证据报告。'}</section>;
  }

  if (!task) {
    return <section className={cardClass}>{error || '正在加载任务详情...'}</section>;
  }

  const currentTask = task;
  const authenticityScore = currentTask.authenticityScore;
  const riskScore = currentTask.riskScore;
  const riskTags = currentTask.tags.length > 0 ? currentTask.tags : ['正常内容'];
  const governanceAction = recommendationLabel(currentTask.recommendation);
  const agentBlocks = buildAgentBlocks(currentTask);
  const naturalConclusion = currentTask.conclusion;
  const sourceType = getTaskSourceType(currentTask);

  function exportJson() {
    downloadFile(`sentinelai-report-${currentTask.id}.json`, JSON.stringify(currentTask, null, 2), 'application/json');
  }

  function exportMarkdown() {
    const markdown = buildMarkdownReport({
      task: currentTask,
      authenticityScore,
      riskScore,
      governanceAction,
      riskTags,
      agentBlocks,
      naturalConclusion,
    });
    downloadFile(`sentinelai-report-${currentTask.id}.md`, markdown, 'text/markdown;charset=utf-8');
  }

  return (
    <div className="space-y-6">
      <section className={`${cardClass} relative overflow-hidden`}>
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.14),transparent_60%)]" />
        <div className="relative space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <PageTitleBlock
              eyebrow="证据报告"
              title="证据报告"
              description="聚焦真实性判断、AIGC 生成可能性、风险高低、Agent 证据链与治理建议，帮助审核员完成可解释处置。"
            />
            <div className="rounded-[28px] border border-white/10 bg-slate-950/45 p-5 lg:min-w-[320px]">
              <div className="text-xs uppercase tracking-[0.24em] text-slate-400">最终治理建议</div>
              <div className="mt-3"><RecommendationBadge recommendation={currentTask.recommendation} /></div>
              <div className="mt-3 text-sm leading-7 text-slate-300">{naturalConclusion}</div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <HeadMeta title="任务ID" value={`#${currentTask.id}`} />
            <HeadMeta title="内容名称" value={currentTask.title} />
            <HeadMeta title="内容类型" value={contentTypeLabel(currentTask.contentType)} />
            <HeadMeta title="来源类型" value={sourceTypeLabel(sourceType)} />
            <HeadMeta title="分析时间" value={new Date(currentTask.createdAt).toLocaleString('zh-CN')} />
            <HeadMeta title="当前状态" value={statusLabel(currentTask.status)} pillClass={statusClassMap[currentTask.status] ?? statusClassMap.completed} />
          </div>
        </div>
      </section>

      {sourceType === 'url' ? (
        <section className={`${cardClass} space-y-5`}>
          <SectionHeading
            eyebrow="链接来源"
            title="链接来源信息"
            description="展示原始链接、平台来源、页面标题、作者与解析摘要，作为链接任务的来源证据入口。"
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <HeadMeta title="平台来源" value={currentTask.sourcePlatform ?? '普通网页'} />
            <HeadMeta title="页面标题" value={currentTask.pageTitle ?? currentTask.title} />
            <HeadMeta title="作者 / 发布者" value={currentTask.pageAuthor ?? '待补充'} />
            <HeadMeta title="发布时间" value={currentTask.publishedAt ?? '待补充'} />
            <HeadMeta title="媒体提取" value={`${currentTask.extractedVideo ? '含视频' : '无视频'} / ${currentTask.extractedImages ?? 0} 张图片`} />
            <HeadMeta title="解析状态" value={currentTask.linkPreview?.parseStatus ?? '演示解析成功'} />
          </div>
          {currentTask.sourceUrl ? (
            <a
              href={currentTask.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-full border border-sky-400/25 bg-sky-500/10 px-4 py-2 text-sm text-sky-100 transition hover:border-sky-300/35 hover:bg-sky-500/15"
            >
              打开原始链接
            </a>
          ) : null}
          <div className="rounded-[24px] border border-white/8 bg-white/4 p-5 text-sm leading-8 text-slate-200">
            {currentTask.extractedText ?? currentTask.linkPreview?.summary ?? '暂无链接解析摘要。'}
          </div>
        </section>
      ) : sourceType === 'document_text' ? (
        <section className={`${cardClass} space-y-5`}>
          <SectionHeading
            eyebrow="文本来源"
            title="文档与文本信息"
            description="展示文本摘要或文档信息，作为文本语义与真实性判断的输入来源。"
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <HeadMeta title="来源类型" value={sourceTypeLabel(sourceType)} />
            <HeadMeta title="内容类型" value={contentTypeLabel(currentTask.contentType)} />
            <HeadMeta title="内容标题" value={currentTask.title} />
          </div>
          <div className="rounded-[24px] border border-white/8 bg-white/4 p-5 text-sm leading-8 text-slate-200">
            {currentTask.extractedText ?? currentTask.conclusion}
          </div>
        </section>
      ) : (
        <section className={`${cardClass} space-y-5`}>
          <SectionHeading
            eyebrow="媒体来源"
            title="媒体素材信息"
            description="展示媒体任务的来源类型与内容类型，帮助区分图片、视频等素材的鉴别场景。"
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <HeadMeta title="来源类型" value={sourceTypeLabel(sourceType)} />
            <HeadMeta title="内容类型" value={contentTypeLabel(currentTask.contentType)} />
            <HeadMeta title="内容标题" value={currentTask.title} />
          </div>
        </section>
      )}

      <section className="grid gap-4 xl:grid-cols-3">
        <ScoreCard
          title="真实性评分"
          value={`${authenticityScore}`}
          description="分数越高表示越可信。"
          percent={authenticityScore}
          tone="authenticity"
        />
        <ScoreCard
          title="AIGC概率"
          value={formatPercent(currentTask.aigcProbability)}
          description="分数越高表示越可能由AI生成或修改。"
          percent={Math.round(currentTask.aigcProbability * 100)}
          tone="aigc"
        />
        <ScoreCard
          title="综合风险分"
          value={`${riskScore}`}
          description="分数越高表示越需要治理干预。"
          percent={riskScore}
          tone="risk"
        />
      </section>

      <section className={`${cardClass} space-y-5`}>
        <div className="flex items-center justify-between">
          <SectionHeading
            eyebrow="风险标签"
            title="动态风险标签"
            description="围绕真实性异常、AIGC 痕迹、语义风险和治理判断输出统一标签。"
          />
          <RiskBadge level={currentTask.riskLevel} />
        </div>
        <div className="flex flex-wrap gap-2">
          {riskTags.map((tag) => (
            <span key={tag} className="rounded-full border border-white/10 bg-white/4 px-4 py-2 text-sm text-slate-100">
              {tag}
            </span>
          ))}
        </div>
      </section>

      <section className={`${cardClass} space-y-5`}>
        <SectionHeading
          eyebrow="Agent协同"
          title="可解释证据链"
          description="按 Agent 展示发现内容、核心证据、风险贡献与解释，突出内容真实性与治理逻辑。"
        />
        <div className="space-y-4">
          {agentBlocks.map((block) => (
            <EvidenceCard
              key={block.id}
              title={block.title}
              summary={block.finding}
              items={block.evidence}
              footerTitle={block.extraTitle}
              footerValue={block.extraValue}
              rightSlot={
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-orange-400/30 bg-orange-500/12 px-3 py-1 text-xs text-orange-100">
                    风险贡献 {block.contribution}
                  </span>
                  <span className="rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-xs text-sky-100">
                    置信度 {Math.round(block.confidence * 100)}%
                  </span>
                </div>
              }
            />
          ))}
        </div>
      </section>

      <section className={`${cardClass} space-y-4`}>
        <SectionHeading
          eyebrow="审核结论"
          title="结论摘要"
          description="系统将真实性评分、AIGC 概率、风险等级和治理建议汇总为中文结论。"
        />
        <div className="rounded-[28px] border border-white/8 bg-white/4 p-5 text-sm leading-8 text-slate-200">
          {naturalConclusion}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className={`${cardClass} space-y-4`}>
          <SectionHeading
            eyebrow="治理建议"
            title="人工复核区"
            description={`当前登录人：${user?.display_name ?? '当前审核员'}。执行动作后会写入最终处置和审核日志。`}
          />
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            rows={5}
            className={inputClass}
            placeholder="补充复核说明，例如：需进一步核验授权证明。"
          />
          <div className="flex flex-wrap gap-3">
            {actions.map((action) => (
              <button
                key={action.value}
                type="button"
                onClick={() => handleAction(action.value)}
                disabled={Boolean(busyAction)}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-white transition hover:border-sky-400 hover:bg-sky-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busyAction === action.value ? '处理中...' : action.label}
              </button>
            ))}
          </div>
          {error ? <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}
        </div>

        <div className={`${cardClass} space-y-4`}>
          <div className="flex items-center justify-between">
            <SectionHeading
              eyebrow="审计留痕"
              title="审核日志"
              description="记录系统分析、人工复核和治理动作，支持后续追踪与复盘。"
            />
            <Link href="/tasks" className="text-sm text-sky-300 transition hover:text-sky-200">
              返回审核任务
            </Link>
          </div>
          <div className="space-y-3">
            {currentTask.auditLogs.map((log) => (
              <div key={`${log.action}-${log.createdAt}`} className="rounded-3xl border border-white/8 bg-white/4 p-4">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-white">{log.action}</span>
                  <span className="text-slate-400">{new Date(log.createdAt).toLocaleString('zh-CN')}</span>
                </div>
                <p className="mt-2 text-sm text-sky-200">{log.actor}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{log.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${cardClass} space-y-4`}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SectionHeading
            eyebrow="导出报告"
            title="导出证据报告"
            description="支持导出 JSON 和 Markdown，用于归档、复审协作与比赛演示。"
          />
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={exportJson} className="rounded-full border border-white/10 px-4 py-2 text-sm text-white transition hover:border-sky-400 hover:bg-sky-500/10">
              导出JSON
            </button>
            <button type="button" onClick={exportMarkdown} className="rounded-full bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-400">
              导出Markdown
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function HeadMeta({ title, value, pillClass }: { title: string; value: string; pillClass?: string }) {
  return (
    <div className="rounded-3xl border border-white/8 bg-white/4 p-4">
      <p className="text-sm text-slate-400">{title}</p>
      {pillClass ? <p className={`status-pill mt-3 inline-flex ${pillClass}`}>{value}</p> : <p className="mt-2 text-lg font-semibold text-white">{value}</p>}
    </div>
  );
}

function buildAgentBlocks(task: AuditTask): AgentReportBlock[] {
  return task.agentResults.map((result) => {
    const blueprint = getAgentBlueprint(result.agentName);
    const evidence = task.evidenceChain
      .filter((item) => item.sourceAgent === result.agentName)
      .map((item) => `${item.evidenceType}：${item.content}`);

    if (result.agentName === '风险推理Agent') {
      return {
        id: 'reasoning',
        title: result.agentName,
        finding: result.summary,
        evidence,
        contribution: result.riskContribution,
        confidence: result.confidence,
        explanation: result.explanation,
        extraTitle: '风险标签',
        extraValue: task.tags.join(' / '),
      };
    }

    if (result.agentName === '治理决策Agent') {
      return {
        id: 'decision',
        title: result.agentName,
        finding: result.summary,
        evidence,
        contribution: result.riskContribution,
        confidence: result.confidence,
        explanation: result.explanation,
        extraTitle: '后续处理建议',
        extraValue: recommendationLabel(task.recommendation),
      };
    }

    return {
      id: result.agentName,
      title: result.agentName,
      finding: result.summary,
      evidence: evidence.length > 0 ? evidence : blueprint.output,
      contribution: result.riskContribution,
      confidence: result.confidence,
      explanation: result.explanation,
      extraTitle: '解释',
      extraValue: blueprint.description,
    };
  });
}

function buildMarkdownReport({
  task,
  authenticityScore,
  riskScore,
  governanceAction,
  riskTags,
  agentBlocks,
  naturalConclusion,
}: {
  task: AuditTask;
  authenticityScore: number;
  riskScore: number;
  governanceAction: string;
  riskTags: string[];
  agentBlocks: AgentReportBlock[];
  naturalConclusion: string;
}) {
  return [
    '# 灵鉴 SentinelAI 证据报告',
    '',
    `- 任务ID：${task.id}`,
    `- 内容名称：${task.title}`,
    `- 内容类型：${contentTypeLabel(task.contentType)}`,
    `- 分析时间：${new Date(task.createdAt).toLocaleString('zh-CN')}`,
    `- 当前状态：${statusLabel(task.status)}`,
    `- 最终治理建议：${governanceAction}`,
    getTaskSourceType(task) === 'url' ? `- 来源类型：${sourceTypeLabel(getTaskSourceType(task))}` : '',
    '',
    ...(getTaskSourceType(task) === 'url'
      ? [
          '## 链接来源信息',
          `- 原始链接：${task.sourceUrl ?? '待补充'}`,
          `- 平台来源：${task.sourcePlatform ?? '普通网页'}`,
          `- 页面标题：${task.pageTitle ?? task.title}`,
          `- 作者 / 发布者：${task.pageAuthor ?? '待补充'}`,
          `- 发布时间：${task.publishedAt ?? '待补充'}`,
          `- 解析摘要：${task.extractedText ?? task.linkPreview?.summary ?? '暂无链接解析摘要'}`,
          '',
        ]
      : []),
    '## 三大核心评分',
    `- 真实性评分：${authenticityScore}`,
    `- AIGC概率：${formatPercent(task.aigcProbability)}`,
    `- 综合风险分：${riskScore}`,
    '',
    '## 风险标签',
    `- ${riskTags.join('、')}`,
    '',
    '## Agent证据链',
    ...agentBlocks.flatMap((block) => [
      `### ${block.title}`,
      `- 发现内容：${block.finding}`,
      `- 风险贡献：${block.contribution}`,
      `- 置信度：${Math.round(block.confidence * 100)}%`,
      `- 解释：${block.explanation}`,
      `- 证据：${block.evidence.join('；')}`,
      block.extraTitle && block.extraValue ? `- ${block.extraTitle}：${block.extraValue}` : '',
      '',
    ]),
    '## 自然语言审核结论',
    naturalConclusion,
  ]
    .filter(Boolean)
    .join('\n');
}

function downloadFile(filename: string, content: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}

function normalizeAction(action: string): Recommendation {
  if (action === 'block') return 'block';
  if (action === 'review') return 'review';
  if (action === 'throttle') return 'throttle';
  return 'release';
}
