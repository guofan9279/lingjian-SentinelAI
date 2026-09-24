'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getMockAuditTaskById, type AuditTask } from '@/lib/mockAuditData';

export type JudgeStepStatus = 'waiting' | 'running' | 'done';

export type JudgeDemoStep = {
  id: string;
  title: string;
  agent: string;
  output: string;
  evidence: string;
  weight: number;
};

type JudgeModeContextValue = {
  isJudgeMode: boolean;
  demoTask: AuditTask;
  demoSteps: JudgeDemoStep[];
  activeStepIndex: number;
  isPlaying: boolean;
  demoComplete: boolean;
  setJudgeMode: (enabled: boolean) => void;
  playDemo: () => void;
  resetDemo: () => void;
  getStepStatus: (index: number) => JudgeStepStatus;
};

const JUDGE_MODE_STORAGE_KEY = 'sentinelai-judge-mode';
export const JUDGE_DEMO_TOKEN = 'judge-demo-token';

const fallbackTask = getMockAuditTaskById(1);

const demoSteps: JudgeDemoStep[] = [
  { id: 'intake', title: '内容接入', agent: '内容输入层', output: '自动加载高价值案例：AI换脸短视频', evidence: '视频来源链路、标题、关键帧进入统一任务上下文', weight: 8 },
  { id: 'authenticity', title: '真实性分析Agent', agent: '真实性分析Agent', output: '发现 Metadata 缺失可信设备信息，来源链路不完整', evidence: 'Metadata异常 / 来源可信度分析', weight: 22 },
  { id: 'aigc', title: 'AIGC识别Agent', agent: 'AIGC识别Agent', output: '检测到人脸边缘融合异常、口型错位和 Deepfake 高风险', evidence: '视觉异常证据 / Deepfake检测结果', weight: 29 },
  { id: 'semantic', title: '语义分析Agent', agent: '文本语义Agent', output: 'OCR 与字幕表达暗示真实人物出镜，缺少合成声明', evidence: 'OCR识别风险词 / 误导语义', weight: 11 },
  { id: 'reasoning', title: '风险推理Agent', agent: '风险推理Agent', output: '多源证据共同指向高风险，综合风险分进入人工复审阈值', evidence: '风险归因 / 多Agent证据聚合', weight: 15 },
  { id: 'decision', title: '治理决策Agent', agent: '治理决策Agent', output: '建议人工复审并保留证据链，必要时执行风险拦截', evidence: '治理策略匹配 / 审计留痕', weight: 11 },
  { id: 'report', title: '生成证据报告', agent: '证据报告层', output: '输出可解释、可追溯、可导出的审核报告', evidence: '证据 → 推理 → 决策闭环', weight: 4 },
];

const JudgeModeContext = createContext<JudgeModeContextValue | null>(null);

export function JudgeModeProvider({ children }: { children: React.ReactNode }) {
  const [isJudgeMode, setIsJudgeMode] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [demoComplete, setDemoComplete] = useState(false);
  const demoTask = fallbackTask ?? (() => { throw new Error('Missing judge demo task'); })();

  useEffect(() => {
    queueMicrotask(() => {
      setIsJudgeMode(window.localStorage.getItem(JUDGE_MODE_STORAGE_KEY) === '1');
    });
  }, []);

  useEffect(() => {
    window.localStorage.setItem(JUDGE_MODE_STORAGE_KEY, isJudgeMode ? '1' : '0');
    if (isJudgeMode) {
      setActiveStepIndex(0);
      setDemoComplete(false);
    }
  }, [isJudgeMode]);

  useEffect(() => {
    if (!isPlaying) return;
    if (activeStepIndex >= demoSteps.length - 1) {
      const doneTimer = window.setTimeout(() => {
        setIsPlaying(false);
        setDemoComplete(true);
      }, 900);
      return () => window.clearTimeout(doneTimer);
    }
    const timer = window.setTimeout(() => {
      setActiveStepIndex((index) => Math.min(index + 1, demoSteps.length - 1));
    }, 850);
    return () => window.clearTimeout(timer);
  }, [activeStepIndex, isPlaying]);

  const value = useMemo<JudgeModeContextValue>(() => ({
    isJudgeMode,
    demoTask,
    demoSteps,
    activeStepIndex,
    isPlaying,
    demoComplete,
    setJudgeMode: setIsJudgeMode,
    playDemo: () => {
      setActiveStepIndex(0);
      setDemoComplete(false);
      setIsPlaying(true);
    },
    resetDemo: () => {
      setActiveStepIndex(0);
      setDemoComplete(false);
      setIsPlaying(false);
    },
    getStepStatus: (index: number) => {
      if (demoComplete || index < activeStepIndex) return 'done';
      if (index === activeStepIndex) return isPlaying ? 'running' : 'done';
      return 'waiting';
    },
  }), [activeStepIndex, demoComplete, demoTask, isJudgeMode, isPlaying]);

  return <JudgeModeContext.Provider value={value}>{children}</JudgeModeContext.Provider>;
}

export function useJudgeMode() {
  const context = useContext(JudgeModeContext);
  if (!context) throw new Error('useJudgeMode must be used within JudgeModeProvider');
  return context;
}
