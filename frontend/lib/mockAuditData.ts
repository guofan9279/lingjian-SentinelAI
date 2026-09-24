'use client';

import type { AuditLog, Task as ApiTask, TaskDetail as ApiTaskDetail } from '@/lib/types';

export type ContentType = 'image' | 'video' | 'document' | 'text' | 'link';
export type AuditTaskStatus = 'queued' | 'processing' | 'completed' | 'reviewed' | 'escalated';
export type RiskLevel = 'low' | 'medium' | 'high' | 'severe';
export type Recommendation = 'release' | 'throttle' | 'review' | 'block';
export type AgentExecutionStatus = 'pending' | 'running' | 'completed' | 'failed';
export type SourceType = 'media' | 'document_text' | 'url';
export type SourcePlatform = '抖音' | '小红书' | '微博' | 'B站' | '电商' | '普通网页';
export type AgentName =
  | '真实性分析Agent'
  | 'AIGC识别Agent'
  | '文本语义Agent'
  | '风险推理Agent'
  | '治理决策Agent';

export type AgentResult = {
  agentName: AgentName;
  status: AgentExecutionStatus;
  confidence: number;
  latencyMs: number;
  riskContribution: number;
  summary: string;
  evidence: string[];
  explanation: string;
};

export type EvidenceItem = {
  sourceAgent: AgentName;
  evidenceType: string;
  content: string;
  riskContribution: number;
  confidence: number;
  explanation: string;
};

export type LinkPreview = {
  sourceUrl: string;
  sourcePlatform: SourcePlatform;
  title: string;
  contentType: string;
  author: string;
  publishedAt: string;
  summary: string;
  hasVideo: boolean;
  hasImages: boolean;
  hasText: boolean;
  parseStatus: string;
  rawDomain: string;
};

export type AuditTask = {
  id: number;
  title: string;
  contentType: ContentType;
  sourceType?: SourceType;
  sourceUrl?: string;
  sourcePlatform?: SourcePlatform;
  pageTitle?: string;
  pageAuthor?: string;
  publishedAt?: string;
  extractedText?: string;
  extractedImages?: number;
  extractedVideo?: boolean;
  linkPreview?: LinkPreview;
  createdAt: string;
  status: AuditTaskStatus;
  authenticityScore: number;
  aigcProbability: number;
  deepfakeProbability: number;
  semanticRisk: number;
  riskScore: number;
  riskLevel: RiskLevel;
  recommendation: Recommendation;
  tags: string[];
  agentResults: AgentResult[];
  evidenceChain: EvidenceItem[];
  conclusion: string;
  reviewerAction: Recommendation | null;
  auditLogs: Array<{
    actor: string;
    action: string;
    detail: string;
    createdAt: string;
  }>;
};

export type AgentBlueprint = {
  name: AgentName;
  icon: string;
  color: string;
  description: string;
  responsibilities: string[];
  input: string[];
  output: string[];
};

export type AgentCapabilityGroup = {
  title: '职责' | '输入' | '输出';
  items: string[];
};

export type AgentOutputExample = {
  key: string;
  value: string;
};

export type AuditRuntimeAgent = {
  id: string;
  name: AgentName;
  status: AgentExecutionStatus;
  progress: number;
  durationMs: number;
  confidence: number;
  contribution: number;
  input: string;
  output: string;
  summary: string;
  evidence: string[];
  explanation: string;
};

export type AgentCenterCard = AgentBlueprint & {
  id: string;
  tags: string[];
  capabilityMatrix: AgentCapabilityGroup[];
  evidenceSummary: string[];
  collaboration: {
    upstream: string[];
    downstream: string[];
  };
  outputExample: AgentOutputExample[];
  runtime: {
    status: 'Healthy' | 'Running' | 'Warning';
    averageDuration: string;
    recentCalls: string;
    averageConfidence: number;
    totalContribution: number;
    todayCalls: number;
    averageContribution: number;
  };
};

export type DashboardMetric = {
  title: string;
  value: string;
  hint: string;
  delta?: string;
};

export const mockHomeHero = {
  title: '内容真实性与AIGC风险治理智能体',
  subtitle: '通过多模态分析与多Agent协同推理，识别AI生成内容、评估真实性风险，并生成可解释的治理决策。',
};

export const mockHomeLoopSteps = [
  {
    title: '真实性分析',
    detail: '结合 Metadata、来源痕迹和基础结构，判断内容是否真实可信。',
  },
  {
    title: 'AIGC识别',
    detail: '识别图像生成、视频换脸和生成式修饰痕迹。',
  },
  {
    title: '风险推理',
    detail: '综合语义风险、传播风险和场景风险输出等级。',
  },
  {
    title: '治理决策',
    detail: '生成放行、限流观察、人工复审或风险拦截建议。',
  },
] as const;

export const agentBlueprints: AgentBlueprint[] = [
  {
    name: '真实性分析Agent',
    icon: 'TR',
    color: 'from-emerald-400/28 to-cyan-400/10',
    description: '负责从文件底层结构、Metadata 与来源痕迹判断内容是否真实可信，是整条治理链路的真实性入口。',
    responsibilities: ['EXIF解析', 'Metadata异常检测', '拍摄设备与来源信号分析'],
    input: ['图片/视频文件', '文件头', '编码参数'],
    output: ['真实性评分', '来源可信度', '异常Metadata'],
  },
  {
    name: 'AIGC识别Agent',
    icon: 'AI',
    color: 'from-sky-400/28 to-violet-400/10',
    description: '负责识别 AI 图像、AI 视频和深度伪造痕迹，通过关键帧与视觉结构分析判断生成或修改可能性。',
    responsibilities: ['AI图像识别', 'Deepfake风险分析', '视频帧异常检测'],
    input: ['图片', '关键帧', '视觉特征'],
    output: ['AIGC概率', 'Deepfake概率', '视觉异常证据'],
  },
  {
    name: '文本语义Agent',
    icon: 'TX',
    color: 'from-amber-300/28 to-rose-400/10',
    description: '负责理解 OCR 文本、标题与正文语义，识别虚假宣传、诈骗营销与误导性表达。',
    responsibilities: ['OCR文本分析', '虚假宣传识别', '诈骗营销识别'],
    input: ['OCR结果', '标题', '正文'],
    output: ['风险词', '语义风险', '违规倾向'],
  },
  {
    name: '风险推理Agent',
    icon: 'RK',
    color: 'from-fuchsia-400/28 to-rose-500/10',
    description: '负责汇总前序 Agent 的分析结果，统一计算综合风险分，并将风险归因映射为平台可执行标签。',
    responsibilities: ['汇总多Agent结果', '计算综合风险分', '生成风险标签'],
    input: ['前序Agent输出'],
    output: ['风险等级', '风险分', '解释'],
  },
  {
    name: '治理决策Agent',
    icon: 'GD',
    color: 'from-sky-300/28 to-indigo-400/10',
    description: '负责匹配平台治理规则，输出最终治理建议与审核结论，并生成可追溯的证据报告。',
    responsibilities: ['匹配平台策略', '输出治理建议', '生成审核结论'],
    input: ['风险等级', '平台规则'],
    output: ['放行、限流、人工复审、拦截'],
  },
] as const;

