'use client';

import {
  contentTypeLabel,
  recommendationLabel,
  riskLevelLabel,
  type AgentExecutionStatus,
  type ContentType,
  type Recommendation,
  type RiskLevel,
} from '@/lib/mockAuditData';
import {
  agentRuntimeClassMap,
  badgeBaseClass,
  cardClass,
  compactCardClass,
  contentTypeClassMap,
  recommendationClassMap,
  riskClassMap,
  subCardClass,
} from '@/lib/ui';

type RiskBadgeLevel = RiskLevel | '低风险' | '中风险' | '高风险' | '严重风险';
type AgentRuntimeState = AgentExecutionStatus | 'Healthy' | 'Running' | 'Warning';

export function PageTitleBlock({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-sky-200/80">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">{title}</h1>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}

export function HeroBrandBlock({
  title,
  subtitle,
  slogan,
  description,
  actions,
}: {
  title: React.ReactNode;
  subtitle: string;
  slogan: string;
  description: string;
  actions: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,20,36,0.92),rgba(6,14,28,0.88))] p-6 lg:p-8">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.08)_1px,transparent_1px)] bg-[size:28px_28px] opacity-[0.08]" />
      <div className="absolute -right-10 top-6 text-[72px] font-semibold tracking-[0.28em] text-white/[0.04] lg:text-[120px]">
        SENTINELAI
      </div>
      <div className="absolute -left-6 bottom-0 text-[48px] font-semibold tracking-[0.16em] text-sky-200/[0.05] lg:text-[92px]">
        AUTHENTICITY
      </div>
      <div className="absolute left-12 top-10 h-40 w-40 rounded-full bg-sky-400/12 blur-3xl" />
      <div className="absolute right-16 bottom-12 h-32 w-32 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="relative space-y-5">
        <div className="text-sm uppercase tracking-[0.34em] text-sky-200/80">真实性驾驶舱</div>
        <div className="space-y-4">
          <div className="brand-hero-title text-white">{title}</div>
          <div className="text-2xl font-semibold leading-snug text-slate-100 lg:text-3xl">{subtitle}</div>
          <div className="text-sm italic tracking-[0.18em] text-sky-200/80 lg:text-base">{slogan}</div>
          <p className="max-w-4xl text-sm leading-8 text-slate-300 lg:text-base">{description}</p>
        </div>
        <div className="flex flex-wrap gap-3">{actions}</div>
      </div>
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.3em] text-sky-200/80">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
    </div>
  );
}

export function RiskBadge({ level }: { level: RiskBadgeLevel }) {
  const normalized = normalizeRiskLevel(level);
  return <span className={`${badgeBaseClass} ${riskClassMap[normalized]}`}>{riskLevelLabel(normalized)}</span>;
}

export function RecommendationBadge({ recommendation }: { recommendation: Recommendation | string }) {
  const normalized = normalizeRecommendation(recommendation);
  return (
    <span className={`${badgeBaseClass} ${recommendationClassMap[normalized]}`}>
      {recommendationLabel(normalized)}
    </span>
  );
}

export function AgentStatusBadge({ status }: { status: AgentRuntimeState }) {
  return <span className={`${badgeBaseClass} ${agentRuntimeClassMap[status]}`}>{agentStatusLabel(status)}</span>;
}

export function ContentTypeBadge({ contentType }: { contentType: ContentType | string }) {
  const label = typeof contentType === 'string' && ['图片', '视频', '文档', '文本', '链接', '视频链接', '图文链接', '新闻网页'].includes(contentType)
    ? contentType
    : contentTypeLabel(contentType as ContentType);
  return <span className={`${badgeBaseClass} ${contentTypeClassMap[label]}`}>{label}</span>;
}

