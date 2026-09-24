'use client';

import Link from 'next/link';
import type { FormEventHandler } from 'react';
import { useMemo, useState } from 'react';
import {
  PageTitleBlock,
  RecommendationBadge,
  RiskBadge,
  SectionHeading,
} from '@/components/visual-components';
import { useAuth } from '@/components/auth-provider';
import { api, isAuthExpiredError } from '@/lib/api';
import {
  type AuditRuntimeAgent,
  type AuditTask,
  type ContentType,
  type LinkPreview,
  buildRuntimeAgentFlow,
  detectSourcePlatform,
  isValidSourceUrl,
  matchMockTaskScenario,
  parseMockLinkContent,
  recommendationLabel,
  riskLevelLabel,
} from '@/lib/mockAuditData';
import { cardClass, inputClass } from '@/lib/ui';

type AnalysisSummary = {
  authenticityScore: number;
  aigcProbability: number;
  riskScore: number;
  riskLevel: string;
  recommendation: string;
  taskId: number | null;
  demoMode: boolean;
};

type IntakeTab = 'media' | 'document_text' | 'url';

const intakeTabs: Array<{ id: IntakeTab; title: string; hint: string }> = [
  { id: 'media', title: '媒体素材', hint: '' },
  { id: 'document_text', title: '文档与文本', hint: '' },
  { id: 'url', title: '链接分析', hint: '' },
];

const mediaFormats = 'JPG / PNG / WEBP / MP4 / MOV / AVI';
const documentFormats = 'PDF / Word / TXT / Markdown';