const rawMockAuditTasks: AuditTask[] = [
  {
    id: 1,
    title: 'AI换脸短视频',
    contentType: 'video',
    sourceType: 'media',
    createdAt: '2026-05-29T16:32:00+08:00',
    status: 'reviewed',
    authenticityScore: 22,
    aigcProbability: 0.94,
    deepfakeProbability: 0.91,
    semanticRisk: 0.68,
    riskScore: 88,
    riskLevel: 'high',
    recommendation: 'review',
    tags: ['AI换脸', '深度伪造', '身份冒用', '来源不明'],
    agentResults: [
      {
        agentName: '真实性分析Agent',
        status: 'completed',
        confidence: 0.92,
        latencyMs: 480,
        riskContribution: 22,
        summary: '检测到来源链不完整，视频编码存在二次导出痕迹。',
        evidence: ['容器信息二次转码', '缺少可信拍摄设备信息', 'Metadata 时间链不连续'],
        explanation: '素材缺少可信设备指纹，文件结构显示存在导出与重封装行为，真实性基础较弱。',
      },
      {
        agentName: 'AIGC识别Agent',
        status: 'completed',
        confidence: 0.96,
        latencyMs: 860,
        riskContribution: 29,
        summary: '检测到面部边缘融合异常和口型错位，疑似 AI 换脸。',
        evidence: ['脸部边缘羽化异常', '口型与语音节奏偏移', '关键帧光照一致性异常'],
        explanation: '视觉链路发现典型换脸特征，Deepfake 风险显著升高。',
      },
      {
        agentName: '文本语义Agent',
        status: 'completed',
        confidence: 0.86,
        latencyMs: 620,
        riskContribution: 11,
        summary: '字幕与标题存在对人物身份的误导性暗示。',
        evidence: ['标题暗示真实名人出镜', '字幕未注明合成或演绎'],
        explanation: '语义内容会放大身份误导风险，增加传播危害。',
      },
      {
        agentName: '风险推理Agent',
        status: 'completed',
        confidence: 0.9,
        latencyMs: 340,
        riskContribution: 15,
        summary: '综合判断为高风险，建议进入人工复审队列。',
        evidence: ['真实性异常 + 深度伪造双高', '身份冒用标签命中'],
        explanation: '视觉与真实性证据同时抬高风险分，需审慎处置。',
      },
      {
        agentName: '治理决策Agent',
        status: 'completed',
        confidence: 0.93,
        latencyMs: 260,
        riskContribution: 11,
        summary: '建议转人工复审，核验授权链路后决定是否拦截。',
        evidence: ['平台策略要求核验肖像授权', '高风险内容需保留证据链'],
        explanation: '当前最优治理策略为先复审再决策，避免误杀与漏放。',
      },
    ],
    evidenceChain: [
      {
        sourceAgent: '真实性分析Agent',
        evidenceType: 'Metadata异常',
        content: '视频 Metadata 中缺少可信拍摄设备字段，时间链存在跳变。',
        riskContribution: 22,
        confidence: 0.92,
        explanation: '来源链不完整削弱内容真实性。',
      },
      {
        sourceAgent: 'AIGC识别Agent',
        evidenceType: 'Deepfake痕迹',
        content: '面部边缘融合异常，口型与语音时序存在明显偏差。',
        riskContribution: 29,
        confidence: 0.96,
        explanation: '符合 AI 换脸与深度伪造的高置信特征。',
      },
      {
        sourceAgent: '文本语义Agent',
        evidenceType: '误导语义',
        content: '标题和字幕暗示真人原始出镜，未对合成内容做说明。',
        riskContribution: 11,
        confidence: 0.86,
        explanation: '提升身份误导与传播风险。',
      },
      {
        sourceAgent: '风险推理Agent',
        evidenceType: '综合判断',
        content: '真实性评分 22，AIGC 概率 94%，综合风险分 88。',
        riskContribution: 15,
        confidence: 0.9,
        explanation: '多信号共同指向高风险内容。',
      },
      {
        sourceAgent: '治理决策Agent',
        evidenceType: '治理建议',
        content: '建议人工复审并保留当前证据链，必要时执行风险拦截。',
        riskContribution: 11,
        confidence: 0.93,
        explanation: '满足高风险内容的审慎治理策略。',
      },
    ],
    conclusion:
      '系统检测到该视频存在明显换脸痕迹，Metadata 中缺少可信拍摄设备信息，视觉分析发现面部边缘融合异常和口型错位。综合风险评分为 88 分，建议进入人工复审队列，并保留当前证据链用于后续审计。',
    reviewerAction: 'review',
    auditLogs: [
      {
        actor: 'system',
        action: '任务创建',
        detail: '视频内容进入真实性与 AIGC 鉴别链路。',
        createdAt: '2026-05-29T16:32:00+08:00',
      },
      {
        actor: 'system',
        action: '分析完成',
        detail: '系统识别到疑似 AI 换脸与深度伪造风险。',
        createdAt: '2026-05-29T16:32:03+08:00',
      },
      {
        actor: 'reviewer',
        action: '转人工复审',
        detail: '需进一步核验肖像授权与来源链路。',
        createdAt: '2026-05-29T16:35:10+08:00',
      },
    ],
  },
  {
    id: 2,
    title: 'AI商品宣传图',
    contentType: 'image',
    sourceType: 'media',
    createdAt: '2026-05-29T16:34:00+08:00',
    status: 'completed',
    authenticityScore: 41,
    aigcProbability: 0.87,
    deepfakeProbability: 0.36,
    semanticRisk: 0.66,
    riskScore: 68,
    riskLevel: 'medium',
    recommendation: 'throttle',
    tags: ['AI商品图', 'Metadata异常', '虚假宣传'],
    agentResults: [
      {
        agentName: '真实性分析Agent',
        status: 'completed',
        confidence: 0.89,
        latencyMs: 430,
        riskContribution: 16,
        summary: '图片缺少原始拍摄信息，编辑软件指纹异常。',
        evidence: ['EXIF 缺失', '软件指纹指向生成式图像工具'],
        explanation: '来源链不足以支撑真实拍摄结论。',
      },
      {
        agentName: 'AIGC识别Agent',
        status: 'completed',
        confidence: 0.93,
        latencyMs: 740,
        riskContribution: 24,
        summary: '商品边缘、阴影和材质纹理存在生成式修饰痕迹。',
        evidence: ['阴影方向不一致', '材质纹理重复', '边缘轮廓异常平滑'],
        explanation: '符合 AI 商品图的典型视觉特征。',
      },
      {
        agentName: '文本语义Agent',
        status: 'completed',
        confidence: 0.9,
        latencyMs: 560,
        riskContribution: 18,
        summary: '文案命中夸大宣传与绝对化表达。',
        evidence: ['“逆龄焕白”', '“7 天见效”'],
        explanation: '文本提升误导性营销风险。',
      },
      {
        agentName: '风险推理Agent',
        status: 'completed',
        confidence: 0.88,
        latencyMs: 320,
        riskContribution: 14,
        summary: '综合判断为中风险，需限流观察。',
        evidence: ['AIGC 修饰明显', '营销表达偏激进'],
        explanation: '当前风险可通过限流和补充说明控制。',
      },
      {
        agentName: '治理决策Agent',
        status: 'completed',
        confidence: 0.91,
        latencyMs: 240,
        riskContribution: 10,
        summary: '建议限流观察，并要求补充真实性说明。',
        evidence: ['电商营销场景适用限流策略'],
        explanation: '在保留转化空间的同时控制误导风险。',
      },
    ],
    evidenceChain: [
      {
        sourceAgent: '真实性分析Agent',
        evidenceType: '来源异常',
        content: '图片 EXIF 缺失，软件指纹疑似生成式图像工具。',
        riskContribution: 16,
        confidence: 0.89,
        explanation: '降低真实性可信度。',
      },
      {
        sourceAgent: 'AIGC识别Agent',
        evidenceType: '视觉异常',
        content: '商品阴影方向不一致，局部材质纹理重复。',
        riskContribution: 24,
        confidence: 0.93,
        explanation: '符合 AI 商品宣传图的生成特征。',
      },
      {
        sourceAgent: '文本语义Agent',
        evidenceType: '夸大宣传',
        content: '命中“逆龄焕白”“7天见效”等绝对化表述。',
        riskContribution: 18,
        confidence: 0.9,
        explanation: '文案存在误导性营销倾向。',
      },
      {
        sourceAgent: '风险推理Agent',
        evidenceType: '综合判断',
        content: '真实性评分 41，AIGC 概率 87%，综合风险分 68。',
        riskContribution: 14,
        confidence: 0.88,
        explanation: '建议采取限流观察策略。',
      },
      {
        sourceAgent: '治理决策Agent',
        evidenceType: '治理建议',
        content: '建议限流观察并补充真实性说明。',
        riskContribution: 10,
        confidence: 0.91,
        explanation: '降低误导传播范围。',
      },
    ],
    conclusion:
      '系统检测到该商品宣传图存在明显 AIGC 生成与修饰痕迹，Metadata 缺少可信来源信息，文案同时命中夸大宣传表达。综合风险评分为 68 分，建议限流观察并要求补充真实性说明。',
    reviewerAction: null,
    auditLogs: [
      {
        actor: 'system',
        action: '任务创建',
        detail: '图片内容进入真实性与 AIGC 鉴别链路。',
        createdAt: '2026-05-29T16:34:00+08:00',
      },
      {
        actor: 'system',
        action: '分析完成',
        detail: '识别到 AI 商品图和夸大宣传风险。',
        createdAt: '2026-05-29T16:34:02+08:00',
      },
    ],
  },
  {
    id: 3,
    title: '普通校园活动照片',
    contentType: 'image',
    sourceType: 'media',
    createdAt: '2026-05-29T16:28:00+08:00',
    status: 'reviewed',
    authenticityScore: 91,
    aigcProbability: 0.08,
    deepfakeProbability: 0.03,
    semanticRisk: 0.08,
    riskScore: 12,
    riskLevel: 'low',
    recommendation: 'release',
    tags: ['正常内容'],
    agentResults: [
      {
        agentName: '真实性分析Agent',
        status: 'completed',
        confidence: 0.94,
        latencyMs: 390,
        riskContribution: 4,
        summary: '拍摄设备信息完整，时间链连续，来源可信。',
        evidence: ['保留拍摄设备型号', '时间信息连续', '原始分辨率正常'],
        explanation: '真实性支撑充分，未发现异常编辑链路。',
      },
      {
        agentName: 'AIGC识别Agent',
        status: 'completed',
        confidence: 0.9,
        latencyMs: 520,
        riskContribution: 2,
        summary: '未发现明显 AIGC 生成或深度伪造痕迹。',
        evidence: ['人物边缘自然', '阴影与透视一致'],
        explanation: '视觉结构自然，AIGC 风险较低。',
      },
      {
        agentName: '文本语义Agent',
        status: 'completed',
        confidence: 0.84,
        latencyMs: 410,
        riskContribution: 2,
        summary: '标题和描述信息中性，未命中风险词。',
        evidence: ['活动主题正常', '无营销或引流表达'],
        explanation: '语义层无显著违规倾向。',
      },
      {
        agentName: '风险推理Agent',
        status: 'completed',
        confidence: 0.89,
        latencyMs: 280,
        riskContribution: 2,
        summary: '综合判断为低风险，可正常放行。',
        evidence: ['真实性高', 'AIGC 风险低', '语义风险低'],
        explanation: '各维度均未发现高风险信号。',
      },
      {
        agentName: '治理决策Agent',
        status: 'completed',
        confidence: 0.93,
        latencyMs: 210,
        riskContribution: 2,
        summary: '建议自动放行，并纳入常规抽检。',
        evidence: ['低风险内容适用自动放行策略'],
        explanation: '满足低风险内容治理条件。',
      },
    ],
    evidenceChain: [
      {
        sourceAgent: '真实性分析Agent',
        evidenceType: '真实性信号',
        content: '拍摄设备、时间和分辨率信息完整，来源可信。',
        riskContribution: 4,
        confidence: 0.94,
        explanation: '支撑内容真实可信。',
      },
      {
        sourceAgent: 'AIGC识别Agent',
        evidenceType: '视觉结论',
        content: '未发现生成式图像或深度伪造特征。',
        riskContribution: 2,
        confidence: 0.9,
        explanation: 'AIGC 风险较低。',
      },
      {
        sourceAgent: '文本语义Agent',
        evidenceType: '语义结论',
        content: '标题与描述未命中诈骗、营销或误导表达。',
        riskContribution: 2,
        confidence: 0.84,
        explanation: '语义风险较低。',
      },
      {
        sourceAgent: '风险推理Agent',
        evidenceType: '综合判断',
        content: '真实性评分 91，AIGC 概率 8%，综合风险分 12。',
        riskContribution: 2,
        confidence: 0.89,
        explanation: '可归为正常内容。',
      },
      {
        sourceAgent: '治理决策Agent',
        evidenceType: '治理建议',
        content: '建议自动放行并进入常规抽检。',
        riskContribution: 2,
        confidence: 0.93,
        explanation: '满足低风险内容处置标准。',
      },
    ],
    conclusion:
      '系统未发现该校园活动照片存在明显篡改、AIGC 生成或语义风险信号，真实性评分为 91 分，综合风险分为 12 分。建议自动放行，并纳入常规抽检。',
    reviewerAction: 'release',
    auditLogs: [
      {
        actor: 'system',
        action: '任务创建',
        detail: '图片内容进入真实性与 AIGC 鉴别链路。',
        createdAt: '2026-05-29T16:28:00+08:00',
      },
      {
        actor: 'system',
        action: '分析完成',
        detail: '未发现显著风险，建议自动放行。',
        createdAt: '2026-05-29T16:28:02+08:00',
      },
      {
        actor: 'reviewer',
        action: '确认放行',
        detail: '经抽检确认内容正常。',
        createdAt: '2026-05-29T16:30:05+08:00',
      },
    ],
  },
  {
    id: 4,
    title: '虚假投资营销文本',
    contentType: 'text',
    sourceType: 'document_text',
    extractedText: '稳赚不赔，老师带单，立即私聊进群，获取内幕收益策略。',
    createdAt: '2026-05-29T16:36:00+08:00',
    status: 'reviewed',
    authenticityScore: 18,
    aigcProbability: 0.76,
    deepfakeProbability: 0.04,
    semanticRisk: 0.95,
    riskScore: 93,
    riskLevel: 'severe',
    recommendation: 'block',
    tags: ['诈骗营销', '虚假宣传', '来源不明'],
    agentResults: [
      {
        agentName: '真实性分析Agent',
        status: 'completed',
        confidence: 0.84,
        latencyMs: 300,
        riskContribution: 14,
        summary: '文本来源链薄弱，缺少可信发布主体与上下文佐证。',
        evidence: ['缺少可信出处', '账号画像异常'],
        explanation: '真实性基础不足，需谨慎看待其可信度。',
      },
      {
        agentName: 'AIGC识别Agent',
        status: 'completed',
        confidence: 0.78,
        latencyMs: 260,
        riskContribution: 8,
        summary: '文本润色风格较统一，存在生成式文案修饰可能。',
        evidence: ['重复营销话术模板', '句式过于统一'],
        explanation: 'AIGC 不是主要风险来源，但存在生成式加工痕迹。',
      },
      {
        agentName: '文本语义Agent',
        status: 'completed',
        confidence: 0.96,
        latencyMs: 610,
        riskContribution: 24,
        summary: '命中“稳赚不赔”“老师带单”“内幕收益”等高危诈骗营销词。',
        evidence: ['稳赚不赔', '老师带单', '私聊进群', '内幕收益'],
        explanation: '语义链路明确指向投资诈骗与违规引流。',
      },
      {
        agentName: '风险推理Agent',
        status: 'completed',
        confidence: 0.93,
        latencyMs: 340,
        riskContribution: 16,
        summary: '综合判断为严重风险，需立即拦截。',
        evidence: ['诈骗营销高危词密集命中', '真实性支撑不足'],
        explanation: '该内容对平台用户具有直接误导和财产损害风险。',
      },
      {
        agentName: '治理决策Agent',
        status: 'completed',
        confidence: 0.95,
        latencyMs: 240,
        riskContribution: 12,
        summary: '建议风险拦截，并升级排查关联账号。',
        evidence: ['平台策略要求直接拦截投资诈骗内容'],
        explanation: '满足高危营销与诈骗内容的阻断策略。',
      },
    ],
    evidenceChain: [
      {
        sourceAgent: '真实性分析Agent',
        evidenceType: '来源可信度',
        content: '文本来源不明，缺少可信发布主体和外部佐证。',
        riskContribution: 14,
        confidence: 0.84,
        explanation: '降低真实性可信度。',
      },
      {
        sourceAgent: 'AIGC识别Agent',
        evidenceType: '文案修饰痕迹',
        content: '句式和修辞高度模板化，存在生成式文案痕迹。',
        riskContribution: 8,
        confidence: 0.78,
        explanation: 'AIGC 风险存在但不是主要治理焦点。',
      },
      {
        sourceAgent: '文本语义Agent',
        evidenceType: '诈骗营销风险',
        content: '命中“稳赚不赔”“老师带单”“私聊进群”等高危风险词。',
        riskContribution: 24,
        confidence: 0.96,
        explanation: '明确指向诈骗营销与违规引流。',
      },
      {
        sourceAgent: '风险推理Agent',
        evidenceType: '综合判断',
        content: '真实性评分 18，AIGC 概率 76%，综合风险分 93。',
        riskContribution: 16,
        confidence: 0.93,
        explanation: '已达到严重风险阈值。',
      },
      {
        sourceAgent: '治理决策Agent',
        evidenceType: '治理建议',
        content: '建议风险拦截并排查关联账号与传播链路。',
        riskContribution: 12,
        confidence: 0.95,
        explanation: '满足高危诈骗营销内容的直接处置条件。',
      },
    ],
    conclusion:
      '系统检测到该文本存在明显诈骗营销与违规引流风险，命中“稳赚不赔”“老师带单”等高危话术，真实性支撑不足，综合风险评分为 93 分。建议立即执行风险拦截，并保留证据链用于后续审计与关联账号排查。',
    reviewerAction: 'block',
    auditLogs: [
      {
        actor: 'system',
        action: '任务创建',
        detail: '文本内容进入真实性与 AIGC 鉴别链路。',
        createdAt: '2026-05-29T16:36:00+08:00',
      },
      {
        actor: 'system',
        action: '分析完成',
        detail: '识别到严重诈骗营销风险，建议立即拦截。',
        createdAt: '2026-05-29T16:36:01+08:00',
      },
      {
        actor: 'reviewer',
        action: '风险拦截',
        detail: '确认高危诈骗营销，执行拦截并升级排查。',
        createdAt: '2026-05-29T16:37:18+08:00',
      },
    ],
  },
  {
    id: 5,
    title: '小红书AI商品宣传笔记',
    contentType: 'link',
    sourceType: 'url',
    sourceUrl: 'https://www.xiaohongshu.com/explore/ai-product-demo',
    sourcePlatform: '小红书',
    pageTitle: 'AI爆款商品图快速生成教程',
    pageAuthor: '示例创作者',
    publishedAt: '2026-05-30T10:20:00+08:00',
    extractedText: '该内容包含商品宣传图、营销文案和用户评论，并突出快速变现与爆款转化。',
    extractedImages: 5,
    extractedVideo: false,
    linkPreview: {
      sourceUrl: 'https://www.xiaohongshu.com/explore/ai-product-demo',
      sourcePlatform: '小红书',
      title: 'AI爆款商品图快速生成教程',
      contentType: '图文笔记',
      author: '示例创作者',
      publishedAt: '2026-05-30',
      summary: '该内容包含商品宣传图、营销文案和用户评论。',
      hasVideo: false,
      hasImages: true,
      hasText: true,
      parseStatus: '演示解析成功',
      rawDomain: 'xiaohongshu.com',
    },
    createdAt: '2026-05-30T16:18:00+08:00',
    status: 'completed',
    authenticityScore: 58,
    aigcProbability: 0.76,
    deepfakeProbability: 0.18,
    semanticRisk: 0.63,
    riskScore: 69,
    riskLevel: 'medium',
    recommendation: 'throttle',
    tags: ['AI商品图', '营销夸大', '来源不明'],
    agentResults: [
      {
        agentName: '真实性分析Agent',
        status: 'completed',
        confidence: 0.88,
        latencyMs: 410,
        riskContribution: 14,
        summary: '页面来源为小红书图文笔记，作者认证信息不足，发布时间与配图来源链不完整。',
        evidence: ['识别来源为小红书图文笔记', '作者主页缺少可信机构认证', '页面未提供原始拍摄来源'],
        explanation: '链接内容可解析到平台与作者，但来源链仍不足以支撑完全真实可信。',
      },
      {
        agentName: 'AIGC识别Agent',
        status: 'completed',
        confidence: 0.91,
        latencyMs: 720,
        riskContribution: 22,
        summary: '封面商品图存在疑似 AI 生成特征，材质纹理与投影细节不自然。',
        evidence: ['封面图边缘过度平滑', '商品材质纹理重复', '局部投影方向不一致'],
        explanation: '图文笔记中的商品图带有明显生成式修饰特征，是当前主要风险来源。',
      },
      {
        agentName: '文本语义Agent',
        status: 'completed',
        confidence: 0.87,
        latencyMs: 530,
        riskContribution: 12,
        summary: '文案包含“快速变现”“爆款模板”等营销放大表达。',
        evidence: ['命中“快速变现”', '命中“爆款模板”', '评论区存在引流话术'],
        explanation: '文本语义提升了营销夸大和误导转化风险。',
      },
      {
        agentName: '风险推理Agent',
        status: 'completed',
        confidence: 0.89,
        latencyMs: 320,
        riskContribution: 12,
        summary: '综合判断为中风险，建议限流观察并补充来源说明。',
        evidence: ['来源可信度不足', 'AI商品图概率较高', '营销表达偏激进'],
        explanation: '内容未达到直接拦截阈值，但需要限制扩散并补充真实性说明。',
      },
      {
        agentName: '治理决策Agent',
        status: 'completed',
        confidence: 0.92,
        latencyMs: 230,
        riskContribution: 9,
        summary: '建议限流观察，并要求补充商品图来源与真实拍摄说明。',
        evidence: ['图文种草场景适用限流观察策略'],
        explanation: '在保留内容运营空间的同时，控制潜在误导传播。',
      },
    ],
    evidenceChain: [
      {
        sourceAgent: '真实性分析Agent',
        evidenceType: 'Link解析证据',
        content: '识别来源为小红书图文笔记，作者主页缺少可信机构认证，页面未提供原始拍摄来源。',
        riskContribution: 14,
        confidence: 0.88,
        explanation: '链接来源可解析，但来源可信度仍待核验。',
      },
      {
        sourceAgent: 'AIGC识别Agent',
        evidenceType: '视觉异常',
        content: '封面商品图材质纹理重复，局部投影与边缘细节不自然。',
        riskContribution: 22,
        confidence: 0.91,
        explanation: '符合 AI 商品宣传图特征。',
      },
      {
        sourceAgent: '文本语义Agent',
        evidenceType: '营销夸大',
        content: '文案命中“快速变现”“爆款模板”等营销放大表达。',
        riskContribution: 12,
        confidence: 0.87,
        explanation: '文本语义存在引导性营销风险。',
      },
      {
        sourceAgent: '风险推理Agent',
        evidenceType: '综合判断',
        content: '真实性评分 58，AIGC 概率 76%，综合风险分 69。',
        riskContribution: 12,
        confidence: 0.89,
        explanation: '当前需进入限流观察队列。',
      },
      {
        sourceAgent: '治理决策Agent',
        evidenceType: '治理建议',
        content: '建议限流观察并补充商品图来源说明。',
        riskContribution: 9,
        confidence: 0.92,
        explanation: '适配图文种草场景的中风险治理策略。',
      },
    ],
    conclusion:
      '系统识别该小红书图文笔记包含疑似 AI 生成商品图，来源链不完整，文案同时命中营销夸大表达。综合风险评分为 69 分，建议限流观察并要求补充来源说明。',
    reviewerAction: null,
    auditLogs: [
      {
        actor: 'system',
        action: '链接解析',
        detail: '解析小红书图文笔记，提取标题、作者、图片与摘要文本。',
        createdAt: '2026-05-30T16:18:00+08:00',
      },
      {
        actor: 'system',
        action: '分析完成',
        detail: '识别到 AI 商品图与营销夸大风险，建议限流观察。',
        createdAt: '2026-05-30T16:18:03+08:00',
      },
    ],
  },
  {
    id: 6,
    title: '抖音疑似AI换脸视频',
    contentType: 'link',
    sourceType: 'url',
    sourceUrl: 'https://www.douyin.com/video/deepfake-demo',
    sourcePlatform: '抖音',
    pageTitle: '明星口播带货片段',
    pageAuthor: '热点搬运号',
    publishedAt: '2026-05-30T14:06:00+08:00',
    extractedText: '短视频包含口播字幕、直播间导流文案和评论区互动信息。',
    extractedImages: 1,
    extractedVideo: true,
    linkPreview: {
      sourceUrl: 'https://www.douyin.com/video/deepfake-demo',
      sourcePlatform: '抖音',
      title: '明星口播带货片段',
      contentType: '短视频',
      author: '热点搬运号',
      publishedAt: '2026-05-30',
      summary: '短视频包含人物口播、商品导流字幕与评论互动。',
      hasVideo: true,
      hasImages: true,
      hasText: true,
      parseStatus: '演示解析成功',
      rawDomain: 'douyin.com',
    },
    createdAt: '2026-05-30T16:26:00+08:00',
    status: 'reviewed',
    authenticityScore: 42,
    aigcProbability: 0.88,
    deepfakeProbability: 0.86,
    semanticRisk: 0.57,
    riskScore: 82,
    riskLevel: 'high',
    recommendation: 'review',
    tags: ['AI换脸', '深度伪造', '身份冒用'],
    agentResults: [
      {
        agentName: '真实性分析Agent',
        status: 'completed',
        confidence: 0.9,
        latencyMs: 460,
        riskContribution: 18,
        summary: '链接来源为抖音短视频，发布者与视频人物身份不一致，发布时间链存在异常。',
        evidence: ['识别来源为抖音短视频', '发布账号与视频人物身份不匹配', '转发链路异常'],
        explanation: '链接解析明确来源平台，但人物身份与账号主体不一致，真实性基础较弱。',
      },
      {
        agentName: 'AIGC识别Agent',
        status: 'completed',
        confidence: 0.95,
        latencyMs: 840,
        riskContribution: 28,
        summary: '关键帧存在面部边缘融合异常和口型错位，疑似 AI 换脸。',
        evidence: ['面部边缘羽化异常', '口型与音轨节奏偏移', '关键帧光照一致性异常'],
        explanation: '深度伪造特征明显，是当前主要风险来源。',
      },
      {
        agentName: '文本语义Agent',
        status: 'completed',
        confidence: 0.82,
        latencyMs: 540,
        riskContribution: 10,
        summary: '字幕带有商品导流与身份误导倾向，可能放大传播危害。',
        evidence: ['字幕暗示真人出镜', '评论区存在导流话术'],
        explanation: '文本虽然不是主要风险，但会放大身份冒用和带货误导。',
      },
      {
        agentName: '风险推理Agent',
        status: 'completed',
        confidence: 0.91,
        latencyMs: 330,
        riskContribution: 16,
        summary: '综合判断为高风险，建议进入人工复审并核验授权链路。',
        evidence: ['Deepfake 概率高', '人物身份存在冒用风险'],
        explanation: '需要结合授权信息与传播链路做人工确认。',
      },
      {
        agentName: '治理决策Agent',
        status: 'completed',
        confidence: 0.93,
        latencyMs: 250,
        riskContribution: 10,
        summary: '建议人工复审，并保留关键帧与链接来源证据。',
        evidence: ['高风险短视频内容需保留关键帧证据'],
        explanation: '在确认授权之前，不应直接放行传播。',
      },
    ],
    evidenceChain: [
      {
        sourceAgent: '真实性分析Agent',
        evidenceType: 'Link解析证据',
        content: '识别来源为抖音短视频，发布账号与视频人物身份不匹配，转发链路异常。',
        riskContribution: 18,
        confidence: 0.9,
        explanation: '来源可信度和账号主体存在明显疑点。',
      },
      {
        sourceAgent: 'AIGC识别Agent',
        evidenceType: 'Deepfake痕迹',
        content: '关键帧面部边缘融合异常，口型与音轨节奏偏移。',
        riskContribution: 28,
        confidence: 0.95,
        explanation: '符合 AI 换脸与深度伪造特征。',
      },
      {
        sourceAgent: '文本语义Agent',
        evidenceType: '身份误导',
        content: '字幕暗示真人出镜，评论区存在商品导流话术。',
        riskContribution: 10,
        confidence: 0.82,
        explanation: '会进一步放大身份冒用与误导传播风险。',
      },
      {
        sourceAgent: '风险推理Agent',
        evidenceType: '综合判断',
        content: '真实性评分 42，AIGC 概率 88%，Deepfake 概率 86%，综合风险分 82。',
        riskContribution: 16,
        confidence: 0.91,
        explanation: '当前应进入人工复审与授权核验流程。',
      },
      {
        sourceAgent: '治理决策Agent',
        evidenceType: '治理建议',
        content: '建议人工复审并保留关键帧与链接来源证据。',
        riskContribution: 10,
        confidence: 0.93,
        explanation: '满足高风险短视频的审慎治理策略。',
      },
    ],
    conclusion:
      '系统识别该抖音短视频存在明显 AI 换脸与深度伪造特征，发布账号与视频人物身份不匹配。综合风险评分为 82 分，建议人工复审并核验授权链路。',
    reviewerAction: 'review',
    auditLogs: [
      {
        actor: 'system',
        action: '链接解析',
        detail: '解析抖音短视频链接，提取关键帧、字幕与账号信息。',
        createdAt: '2026-05-30T16:26:00+08:00',
      },
      {
        actor: 'system',
        action: '分析完成',
        detail: '识别到疑似 AI 换脸和身份冒用风险，建议人工复审。',
        createdAt: '2026-05-30T16:26:04+08:00',
      },
    ],
  },
  {
    id: 7,
    title: '新闻网页疑似AI生成图文',
    contentType: 'link',
    sourceType: 'url',
    sourceUrl: 'https://news.example.com/aigc-report-demo',
    sourcePlatform: '普通网页',
    pageTitle: '某地科技论坛现场图片报道',
    pageAuthor: '示例新闻编辑',
    publishedAt: '2026-05-30T09:42:00+08:00',
    extractedText: '网页包含新闻正文、配图说明与引用来源说明。',
    extractedImages: 3,
    extractedVideo: false,
    linkPreview: {
      sourceUrl: 'https://news.example.com/aigc-report-demo',
      sourcePlatform: '普通网页',
      title: '某地科技论坛现场图片报道',
      contentType: '新闻网页',
      author: '示例新闻编辑',
      publishedAt: '2026-05-30',
      summary: '网页包含新闻正文、配图说明与来源引用信息。',
      hasVideo: false,
      hasImages: true,
      hasText: true,
      parseStatus: '演示解析成功',
      rawDomain: 'news.example.com',
    },
    createdAt: '2026-05-30T16:41:00+08:00',
    status: 'completed',
    authenticityScore: 61,
    aigcProbability: 0.67,
    deepfakeProbability: 0.2,
    semanticRisk: 0.46,
    riskScore: 64,
    riskLevel: 'medium',
    recommendation: 'review',
    tags: ['AI配图', '来源待核验', 'Metadata异常'],
    agentResults: [
      {
        agentName: '真实性分析Agent',
        status: 'completed',
        confidence: 0.86,
        latencyMs: 390,
        riskContribution: 15,
        summary: '网页来源可访问，但转载声明与原始来源引用不完整。',
        evidence: ['来源域名可访问', '转载链路不完整', '发布时间与图片来源说明不一致'],
        explanation: '链接来源有一定可信度，但出处说明仍需补充核验。',
      },
      {
        agentName: 'AIGC识别Agent',
        status: 'completed',
        confidence: 0.84,
        latencyMs: 690,
        riskContribution: 18,
        summary: '新闻配图存在局部纹理重复与边缘平滑异常，疑似 AI 配图。',
        evidence: ['配图边缘过度平滑', '局部纹理重复', '图像 Metadata 缺失'],
        explanation: '配图疑似生成式生成，但正文本身未发现显著伪造痕迹。',
      },
      {
        agentName: '文本语义Agent',
        status: 'completed',
        confidence: 0.8,
        latencyMs: 470,
        riskContribution: 9,
        summary: '正文叙述中性，但引用来源不足，需人工核验出处。',
        evidence: ['正文未命中高危营销词', '来源引用不足', '图片说明缺乏原始出处'],
        explanation: '文本风险适中，重点在于来源可信度与配图真实性。',
      },
      {
        agentName: '风险推理Agent',
        status: 'completed',
        confidence: 0.87,
        latencyMs: 310,
        riskContribution: 13,
        summary: '综合判断为中风险，建议人工复审来源与配图真实性。',
        evidence: ['来源待核验', 'AI配图风险中等', 'Metadata 异常'],
        explanation: '适合进入人工核验流程，避免误导性传播。',
      },
      {
        agentName: '治理决策Agent',
        status: 'completed',
        confidence: 0.9,
        latencyMs: 220,
        riskContribution: 9,
        summary: '建议人工复审，重点核验原始来源和配图说明。',
        evidence: ['新闻网页场景适用人工核验策略'],
        explanation: '兼顾新闻传播效率与来源核验要求。',
      },
    ],
    evidenceChain: [
      {
        sourceAgent: '真实性分析Agent',
        evidenceType: 'Link解析证据',
        content: '识别为普通新闻网页，转载链路与原始来源引用不完整。',
        riskContribution: 15,
        confidence: 0.86,
        explanation: '需要进一步核验来源出处。',
      },
      {
        sourceAgent: 'AIGC识别Agent',
        evidenceType: 'AI配图痕迹',
        content: '新闻配图边缘过度平滑，局部纹理重复，Metadata 缺失。',
        riskContribution: 18,
        confidence: 0.84,
        explanation: '疑似 AI 生成或二次修饰配图。',
      },
      {
        sourceAgent: '文本语义Agent',
        evidenceType: '来源待核验',
        content: '正文未命中高危词，但图片说明缺少原始出处。',
        riskContribution: 9,
        confidence: 0.8,
        explanation: '需人工核验文本引用与图片说明。',
      },
      {
        sourceAgent: '风险推理Agent',
        evidenceType: '综合判断',
        content: '真实性评分 61，AIGC 概率 67%，综合风险分 64。',
        riskContribution: 13,
        confidence: 0.87,
        explanation: '建议进入人工复审。',
      },
      {
        sourceAgent: '治理决策Agent',
        evidenceType: '治理建议',
        content: '建议人工复审，核验网页来源与配图真实性。',
        riskContribution: 9,
        confidence: 0.9,
        explanation: '适配新闻网页场景的审慎治理策略。',
      },
    ],
    conclusion:
      '系统识别该新闻网页配图存在疑似 AI 生成痕迹，转载链路和原始来源说明不完整。综合风险评分为 64 分，建议人工复审并核验来源与配图真实性。',
    reviewerAction: null,
    auditLogs: [
      {
        actor: 'system',
        action: '链接解析',
        detail: '解析新闻网页链接，提取正文、配图与来源说明。',
        createdAt: '2026-05-30T16:41:00+08:00',
      },
      {
        actor: 'system',
        action: '分析完成',
        detail: '识别到 AI 配图与来源待核验风险，建议人工复审。',
        createdAt: '2026-05-30T16:41:03+08:00',
      },
    ],
  },
];