export function MetricCard({
  title,
  value,
  description,
  delta,
  accent = 'sky',
}: {
  title: string;
  value: string;
  description: string;
  delta?: string;
  accent?: 'sky' | 'emerald' | 'amber' | 'orange' | 'red' | 'violet';
}) {
  const accentClass = {
    sky: 'bg-sky-400',
    emerald: 'bg-emerald-400',
    amber: 'bg-amber-300',
    orange: 'bg-orange-400',
    red: 'bg-red-400',
    violet: 'bg-violet-400',
  } as const;

  return (
    <article className={cardClass}>
      <div className="text-sm text-slate-400">{title}</div>
      <div className="mt-4 text-4xl font-semibold text-white">{value}</div>
      <div className="mt-3 text-sm leading-6 text-slate-300">{description}</div>
      {delta ? <div className="mt-2 text-xs text-slate-500">{delta}</div> : null}
      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-950">
        <div className={`h-full w-2/3 rounded-full ${accentClass[accent]}`} />
      </div>
    </article>
  );
}

export function ScoreCard({
  title,
  value,
  description,
  percent,
  tone,
}: {
  title: string;
  value: string;
  description: string;
  percent: number;
  tone: 'authenticity' | 'aigc' | 'risk';
}) {
  const toneMap = {
    authenticity: {
      bg: 'from-emerald-400/24 to-emerald-500/5',
      accent: 'bg-emerald-400',
    },
    aigc: {
      bg: 'from-sky-400/24 to-violet-500/5',
      accent: 'bg-sky-400',
    },
    risk: {
      bg: 'from-orange-400/20 to-red-500/5',
      accent: 'bg-orange-400',
    },
  } as const;

  return (
    <article className={`${cardClass} relative overflow-hidden`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${toneMap[tone].bg}`} />
      <div className="relative">
        <div className="text-sm text-slate-300">{title}</div>
        <div className="mt-4 text-5xl font-semibold text-white">{value}</div>
        <div className="mt-3 text-sm leading-7 text-slate-300">{description}</div>
        <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-950/70">
          <div className={`h-full rounded-full ${toneMap[tone].accent}`} style={{ width: `${Math.max(percent, 8)}%` }} />
        </div>
      </div>
    </article>
  );
}

export function EvidenceCard({
  title,
  summary,
  items,
  footerTitle,
  footerValue,
  rightSlot,
}: {
  title: string;
  summary?: string;
  items: string[];
  footerTitle?: string;
  footerValue?: string;
  rightSlot?: React.ReactNode;
}) {
  return (
    <article className={`${subCardClass} space-y-4`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          {summary ? <p className="mt-2 text-sm leading-7 text-slate-300">{summary}</p> : null}
        </div>
        {rightSlot}
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className={`${badgeBaseClass} border-white/10 bg-white/4 text-slate-100`}>
            {item}
          </span>
        ))}
      </div>
      {footerTitle && footerValue ? (
        <div className={compactCardClass}>
          <div className="text-xs uppercase tracking-[0.22em] text-slate-500">{footerTitle}</div>
          <div className="mt-2 text-sm leading-7 text-slate-200">{footerValue}</div>
        </div>
      ) : null}
    </article>
  );
}

function normalizeRiskLevel(level: RiskBadgeLevel): RiskLevel {
  if (level === '低风险') return 'low';
  if (level === '中风险') return 'medium';
  if (level === '高风险') return 'high';
  if (level === '严重风险') return 'severe';
  return level;
}

function normalizeRecommendation(value: Recommendation | string): Recommendation {
  if (value === 'block' || value === '风险拦截' || value === '拦截') return 'block';
  if (value === 'review' || value === '人工复审') return 'review';
  if (value === 'throttle' || value === '限流' || value === '限流观察') return 'throttle';
  return 'release';
}

function agentStatusLabel(status: AgentRuntimeState) {
  if (status === 'pending') return '等待中';
  if (status === 'running') return '分析中';
  if (status === 'completed') return '已完成';
  if (status === 'failed') return '失败';
  return status;
}
