export const cardClass = 'glass rounded-[28px] border border-white/10 p-6 lg:p-7 shadow-[0_18px_60px_rgba(1,10,24,0.28)]';
export const subCardClass = 'rounded-[24px] border border-white/8 bg-white/4 p-4';
export const compactCardClass = 'rounded-2xl border border-white/8 bg-slate-950/35 px-4 py-3';
export const inputClass =
  'w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400';
export const badgeBaseClass =
  'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.02em]';

export const riskClassMap: Record<string, string> = {
  pending: 'bg-slate-700/70 text-slate-200',
  severe: 'bg-red-500/18 text-red-100 border border-red-400/35',
  high: 'bg-orange-500/18 text-orange-100 border border-orange-400/35',
  medium: 'bg-amber-400/18 text-amber-100 border border-amber-300/35',
  low: 'bg-emerald-400/20 text-emerald-100 border border-emerald-300/30',
};

export const statusClassMap: Record<string, string> = {
  queued: 'bg-slate-700/70 text-slate-100',
  processing: 'bg-sky-500/20 text-sky-100 border border-sky-400/30',
  completed: 'bg-emerald-500/20 text-emerald-100 border border-emerald-400/30',
  reviewed: 'bg-violet-500/20 text-violet-100 border border-violet-400/30',
  escalated: 'bg-amber-400/20 text-amber-100 border border-amber-300/30',
};

export const recommendationClassMap: Record<string, string> = {
  release: 'bg-emerald-400/20 text-emerald-100 border border-emerald-300/30',
  throttle: 'bg-amber-400/18 text-amber-100 border border-amber-300/35',
  review: 'bg-orange-500/18 text-orange-100 border border-orange-400/35',
  block: 'bg-red-500/18 text-red-100 border border-red-400/35',
};

export const agentRuntimeClassMap: Record<string, string> = {
  pending: 'bg-slate-700/70 text-slate-200 border border-white/10',
  running: 'bg-sky-500/18 text-sky-100 border border-sky-400/35',
  completed: 'bg-emerald-400/20 text-emerald-100 border border-emerald-300/30',
  failed: 'bg-red-500/18 text-red-100 border border-red-400/35',
  Healthy: 'bg-emerald-400/20 text-emerald-100 border border-emerald-300/30',
  Running: 'bg-sky-500/18 text-sky-100 border border-sky-400/35',
  Warning: 'bg-amber-400/18 text-amber-100 border border-amber-300/35',
};

export const contentTypeClassMap: Record<string, string> = {
  image: 'bg-violet-500/16 text-violet-100 border border-violet-400/25',
  video: 'bg-cyan-500/16 text-cyan-100 border border-cyan-400/25',
  document: 'bg-amber-500/16 text-amber-100 border border-amber-400/25',
  text: 'bg-slate-500/18 text-slate-100 border border-slate-300/25',
  link: 'bg-sky-500/16 text-sky-100 border border-sky-400/25',
  图片: 'bg-violet-500/16 text-violet-100 border border-violet-400/25',
  视频: 'bg-cyan-500/16 text-cyan-100 border border-cyan-400/25',
  文档: 'bg-amber-500/16 text-amber-100 border border-amber-400/25',
  文本: 'bg-slate-500/18 text-slate-100 border border-slate-300/25',
  链接: 'bg-sky-500/16 text-sky-100 border border-sky-400/25',
  视频链接: 'bg-sky-500/16 text-sky-100 border border-sky-400/25',
  图文链接: 'bg-sky-500/16 text-sky-100 border border-sky-400/25',
  新闻网页: 'bg-sky-500/16 text-sky-100 border border-sky-400/25',
};

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}
