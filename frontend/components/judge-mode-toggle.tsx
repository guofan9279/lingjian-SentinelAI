'use client';

import { useJudgeMode } from '@/components/judge-mode-provider';

export function JudgeModeToggle() {
  const { isJudgeMode, setJudgeMode, playDemo } = useJudgeMode();

  return (
    <div className="judge-mode-toggle inline-flex rounded-2xl border border-white/10 bg-slate-950/45 p-1 shadow-[0_0_28px_rgba(56,189,248,0.12)]">
      <button type="button" onClick={() => setJudgeMode(false)} className={`rounded-xl px-4 py-2 text-sm transition ${!isJudgeMode ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}>
        普通模式
      </button>
      <button type="button" onClick={() => { setJudgeMode(true); playDemo(); }} className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${isJudgeMode ? 'bg-gradient-to-r from-sky-500 to-violet-500 text-white shadow-[0_0_22px_rgba(56,189,248,0.32)]' : 'text-sky-100 hover:bg-sky-400/10'}`}>
        评委模式 ⭐
      </button>
    </div>
  );
}
