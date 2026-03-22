/**
 * API client for the FormosaDeepAV backend.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

/* ── Types ─── */
export interface UploadResponse {
  file_hash: string;
  filename: string;
  cached: boolean;
  media_type: "video_audio" | "video_only" | "audio_only" | "unknown";
  applicable_modalities: ("visual" | "audio" | "sync")[];
  message: string;
}

export interface EngineResult {
  engine_name: string;
  modality: "visual" | "audio" | "sync";
  raw_score: number;
  verdict: "BONAFIDE" | "SPOOF" | "UNCERTAIN";
  evidence: Record<string, unknown> | null;
  processing_time_ms: number;
}

export interface ModalityScore {
  modality: "visual" | "audio" | "sync";
  engines: EngineResult[];
  weighted_score: number;
  verdict: "BONAFIDE" | "SPOOF" | "UNCERTAIN";
  contribution_ratio: number;
}

export interface DiagnosticReport {
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  overall_score: number;
  summary_zh: string;
  summary_en: string;
  dominant_modality: string | null;
}

export interface AnalysisResult {
  file_hash: string;
  filename: string;
  file_size: number;
  file_format: string;
  media_type: "video_audio" | "video_only" | "audio_only" | "unknown";
  applicable_modalities: ("visual" | "audio" | "sync")[];
  source_url: string | null;
  analyzed_at: string;
  modalities: ModalityScore[];
  overall_score: number;
  diagnostic: DiagnosticReport;
}

export interface CommunityStats {
  total_votes: number;
  real_votes: number;
  fake_votes: number;
  real_ratio: number;
  fake_ratio: number;
}

/* ── API Functions ─── */
export async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
  return res.json();
}

export async function lookupHash(hash: string): Promise<{ found: boolean; result?: AnalysisResult }> {
  const res = await fetch(`${API_BASE}/api/lookup/${hash}`);
  if (!res.ok) throw new Error(`Lookup failed: ${res.statusText}`);
  return res.json();
}

export async function runAnalysis(hash: string, force = false): Promise<AnalysisResult> {
  const res = await fetch(`${API_BASE}/api/analyze/${hash}?force=${force}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error(`Analysis failed: ${res.statusText}`);
  return res.json();
}

export async function getResults(hash: string): Promise<AnalysisResult> {
  const res = await fetch(`${API_BASE}/api/analyze/${hash}/results`);
  if (!res.ok) throw new Error(`Get results failed: ${res.statusText}`);
  return res.json();
}

export async function castVote(hash: string, vote: "REAL" | "FAKE"): Promise<CommunityStats> {
  const res = await fetch(`${API_BASE}/api/community/${hash}/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vote }),
  });
  if (!res.ok) throw new Error(`Vote failed: ${res.statusText}`);
  return res.json();
}

export async function getVoteStats(hash: string): Promise<CommunityStats> {
  const res = await fetch(`${API_BASE}/api/community/${hash}/stats`);
  if (!res.ok) throw new Error(`Get stats failed: ${res.statusText}`);
  return res.json();
}
