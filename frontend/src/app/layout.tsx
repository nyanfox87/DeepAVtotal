import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/lib/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "FormosaDeepAV — 多模態深偽整合檢測平台",
  description:
    "A VirusTotal-style multi-modal deepfake detection platform integrating visual, audio, and synchrony analysis engines.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Providers>
          {/* ── Navigation ─── */}
          <header className="glass sticky top-0 z-50 border-b border-white/5">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
              {/* Logo */}
              <a href="/" className="flex items-center gap-3 group">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
                  F
                </div>
                <span className="text-lg font-bold tracking-tight">
                  <span className="gradient-text">Formosa</span>
                  <span className="text-slate-300">DeepAV</span>
                </span>
              </a>

              {/* Hash Search (in nav) */}
              <div className="hidden sm:flex items-center gap-3">
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    id="nav-hash-search"
                    type="text"
                    placeholder="Search SHA-256 hash..."
                    className="h-10 w-80 rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
                  />
                </div>
              </div>

              {/* Status indicator */}
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>6 engines online</span>
              </div>
            </div>
          </header>

          {/* ── Main ─── */}
          <main className="flex-1">{children}</main>

          {/* ── Footer ─── */}
          <footer className="border-t border-white/5 py-6 text-center text-xs text-slate-500">
            <p>FormosaDeepAV © 2026 — Multi-Modal Deepfake Detection Platform</p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
