'use client';

import { useMemo, useState } from 'react';
import {
  AgentStatusBadge,
  MetricCard,
  PageTitleBlock,
  SectionHeading,
} from '@/components/visual-components';
import { type AgentCenterCard, getAgentCenterCards } from '@/lib/mockAuditData';
import { JudgeDemoFlow } from '@/components/judge-demo-flow';
import { useJudgeMode } from '@/components/judge-mode-provider';
import { cardClass, compactCardClass, formatPercent, subCardClass } from '@/lib/ui';

const pipelineNodes = [
  '内容输入',
  '真实性分析Agent',
  'AIGC识别Agent',
  '文本语义Agent',
  '风险推理Agent',
  '治理决策Agent',
  '证据报告',
] as const;

type AgentDetailNode = Omit<AgentCenterCard, 'name'> & {
  name: string;
};

export default function AgentsPage() {
  const agents: AgentCenterCard[] = useMemo(() => getAgentCenterCards(), []);
  const detailNodes = useMemo<AgentDetailNode[]>(() => {
    const contentInputNode: AgentDetailNode = {
      id: 'ingest',
      name: '内容输入',
      icon: 'IN',
      color: 'from-emerald-400/24 to-cyan-400/10',
      description: '负责多模态内容接入、基础解析和鉴别任务初始化，为后续各 Agent 提供标准化输入。',
      responsibilities: ['多模态内容接入', '任务初始化', '文件与链接解析'],
      input: ['图片 / 视频', '文档与文本', '社交媒体与网页链接'],
      output: ['source_type', 'content_type', 'file_metadata', 'task_id'],
      tags: ['多模态接入', '任务初始化', '标准化输入'],
      capabilityMatrix: [
        { title: '职责', items: ['多模态内容接入', '文件元信息提取', '任务初始化'] },
        { title: '输入', items: ['本地媒体素材', '文档与文本', '链接内容'] },
        { title: '输出', items: ['source_type', 'content_type', 'file_metadata', 'task_id'] },
      ],
      evidenceSummary: ['识别来源类型与内容类型', '抽取文件元信息', '生成统一任务编号'],
      collaboration: {
        upstream: [],
        downstream: ['真实性分析Agent'],
      },
      outputExample: [
        { key: 'source_type', value: 'media' },
        { key: 'content_type', value: 'video' },
        { key: 'file_metadata', value: 'duration=18.4s / size=24MB' },
        { key: 'task_id', value: '#A-2048' },
      ],
      runtime: {
        status: 'Healthy',
        averageDuration: '0.4s',
        recentCalls: '1,892 次',
        averageConfidence: 0.99,
        totalContribution: 0,
        todayCalls: 1892,
        averageContribution: 0,
      },
    };

    return [contentInputNode, ...agents];
  }, [agents]);
  const [activeAgentId, setActiveAgentId] = useState<string>('aigc');
  const activeAgent = useMemo(
    () => detailNodes.find((agent) => agent.id === activeAgentId) ?? detailNodes[1] ?? detailNodes[0],
    [activeAgentId, detailNodes],
  );
  const totalCalls = agents.reduce((sum, agent) => sum + parseInt(agent.runtime.recentCalls.replace(/[^\d]/g, ''), 10), 0);
  const averageConfidence = agents.reduce((sum, agent) => sum + agent.runtime.averageConfidence, 0) / agents.length;
  const { isJudgeMode } = useJudgeMode();

  return (
    <div className="space-y-6">
      {isJudgeMode ? <JudgeDemoFlow /> : null}
      <section className={`${cardClass} workflow-hero relative overflow-hidden`}>
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(96,165,250,0.18),transparent_60%)]" />
        <div className="absolute left-8 top-8 h-44 w-44 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute bottom-8 right-12 h-40 w-40 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="relative grid gap-8 xl:grid-cols-[1.12fr_0.88fr] xl:items-start">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2 text-xs text-sky-100/90">
              <span className="rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1">Agent协同中心</span>
              <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1">多智能体治理</span>
              <span className="rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-3 py-1">可解释证据链</span>
            </div>
            <PageTitleBlock
              eyebrow="Agent协同中心"
              title="多Agent协同治理架构"
              description="灵鉴 SentinelAI 将复杂内容审核任务拆解给多个专业智能体，由各Agent完成真实性分析、AIGC识别、语义风险判断、风险推理和治理决策。"
            />
            <div className="grid gap-3 md:grid-cols-3">
              <MetricCard title="Agent 数量" value={`${agents.length}`} description="围绕真实性分析到治理决策的完整链路协同运行" accent="sky" />
              <MetricCard title="最近调用总量" value={formatCalls(totalCalls)} description="展示多 Agent 在真实内容流上的持续运行能力" accent="emerald" />
              <MetricCard title="平均置信度" value={formatPercent(averageConfidence)} description="各 Agent 输出结果的综合稳定性" accent="violet" />
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-slate-950/45 p-5 shadow-[0_28px_80px_rgba(5,10,24,0.4)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">当前讲解焦点</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">{activeAgent.name}</h2>
              </div>
              <AgentStatusBadge status={activeAgent.runtime.status} />
            </div>
            <div className="mt-4 text-sm leading-7 text-slate-300">{activeAgent.description}</div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <MiniStat label="平均耗时" value={activeAgent.runtime.averageDuration} />
              <MiniStat label="今日调用次数" value={`${activeAgent.runtime.todayCalls.toLocaleString('zh-CN')} 次`} />
              <MiniStat label="平均置信度" value={formatPercent(activeAgent.runtime.averageConfidence)} />
              <MiniStat label="风险贡献均值" value={activeAgent.runtime.averageContribution > 0 ? `+${activeAgent.runtime.averageContribution}` : '0'} />
            </div>
          </div>
        </div>
      </section>

      <section className={`${cardClass} workflow-grid relative overflow-hidden`}>
        <div className="flex items-center justify-between">
          <SectionHeading
            eyebrow="Agent协同"
            title="Agent 协同主链路"
            description="从内容输入到证据报告，统一展示多 Agent 如何分工协同、逐步形成治理结论。"
          />
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">适合路演讲解</div>
        </div>
        <div className="mt-6 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-2">
            {pipelineNodes.map((label, index) => {
              const linkedAgent = detailNodes.find((agent) => agent.name === label);
              const isActive = linkedAgent?.id === activeAgent.id;
              const isClickable = Boolean(linkedAgent);
              return (
                <div key={label} className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (linkedAgent) {
                        setActiveAgentId(linkedAgent.id);
                      }
                    }}
                    className={`workflow-node w-full rounded-[28px] border px-5 py-4 text-left transition ${
                      isClickable
                        ? isActive
                          ? 'border-sky-400/40 bg-sky-500/10 shadow-[0_0_32px_rgba(56,189,248,0.12)]'
                          : 'border-white/10 bg-white/4 hover:border-sky-400/25 hover:bg-white/6'
                        : label === '内容输入'
                          ? 'border-emerald-400/25 bg-emerald-500/10'
                          : 'border-fuchsia-400/25 bg-fuchsia-500/10'
                    } ${!isClickable ? 'cursor-default' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/70 text-sm font-semibold text-white">
                        {linkedAgent?.icon ?? (label === '内容输入' ? 'IN' : 'OUT')}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-lg font-semibold text-white">{label}</span>
                          {linkedAgent ? <AgentStatusBadge status={linkedAgent.runtime.status} /> : null}
                        </div>
                        <div className="mt-2 text-sm text-slate-300">
                          {linkedAgent?.description ?? (label === '内容输入' ? '多模态内容进入鉴别链路' : '汇总多 Agent 输出，形成可导出的证据报告')}
                        </div>
                      </div>
                    </div>
                  </button>
                  {index < pipelineNodes.length - 1 ? (
                    <div className="workflow-connector my-2 flex h-8 items-center justify-center">
                      <div className="h-full w-px bg-gradient-to-b from-sky-400/70 to-transparent" />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className={`rounded-[32px] border border-white/10 bg-gradient-to-br ${activeAgent.color} p-5`}>
            <AgentOverviewPanel agent={activeAgent} />
            <div className="mt-5 grid gap-4">
              <AgentCapabilityMatrix groups={activeAgent.capabilityMatrix} />
              <AgentRuntimeMetrics agent={activeAgent} />
              <AgentCollaborationPath agent={activeAgent} />
              <AgentOutputExample agent={activeAgent} />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className={`${cardClass} space-y-5`}>
          <SectionHeading
            eyebrow="风险评分"
            title="综合风险分计算方式"
            description="统一使用相同的风险权重和解释口径，确保首页、任务中心和证据报告结论一致。"
          />
          <div className="rounded-[28px] border border-white/8 bg-slate-950/45 p-6">
            <div className="text-2xl font-semibold leading-10 text-white">
              综合风险分 =
              <br />
              0.30 × AIGC概率 +
              <br />
              0.25 × 真实性异常 +
              <br />
              0.25 × 语义风险 +
              <br />
              0.20 × 传播风险
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <MetricCard title="AIGC概率权重" value="30%" description="重点刻画生成与修改痕迹对内容可信度的影响" accent="sky" />
            <MetricCard title="真实性异常权重" value="25%" description="关注 Metadata、来源信号和设备可信度异常" accent="emerald" />
            <MetricCard title="语义风险权重" value="25%" description="评估虚假宣传、诈骗营销和误导性表达" accent="amber" />
            <MetricCard title="传播风险权重" value="20%" description="评估内容传播后造成误导、扩散和处置压力" accent="orange" />
          </div>
        </div>

        <div className={`${cardClass} governance-status relative overflow-hidden`}>
          <div className="flex items-center justify-between">
            <SectionHeading
              eyebrow="Agent状态"
              title="运行状态总览"
              description="统一展示每个 Agent 的状态、平均耗时、调用量和置信度。"
            />
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">实时概览</span>
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-200">
              <thead className="border-b border-white/10 text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Agent</th>
                  <th className="px-4 py-3 font-medium">状态</th>
                  <th className="px-4 py-3 font-medium">平均耗时</th>
                  <th className="px-4 py-3 font-medium">最近调用次数</th>
                  <th className="px-4 py-3 font-medium">平均置信度</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent) => (
                  <tr key={agent.id} className="border-b border-white/6">
                    <td className="px-4 py-4 font-medium text-white">{agent.name}</td>
                    <td className="px-4 py-4">
                      <AgentStatusBadge status={agent.runtime.status} />
                    </td>
                    <td className="px-4 py-4 text-slate-300">{agent.runtime.averageDuration}</td>
                    <td className="px-4 py-4 text-slate-300">{agent.runtime.recentCalls}</td>
                    <td className="px-4 py-4 text-slate-300">{formatPercent(agent.runtime.averageConfidence)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-slate-950/35 px-4 py-3">
      <div className="text-xs uppercase tracking-[0.22em] text-slate-500">{label}</div>
      <div className="mt-2 text-lg font-semibold text-white">{value}</div>
    </div>
  );
}

function AgentOverviewPanel({ agent }: { agent: AgentDetailNode }) {
  return (
    <section className={subCardClass}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.28em] text-sky-100/80">当前 Agent 概览</div>
          <h3 className="mt-2 text-3xl font-semibold text-white">{agent.name}</h3>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-100">{agent.description}</p>
        </div>
        <AgentStatusBadge status={agent.runtime.status} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {agent.tags.map((tag) => (
          <span key={tag} className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-slate-100">
            {tag}
          </span>
        ))}
      </div>
    </section>
  );
}

function AgentCapabilityMatrix({ groups }: { groups: AgentDetailNode['capabilityMatrix'] }) {
  return (
    <section className={subCardClass}>
      <div className="text-sm font-medium text-white">能力矩阵</div>
      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        {groups.map((group) => (
          <div key={group.title} className="rounded-3xl border border-white/8 bg-slate-950/30 p-4">
            <div className="text-sm font-medium text-white">{group.title}</div>
            <div className="mt-4 flex flex-wrap gap-2">
              {group.items.map((item) => (
                <span key={item} className="rounded-full border border-white/10 bg-white/4 px-3 py-1 text-xs text-slate-200">
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function AgentRuntimeMetrics({ agent }: { agent: AgentDetailNode }) {
  const metrics = [
    { label: '平均耗时', value: agent.runtime.averageDuration },
    { label: '平均置信度', value: formatPercent(agent.runtime.averageConfidence) },
    { label: '今日调用次数', value: agent.runtime.todayCalls.toLocaleString('zh-CN') },
    { label: '风险贡献均值', value: agent.runtime.averageContribution > 0 ? `+${agent.runtime.averageContribution}` : '0' },
  ];
  return (
    <section className={subCardClass}>
      <div className="text-sm font-medium text-white">运行指标</div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className={compactCardClass}>
            <div className="text-xs uppercase tracking-[0.22em] text-slate-500">{metric.label}</div>
            <div className="mt-2 text-lg font-semibold text-white">{metric.value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function AgentCollaborationPath({ agent }: { agent: AgentDetailNode }) {
  const upstream = agent.collaboration.upstream.length > 0 ? agent.collaboration.upstream : ['无上游'];
  const downstream = agent.collaboration.downstream.length > 0 ? agent.collaboration.downstream : ['等待下游'];
  return (
    <section className={subCardClass}>
      <div className="text-sm font-medium text-white">协同关系</div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {upstream.map((item) => (
          <NodeChip key={`up-${item}`} label={item} tone="muted" />
        ))}
        <span className="text-slate-500">→</span>
        <NodeChip label={agent.name} tone="active" />
        {downstream.map((item) => (
          <div key={`down-${item}`} className="contents">
            <span className="text-slate-500">→</span>
            <NodeChip label={item} tone="muted" />
          </div>
        ))}
      </div>
    </section>
  );
}

function AgentOutputExample({ agent }: { agent: AgentDetailNode }) {
  return (
    <section className={subCardClass}>
      <div className="grid gap-4 xl:grid-cols-[0.88fr_1.12fr]">
        <div>
          <div className="text-sm font-medium text-white">示例输出</div>
          <div className="mt-4 rounded-3xl border border-white/8 bg-slate-950/45 p-4">
            <div className="space-y-3 font-mono text-xs text-slate-200">
              {agent.outputExample.map((item) => (
                <div key={item.key} className="grid grid-cols-[132px_minmax(0,1fr)] gap-3">
                  <span className="text-sky-200/90">{item.key}</span>
                  <span className="text-slate-300">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <div className="text-sm font-medium text-white">证据摘要</div>
          <div className="mt-4 grid gap-3">
            {agent.evidenceSummary.map((item) => (
              <div key={item} className="rounded-2xl border border-white/8 bg-slate-950/30 px-4 py-3 text-sm text-slate-200">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function NodeChip({ label, tone }: { label: string; tone: 'active' | 'muted' }) {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs ${
        tone === 'active'
          ? 'border-sky-400/35 bg-sky-500/12 text-sky-100'
          : 'border-white/10 bg-white/4 text-slate-300'
      }`}
    >
      {label}
    </span>
  );
}

function formatCalls(value: number) {
  return `${value.toLocaleString('zh-CN')} 次`;
}