export const mockAuditTasks: AuditTask[] = buildCuratedMockAuditTasks();

function buildCuratedMockAuditTasks(): AuditTask[] {
  const douyin = requireTaskTemplate(6);
  const xiaohongshu = requireTaskTemplate(5);
  const news = requireTaskTemplate(7);
  const ecommerce = requireTaskTemplate(2);
  const campus = requireTaskTemplate(3);
  const investment = requireTaskTemplate(4);

  return [
    {
      ...douyin,
      id: 1,
      title: '抖音疑似AI换脸视频',
      sourceType: 'url',
      contentType: 'link',
      sourcePlatform: '抖音',
      status: 'completed',
      createdAt: '2026-05-30T18:00:00+08:00',
      tags: ['AI换脸', '深度伪造', '身份冒用', '来源待核验'],
      reviewerAction: null,
      linkPreview: douyin.linkPreview
        ? {
            ...douyin.linkPreview,
            contentType: '视频链接',
          }
        : douyin.linkPreview,
      conclusion: '短视频链接疑似存在AI换脸、深度伪造与身份冒用风险，建议进入人工复审并核验授权链路。',
    },
    {
      ...xiaohongshu,
      id: 2,
      title: '小红书AI商品宣传笔记',
      sourceType: 'url',
      contentType: 'link',
      sourcePlatform: '小红书',
      createdAt: '2026-05-30T17:40:00+08:00',
      linkPreview: xiaohongshu.linkPreview
        ? {
            ...xiaohongshu.linkPreview,
            contentType: '图文链接',
          }
        : xiaohongshu.linkPreview,
      conclusion: '图文笔记疑似使用AI商品图，并存在营销夸大和来源不明风险，建议限流观察并补充来源说明。',
    },
    {
      ...news,
      id: 3,
      title: '新闻网页疑似AI生成图文',
      sourceType: 'url',
      contentType: 'link',
      sourcePlatform: '普通网页',
      createdAt: '2026-05-30T17:20:00+08:00',
      riskScore: 63,
      linkPreview: news.linkPreview
        ? {
            ...news.linkPreview,
            contentType: '新闻网页',
          }
        : news.linkPreview,
      conclusion: '新闻页面中配图疑似AI生成，正文来源和图片Metadata信息待核验，建议进入人工复审流程。',
    },
    {
      ...ecommerce,
      id: 4,
      title: '电商AI商品主图审核',
      sourceType: 'media',
      sourcePlatform: '电商',
      contentType: 'image',
      status: 'completed',
      createdAt: '2026-05-30T17:00:00+08:00',
      authenticityScore: 54,
      aigcProbability: 0.81,
      riskScore: 72,
      riskLevel: 'high',
      recommendation: 'review',
      tags: ['AI商品图', '虚假展示', '商品合规'],
      conclusion: '商品主图疑似由AI生成，展示效果与真实规格存在不一致风险，建议人工复审并核验商品素材来源。',
    },
    {
      ...campus,
      id: 5,
      title: '普通校园活动照片',
      sourceType: 'media',
      sourcePlatform: undefined,
      contentType: 'image',
      status: 'completed',
      createdAt: '2026-05-30T16:40:00+08:00',
      authenticityScore: 89,
      aigcProbability: 0.12,
      riskScore: 18,
      riskLevel: 'low',
      recommendation: 'release',
      tags: ['正常内容', '真实可信', '低风险'],
      reviewerAction: null,
      conclusion: '校园活动照片具备较高真实性信号，未发现明显AIGC生成或高风险内容，建议自动放行。',
    },
    {
      ...investment,
      id: 6,
      title: '虚假投资营销文本',
      sourceType: 'document_text',
      sourcePlatform: undefined,
      contentType: 'text',
      status: 'reviewed',
      createdAt: '2026-05-30T16:20:00+08:00',
      authenticityScore: 52,
      aigcProbability: 0.79,
      riskScore: 86,
      riskLevel: 'severe',
      recommendation: 'block',
      tags: ['诈骗营销', '虚假承诺', '金融风险'],
      extractedText: '稳赚不赔，老师带单，立即私聊进群，获取内幕收益策略。',
      conclusion: '文本命中“稳赚不赔”“老师带单”“立即私聊进群”等高风险营销表达，综合判断为严重风险，建议风险拦截。',
    },
  ];
}