const analysisDimensions = [
  'Metadata真实性信号',
  '视觉AIGC痕迹',
  'OCR文字风险',
  '语义风险',
  '综合治理建议',
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function AuditPage() {
  const { token } = useAuth();
  const [intakeTab, setIntakeTab] = useState<IntakeTab>('media');
  const [title, setTitle] = useState('');
  const [textContent, setTextContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [linkPreview, setLinkPreview] = useState<LinkPreview | null>(null);
  const [banner, setBanner] = useState<{ tone: 'warning' | 'success'; message: string } | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [agentFlow, setAgentFlow] = useState<AuditRuntimeAgent[]>(createInitialAgentFlow());
  const [analysisStarted, setAnalysisStarted] = useState(false);
  const [analysisFinished, setAnalysisFinished] = useState(false);
  const [summary, setSummary] = useState<AnalysisSummary | null>(null);
  const [previewTask, setPreviewTask] = useState<AuditTask | null>(null);
  const currentContentType: ContentType =
    intakeTab === 'media'
      ? inferMediaContentType(file)
      : intakeTab === 'document_text'
        ? inferDocumentTextContentType(file, textContent)
        : 'link';

  async function runAgentFlow(definitions: AuditRuntimeAgent[]) {
    setAnalysisStarted(true);
    setAnalysisFinished(false);
    setAgentFlow(
      definitions.map((agent) => ({
        ...agent,
        status: 'pending',
        progress: 0,
      })),
    );

    await sleep(300);

    for (const agent of definitions) {
      setAgentFlow((current) =>
        current.map((item) =>
          item.id === agent.id
            ? {
                ...item,
                status: 'running',
                summary: '正在分析中...',
                output: '正在汇聚跨模态证据链',
              }
            : item,
        ),
      );

      await sleep(500);

      for (let step = 1; step <= 10; step += 1) {
        await sleep(Math.max(Math.floor(agent.durationMs / 10), 60));
        setAgentFlow((current) =>
          current.map((item) =>
            item.id === agent.id
              ? {
                  ...item,
                  progress: step * 10,
                }
              : item,
          ),
        );
      }

      await sleep(300);

      setAgentFlow((current) =>
        current.map((item) =>
          item.id === agent.id
            ? {
                ...item,
                status: 'completed',
                progress: 100,
                summary: agent.summary,
                output: agent.output,
              }
            : item,
        ),
      );

      await sleep(200);
    }

    await sleep(500);
    setAnalysisFinished(true);
  }

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    if (!token) {
      setError('请先登录后再启动内容鉴别。');
      return;
    }
    if (intakeTab !== 'url' && !title.trim()) {
      setError('请输入鉴别任务标题。');
      return;
    }
    if (intakeTab === 'document_text' && !textContent.trim() && !file) {
      setError('请输入待鉴别文本内容，或上传文档。');
      return;
    }
    if (intakeTab === 'media' && !file) {
      setError('请上传图片或视频内容。');
      return;
    }
    if (intakeTab === 'url') {
      if (!urlInput.trim()) {
        setError('请输入待解析的内容链接。');
        return;
      }
    }

    setSubmitting(true);
    setError('');
    setBanner(null);
    setSummary(null);

    const parsedLink = intakeTab === 'url' ? parseMockLinkContent(urlInput.trim(), title.trim()) : null;
    const mockTask =
      parsedLink?.task ??
      matchMockTaskScenario({
        mode: currentContentType,
        title: title.trim(),
        text: textContent.trim(),
        fileName: file?.name,
        sourceUrl: urlInput.trim(),
      });
    const previewTitle = parsedLink?.preview.title ?? title.trim();
    const normalizedTask: AuditTask =
      intakeTab === 'url'
        ? {
            ...mockTask,
            title: previewTitle || mockTask.title,
            sourceType: 'url',
            contentType: 'link',
            sourceUrl: urlInput.trim(),
            sourcePlatform: parsedLink?.preview.sourcePlatform ?? detectSourcePlatform(urlInput.trim()),
            linkPreview: parsedLink?.preview ?? mockTask.linkPreview,
            pageTitle: parsedLink?.preview.title ?? mockTask.pageTitle,
            pageAuthor: parsedLink?.preview.author ?? mockTask.pageAuthor,
            publishedAt: parsedLink?.preview.publishedAt ?? mockTask.publishedAt,
            extractedText: parsedLink?.preview.summary ?? mockTask.extractedText,
            extractedImages:
              parsedLink?.preview.hasImages ? Math.max(mockTask.extractedImages ?? 0, 1) : mockTask.extractedImages,
            extractedVideo: parsedLink?.preview.hasVideo ?? mockTask.extractedVideo,
          }
        : {
            ...mockTask,
            title: title.trim(),
            sourceType: intakeTab === 'media' ? 'media' : 'document_text',
            contentType: currentContentType,
            extractedText:
              intakeTab === 'document_text'
                ? textContent.trim() || mockTask.extractedText || mockTask.conclusion
                : mockTask.extractedText,
          };
    if (parsedLink) {
      setLinkPreview(parsedLink.preview);
    }
    setPreviewTask(normalizedTask);
    const definitions = buildRuntimeAgentFlow(normalizedTask);
    const fallbackSummary = buildAnalysisSummary(normalizedTask, normalizedTask.id, true);

    try {
      if (intakeTab === 'url') {
        await runAgentFlow(definitions);
        setBanner({
          tone: 'warning',
          message: '链接解析服务暂时不可用，已切换为演示解析结果。',
        });
        setSummary(fallbackSummary);
        return;
      }

      const taskPromise = (async () => {
        const upload = await api.upload(
          token,
          intakeTab === 'media' || intakeTab === 'document_text' ? file : null,
          intakeTab === 'document_text' ? textContent.trim() || undefined : undefined,
        );
        return api.createTask(token, { upload_id: upload.id, title: title.trim() });
      })();

      await runAgentFlow(definitions);

      try {
        const task = await taskPromise;
        setBanner({
          tone: 'success',
          message: `内容鉴别已完成，任务 #${task.id} 已生成，可继续查看完整证据报告。`,
        });
        setSummary(buildAnalysisSummary(normalizedTask, task.id, false));
      } catch (err) {
        setBanner({
          tone: 'warning',
          message: isAuthExpiredError(err)
            ? '登录已过期，请重新登录，当前展示演示结果。'
            : '分析服务暂时不可用，已切换为演示结果。',
        });
        setSummary(fallbackSummary);
      }

      setTitle('');
      if (intakeTab === 'document_text') {
        setTextContent('');
      }
      setFile(null);
      const input = document.getElementById('asset-file') as HTMLInputElement | null;
      if (input) {
        input.value = '';
      }
    } finally {
      setSubmitting(false);
    }
  };

  const activeAgent = useMemo(() => agentFlow.find((agent) => agent.status === 'running') ?? null, [agentFlow]);
  const activeStage = useMemo(
    () => resolveStageMeta(activeAgent?.name, analysisStarted, analysisFinished, previewTask),
    [activeAgent?.name, analysisFinished, analysisStarted, previewTask],
  );
  const overallProgress = useMemo(() => {
    if (analysisFinished) {
      return 100;
    }
    if (!analysisStarted) {
      return 0;
    }
    return Math.round(agentFlow.reduce((sum, agent) => sum + agent.progress, 0) / Math.max(agentFlow.length, 1));
  }, [agentFlow, analysisFinished, analysisStarted]);
  const liveFindings = useMemo(
    () => getLiveFindings(agentFlow, analysisStarted, analysisFinished, previewTask),
    [agentFlow, analysisFinished, analysisStarted, previewTask],
  );
  const preliminarySummary = useMemo(() => {
    if (!previewTask || !analysisStarted) {
      return null;
    }
    return buildAnalysisSummary(previewTask, null, summary?.demoMode ?? false);
  }, [analysisStarted, previewTask, summary?.demoMode]);
  const idleMessage = useMemo(() => {
    if (intakeTab === 'media') {
      return '上传图片或视频后，将在此展示鉴别进度、实时发现与初步判断。';
    }
    if (intakeTab === 'document_text') {
      return '输入文本或上传文档后，将在此展示文本/文档风险分析进度。';
    }
    return '粘贴链接并解析后，将在此展示页面内容解析与风险分析进度。';
  }, [intakeTab]);

  return (
    <div className="space-y-6">
      <section className={`${cardClass} space-y-6`}>
        <PageTitleBlock
          eyebrow="内容鉴别工作台"
          title="内容鉴别工作台"
          description="接入内容并启动鉴别。"
        />

        <form className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]" onSubmit={handleSubmit}>
          <section className="space-y-5">
            <div className="grid gap-3 md:grid-cols-3">
              {intakeTabs.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setIntakeTab(item.id);
                    setFile(null);
                    setLinkPreview(null);
                    setError('');
                    setBanner(null);
                  }}
                  className={`rounded-3xl border p-4 text-left transition ${
                    intakeTab === item.id
                      ? 'border-sky-400/35 bg-sky-500/10'
                      : 'border-white/8 bg-white/4 hover:border-sky-400/25 hover:bg-white/6'
                  }`}
                >
                  <div className="text-base font-medium text-white">{item.title}</div>
                </button>
              ))}
            </div>

            <div className="rounded-[32px] border border-dashed border-sky-400/30 bg-slate-950/50 p-6">
              <div className="space-y-4">
                <div className="text-lg font-semibold text-white">内容接入</div>

                <label className="block space-y-2">
                  <span className="text-sm text-slate-300">鉴别任务标题</span>
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    className={inputClass}
                    placeholder={
                      intakeTab === 'media'
                        ? '例如：AI换脸短视频鉴别'
                        : intakeTab === 'document_text'
                          ? '例如：高风险投资文案 / 文档鉴别'
                          : '可选：如不填写，将使用解析出的页面标题'
                    }
                  />
                </label>

                {intakeTab === 'media' ? (
                  <>
                    <label className="block space-y-2">
                      <span className="text-sm text-slate-300">拖拽或选择图片、视频文件</span>
                      <input
                        id="asset-file"
                        type="file"
                        accept={getAcceptByTab(intakeTab)}
                        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                        className="w-full rounded-2xl border border-dashed border-white/20 bg-slate-950/70 px-4 py-6 text-sm text-slate-300"
                      />
                      <div className="text-xs leading-6 text-slate-500">
                        支持格式：{mediaFormats}
                        {file ? `。当前文件将按“${contentTypeLabelLite(inferMediaContentType(file))}”方式分析。` : ''}
                      </div>
                    </label>
                  </>
                ) : null}

                {intakeTab === 'document_text' ? (
                  <div className="space-y-4">
                    <label className="block space-y-2">
                      <span className="text-sm text-slate-300">文本内容</span>
                      <textarea
                        value={textContent}
                        onChange={(event) => setTextContent(event.target.value)}
                        rows={8}
                        className={inputClass}
                        placeholder="例如：稳赚不赔，老师带单，立即私聊进群。"
                      />
                    </label>

                    <label className="block space-y-2">
                      <span className="text-sm text-slate-300">上传文档</span>
                      <input
                        id="asset-file"
                        type="file"
                        accept={getAcceptByTab(intakeTab)}
                        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                        className="w-full rounded-2xl border border-dashed border-white/20 bg-slate-950/70 px-4 py-6 text-sm text-slate-300"
                      />
                      <div className="text-xs leading-6 text-slate-500">
                        支持格式：{documentFormats}
                        {file ? `。当前文件将按“${contentTypeLabelLite(inferDocumentTextContentType(file, textContent))}”方式分析。` : ''}
                      </div>
                    </label>
                  </div>
                ) : null}

                {intakeTab === 'url' ? (
                  <div className="space-y-4">
                    <label className="block space-y-2">
                      <span className="text-sm text-slate-300">内容链接</span>
                      <input
                        value={urlInput}
                        onChange={(event) => {
                          setUrlInput(event.target.value);
                          setLinkPreview(null);
                        }}
                        className={inputClass}
                        placeholder="粘贴抖音 / 小红书 / 微博 / B站 / 新闻网页 / 电商商品链接"
                      />
                    </label>
                    <div className="text-xs leading-6 text-slate-500">
                      平台：{urlInput.trim() ? detectSourcePlatform(urlInput.trim()) : '等待识别'} · 支持：抖音 / 小红书 / 微博 / B站 / 新闻 / 电商 / 网页
                    </div>

                    {linkPreview ? (
                      <article className="rounded-[24px] border border-sky-400/20 bg-sky-500/8 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-xs uppercase tracking-[0.22em] text-sky-200/80">链接解析预览</div>
                            <div className="mt-2 text-lg font-semibold text-white">{linkPreview.title}</div>
                          </div>
                          <span className="rounded-full border border-sky-400/25 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-100">
                            {linkPreview.parseStatus}
                          </span>
                        </div>
                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                          <InfoBlock title="平台来源" value={linkPreview.sourcePlatform} />
                          <InfoBlock title="内容类型" value={linkPreview.contentType} />
                          <InfoBlock title="作者 / 发布者" value={linkPreview.author} />
                          <InfoBlock title="发布时间" value={linkPreview.publishedAt} />
                          <InfoBlock
                            title="媒体组成"
                            value={`${linkPreview.hasVideo ? '含视频' : '无视频'} / ${linkPreview.hasImages ? '含图片' : '无图片'} / ${linkPreview.hasText ? '含文本' : '无文本'}`}
                          />
                          <InfoBlock title="原始域名" value={linkPreview.rawDomain} />
                        </div>
                        <div className="mt-4 rounded-2xl border border-white/8 bg-slate-950/35 px-4 py-3 text-sm leading-7 text-slate-200">
                          {linkPreview.summary}
                        </div>
                      </article>
                    ) : null}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-sky-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-sky-900"
                >
                  {submitting
                    ? intakeTab === 'url'
                      ? '链接解析与鉴别中...'
                      : '智能体分析中...'
                    : intakeTab === 'media'
                      ? '启动媒体鉴别'
                      : intakeTab === 'document_text'
                        ? '启动文本/文档鉴别'
                        : '解析并鉴别'}
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-white/8 bg-white/4 p-5">
              <SectionHeading
                eyebrow="分析维度"
                title="分析维度预告"
                description="系统会沿同一条主线输出真实性评分、AIGC概率、风险等级与治理建议。"
              />
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {analysisDimensions.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/8 bg-slate-950/35 px-4 py-3 text-sm text-slate-200">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {error ? (
              <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            ) : null}
            {banner ? (
              <div
                className={`rounded-2xl px-4 py-3 text-sm ${
                  banner.tone === 'success'
                    ? 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                    : 'border border-amber-400/40 bg-amber-500/10 text-amber-100'
                }`}
              >
                {banner.message}
              </div>
            ) : null}
          </section>

          <section className={`${cardClass} audit-runtime relative overflow-hidden !p-6`}>
            <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.16),transparent_62%)]" />
            <div className="relative space-y-5">
              <SectionHeading
                eyebrow="智能分析面板"
                title="智能分析摘要"
                description="聚合当前进度、关键发现与分析结论。"
              />

              <AuditProgressPanel
                progress={overallProgress}
                analysisStarted={analysisStarted}
                analysisFinished={analysisFinished}
                activeStageKey={activeStage.key}
                activeStageLabel={activeStage.label}
                activeAgentName={activeAgent?.name ?? '等待调度'}
                idleMessage={idleMessage}
              />

              <LiveFindingsList
                findings={liveFindings}
                analysisStarted={analysisStarted}
                analysisFinished={analysisFinished}
              />

              <JudgementSummaryCard
                summary={summary}
                previewSummary={preliminarySummary}
                analysisStarted={analysisStarted}
                analysisFinished={analysisFinished}
              />
            </div>
          </section>
        </form>
      </section>
    </div>
  );
}

