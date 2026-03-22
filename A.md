專案名稱：FormosaDeepAV - 複合式深偽整合檢測平台
1. 系統核心定位

本平台旨在建立一個類 VirusTotal 的多模態檢測中心。其核心貢獻不在於單一演算法的突破，而在於標準化的檢測工作流與模組化擴充架構。系統支持影像、音訊、同步性三維度檢測，並結合 AI 自動判讀與社群人工驗證。
2. 功能需求與介面設計
2.1 入口點 (Entry Point) - 多元上傳與快取機制

    檔案上傳/擷取：

        使用者可上傳本地影音檔。

        客戶端編輯器：整合輕量化剪輯工具（如 ffmpeg.wasm），允許使用者上傳前預覽、選擇並切割片段（限制 30 秒內）。

    連結爬取：

        支援解析 Facebook, LINE, YouTube 影片連結。

        後端自動擷取該連結內容，並同樣提供片段切割功能。

    Hash 檢索：

        首頁提供 SHA-256 搜尋框。若該檔案曾被檢測過，直接跳轉結果頁面，減少運算資源浪費。

2.2 儀表板與基礎資訊 (Top Section)

    左上/中上區域：

        顯示 SHA-256、原始檔名、來源 URL、影片名稱、格式（MPEG/WebM等）、檔案大小。

        上次分析日期與 「重新分析 (Re-analyze)」 按鈕。

    右上區域 (Summary Pie Chart)：

        圓餅圖顯示三大模態（影像、音訊、同步性）的加權總評分。

        紅色區塊代表高風險（SPOOF），綠色代表低風險（BONAFIDE）。

2.3 五大核心功能分頁 (Main Tabs)

    Tab 1: 檢測結果 (Detection)

        進度追蹤：以模組化分類顯示（影像偽影、音訊真偽、同步性檢測）。每個模組下可掛載多個 API 引擎。

        Details 彈窗：若引擎支援視覺化，點擊後彈出：

            影像：Grad-CAM 熱力圖（標記偽造區域）。

            音訊：時頻圖（標記合成痕跡）。

            同步性：時間軸波形圖（標記影音不同步區間）。

        頂層統整：彙整所有影像引擎的熱力圖權重，產生一張「共識熱力圖」。

    Tab 2: 詳細資訊 (Details)

        展示檔案的完整二進制資訊、Metadata (Exif, Codec info)、位元率、採樣率等技術規格。

    Tab 3: 關聯分析 (Relations)

        顯示潛在關聯影片。

        關聯邏輯：檔案簽名相似度、K-means 高維度特徵映射、來自相同 YouTube 頻道的影片。

    Tab 4: 社群評價 (Community)

        人工評分系統：開源社群使用者可針對影片進行二元投票（贊同/否決）。

        雙軌評分比較：頁面同時並列「模型預測分數」與「社群真實反饋」，供研究者對比。

3. 技術架構建議
前端 (Next.js - App Router)

    State Management: 使用 TanStack Query (React Query) 處理非同步的 API 推論狀態。

    UI Library: Tailwind CSS + Shadcn UI（模仿 VirusTotal 的簡潔與專業感）。

    Video Processing: 使用 video.js 或原始 HTML5 結合客戶端切割邏輯。

後端推論引擎 (FastAPI - Python)

為了實現你要求的「模組化擴充性」，後端應採用以下架構：
Python

# FastAPI 模組化設計示意
from fastapi import FastAPI

app = FastAPI()

@app.get("/analyze/visual")
async def visual_module(file_hash: str):
    # 可在此處封裝 LipForensics, DeepfakeHop 等 API
    return {"engine": "LipForensics", "score": 0.85, "visual_data": "base64_heatmap"}

@app.get("/analyze/audio")
async def audio_module(file_hash: str):
    # 封裝 AASIST, Conformer 等 API
    return {"engine": "AASIST", "score": 0.12, "segments": [2, 5, 12]}

@app.get("/analyze/sync")
async def sync_module(file_hash: str):
    # 封裝 SyncNet 等 API
    return {"engine": "SyncNet", "offset_ms": 150, "score": 0.7}

4. 預期貢獻：擴充性平台

    標準化 API 介面：未來任何新的 SOTA 模型（如 Wav2Lip 防禦）只需符合格式，即可在數分鐘內整合進平台。
