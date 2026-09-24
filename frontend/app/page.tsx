'use client';

import Link from 'next/link';
import {
  AgentStatusBadge,
  ContentTypeBadge,
  HeroBrandBlock,
  MetricCard,
  RecommendationBadge,
  RiskBadge,
  SectionHeading,
} from '@/components/visual-components';
import {
  getAgentCenterCards,
  getAuthenticityOverview,
  getDashboardOverviewMetrics,
  getTaskSourceType,
  getRecentAuditTasks,
  mockGovernanceRiskTypes,
  mockRealtimeRiskEvents,
  sourceTypeLabel,
  taskContentTypeLabel,
} from '@/lib/mockAuditData';
import { cardClass, formatPercent } from '@/lib/ui';
import { JudgeDemoFlow } from '@/components/judge-demo-flow';
import { useJudgeMode } from '@/components/judge-mode-provider';

export default function HomePage() {
  const overviewMetrics = getDashboardOverviewMetrics();
  const authenticityOverview = getAuthenticityOverview();
  const homeRecentTasks = getRecentAuditTasks(5);
  const agentStatus = getAgentCenterCards();
  const { isJudgeMode, playDemo, demoTask } = useJudgeMode();


  if (isJudgeMode) {
    return (
      <div className="judge-mode-home space-y-6">
        <section className={`${cardClass} relative overflow-hidden border-sky-300/20`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.18),transparent_32%),radial-gradient(circle_at_80%_15%,rgba(139,92,246,0.16),transparent_28%)]" />
          <div className="relative grid gap-6 xl:grid-cols-[1fr_360px] xl:items-center">
            <div>
              <div className="inline-flex rounded-full border border-sky-300/30 bg-sky-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-100">中国移动杯 2026 江苏生成式人工智能创新大赛</div>
              <h1 className="mt-5 text-4xl font-semibold text-white lg:text-5xl">评委模式：30秒理解多智能体治理能力</h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">系统自动加载最佳案例“{demoTask.title}”，一键播放内容接入、真实性分析、AIGC识别、风险推理、治理决策和证据报告生成全过程。</p>
              <button type="button" onClick={playDemo} className="mt-6 rounded-full bg-gradient-to-r from-sky-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_30px_rgba(56,189,248,0.3)] transition hover:brightness-110">
                体验完整智能体决策链路
              </button>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/45 p-5">
              <div className="text-xs uppercase tracking-[0.22em] text-slate-500">系统能力总览卡片</div>
              <div className="mt-4 grid gap-3">
                {['多模态内容接入', '多Agent协同推理', '可解释证据链', '治理决策闭环'].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white">{item}</div>
                ))}
              </div>
            </div>
          </div>
        </section>
        <JudgeDemoFlow />
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <section className={`${cardClass} relative overflow-hidden`}>
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.14),transparent_60%)]" />
        <div className="absolute left-0 top-0 h-40 w-40 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="absolute bottom-0 right-10 h-36 w-36 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="relative">
          <HeroBrandBlock
            title={
              <>
                <span className="brand-cn">灵鉴</span>
                <span className="brand-en">SENTINELAI</span>
              </>
            }
            subtitle="内容真实性与AIGC风险治理智能体"
            slogan="In the era of generative AI, rebuild content trust."
            description="通过多模态分析与多Agent协同推理，识别AIGC生成内容、评估真实性风险，并生成可解释的治理决策与审计证据链。"
            actions={
              <>
                <Link href="/audit" className="rounded-full bg-sky-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-sky-400">
                  启动真实性鉴别
                </Link>
                <Link href="/agents" className="rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-slate-200 transition hover:border-sky-400 hover:text-white">
                  查看Agent协同机制
                </Link>
              </>
            }
          />
        </div>
      </section>

      <section className={`${cardClass} space-y-5`}>
        <SectionHeading
          eyebrow="平台治理总览"
          title="平台治理总览指标"
          description="集中回答平台当前识别量、AIGC疑似占比、高风险样本规模、分析效率与治理处置表现。"
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          {overviewMetrics.map((item, index) => (
            <div key={item.title} className="min-w-0">
              <MetricCard
                title={item.title}
                value={item.value}
                description={item.hint}
                delta={item.delta}
                accent={
                  index === 0
                    ? 'sky'
                    : index === 1
                      ? 'violet'
                      : index === 2
                        ? 'orange'
                        : index === 3
                          ? 'emerald'
                          : index === 4
                            ? 'emerald'
                            : 'amber'
                }
              />
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className={`${cardClass} space-y-5`}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="实时风险监控"
              title="实时风险监控"
              description="提炼平台最新高关注风险事件，帮助快速判断当前风险态势与优先处理方向。"
            />
            <Link href="/tasks" className="text-sm text-sky-300 transition hover:text-sky-200">
              前往审核任务
            </Link>
          </div>
          <div className="space-y-3">
            {mockRealtimeRiskEvents.map((event) => (
              <article key={`${event.time}-${event.title}`} className="rounded-3xl border border-white/8 bg-white/4 p-5">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span className="rounded-full bg-slate-900 px-3 py-1">{event.time}</span>
                    <ContentTypeBadge contentType={event.contentType} />
                    <span className="rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-slate-300">{event.tag}</span>
                  </div>
                  <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xl font-semibold text-white">{event.title}</h3>
                      <div className="mt-3 text-sm text-slate-400">{event.source}</div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <RiskBadge level={event.level} />
                      <RecommendationBadge recommendation={event.recommendation} />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className={`${cardClass} space-y-5`}>
          <SectionHeading
            eyebrow="风险类型分布"
            title="风险类型分布"
            description="聚合当前平台最需要关注的风险类型，突出治理热度与风险焦点。"
          />
          <div className="grid gap-4 md:grid-cols-2">
            {mockGovernanceRiskTypes.map((item) => (
              <article key={item.label} className="rounded-3xl border border-white/8 bg-white/4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-white">{item.label}</div>
                    <div className="mt-2 text-sm text-slate-300">{item.hint}</div>
                  </div>
                  <span className="rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-xs text-slate-300">
                    {item.level}
                  </span>
                </div>
                <div className="mt-5 flex items-end justify-between gap-4">
                  <div className="text-3xl font-semibold text-white">{item.value}</div>
                  <div className="text-sm text-slate-400">热度 {item.heat}%</div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-950">
                  <div className={`h-full rounded-full ${riskTypeBarClass(item.heat)}`} style={{ width: `${item.heat}%` }} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`${cardClass} space-y-5`}>
        <SectionHeading
          eyebrow="真实性风险概览"
          title="真实性风险概览"
          description="围绕内容是否真实、是否疑似 AIGC、是否存在传播风险三个判断维度进行聚合呈现。"
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {authenticityOverview.map((item) => (
            <article key={item.title} className="rounded-3xl border border-white/8 bg-white/4 p-5">
              <div className="text-sm text-slate-400">{item.title}</div>
              <div className={`mt-3 text-4xl font-semibold ${item.tone}`}>{item.value}</div>
              <div className="mt-4 text-sm leading-7 text-slate-300">{item.detail}</div>
            </article>
          ))}
        </div>
      </section>

      <section className={`${cardClass} space-y-5`}>
        <SectionHeading
          eyebrow="Agent协同"
          title="Agent运行状态摘要"
          description="展示真实性分析、AIGC识别、文本语义、风险推理和治理决策五个核心 Agent 的当前状态、耗时、调用量与稳定性。"
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {agentStatus.map((agent) => (
            <article key={agent.name} className="rounded-3xl border border-white/8 bg-white/4 p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-white">{agent.name}</h3>
                <AgentStatusBadge status={agent.runtime.status} />
              </div>
              <div className="mt-3 text-sm leading-6 text-slate-300">{agent.description}</div>
              <div className="mt-5 grid gap-3">
                <InfoRow label="平均耗时" value={agent.runtime.averageDuration} />
                <InfoRow label="今日调用次数" value={agent.runtime.recentCalls} />
                <InfoRow label="平均置信度" value={formatPercent(agent.runtime.averageConfidence)} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={`${cardClass} space-y-5`}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="最近鉴别任务"
            title="最近鉴别任务"
            description="展示最近进入系统的内容鉴别任务，帮助快速进入证据报告和治理处置。"
          />
          <Link href="/tasks" className="text-sm text-sky-300 transition hover:text-sky-200">
            查看全部审核任务
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-200">
            <thead className="border-b border-white/10 text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">内容名称</th>
                <th className="px-4 py-3 font-medium">来源类型</th>
                <th className="px-4 py-3 font-medium">内容类型</th>
                <th className="px-4 py-3 font-medium">真实性评分</th>
                <th className="px-4 py-3 font-medium">AIGC概率</th>
                <th className="px-4 py-3 font-medium">风险等级</th>
                <th className="px-4 py-3 font-medium">治理建议</th>
                <th className="px-4 py-3 font-medium">报告</th>
              </tr>
            </thead>
            <tbody>
              {homeRecentTasks.map((task) => (
                <tr key={task.id} className="border-b border-white/6 align-top">
                  <td className="px-4 py-4 font-medium text-white">{task.title}</td>
                  <td className="px-4 py-4 text-slate-300">{sourceTypeLabel(getTaskSourceType(task))}</td>
                  <td className="px-4 py-4"><ContentTypeBadge contentType={taskContentTypeLabel(task)} /></td>
                  <td className="px-4 py-4">{task.authenticityScore}</td>
                  <td className="px-4 py-4">{formatPercent(task.aigcProbability)}</td>
                  <td className="px-4 py-4"><RiskBadge level={task.riskLevel} /></td>
                  <td className="px-4 py-4"><RecommendationBadge recommendation={task.recommendation} /></td>
                  <td className="px-4 py-4">
                    <Link href={`/tasks/${task.id}`} className="text-sky-300 transition hover:text-sky-200">
                      查看报告
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-slate-950/35 px-4 py-3">
      <div className="text-xs uppercase tracking-[0.22em] text-slate-500">{label}</div>
      <div className="mt-2 text-sm font-medium text-white">{value}</div>
    </div>
  );
}

function riskTypeBarClass(heat: number) {
  if (heat >= 90) return 'bg-red-400';
  if (heat >= 80) return 'bg-orange-400';
  if (heat >= 70) return 'bg-amber-300';
  return 'bg-emerald-400';
}