function createInitialAgentFlow(): AuditRuntimeAgent[] {
  return buildRuntimeAgentFlow(matchMockTaskScenario({ mode: 'image', title: '普通校园活动照片' }));
}

function inferMediaContentType(file: File | null): ContentType {
  if (!file) {
    return 'image';
  }

  const fileName = file.name.toLowerCase();
  const mimeType = file.type.toLowerCase();
  if (mimeType.startsWith('video/') || /\.(mp4|mov|avi|mkv|webm|m4v)$/i.test(fileName)) {
    return 'video';
  }
  return 'image';
}

function inferDocumentTextContentType(file: File | null, textContent: string): ContentType {
  if (file) {
    return 'document';
  }
  if (textContent.trim()) {
    return 'text';
  }
  return 'text';
}

function contentTypeLabelLite(type: ContentType) {
  if (type === 'video') return '视频';
  if (type === 'document') return '文档';
  if (type === 'text') return '文本';
  if (type === 'link') return '链接';
  return '图片';
}

function getAcceptByTab(tab: IntakeTab) {
  if (tab === 'media') {
    return 'image/*,video/*,.jpg,.jpeg,.png,.webp,.mp4,.mov,.avi';
  }
  if (tab === 'document_text') {
    return '.pdf,.doc,.docx,.txt,.md,.markdown,.rtf,.wps,.odt';
  }
  return 'text/plain';
}

