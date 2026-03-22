1. 系統邏輯架構圖

系統採取 解耦 (Decoupling) 設計，前端負責使用者互動與初步處理，後端則扮演「分析調度員」的角色。

    Entry Layer (前端)：處理雜湊比對、影片剪輯與連結解析。

    Orchestration Layer (中台)：管理檢測隊列（Queue）、整合不同模型的輸出分數。

    Engine Layer (模組化引擎)：獨立的 API 服務，分為影像、音訊、同步性三大類別。

2. 前端架構設計 (Next.js)
A. 多元輸入模組 (Input Manager)

    Hash Checker: 使用者輸入 SHA-256 後，先請求後端 API 查詢資料庫。若有紀錄，直接跳轉結果頁面。

    Client-side Processor:

        整合 ffmpeg.wasm 實現在瀏覽器端進行影片裁切（限制 30 秒）。

        計算檔案雜湊值，確保上傳前已完成身份標記。

    Link Parser: 解析外部 URL (FB/YT/Line)，並透過後端 Proxy 抓取影音流供使用者選取片段。

B. 多頁面狀態管理 (Page Structure)

    Detection Page (核心)：

        模組化清單：動態渲染影像、音訊、同步性三大區塊。

        權重融合組件：彙整各模型分數，計算出該模態的總風險分 Sm​。

        可視化插件：支援 Grad-CAM 熱力圖、音訊頻譜、時間軸波形。

    Details Page：展示檔案 Binary 特徵與 Metadata。

    Relations Page：

        透過向量資料庫（如 Milvus/Pinecone）比對 K-means 映射後的特徵，找出相似影片。

    Community Page：

        雙軌投票系統：展示 AI 診斷與人工社群投票的對比差異。

3. 後端與模型引擎架構 (FastAPI + PyTorch)
A. 模組化調度器 (The Dispatcher)

後端不直接運行模型，而是透過 平行檢測架構 觸發各個獨立的偵測引擎：

    影音分離器 (Preprocessor)：接收 30 秒片段後，自動分離為純影像幀序列（用於模態 A）與純音訊軌（用於模態 B）。

    並行請求處理：使用 asyncio 同時向不同的引擎端點發送請求。

B. 三大偵測模組分類 (Modular Engines)

每個模組都是一個獨立的容器或 API 服務：
模組分類	涵蓋模型範例	輸出標準格式
影像偽影 (Visual)	LipForensics, DeepfakeHop	偽造分數 (0~1) + Grad-CAM 熱力圖數據
音訊真偽 (Audio)	AASIST, Conformer	偽造分數 (0~1) + 異常頻譜片段索引
影音同步 (Sync)	SyncNet, LipFD	同步機率 + 時間軸位移曲線
4. 數據流與評分機制
A. 評分融合演算法 (Fusion Logic)

系統會將不同模型的原始分數統一標準化為「偽造風險分數」 sm,k​∈[0,1]。

    模態總分：各模型加權平均 Sm​=∑wm,k​⋅sm,k​。

    整體風險：三模態加權總和 Stotal​=WA​SA​+WB​SB​+WC​SC​。

B. 擴充性保證 (Scalability)

    API 註冊機制：新模型開發完成後，只需在後端配置文件中加入新的 API Endpoint，系統前端就會自動在「檢測列表」中新增該引擎的顯示欄位，無需重新撰寫 UI 邏輯。

5. 關聯性與社群架構

    關聯分析 (Relations)：利用影片的音訊指紋（Audio Fingerprinting）或視覺特徵向量，在資料庫中檢索具有高度餘弦相似度（Cosine Similarity）的歷史樣本。

    社群權威度：針對 Community 分頁，可引入使用者信用分，權重較高的人工投票將更顯著地影響「社群評分」區塊。