export type User = {
  username: string;
  role: string;
  display_name: string;
};

export type LoginResult = {
  access_token: string;
  token_type: string;
  user: User;
};

export type UploadResult = {
  id: number;
  original_name: string;
  media_type: string;
  content_text: string | null;
  created_at: string;
};

export type Task = {
  id: number;
  title: string;
  status: string;
  risk_level: string;
  media_type: string;
  ai_probability: number;
  deepfake_risk: number;
  labels: string[];
  summary: string;
  recommendation: string;
  created_by: string;
  final_action: string | null;
  final_actor: string | null;
  created_at: string;
  updated_at: string;
};

export type Evidence = {
  step: string;
  finding: string;
  score: number;
};

export type AuditLog = {
  actor: string;
  action: string;
  detail: string;
  created_at: string;
};

export type TaskDetail = Task & {
  upload_id: number;
  report: Record<string, unknown>;
  evidence_chain: Evidence[];
  logs: AuditLog[];
};

export type DashboardData = {
  stats: {
    total_tasks: number;
    pending_tasks: number;
    completed_tasks: number;
    high_risk_tasks: number;
  };
  risk_distribution: Array<{ label: string; value: number }>;
  risk_trend: Array<{ date: string; high: number; medium: number; low: number }>;
  demo_cases: Array<{
    id: number;
    title: string;
    risk_level: string;
    ai_probability: number;
    deepfake_risk: number;
    labels: string[];
    recommendation: string;
    conclusion: string;
  }>;
};
