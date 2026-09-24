from __future__ import annotations

from dataclasses import dataclass


@dataclass
class AnalysisOutput:
    risk_level: str
    ai_probability: float
    deepfake_risk: float
    labels: list[str]
    summary: str
    recommendation: str
    conclusion: str
    evidence_chain: list[dict]
    report: dict


class MockModelService:
    def analyze(self, media_type: str, title: str, text: str) -> AnalysisOutput:
        content = f'{title} {text}'.lower()
        if '换脸' in text or 'deepfake' in content or 'face swap' in content:
            return self._deepfake_case(title)
        if '投资' in text or '稳赚' in text or '收益' in text:
            return self._investment_case(title)
        if '宣传图' in text or '商品' in text or media_type == 'image':
            return self._marketing_case(title)
        return self._safe_case(title)

    def _deepfake_case(self, title: str) -> AnalysisOutput:
        return AnalysisOutput(
            risk_level='high',
            ai_probability=0.97,
            deepfake_risk=0.94,
            labels=['AI换脸', '人物真实性风险', '身份冒用'],
            summary=f'{title} 存在明显人脸重建与口型同步异常。',
            recommendation='建议立即拦截，并转人工复核身份真实性。',
            conclusion='该素材疑似使用 AI 换脸链路生成，具备较高误导性。',
            evidence_chain=[
                {'step': 'FrameSampler', 'finding': '关键帧面部边缘融合不自然', 'score': 0.93},
                {'step': 'DeepfakeDetector', 'finding': '口型与光照一致性异常', 'score': 0.94},
                {'step': 'PolicyEngine', 'finding': '命中人物冒用高风险策略', 'score': 0.91},
            ],
            report={
                'policy_hits': ['deepfake_identity_risk', 'misleading_persona'],
                'risk_reason': '关键帧中面部纹理与光影不一致，疑似身份冒用。',
                'agent_notes': ['建议追溯原始素材来源', '核验发布主体授权信息'],
            },
        )

    def _marketing_case(self, title: str) -> AnalysisOutput:
        return AnalysisOutput(
            risk_level='medium',
            ai_probability=0.88,
            deepfake_risk=0.24,
            labels=['AI商品宣传图', '夸大营销'],
            summary=f'{title} 疑似由 AIGC 合成，存在商品展示与真实规格不一致风险。',
            recommendation='建议限流并补充商品真实性说明。',
            conclusion='该素材可继续观察，但需补充商详与免责声明。',
            evidence_chain=[
                {'step': 'OCR', 'finding': '发现夸张功效表述与促销词', 'score': 0.82},
                {'step': 'VisionInspector', 'finding': '包装阴影与透视存在生成式特征', 'score': 0.86},
                {'step': 'PolicyEngine', 'finding': '命中电商宣传规范提醒', 'score': 0.73},
            ],
            report={
                'policy_hits': ['ecommerce_exaggeration_notice'],
                'risk_reason': '画面高饱和精修痕迹明显，文本中出现绝对化宣传。',
                'agent_notes': ['要求补充产品资质', '补充真实拍摄图对照'],
            },
        )

    def _investment_case(self, title: str) -> AnalysisOutput:
        return AnalysisOutput(
            risk_level='high',
            ai_probability=0.79,
            deepfake_risk=0.11,
            labels=['虚假投资营销', '收益承诺', '诈骗引流'],
            summary=f'{title} 命中高风险投资营销语义模式。',
            recommendation='建议立即拦截，并审查关联账号与落地页。',
            conclusion='文本存在明显收益承诺与引流暗示，疑似违规营销。',
            evidence_chain=[
                {'step': 'SemanticClassifier', 'finding': '识别到保本高收益表达', 'score': 0.95},
                {'step': 'NER', 'finding': '抽取到投资群、私聊等引流实体', 'score': 0.88},
                {'step': 'PolicyEngine', 'finding': '命中金融营销高风险策略', 'score': 0.92},
            ],
            report={
                'policy_hits': ['financial_fraud_marketing', 'private_channel_diversion'],
                'risk_reason': '文本含稳赚、保本、老师带单等典型诈骗语义。',
                'agent_notes': ['检查历史内容关联性', '核验是否存在批量发布'],
            },
        )

    def _safe_case(self, title: str) -> AnalysisOutput:
        return AnalysisOutput(
            risk_level='low',
            ai_probability=0.16,
            deepfake_risk=0.03,
            labels=['普通素材', '低风险'],
            summary=f'{title} 未发现显著违规或误导线索。',
            recommendation='建议放行，并进入常规抽检。',
            conclusion='当前内容整体安全，可按低风险流程处理。',
            evidence_chain=[
                {'step': 'MetadataParser', 'finding': '素材元数据完整，无异常链路', 'score': 0.21},
                {'step': 'VisionInspector', 'finding': '场景与主体一致性正常', 'score': 0.17},
                {'step': 'PolicyEngine', 'finding': '未命中高风险策略', 'score': 0.08},
            ],
            report={
                'policy_hits': [],
                'risk_reason': '素材自然度与文案语义均处于低风险区间。',
                'agent_notes': ['保留抽样复检记录'],
            },
        )