function buildAnalysisSummary(task: AuditTask, taskId: number | null, demoMode: boolean): AnalysisSummary {
  return {
    authenticityScore: task.authenticityScore,
    aigcProbability: Math.round(task.aigcProbability * 100),
    riskScore: task.riskScore,
    riskLevel: riskLevelLabel(task.riskLevel),
    recommendation: recommendationLabel(task.recommendation),
    taskId,
    demoMode,
  };
}

function AuditProgressPanel({
  progress,
  analysisStarted,
  analysisFinished,
  activeStageKey,
  activeStageLabel,
  activeAgentName,
  idleMessage,
}: {
  progress: number;
  analysisStarted: boolean;
  analysisFinished: boolean;
  activeStageKey: AuditStageKey;
  activeStageLabel: string;
  activeAgentName: string;
  idleMessage: string;
}) {
  const steps: Array<{ key: AuditStageKey; label: string }> = [
    { key: 'ingest', label: '内容接入' },
    { key: 'auth', label: '真实性分析' },
    { key: 'aigc', label: 'AIGC识别' },
    { key: 'decision', label: '治理决策' },
  ];
  const activeIndex = steps.findIndex((step) => step.key === activeStageKey);

  return (
    <article className="rounded-[28px] border border-white/8 bg-white/4 p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="text-xs uppercase tracking-[0.22em] text-slate-500">鉴别进度</div>
        <div className="text-lg font-semibold text-white">{progress}%</div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <InfoBlock
          title="当前阶段"
          value={!analysisStarted ? '等待启动' : analysisFinished ? '结果汇总完成' : activeStageLabel}
        />
        <InfoBlock
          title="当前调用"
          value={!analysisStarted ? '等待调度' : analysisFinished ? '治理决策Agent' : activeAgentName}
        />
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-950">
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${analysisStarted && !analysisFinished ? 'agent-progress-active' : 'bg-[linear-gradient(90deg,#38bdf8_0%,#8b5cf6_100%)]'}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      {!analysisStarted ? (
        <div className="mt-4 text-sm leading-7 text-slate-300">
          {idleMessage}
        </div>
      ) : null}
      <div className="mt-4 grid grid-cols-4 gap-2 text-xs">
        {steps.map((step, index) => {
          const completed = analysisFinished || (analysisStarted && index < activeIndex);
          const active = analysisStarted && !analysisFinished && index === activeIndex;
          return (
            <div key={step.key} className="space-y-2">
              <div
                className={`h-2 rounded-full ${
                  completed
                    ? 'bg-sky-400'
                    : active
                      ? 'bg-violet-400'
                      : 'bg-white/10'
                }`}
              />
              <div className={completed || active ? 'text-slate-100' : 'text-slate-500'}>{step.label}</div>
            </div>
          );
        })}
      </div>
    </article>
  );
}

