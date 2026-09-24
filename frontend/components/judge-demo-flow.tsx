'use client';

import { useJudgeMode, type JudgeStepStatus } from '@/components/judge-mode-provider';

const statusText: Record<JudgeStepStatus, string> = {
  waiting: 'waiting',
  running: 'running',
  done: 'done',
};

export function JudgeDemoFlow({ compact = false }: { compact?: boolean }) {
  const { demoSteps, activeStepIndex, getStepStatus, playDemo, resetDemo, demoComplete, demoTask } = useJudgeMode();
  const activeStep = demoSteps[activeStepIndex] ?? demoSteps[0];

  return (
    <section className="judge-demo-flow rounded-2xl border border-sky-300/18 bg-slate-950/45 p-5 shadow-[0_0_44px_rgba(56,189,248,0.13)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.28em] text-cyan-200/70">live execution</div>
          <h2 className="mt-2 text-2xl font-semibold text-white">多智能体决策链路实时运行</h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300">最佳演示案例：{demoTask.title}。评委可在 2 分钟内看到内容接入、证据生成、风险推理和治理决策闭环。</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={playDemo} className="rounded-full bg-gradient-to-r from-sky-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_24px_rgba(56,189,248,0.24)]">一键播放完整演示</button>
          <button type="button" onClick={resetDemo} className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:border-sky-300/40">重置</button>
        </div>
      </div>

      <div className={`mt-5 grid gap-3 ${compact ? 'lg:grid-cols-4' : 'lg:grid-cols-7'}`}>
        {demoSteps.map((step, index) => {
          const status = getStepStatus(index);
          return (
            <article key={step.id} className={`judge-step-card ${status} rounded-2xl border p-4 transition duration-300`}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-400">{String(index + 1).padStart(2, '0')}</span>
                <span className="rounded-full bg-white/8 px-2 py-1 text-[11px] text-slate-200">{statusText[status]}</span>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-white">{step.title}</h3>
              <p className="mt-2 text-xs leading-5 text-slate-400">{step.output}</p>
            </article>
          );
        })}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs uppercase tracking-[0.22em] text-slate-500">当前输出结果</div>
          <div className="mt-2 text-lg font-semibold text-white">{activeStep.agent}</div>
          <p className="mt-2 text-sm leading-7 text-slate-300">{activeStep.output}</p>
          <p className="mt-2 text-sm text-cyan-100">证据：{activeStep.evidence}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs uppercase tracking-[0.22em] text-slate-500">结果高光</div>
          <div className="mt-3 grid gap-2 text-sm text-slate-300">
            <div>真实性评分：<span className="text-white">{demoTask.authenticityScore}</span></div>
            <div>AIGC概率：<span className="text-sky-100">{Math.round(demoTask.aigcProbability * 100)}%</span></div>
            <div>综合风险分：<span className="text-rose-100">{demoTask.riskScore}</span></div>
            <div>流程状态：<span className="text-emerald-100">{demoComplete ? '证据报告已生成' : '正在推理'}</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}
