"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { uploadFile, lookupHash } from "@/lib/api";

export default function HomePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [hashInput, setHashInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  /* ── Upload handler ─── */
  const handleUpload = useCallback(
    async (file: File) => {
      setError(null);
      setUploading(true);
      setUploadProgress(20);

      try {
        setUploadProgress(50);
        const res = await uploadFile(file);
        setUploadProgress(100);

        // Redirect to results page
        setTimeout(() => router.push(`/results/${res.file_hash}`), 300);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Upload failed");
        setUploading(false);
        setUploadProgress(0);
      }
    },
    [router]
  );

  /* ── Hash search ─── */
  const handleHashSearch = async () => {
    if (!hashInput.trim()) return;
    setError(null);
    try {
      const res = await lookupHash(hashInput.trim());
      if (res.found) {
        router.push(`/results/${hashInput.trim()}`);
      } else {
        setError("該 Hash 尚未被分析，請先上傳檔案。");
      }
    } catch {
      setError("搜尋失敗，請確認 Hash 格式。");
    }
  };

  /* ── Drag & Drop ─── */
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      {/* ── Hero ─── */}
      <section className="text-center mb-16 animate-fade-in">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 text-sm text-blue-400 mb-6">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          多模態深偽整合檢測平台
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-6">
          <span className="gradient-text">FormosaDeepAV</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-slate-400 leading-relaxed">
          結合<span className="text-slate-200 font-medium">影像偽影</span>、
          <span className="text-slate-200 font-medium">音訊特徵</span>與
          <span className="text-slate-200 font-medium">影音同步性</span>三維度平行檢測，
          提供即時、量化且透明的深偽防禦方案。
        </p>
      </section>

      {/* ── Upload Zone ─── */}
      <section className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <div
          id="upload-drop-zone"
          className={`drop-zone ${dragActive ? "active" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*,audio/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
            }}
          />

          {uploading ? (
            <div className="space-y-4">
              <div className="mx-auto h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <svg className="h-6 w-6 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
              <p className="text-slate-300 font-medium">上傳與處理中…</p>
              <div className="mx-auto w-64 progress-bar">
                <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          ) : (
            <>
              <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/20 flex items-center justify-center">
                <svg className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <p className="text-slate-300 text-lg font-medium mb-1">
                拖放影音檔案至此，或點擊上傳
              </p>
              <p className="text-slate-500 text-sm">
                支援 MP4、WebM、AVI、WAV、MP3 等格式（建議 30 秒內片段）
              </p>
            </>
          )}
        </div>
      </section>

      {/* ── Hash Search ─── */}
      <section className="mt-10 animate-slide-up" style={{ animationDelay: "0.2s" }}>
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
            SHA-256 Hash 搜尋
          </h2>
          <div className="flex gap-3">
            <input
              id="hash-search-input"
              type="text"
              value={hashInput}
              onChange={(e) => setHashInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleHashSearch()}
              placeholder="輸入檔案 SHA-256 Hash 以查詢歷史分析結果…"
              className="flex-1 h-12 rounded-xl bg-white/5 border border-white/10 px-4 text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
            />
            <button
              id="hash-search-btn"
              onClick={handleHashSearch}
              className="h-12 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium text-sm hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 active:scale-[0.98]"
            >
              搜尋
            </button>
          </div>
        </div>
      </section>

      {/* ── Feature Cards ─── */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 animate-slide-up" style={{ animationDelay: "0.3s" }}>
        {[
          {
            icon: "🖼️",
            title: "影像偽影檢測",
            desc: "LipForensics、DeepfakeHop 等引擎偵測視覺偽造痕跡",
            color: "from-rose-500/10 to-pink-500/10",
            border: "border-rose-500/20",
          },
          {
            icon: "🎵",
            title: "音訊真偽檢測",
            desc: "AASIST、Conformer 分析語音合成與聲學特徵",
            color: "from-emerald-500/10 to-teal-500/10",
            border: "border-emerald-500/20",
          },
          {
            icon: "🔗",
            title: "影音同步性檢測",
            desc: "SyncNet、LipFD 評估唇語與音訊的時序對齊",
            color: "from-violet-500/10 to-purple-500/10",
            border: "border-violet-500/20",
          },
        ].map((card) => (
          <div
            key={card.title}
            className={`card p-6 bg-gradient-to-br ${card.color} border ${card.border}`}
          >
            <div className="text-3xl mb-3">{card.icon}</div>
            <h3 className="text-base font-semibold text-slate-200 mb-1">{card.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </section>

      {/* ── Error ─── */}
      {error && (
        <div className="mt-6 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