function LiveFindingsList({
  findings,
  analysisStarted,
  analysisFinished,
}: {
  findings: Array<{ source: FindingSource; message: string }>;
  analysisStarted: boolean;
  analysisFinished: boolean;
}) {
  return (
    <article className="rounded-[28px] border border-white/8 bg-white/4 p-5">
      <div className="text-xs uppercase tracking-[0.22em] text-slate-500">实时发现</div>
      <div className="mt-4 space-y-3">
        {!analysisStarted ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/25 px-4 py-3 text-sm text-slate-400">
            分析启动后展示关键发现。
          </div>
        ) : findings.length > 0 ? (
          findings.map((finding) => (
            <div key={`${finding.source}-${finding.message}`} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-slate-950/35 px-4 py-3">
              <FindingLabel source={finding.source} />
              <div className="min-w-0 flex-1 text-sm text-slate-200">{finding.message}</div>
            </div>
          ))
        ) : (
          <div className="text-sm leading-7 text-slate-300">
            {analysisFinished ? '已完成结果汇总，等待进入完整证据报告。' : '正在生成第一批关键发现...'}
          </div>
        )}
      </div>
    </article>
  );
}

function JudgementSummaryCard({
  summary,
  previewSummary,
  analysisStarted,
  analysisFinished,
}: {
  summary: AnalysisSummary | null;
  previewSummary: AnalysisSummary | null;
  analysisStarted: boolean;
  analysisFinished: boolean;
}) {
  const activeSummary = summary ?? previewSummary;

  return (
    <article className="rounded-[28px] border border-white/8 bg-white/4 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-slate-500">分析结论</div>
          <div className="mt-3 text-lg font-semibold text-white">
            {analysisFinished ? '分析完成' : analysisStarted ? '结果持续更新中' : '等待分析启动'}
          </div>
        </div>
        {analysisFinished && summary ? (
          <div className="flex flex-wrap gap-2">
            <RiskBadge level={summary.riskLevel as '低风险' | '中风险' | '高风险' | '严重风险'} />
            <RecommendationBadge recommendation={summary.recommendation} />
          </div>
        ) : null}
      </div>

      {!analysisStarted || !activeSummary ? (
        <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-slate-950/25 px-4 py-3 text-sm text-slate-400">
          分析完成后展示评分、风险等级与治理建议。
        </div>
      ) : (
        <>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <InfoBlock title="真实性评分" value={analysisFinished ? `${activeSummary.authenticityScore} / 100` : `${activeSummary.authenticityScore}`} />
            <InfoBlock title="AIGC概率" value={analysisFinished ? `${activeSummary.aigcProbability}%` : `${activeSummary.aigcProbability}%`} />
            <InfoBlock title="综合风险分" value={`${activeSummary.riskScore}`} />
            <InfoBlock
              title={analysisFinished ? '治理建议' : '当前建议'}
              value={analysisFinished ? activeSummary.recommendation : '等待最终决策'}
              highlight={analysisFinished}
            />
          </div>
          {analysisFinished ? (
            <div className="mt-3">
              <InfoBlock title="风险等级" value={activeSummary.riskLevel} highlight />
            </div>
          ) : null}

          <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="text-sm text-slate-400">
              {analysisFinished
                ? activeSummary.demoMode
                  ? '分析服务暂时不可用，已切换为演示结果。'
                  : '结果已生成，可进入完整证据报告查看详细证据链。'
                : '当前为初步判断，最终结果将在治理决策阶段完成后生成。'}
            </div>
            {analysisFinished ? (
              <Link
                href={summary?.taskId ? `/tasks/${summary.taskId}` : '/tasks'}
                className="inline-flex rounded-full bg-sky-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-sky-400"
              >
                查看完整证据报告
              </Link>
            ) : null}
          </div>
        </>
      )}
    </article>
  );
}