function requireTaskTemplate(id: number): AuditTask {
  const task = rawMockAuditTasks.find((item) => item.id === id);
  if (!task) {
    throw new Error(`Missing mock task template: ${id}`);
  }
  return task;
}

export const mockRealtimeRiskEvents = [
  {
    time: '16:32',
    taskId: 1,
    title: '检测到疑似AI换脸视频',
    contentType: '视频',
    tag: 'AI换脸',
    level: '高风险',
    recommendation: '人工复审',
    source: '短视频审核流',
  },
  {
    time: '16:34',
    taskId: 2,
    title: '检测到AI商品宣传图',
    contentType: '图片',
    tag: 'AI商品图',
    level: '中风险',
    recommendation: '限流观察',
    source: '电商商详图流',
  },
  {
    time: '16:36',
    taskId: 4,
    title: '检测到虚假投资营销文本',
    contentType: '文本',
    tag: '诈骗营销',
    level: '严重风险',
    recommendation: '风险拦截',
    source: '文本投放流',
  },
  {
    time: '16:39',
    taskId: 2,
    title: '检测到Metadata异常内容',
    contentType: '图片',
    tag: 'Metadata异常',
    level: '高风险',
    recommendation: '人工复审',
    source: '跨平台搬运池',
  },
] as const;

