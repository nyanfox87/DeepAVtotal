"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  runAnalysis,
  castVote,
  getVoteStats,
  type AnalysisResult,
  type ModalityScore,
  type CommunityStats,
} from "@/lib/api";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

/* ── Color maps ─── */
const MODALITY_COLORS: Record<string, string> = {
  visual: "#f43f5e",
  audio: "#10b981",
  sync: "#8b5cf6",
};

const MODALITY_LABELS: Record<string, { zh: string; en: string; icon: string }> = {
  visual: { zh: "影像偽影", en: "Visual Artifacts", icon: "🖼️" },
  audio: { zh: "音訊特徵", en: "Audio Features", icon: "🎵" },
  sync: { zh: "影音同步性", en: "AV Synchrony", icon: "🔗" },
};

const MEDIA_TYPE_LABELS: Record<string, string> = {
  video_audio: "影音檔案（含影像與音訊）",
  video_only: "純影像檔案（無音訊）",
  audio_only: "純音訊檔案（無影像）",
  unknown: "未知格式",
};

export default function ResultsPage() {
  const params = useParams();
  const hash = params.hash as string;
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"detection" | "details" | "relations" | "community">("detection");
  const [communityStats, setCommunityStats] = useState<CommunityStats | null>(null);
  const [voting, setVoting] = useState(false);

  /* ── Load analysis on mount ─── */
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await runAnalysis(hash);
        setResult(data);
        const stats = await getVoteStats(hash);
        setCommunityStats(stats);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [hash]);

  /* ── Vote handler ─── */
  const handleVote = async (vote: "REAL" | "FAKE") => {
    setVoting(true);
    try {
      const stats = await castVote(hash, vote);
      setCommunityStats(stats);
    } catch {
      /* ignore */
    } finally {
      setVoting(false);
    }
  };

  /* ── Loading skeleton ─── */
  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-12 space-y-6">
        <div className="skeleton h-8 w-80" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 skeleton h-64" />
          <div className="skeleton h-64" />
        </div>
        <div className="skeleton h-96" />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="card p-8 text-center">
          <p className="text-red-400 text-lg">{error || "No results"}</p>
          <a href="/" className="mt-4 inline-block text-blue-400 hover:text-blue-300 text-sm">
            ← 回到首頁
          </a>
        </div>
      </div>
    );
  }

  const riskColor =
    result.diagnostic.risk_level === "LOW"
      ? "var(--safe)"
      : result.diagnostic.risk_level === "MEDIUM"
      ? "var(--warning)"
      : "var(--danger)";

  /* ── Pie chart data ─── */
  const pieData = result.modalities.map((m) => ({
    name: MODALITY_LABELS[m.modality]?.zh || m.modality,
    value: Math.round(m.weighted_score * 100),
    color: MODALITY_COLORS[m.modality] || "#6b7280",
  }));

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 space-y-6 animate-fade-in">
      {/* ════ TOP SECTION ════ */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── File info ─── */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-slate-200 mb-1">
                分析結果
              </h1>
              <p className="text-sm text-slate-500">
                {new Date(result.analyzed_at).toLocaleString("zh-TW")}
              </p>
            </div>
            <button
              id="reanalyze-btn"
              onClick={async () => {
                setLoading(true);
                const data = await runAnalysis(hash, true);
                setResult(data);
                setLoading(false);
              }}
              className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/10 transition-all"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              重新分析
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <InfoRow label="SHA-256" value={result.file_hash} mono />
            <InfoRow label="檔案名稱" value={result.filename} />
            <InfoRow label="格式" value={result.file_format.toUpperCase()} />
            <InfoRow label="媒體類型" value={MEDIA_TYPE_LABELS[result.media_type] || result.media_type} />
          </div>
        </div>

        {/* ── Summary Pie ─── */}
        <div className="card p-6 flex flex-col items-center justify-center">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
            綜合風險評分
          </h2>
          <div className="relative w-40 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    color: "var(--text-primary)",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center score */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold" style={{ color: riskColor }}>
                {Math.round(result.overall_score * 100)}%
              </span>
              <span className="text-xs text-slate-500">風險</span>
            </div>
          </div>
          <span
            className={`mt-3 rounded-full px-3 py-1 text-xs font-semibold ${
              result.diagnostic.risk_level === "LOW"
                ? "badge-safe"
                : result.diagnostic.risk_level === "MEDIUM"
                ? "badge-warning"
                : "badge-danger"
            }`}
          >
            {result.diagnostic.risk_level === "LOW"
              ? "低風險"
              : result.diagnostic.risk_level === "MEDIUM"
              ? "中度可疑"
              : "高度可疑"}
          </span>
        </div>
      </section>

      {/* ════ DIAGNOSTIC BANNER ════ */}
      <section
        className="card p-6 border-l-4"
        style={{ borderLeftColor: riskColor }}
      >
        <h3 className="text-sm font-semibold text-slate-400 mb-2">🩺 診斷分析</h3>
        <p className="text-slate-200 leading-relaxed">{result.diagnostic.summary_zh}</p>
        <p className="text-sm text-slate-500 mt-2">{result.diagnostic.summary_en}</p>
      </section>

      {/* ════ MODALITY STATUS ════ */}
      <section className="grid grid-cols-3 gap-4">
        {(["visual", "audio", "sync"] as const).map((mod) => {
          const data = result.modalities.find((m) => m.modality === mod);
          const applicable = result.applicable_modalities?.includes(mod) ?? true;
          if (!applicable) {
            return <ModalityNACard key={mod} modality={mod} />;
          }
          if (data) {
            return <ModalityStatusCard key={mod} data={data} />;
          }
          return <ModalityNACard key={mod} modality={mod} />;
        })}
      </section>

      {/* ════ TABS ════ */}
      <section className="card overflow-hidden">
        <div className="flex border-b border-white/5">
          {(
            [
              { id: "detection", label: "🔍 檢測結果" },
              { id: "details", label: "📋 詳細資訊" },
              { id: "relations", label: "🔗 關聯分析" },
              { id: "community", label: "👥 社群評價" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              id={`tab-${t.id}`}
              className={`tab ${activeTab === t.id ? "active" : ""}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "detection" && <DetectionTab modalities={result.modalities} />}
          {activeTab === "details" && <DetailsTab result={result} />}
          {activeTab === "relations" && <RelationsTab />}
          {activeTab === "community" && (
            <CommunityTab
              stats={communityStats}
              onVote={handleVote}
              voting={voting}
              aiScore={result.overall_score}
              riskLevel={result.diagnostic.risk_level}
            />
          )}
        </div>
      </section>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ══════════════════════════════════════════════════════════════════════ */

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <span className="text-xs text-slate-500 uppercase tracking-wider">{label}</span>
      <p className={`text-slate-300 text-sm mt-0.5 ${mono ? "font-mono text-xs break-all" : ""}`}>{value}</p>
    </div>
  );
}

function ModalityStatusCard({ data }: { data: ModalityScore }) {
  const meta = MODALITY_LABELS[data.modality];
  const isSpoof = data.verdict === "SPOOF";

  return (
    <div className={`card p-5 border ${isSpoof ? "border-red-500/30" : "border-emerald-500/30"}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{meta?.icon}</span>
          <span className="text-sm font-semibold text-slate-200">{meta?.zh}</span>
        </div>
        <span className={isSpoof ? "badge-danger" : "badge-safe"}>
          {isSpoof ? "SPOOF" : "BONAFIDE"}
        </span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold" style={{ color: MODALITY_COLORS[data.modality] }}>
          {Math.round(data.weighted_score * 100)}
        </span>
        <span className="text-sm text-slate-500 mb-1">/ 100</span>
      </div>
      <div className="mt-3 progress-bar">
        <div
          className="progress-bar-fill"
          style={{
            width: `${Math.round(data.weighted_score * 100)}%`,
            background: MODALITY_COLORS[data.modality],
          }}
        />
      </div>
    </div>
  );
}

function ModalityNACard({ modality }: { modality: string }) {
  const meta = MODALITY_LABELS[modality];
  return (
    <div className="card p-5 border border-white/5 opacity-50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{meta?.icon}</span>
          <span className="text-sm font-semibold text-slate-200">{meta?.zh}</span>
        </div>
        <span className="rounded-full px-3 py-1 text-xs font-semibold bg-white/5 text-slate-500">
          N/A
        </span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold text-slate-600">—</span>
      </div>
      <p className="text-xs text-slate-600 mt-3">
        檔案不含{modality === "visual" ? "影像" : modality === "audio" ? "音訊" : "影音"}串流，此模態不適用
      </p>
    </div>
  );
}

/* ── Tab: Detection ─── */
function DetectionTab({ modalities }: { modalities: ModalityScore[] }) {
  return (
    <div className="space-y-8">
      {modalities.map((m) => {
        const meta = MODALITY_LABELS[m.modality];
        return (
          <div key={m.modality}>
            <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2 mb-4">
              <span>{meta?.icon}</span>
              <span>{meta?.zh}</span>
              <span className="text-sm text-slate-500">({meta?.en})</span>
              <span className="ml-auto text-sm font-normal text-slate-400">
                模態風險分 S<sub>m</sub> = {Math.round(m.weighted_score * 100)}%
              </span>
            </h3>
            <div className="space-y-3">
              {m.engines.map((eng) => (
                <EngineCard key={eng.engine_name} engine={eng} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EngineCard({ engine }: { engine: { engine_name: string; raw_score: number; verdict: string; processing_time_ms: number; evidence: Record<string, unknown> | null } }) {
  const [expanded, setExpanded] = useState(false);
  const isSpoof = engine.verdict === "SPOOF";

  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/5 overflow-hidden">
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <div className={`h-2 w-2 rounded-full ${isSpoof ? "bg-red-400" : "bg-emerald-400"}`} />
          <span className="text-sm font-medium text-slate-200">{engine.engine_name}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className={`text-lg font-bold ${isSpoof ? "text-red-400" : "text-emerald-400"}`}>
              {Math.round(engine.raw_score * 100)}%
            </span>
            <span className="text-xs text-slate-500 ml-2">{engine.processing_time_ms.toFixed(0)}ms</span>
          </div>
          <span className={isSpoof ? "badge-danger" : "badge-safe"}>
            {engine.verdict}
          </span>
          <svg
            className={`h-4 w-4 text-slate-500 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {expanded && engine.evidence && (
        <div className="px-5 pb-4 border-t border-white/5 pt-4">
          <EvidencePanel evidence={engine.evidence} />
        </div>
      )}
    </div>
  );
}

function EvidencePanel({ evidence }: { evidence: Record<string, unknown> }) {
  const type = evidence.type as string;

  if (type === "gradcam") {
    const heatmap = evidence.heatmap as number[][];
    return (
      <div>
        <p className="text-sm text-slate-400 mb-3">{evidence.description as string}</p>
        <div className="inline-block rounded-lg overflow-hidden border border-white/10">
          <div className="grid" style={{ gridTemplateColumns: `repeat(${heatmap[0]?.length || 8}, 1fr)` }}>
            {heatmap.flat().map((val, i) => {
              const r = Math.round(val * 255);
              const b = Math.round((1 - val) * 255);
              return (
                <div
                  key={i}
                  className="w-6 h-6"
                  style={{ backgroundColor: `rgb(${r}, ${Math.round(50 + (1-val) * 100)}, ${b})` }}
                  title={`${(val * 100).toFixed(1)}%`}
                />
              );
            })}
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-2">分析幀數: {evidence.frames_analyzed as number}</p>
      </div>
    );
  }

  if (type === "spectrogram") {
    const segments = evidence.anomaly_segments as { start_s: number; end_s: number; severity: number }[];
    return (
      <div>
        <p className="text-sm text-slate-400 mb-3">{evidence.description as string}</p>
        {segments.length > 0 ? (
          <div className="space-y-2">
            {segments.map((seg, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 flex-1 rounded bg-white/5 relative overflow-hidden">
                  <div
                    className="absolute inset-y-0 rounded"
                    style={{
                      left: `${(seg.start_s / 30) * 100}%`,
                      width: `${((seg.end_s - seg.start_s) / 30) * 100}%`,
                      backgroundColor: `rgba(239, 68, 68, ${seg.severity})`,
                    }}
                  />
                </div>
                <span className="text-xs text-slate-500 w-28">
                  {seg.start_s.toFixed(1)}s – {seg.end_s.toFixed(1)}s ({(seg.severity * 100).toFixed(0)}%)
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-emerald-400">未偵測到異常片段</p>
        )}
      </div>
    );
  }

  if (type === "sync_timeline") {
    const curve = evidence.offset_curve as { time_s: number; offset_ms: number }[];
    const maxOffset = Math.max(...curve.map((c) => Math.abs(c.offset_ms)), 1);
    return (
      <div>
        <p className="text-sm text-slate-400 mb-3">{evidence.description as string}</p>
        <div className="h-24 flex items-end gap-px rounded-lg overflow-hidden bg-white/5 p-2">
          {curve.map((pt, i) => {
            const normalized = Math.abs(pt.offset_ms) / maxOffset;
            const isHigh = normalized > 0.6;
            return (
              <div
                key={i}
                className="flex-1 rounded-t transition-all"
                style={{
                  height: `${Math.max(normalized * 100, 4)}%`,
                  backgroundColor: isHigh ? "rgba(239, 68, 68, 0.7)" : "rgba(139, 92, 246, 0.5)",
                }}
                title={`${pt.time_s}s: ${pt.offset_ms}ms offset`}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>0s</span>
          <span>平均偏移: {(evidence.average_offset_ms as number).toFixed(1)}ms</span>
          <span>30s</span>
        </div>
      </div>
    );
  }

  return <pre className="text-xs text-slate-400 overflow-auto">{JSON.stringify(evidence, null, 2)}</pre>;
}

/* ── Tab: Details ─── */
function DetailsTab({ result }: { result: AnalysisResult }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-200">📋 檔案技術規格</h3>
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "SHA-256 雜湊", value: result.file_hash },
          { label: "檔案名稱", value: result.filename },
          { label: "檔案格式", value: result.file_format.toUpperCase() },
          { label: "媒體類型", value: MEDIA_TYPE_LABELS[result.media_type] || result.media_type },
          { label: "檢測模態", value: (result.applicable_modalities || []).map(m => MODALITY_LABELS[m]?.zh || m).join("、") || "全部" },
          { label: "分析時間", value: new Date(result.analyzed_at).toLocaleString("zh-TW") },
          { label: "整體風險分", value: `${Math.round(result.overall_score * 100)}%` },
          { label: "風險等級", value: result.diagnostic.risk_level },
        ].map((item) => (
          <div key={item.label} className="rounded-lg bg-white/[0.02] border border-white/5 p-4">
            <span className="text-xs text-slate-500 uppercase tracking-wider">{item.label}</span>
            <p className="text-sm text-slate-300 mt-1 font-mono break-all">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Tab: Relations ─── */
function RelationsTab() {
  return (
    <div className="text-center py-16">
      <div className="text-4xl mb-4">🔍</div>
      <h3 className="text-lg font-semibold text-slate-200 mb-2">關聯分析</h3>
      <p className="text-slate-500 max-w-md mx-auto">
        此功能需要向量資料庫（如 Milvus / Pinecone）支援。
        系統將透過音訊指紋與視覺特徵向量，檢索具有高餘弦相似度的歷史樣本。
      </p>
      <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2 text-sm text-slate-400">
        <span className="h-2 w-2 rounded-full bg-amber-400" />
        Coming Soon
      </div>
    </div>
  );
}

/* ── Tab: Community ─── */
function CommunityTab({
  stats,
  onVote,
  voting,
  aiScore,
  riskLevel,
}: {
  stats: CommunityStats | null;
  onVote: (vote: "REAL" | "FAKE") => void;
  voting: boolean;
  aiScore: number;
  riskLevel: string;
}) {
  return (
    <div className="space-y-8">
      {/* ── Dual track comparison ─── */}
      <div className="grid grid-cols-2 gap-6">
        {/* AI score */}
        <div className="card p-6 text-center">
          <h4 className="text-sm font-semibold text-slate-400 mb-4">🤖 模型預測</h4>
          <div className="text-4xl font-bold mb-2" style={{
            color: riskLevel === "LOW" ? "var(--safe)" : riskLevel === "MEDIUM" ? "var(--warning)" : "var(--danger)",
          }}>
            {Math.round(aiScore * 100)}%
          </div>
          <span className={
            riskLevel === "LOW" ? "badge-safe" : riskLevel === "MEDIUM" ? "badge-warning" : "badge-danger"
          }>
            {riskLevel === "LOW" ? "低風險" : riskLevel === "MEDIUM" ? "中度可疑" : "高度可疑"}
          </span>
        </div>

        {/* Community score */}
        <div className="card p-6 text-center">
          <h4 className="text-sm font-semibold text-slate-400 mb-4">👥 社群評價</h4>
          {stats && stats.total_votes > 0 ? (
            <>
              <div className="flex justify-center gap-6 mb-4">
                <div>
                  <div className="text-3xl font-bold text-emerald-400">{stats.real_votes}</div>
                  <div className="text-xs text-slate-500">真實</div>
                </div>
                <div className="w-px bg-white/10" />
                <div>
                  <div className="text-3xl font-bold text-red-400">{stats.fake_votes}</div>
                  <div className="text-xs text-slate-500">偽造</div>
                </div>
              </div>
              <div className="h-3 rounded-full bg-white/5 overflow-hidden flex">
                <div className="bg-emerald-500 transition-all" style={{ width: `${stats.real_ratio * 100}%` }} />
                <div className="bg-red-500 transition-all" style={{ width: `${stats.fake_ratio * 100}%` }} />
              </div>
              <p className="text-xs text-slate-500 mt-2">共 {stats.total_votes} 票</p>
            </>
          ) : (
            <p className="text-slate-500 text-sm">尚無投票</p>
          )}
        </div>
      </div>

      {/* ── Voting  ─── */}
      <div className="card p-6 text-center">
        <h4 className="text-sm font-semibold text-slate-400 mb-4">投下您的判斷</h4>
        <div className="flex justify-center gap-4">
          <button
            id="vote-real-btn"
            onClick={() => onVote("REAL")}
            disabled={voting}
            className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-8 py-3 text-emerald-400 font-medium hover:bg-emerald-500/20 transition-all disabled:opacity-50"
          >
            👍 真實 (REAL)
          </button>
          <button
            id="vote-fake-btn"
            onClick={() => onVote("FAKE")}
            disabled={voting}
            className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 px-8 py-3 text-red-400 font-medium hover:bg-red-500/20 transition-all disabled:opacity-50"
          >
            👎 偽造 (FAKE)
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ─── */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "N/A";
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}