function InfoBlock({ title, value, highlight = false }: { title: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-slate-950/35 px-4 py-3">
      <div className="text-xs uppercase tracking-[0.22em] text-slate-500">{title}</div>
      <div className={`mt-2 text-sm ${highlight ? 'font-semibold text-fuchsia-200' : 'text-slate-100'}`}>{value}</div>
    </div>
  );
}

type AuditStageKey = 'idle' | 'ingest' | 'auth' | 'aigc' | 'decision' | 'complete';
type FindingSource = 'Metadata' | 'Vision' | 'OCR' | 'Risk' | 'Link' | 'Text';

function FindingLabel({ source }: { source: FindingSource }) {
  const className =
    source === 'Link'
      ? 'border-sky-400/30 bg-sky-500/10 text-sky-100'
      : source === 'Metadata'
      ? 'border-cyan-400/30 bg-cyan-500/10 text-cyan-100'
      : source === 'Vision'
        ? 'border-indigo-400/30 bg-indigo-500/10 text-indigo-100'
        : source === 'OCR'
          ? 'border-violet-400/30 bg-violet-500/10 text-violet-100'
          : source === 'Text'
            ? 'border-amber-400/30 bg-amber-500/10 text-amber-100'
          : 'border-orange-400/30 bg-orange-500/10 text-orange-100';

  return <span className={`inline-flex shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${className}`}>{source}</span>;
}