export const mockGovernanceMetrics = [
  { label: '今日鉴别内容', value: '12,864', delta: '+18.2%', tone: 'text-sky-200', hint: '多模态内容持续接入' },
  { label: '疑似AIGC内容', value: '4,231', delta: '+12.9%', tone: 'text-violet-200', hint: '生成式图像与短视频占比上升' },
  { label: '高风险内容', value: '982', delta: '+6.7%', tone: 'text-rose-200', hint: '高危内容进入优先处置队列' },
  { label: '自动处置率', value: '86.4%', delta: '+4.2%', tone: 'text-emerald-200', hint: '策略引擎自动完成基础治理动作' },
  { label: '人工复审量', value: '312', delta: '-8.5%', tone: 'text-amber-200', hint: '重点保留真实性存疑内容' },
  { label: '平均响应时间', value: '1.82s', delta: '-17.6%', tone: 'text-cyan-200', hint: 'Agent 协同缩短整体鉴别时延' },
] as const;

export const mockGovernanceRiskTypes = [
  { label: 'AI换脸', value: '231', level: '高关注', heat: 92, hint: '重点集中在短视频口播与人物冒用' },
  { label: 'Deepfake', value: '176', level: '高关注', heat: 89, hint: '关键帧异常和口型错位持续提升' },
  { label: 'AI商品图', value: '490', level: '中高关注', heat: 81, hint: 'AIGC 商详图和夸大修饰显著增多' },
  { label: '虚假投资营销', value: '112', level: '严重关注', heat: 95, hint: '收益承诺与引流话术命中频繁' },
  { label: 'Metadata异常', value: '204', level: '中高关注', heat: 77, hint: '来源链缺失与设备信息异常增多' },
  { label: '来源不明', value: '98', level: '重点观察', heat: 73, hint: '跨平台搬运与二次导出内容增加' },
] as const;

export const mockGovernanceEffects = [
  { label: '审核效率提升', value: '43%', delta: '+11.2%', hint: 'Agent 协同后整体审核吞吐显著提升' },
  { label: '人工复核减少', value: '28%', delta: '+7.8%', hint: '低风险内容由系统自动完成初步处置' },
  { label: '高风险召回提升', value: '31%', delta: '+9.4%', hint: '高风险内容更早进入优先治理队列' },
  { label: '平均处理时长下降', value: '37%', delta: '-12.6%', hint: '多 Agent 并行缩短单条内容分析闭环' },
] as const;

export function getMockAuditTaskById(id: number) {
  return mockAuditTasks.find((task) => task.id === id) ?? null;
}

export function getTaskSourceType(task: AuditTask): SourceType {
  if (task.sourceType) return task.sourceType;
  if (task.contentType === 'text' || task.contentType === 'document') return 'document_text';
  if (task.contentType === 'link') return 'url';
  return 'media';
}

export function sourceTypeLabel(sourceType: SourceType) {
  if (sourceType === 'media') return '媒体素材';
  if (sourceType === 'document_text') return '文档与文本';
  return '链接分析';
}

export function isValidSourceUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return /^[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}(?:[/?].*)?$/.test(value);
  }
}

export function detectSourcePlatform(value: string): SourcePlatform {
  try {
    let host: string;
    try {
      host = new URL(value).hostname.toLowerCase();
    } catch {
      host = value.toLowerCase().replace(/^https?:\/\//, '').split('/')[0];
    }
    if (host.includes('douyin.com')) return '抖音';
    if (host.includes('xiaohongshu.com') || host.includes('xhslink.com')) return '小红书';
    if (host.includes('weibo.com')) return '微博';
    if (host.includes('bilibili.com') || host.includes('b23.tv')) return 'B站';
    if (
      host.includes('taobao.com') ||
      host.includes('tmall.com') ||
      host.includes('jd.com') ||
      host.includes('pinduoduo.com')
    ) {
      return '电商';
    }
    return '普通网页';
  } catch {
    return '普通网页';
  }
}

export function parseMockLinkContent(url: string, customTitle?: string) {
  const platform = detectSourcePlatform(url);
  const task = createMockLinkAuditTask({ url, sourcePlatform: platform, title: customTitle });
  return {
    preview: task.linkPreview ?? buildFallbackLinkPreview(url, platform),
    task,
  };
}

export function createMockLinkAuditTask({
  url,
  sourcePlatform,
  title,
}: {
  url: string;
  sourcePlatform?: SourcePlatform;
  title?: string;
}): AuditTask {
  const platform = sourcePlatform ?? detectSourcePlatform(url);
  const template = resolveLinkTaskTemplate(platform);
  const linkPreview = buildLinkPreviewFromTemplate(template, url, platform);

  return {
    ...template,
    title: title?.trim() || template.title,
    sourceType: 'url',
    sourceUrl: url,
    sourcePlatform: platform,
    pageTitle: linkPreview.title,
    pageAuthor: linkPreview.author,
    publishedAt: linkPreview.publishedAt,
    extractedText: template.extractedText ?? linkPreview.summary,
    extractedImages: template.extractedImages ?? (linkPreview.hasImages ? 1 : 0),
    extractedVideo: template.extractedVideo ?? linkPreview.hasVideo,
    linkPreview,
  };
}

export function getMockHomeMetrics() {
  return getDashboardOverviewMetrics().slice(0, 4);
}

export function getDashboardOverviewMetrics(): DashboardMetric[] {
  return [
    {
      title: '今日鉴别内容',
      value: '12,864',
      hint: '覆盖图片、视频、文本等多模态内容',
      delta: '+18.2%',
    },
    {
      title: 'AIGC疑似内容占比',
      value: '38%',
      hint: '重点集中在商品图、短视频口播和营销文案',
      delta: '+12.9%',
    },
    {
      title: '高风险内容数量',
      value: '428',
      hint: '包含深度伪造、诈骗营销和溯源异常样本',
      delta: '+6.7%',
    },
    {
      title: '平均分析耗时',
      value: '2.3s',
      hint: '多 Agent 串并行协同降低整体分析延迟',
      delta: '-17.6%',
    },
    {
      title: '自动处置率',
      value: '86.4%',
      hint: '策略引擎自动完成基础治理动作，保留重点高风险内容给人工复核',
      delta: '+4.2%',
    },
    {
      title: '人工复审量',
      value: '312',
      hint: '聚焦真实性存疑、深度伪造和诈骗营销等高关注样本',
      delta: '-8.5%',
    },
  ] as const;
}

export function getAuthenticityOverview() {
  return [
    {
      title: '真实可信',
      value: '61%',
      tone: 'text-emerald-200',
      detail: '来源链路完整，未发现显著篡改与生成痕迹',
    },
    {
      title: '疑似AIGC',
      value: '24%',
      tone: 'text-sky-200',
      detail: '存在生成式图像、AI口播和文案润饰特征',
    },
    {
      title: '深度伪造风险',
      value: '9%',
      tone: 'text-fuchsia-200',
      detail: '主要集中在人脸边缘融合异常和口型错位场景',
    },
    {
      title: '虚假营销风险',
      value: '6%',
      tone: 'text-amber-200',
      detail: '高频命中夸大功效、收益承诺和引流词',
    },
  ] as const;
}

export function getRecentAuditTasks(limit = 4) {
  return [...mockAuditTasks]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

export function getAgentCenterCards(): AgentCenterCard[] {
  return agentBlueprints.map((blueprint) => {
    const results = mockAuditTasks.map((task) => task.agentResults.find((item) => item.agentName === blueprint.name)).filter(Boolean) as AgentResult[];
    const averageLatency = Math.round(results.reduce((sum, item) => sum + item.latencyMs, 0) / Math.max(results.length, 1));
    const averageConfidence = results.reduce((sum, item) => sum + item.confidence, 0) / Math.max(results.length, 1);
    const totalContribution = results.reduce((sum, item) => sum + item.riskContribution, 0);
    const detail = getAgentCenterDetail(blueprint.name);
    return {
      id: getAgentId(blueprint.name),
      ...blueprint,
      tags: detail.tags,
      capabilityMatrix: [
        { title: '职责', items: blueprint.responsibilities },
        { title: '输入', items: blueprint.input },
        { title: '输出', items: blueprint.output },
      ],
      evidenceSummary: detail.evidenceSummary,
      collaboration: detail.collaboration,
      outputExample: detail.outputExample,
      runtime: {
        status: resolveAgentRuntimeStatus(blueprint.name),
        averageDuration: `${averageLatency}ms`,
        recentCalls: `${(results.length * 312).toLocaleString('zh-CN')} 次`,
        averageConfidence,
        totalContribution,
        todayCalls: detail.todayCalls,
        averageContribution: detail.averageContribution,
      },
    };
  });
}

export function getGovernanceAgentStatus() {
  return getAgentCenterCards().map((agent) => ({
    name: agent.name,
    status: agent.runtime.status,
    latency: agent.runtime.averageDuration,
    averageConfidence: agent.runtime.averageConfidence,
    note: agent.description,
  }));
}

export function matchMockTaskScenario(input: {
  mode: ContentType;
  title: string;
  text?: string;
  fileName?: string;
  sourceUrl?: string;
  sourcePlatform?: SourcePlatform;
}) {
  const source = `${input.title} ${input.text ?? ''} ${input.fileName ?? ''}`.toLowerCase();
  if (input.mode === 'link' || input.sourceUrl) {
    const platform = input.sourcePlatform ?? (input.sourceUrl ? detectSourcePlatform(input.sourceUrl) : '普通网页');
    if (platform === '小红书' || platform === '电商') {
      return getMockAuditTaskById(2) ?? mockAuditTasks[1];
    }
    if (platform === '抖音' || platform === 'B站' || platform === '微博') {
      return getMockAuditTaskById(1) ?? mockAuditTasks[0];
    }
    return getMockAuditTaskById(3) ?? mockAuditTasks[2];
  }
  if (/换脸|deepfake|face swap|口播/.test(source) || input.mode === 'video') {
    return getMockAuditTaskById(1) ?? mockAuditTasks[0];
  }
  if (/商品|宣传图|功效|焕白|护肤/.test(source)) {
    return getMockAuditTaskById(2) ?? mockAuditTasks[1];
  }
  if (/投资|稳赚|收益|带单|私聊|进群/.test(source) || input.mode === 'text' || input.mode === 'document') {
    return getMockAuditTaskById(4) ?? mockAuditTasks[3];
  }
  return getMockAuditTaskById(3) ?? mockAuditTasks[2];
}

export function buildRuntimeAgentFlow(task: AuditTask): AuditRuntimeAgent[] {
  return task.agentResults.map((agentResult) => {
    const blueprint = getAgentBlueprint(agentResult.agentName);
    return {
      id: getAgentId(agentResult.agentName),
      name: agentResult.agentName,
      status: 'pending',
      progress: 0,
      durationMs: agentResult.latencyMs,
      confidence: agentResult.confidence,
      contribution: agentResult.riskContribution,
      input: blueprint.input.join('、'),
      output: blueprint.output.join('、'),
      summary: agentResult.summary,
      evidence: agentResult.evidence,
      explanation: agentResult.explanation,
    };
  });
}

export function mapApiTaskToAuditTask(task: ApiTask): AuditTask {
  const authenticityScore = calculateAuthenticityScore(task.ai_probability, task.deepfake_risk);
  const semanticRisk = inferSemanticRisk(task);
  const riskScore = calculateRiskScore(task.ai_probability, authenticityScore, semanticRisk, task.deepfake_risk);
  const riskLevel = normalizeRiskLevel(task.risk_level, riskScore);
  const recommendation = normalizeRecommendation(task.final_action ?? task.recommendation);

  return {
    id: task.id,
    title: task.title,
    contentType: normalizeContentType(task.media_type),
    sourceType: normalizeContentType(task.media_type) === 'text' || normalizeContentType(task.media_type) === 'document' ? 'document_text' : 'media',
    createdAt: task.created_at,
    status: normalizeTaskStatus(task.status),
    authenticityScore,
    aigcProbability: clampProbability(task.ai_probability),
    deepfakeProbability: clampProbability(task.deepfake_risk),
    semanticRisk,
    riskScore,
    riskLevel,
    recommendation,
    tags: task.labels,
    agentResults: buildAgentResultsFromSignals({
      title: task.title,
      contentType: normalizeContentType(task.media_type),
      authenticityScore,
      aigcProbability: clampProbability(task.ai_probability),
      deepfakeProbability: clampProbability(task.deepfake_risk),
      semanticRisk,
      riskScore,
      riskLevel,
      recommendation,
      summary: task.summary,
      tags: task.labels,
    }),
    evidenceChain: task.labels.map((label, index) => ({
      sourceAgent: index === 0 ? '风险推理Agent' : '文本语义Agent',
      evidenceType: '风险标签',
      content: label,
      riskContribution: Math.max(6, Math.round(riskScore / Math.max(task.labels.length, 1))),
      confidence: 0.8,
      explanation: `系统命中风险标签：${label}`,
    })),
    conclusion: task.summary || task.recommendation,
    reviewerAction: task.final_action ? normalizeRecommendation(task.final_action) : null,
    auditLogs: [],
  };
}

export function mapApiTaskDetailToAuditTask(task: ApiTaskDetail): AuditTask {
  const base = mapApiTaskToAuditTask(task);
  const report = task.report as Record<string, unknown>;
  return {
    ...base,
    evidenceChain:
      task.evidence_chain.map((item) => ({
        sourceAgent: mapEvidenceStepToAgent(item.step),
        evidenceType: item.step,
        content: item.finding,
        riskContribution: Math.round(item.score * 100),
        confidence: clampProbability(item.score),
        explanation: `来自 ${item.step} 的证据发现`,
      })) || base.evidenceChain,
    conclusion: String(report.conclusion ?? base.conclusion),
    auditLogs: task.logs.map((log) => mapApiLog(log)),
  };
}

export function getAgentBlueprint(name: AgentName) {
  return agentBlueprints.find((item) => item.name === name) ?? agentBlueprints[0];
}

export function contentTypeLabel(type: ContentType) {
  if (type === 'image') return '图片';
  if (type === 'video') return '视频';
  if (type === 'document') return '文档';
  if (type === 'link') return '链接';
  return '文本';
}

export function taskContentTypeLabel(task: AuditTask) {
  if (task.contentType === 'link' && task.linkPreview?.contentType) {
    return task.linkPreview.contentType;
  }
  return contentTypeLabel(task.contentType);
}

export function riskLevelLabel(level: RiskLevel) {
  if (level === 'low') return '低风险';
  if (level === 'medium') return '中风险';
  if (level === 'high') return '高风险';
  return '严重风险';
}

export function recommendationLabel(recommendation: Recommendation) {
  if (recommendation === 'release') return '放行';
  if (recommendation === 'throttle') return '限流观察';
  if (recommendation === 'review') return '人工复审';
  return '风险拦截';
}

export function recommendationShortLabel(recommendation: Recommendation) {
  if (recommendation === 'release') return '放行';
  if (recommendation === 'throttle') return '限流';
  if (recommendation === 'review') return '人工复审';
  return '拦截';
}

export function statusLabel(status: AuditTaskStatus) {
  if (status === 'processing') return '分析中';
  if (status === 'completed') return '已完成';
  if (status === 'reviewed') return '已复核';
  if (status === 'queued') return '排队中';
  return '升级处理';
}

export function riskLevelToUi(level: RiskLevel): 'low' | 'medium' | 'high' {
  if (level === 'low') return 'low';
  if (level === 'medium') return 'medium';
  return 'high';
}

function buildAgentResultsFromSignals(input: {
  title: string;
  contentType: ContentType;
  authenticityScore: number;
  aigcProbability: number;
  deepfakeProbability: number;
  semanticRisk: number;
  riskScore: number;
  riskLevel: RiskLevel;
  recommendation: Recommendation;
  summary: string;
  tags: string[];
}) {
  const matched = matchMockTaskScenario({
    mode: input.contentType,
    title: `${input.title} ${input.summary} ${input.tags.join(' ')}`,
  });
  return matched.agentResults.map((item) => ({ ...item }));
}

function mapApiLog(log: AuditLog) {
  return {
    actor: log.actor,
    action: log.action,
    detail: log.detail,
    createdAt: log.created_at,
  };
}

function getAgentId(name: AgentName) {
  if (name === '真实性分析Agent') return 'authenticity';
  if (name === 'AIGC识别Agent') return 'aigc';
  if (name === '文本语义Agent') return 'semantic';
  if (name === '风险推理Agent') return 'reasoning';
  return 'decision';
}

function getAgentCenterDetail(name: AgentName) {
  if (name === '真实性分析Agent') {
    return {
      tags: ['真实性分析', 'Metadata检测', '来源核验'],
      evidenceSummary: ['EXIF 时间链轻微异常', '缺少可信拍摄设备信息', '来源引用链不完整'],
      todayCalls: 1462,
      averageContribution: 18,
      collaboration: {
        upstream: ['内容输入'],
        downstream: ['AIGC识别Agent', '风险推理Agent'],
      },
      outputExample: [
        { key: 'authenticity_score', value: '74 / 100' },
        { key: 'metadata_anomaly', value: '时间链轻微异常' },
        { key: 'source_confidence', value: '0.68' },
        { key: 'risk_contribution', value: '+18' },
      ],
    };
  }
  if (name === 'AIGC识别Agent') {
    return {
      tags: ['视觉识别', '生成检测', 'Deepfake分析'],
      evidenceSummary: ['面部边缘融合不自然', '局部光影与背景不一致', '关键帧纹理连续性异常'],
      todayCalls: 1284,
      averageContribution: 26,
      collaboration: {
        upstream: ['真实性分析Agent'],
        downstream: ['文本语义Agent', '风险推理Agent'],
      },
      outputExample: [
        { key: 'aigc_probability', value: '87%' },
        { key: 'deepfake_probability', value: '82%' },
        { key: 'visual_anomaly', value: '面部边缘融合异常' },
        { key: 'risk_contribution', value: '+31' },
      ],
    };
  }
  if (name === '文本语义Agent') {
    return {
      tags: ['语义分析', '风险词识别', '营销检测'],
      evidenceSummary: ['命中“稳赚不赔”', '存在私聊导流话术', '语义倾向误导营销'],
      todayCalls: 1538,
      averageContribution: 12,
      collaboration: {
        upstream: ['AIGC识别Agent'],
        downstream: ['风险推理Agent'],
      },
      outputExample: [
        { key: 'risk_terms', value: '稳赚不赔, 私聊进群' },
        { key: 'semantic_risk', value: '0.73' },
        { key: 'violation_tendency', value: '误导营销' },
        { key: 'risk_contribution', value: '+12' },
      ],
    };
  }
  if (name === '风险推理Agent') {
    return {
      tags: ['风险聚合', '评分推理', '标签生成'],
      evidenceSummary: ['多Agent结果一致抬高风险分', 'AI换脸与身份冒用标签同时命中', '综合风险超过人工复审阈值'],
      todayCalls: 1196,
      averageContribution: 16,
      collaboration: {
        upstream: ['真实性分析Agent', 'AIGC识别Agent', '文本语义Agent'],
        downstream: ['治理决策Agent'],
      },
      outputExample: [
        { key: 'risk_score', value: '82' },
        { key: 'risk_level', value: '高风险' },
        { key: 'risk_tags', value: 'AI换脸, 身份冒用' },
        { key: 'risk_contribution', value: '+16' },
      ],
    };
  }
  return {
    tags: ['策略匹配', '处置建议', '审核结论'],
    evidenceSummary: ['匹配高风险治理策略', '建议保留关键证据链', '输出人工复审与处置建议'],
    todayCalls: 1108,
    averageContribution: 9,
    collaboration: {
      upstream: ['风险推理Agent'],
      downstream: ['证据报告'],
    },
    outputExample: [
      { key: 'final_action', value: '人工复审' },
      { key: 'policy_match', value: '身份冒用高风险策略' },
      { key: 'decision_reason', value: '综合风险分超过阈值' },
      { key: 'risk_contribution', value: '+9' },
    ],
  };
}

function resolveLinkTaskTemplate(platform: SourcePlatform) {
  if (platform === '小红书' || platform === '电商') {
    return getMockAuditTaskById(2) ?? mockAuditTasks[1];
  }
  if (platform === '抖音' || platform === '微博' || platform === 'B站') {
    return getMockAuditTaskById(1) ?? mockAuditTasks[0];
  }
  return getMockAuditTaskById(3) ?? mockAuditTasks[2];
}

function buildLinkPreviewFromTemplate(task: AuditTask, url: string, platform: SourcePlatform): LinkPreview {
  if (task.linkPreview) {
    return {
      ...task.linkPreview,
      sourceUrl: url,
      sourcePlatform: platform,
      rawDomain: getDomainLabel(url),
    };
  }
  return buildFallbackLinkPreview(url, platform);
}

function buildFallbackLinkPreview(url: string, platform: SourcePlatform): LinkPreview {
  return {
    sourceUrl: url,
    sourcePlatform: platform,
    title: '链接内容解析结果',
    contentType: platform === '抖音' || platform === 'B站' ? '短视频' : platform === '小红书' ? '图文笔记' : '网页内容',
    author: '示例发布者',
    publishedAt: '2026-05-30',
    summary: '系统已提取页面标题、摘要文本和媒体线索，可进入真实性与AIGC风险分析。',
    hasVideo: platform === '抖音' || platform === 'B站',
    hasImages: true,
    hasText: true,
    parseStatus: '演示解析成功',
    rawDomain: getDomainLabel(url),
  };
}

function getDomainLabel(url: string) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return 'unknown';
  }
}