function resolveStageMeta(
  agentName: AuditRuntimeAgent['name'] | undefined,
  analysisStarted: boolean,
  analysisFinished: boolean,
  previewTask?: AuditTask | null,
): { key: AuditStageKey; label: string } {
  if (!analysisStarted) {
    return { key: 'idle', label: '等待启动' };
  }
  if (analysisFinished) {
    return { key: 'complete', label: '结果汇总完成' };
  }
  if (previewTask?.sourceType === 'url' && !agentName) {
    return { key: 'ingest', label: '解析链接来源与页面结构' };
  }
  if (agentName === '真实性分析Agent') {
    return {
      key: 'auth',
      label: previewTask?.sourceType === 'url' ? '核验来源、作者与发布时间' : '真实性分析',
    };
  }
  if (agentName === 'AIGC识别Agent' || agentName === '文本语义Agent') {
    return {
      key: 'aigc',
      label: previewTask?.sourceType === 'url' ? '识别页面中的图像、视频与文本风险' : 'AIGC识别',
    };
  }
  if (agentName === '风险推理Agent' || agentName === '治理决策Agent') {
    return { key: 'decision', label: '生成风险等级与治理建议' };
  }
  return {
    key: 'ingest',
    label: previewTask?.sourceType === 'url' ? '解析链接来源与页面结构' : '内容接入',
  };
}

function getLiveFindings(
  agentFlow: AuditRuntimeAgent[],
  analysisStarted: boolean,
  analysisFinished: boolean,
  previewTask?: AuditTask | null,
) {
  if (!analysisStarted) {
    return [];
  }

  const findings: Array<{ source: FindingSource; message: string }> = [];
  if (previewTask?.sourceType === 'url' && previewTask.linkPreview) {
    findings.push({
      source: 'Link',
      message: `识别来源为${previewTask.linkPreview.sourcePlatform}${previewTask.linkPreview.contentType}`,
    });
  }

  const prioritizedAgents = analysisFinished
    ? agentFlow.filter((agent) => agent.status === 'completed')
    : agentFlow.filter((agent) => agent.status === 'completed' || agent.status === 'running');

  const derivedFindings = prioritizedAgents
    .map((agent) => {
      const finding = agent.evidence[0] ?? agent.summary;
      if (!finding) {
        return null;
      }

      return {
        source: mapFindingSource(agent.name, previewTask),
        message: shortenFinding(finding),
      };
    })
    .filter((item): item is { source: FindingSource; message: string } => Boolean(item));

  return [...findings, ...derivedFindings].slice(0, 3);
}

function mapFindingSource(agentName: AuditRuntimeAgent['name'], previewTask?: AuditTask | null): FindingSource {
  if (agentName === '真实性分析Agent') return 'Metadata';
  if (agentName === 'AIGC识别Agent') return 'Vision';
  if (agentName === '文本语义Agent') return previewTask?.sourceType === 'url' ? 'Text' : 'OCR';
  return 'Risk';
}

function shortenFinding(message: string) {
  const normalized = message.replace(/[。；]/g, '').trim();
  if (normalized.length <= 28) {
    return normalized;
  }
  return `${normalized.slice(0, 28)}...`;
}