function resolveAgentRuntimeStatus(name: AgentName): 'Healthy' | 'Running' | 'Warning' {
  if (name === 'AIGC识别Agent' || name === '风险推理Agent') {
    return 'Running';
  }
  return 'Healthy';
}

function normalizeContentType(value: string): ContentType {
  if (value === 'link') return 'link';
  if (value === 'document' || value === 'pdf' || value === 'doc' || value === 'docx' || value === 'markdown') {
    return 'document';
  }
  if (value === 'video') return 'video';
  if (value === 'text') return 'text';
  return 'image';
}

function normalizeTaskStatus(value: string): AuditTaskStatus {
  if (value === 'queued') return 'queued';
  if (value === 'processing') return 'processing';
  if (value === 'reviewed') return 'reviewed';
  if (value === 'escalated') return 'escalated';
  return 'completed';
}

function normalizeRecommendation(value: string): Recommendation {
  if (/block|拦截/.test(value)) return 'block';
  if (/review|复审/.test(value)) return 'review';
  if (/throttle|限流/.test(value)) return 'throttle';
  return 'release';
}

function normalizeRiskLevel(value: string, riskScore: number): RiskLevel {
  if (value === 'low') return 'low';
  if (value === 'medium') return 'medium';
  if (value === 'high') return riskScore >= 85 ? 'severe' : 'high';
  if (value === 'severe') return 'severe';
  if (riskScore >= 85) return 'severe';
  if (riskScore >= 70) return 'high';
  if (riskScore >= 45) return 'medium';
  return 'low';
}

function mapEvidenceStepToAgent(step: string): AgentName {
  if (/deepfake|vision|frame/i.test(step)) return 'AIGC识别Agent';
  if (/ocr|semantic|ner/i.test(step)) return '文本语义Agent';
  if (/policy|risk/i.test(step)) return '风险推理Agent';
  if (/decision/i.test(step)) return '治理决策Agent';
  return '真实性分析Agent';
}

function inferSemanticRisk(task: ApiTask) {
  if (task.labels.some((label) => /诈骗|营销|宣传/.test(label))) {
    return 0.86;
  }
  if (task.labels.some((label) => /AI换脸|深度伪造/.test(label))) {
    return 0.62;
  }
  if (task.risk_level === 'low') {
    return 0.1;
  }
  if (task.risk_level === 'medium') {
    return 0.45;
  }
  return 0.72;
}

function calculateAuthenticityScore(aiProbability: number, deepfakeProbability: number) {
  return Math.max(0, Math.round(100 - aiProbability * 55 - deepfakeProbability * 45));
}

function calculateRiskScore(aiProbability: number, authenticityScore: number, semanticRisk: number, deepfakeProbability: number) {
  return Math.min(
    100,
    Math.round(
      aiProbability * 30 * 100 / 100 +
        (100 - authenticityScore) * 0.25 +
        semanticRisk * 25 +
        deepfakeProbability * 20,
    ),
  );
}

function clampProbability(value: number) {
  return Math.max(0, Math.min(value, 1));
}
