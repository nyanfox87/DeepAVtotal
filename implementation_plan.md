# FormosaDeepAV — Multi-Modal Deepfake Detection Platform

A VirusTotal-style web platform for multi-modal deepfake detection, integrating visual artifact, audio authenticity, and audio-visual synchrony engines with score fusion, visual evidence, and community voting.

## User Review Required

> [!IMPORTANT]
> **Technology Stack Confirmation**: The documents specify **Next.js (App Router) + Tailwind CSS + Shadcn UI** for the frontend and **FastAPI (Python)** for the backend. I will follow this stack. Please confirm or adjust.

> [!IMPORTANT]
> **Scope of This Plan**: This plan focuses on building the **web application shell** — the frontend UI, backend API skeleton, mock detection engines, score fusion, and visualizations. Actual ML model integration (LipForensics, AASIST, SyncNet, etc.) requires trained model weights and is outside the scope of this initial build. The backend will expose the correct API contracts with mock/simulated scores so the full pipeline is demonstrable end-to-end.

> [!WARNING]
> **ffmpeg.wasm**: Client-side video trimming with `ffmpeg.wasm` is a heavy dependency (~30MB WASM). I will integrate it behind a lazy-load boundary. Confirm if this is acceptable, or if you'd prefer server-side trimming initially.

---

## Proposed Changes

### 1. Project Structure

```
DeepfakeTotal/
├── frontend/               # Next.js 14+ (App Router)
│   ├── app/
│   │   ├── layout.tsx      # Root layout with global nav
│   │   ├── page.tsx        # Landing / Upload page
│   │   ├── results/
│   │   │   └── [hash]/
│   │   │       └── page.tsx  # Results dashboard
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/             # Shadcn UI components
│   │   ├── upload/         # Upload, trimmer, link parser
│   │   ├── dashboard/      # Metadata bar, pie chart, tabs
│   │   ├── detection/      # Engine list, score cards
│   │   ├── visualizations/ # Grad-CAM, spectrogram, timeline
│   │   └── community/      # Voting UI
│   ├── lib/
│   │   ├── api.ts          # API client (fetch wrappers)
│   │   └── utils.ts
│   ├── package.json
│   └── tailwind.config.ts
│
├── backend/                # FastAPI (Python)
│   ├── main.py             # App entry, CORS, router mounts
│   ├── routers/
│   │   ├── upload.py       # File upload + SHA-256
│   │   ├── analysis.py     # Detection dispatcher
│   │   └── community.py    # Voting endpoints
│   ├── engines/
│   │   ├── base.py         # Abstract engine interface
│   │   ├── visual.py       # Visual detection (mock)
│   │   ├── audio.py        # Audio detection (mock)
│   │   └── sync.py         # Sync detection (mock)
│   ├── services/
│   │   ├── fusion.py       # Score fusion (Eq. 8-11)
│   │   └── diagnostics.py  # Report text generation
│   ├── models/
│   │   └── schemas.py      # Pydantic models
│   ├── database.py         # SQLite setup + cache
│   └── requirements.txt
│
├── A.md
├── B.md
└── proposal.md
```

---

### 2. Frontend — Next.js

#### [NEW] [package.json](file:///c:/Users/D1248959/Documents/DeepfakeTotal/frontend/package.json)
Initialize via `npx -y create-next-app@latest ./` inside `frontend/`. Dependencies: `tailwindcss`, `@shadcn/ui`, `@tanstack/react-query`, `recharts` (for pie chart), `@ffmpeg/ffmpeg` (lazy), `crypto-js` (SHA-256 client-side).

#### [NEW] [layout.tsx](file:///c:/Users/D1248959/Documents/DeepfakeTotal/frontend/app/layout.tsx)
- Dark-mode root layout
- Global nav bar with logo "FormosaDeepAV" + hash search input
- TanStack QueryProvider wrapper

#### [NEW] [page.tsx](file:///c:/Users/D1248959/Documents/DeepfakeTotal/frontend/app/page.tsx) — Landing / Upload
- Hero section with title & tagline
- **File Upload**: Drag-and-drop zone, computes SHA-256, shows file preview
- **Hash Search**: Input box → calls `GET /api/lookup/{hash}` → redirect to results if found
- **URL Parser**: Input for FB/YT/LINE links → backend proxy grabs video
- **Video Trimmer**: ffmpeg.wasm-powered, 30s limit, preview player
- After upload → redirect to `/results/[hash]`

#### [NEW] [results/[hash]/page.tsx](file:///c:/Users/D1248959/Documents/DeepfakeTotal/frontend/app/results/%5Bhash%5D/page.tsx) — Results Dashboard
- **Top Section**: File metadata (SHA-256, filename, URL, format, size, last analysis date) + "Re-analyze" button
- **Summary Pie Chart**: `recharts` PieChart showing 3-modality weighted scores (Visual / Audio / Sync), red=SPOOF, green=BONAFIDE
- **Diagnostic Analysis Banner**: Overall risk score `S_total` + auto-generated diagnostic text
- **Modality Status Bar**: 3 cards (Visual / Audio / Sync) with BONAFIDE/SPOOF status badges
- **Tabs** (Shadcn Tabs component):
  | Tab | Content |
  |-----|---------|
  | Detection | Engine list per modality, per-engine score, expandable details with Grad-CAM / spectrogram / timeline |
  | Details | File binary info, Exif metadata, codec, bitrate, sample rate |
  | Relations | Similar video cards (placeholder, from vector DB) |
  | Community | Dual-track voting (AI score vs. community votes), binary vote buttons |

---

### 3. Frontend — Visualization Components

#### [NEW] [GradCAMOverlay.tsx](file:///c:/Users/D1248959/Documents/DeepfakeTotal/frontend/components/visualizations/GradCAMOverlay.tsx)
Canvas overlay rendering heatmap data on top of a video frame. Color scale: blue (safe) → red (suspicious).

#### [NEW] [AudioSpectrogram.tsx](file:///c:/Users/D1248959/Documents/DeepfakeTotal/frontend/components/visualizations/AudioSpectrogram.tsx)
Renders mel-spectrogram with highlighted anomaly segments returned by audio engines.

#### [NEW] [SyncTimeline.tsx](file:///c:/Users/D1248959/Documents/DeepfakeTotal/frontend/components/visualizations/SyncTimeline.tsx)
A time-axis chart showing lip-audio offset curve. Highlights desync windows.

#### [NEW] [ConsensusHeatmap.tsx](file:///c:/Users/D1248959/Documents/DeepfakeTotal/frontend/components/visualizations/ConsensusHeatmap.tsx)
Aggregated weighted heatmap from all visual engines.

---

### 4. Backend — FastAPI

#### [NEW] [main.py](file:///c:/Users/D1248959/Documents/DeepfakeTotal/backend/main.py)
- CORS middleware (allow frontend origin)
- Mount routers: `/api/upload`, `/api/analyze`, `/api/community`
- Startup event: init DB

#### [NEW] [routers/upload.py](file:///c:/Users/D1248959/Documents/DeepfakeTotal/backend/routers/upload.py)
- `POST /api/upload` — Receive file, compute SHA-256, store file, check cache → return `{hash, cached: bool}`
- `GET /api/lookup/{hash}` — Check if hash exists in DB → return cached result or 404

#### [NEW] [routers/analysis.py](file:///c:/Users/D1248959/Documents/DeepfakeTotal/backend/routers/analysis.py)
- `POST /api/analyze/{hash}` — Trigger async parallel detection across all 3 modalities
- `GET /api/analyze/{hash}/status` — Return progress + partial results
- `GET /api/analyze/{hash}/results` — Return full results

#### [NEW] [engines/base.py](file:///c:/Users/D1248959/Documents/DeepfakeTotal/backend/engines/base.py)
```python
class DetectionEngine(ABC):
    name: str
    modality: str  # "visual" | "audio" | "sync"

    @abstractmethod
    async def analyze(self, file_path: str) -> EngineResult:
        """Return score in [0,1] + visual evidence data"""
```

#### [NEW] [engines/visual.py](file:///c:/Users/D1248959/Documents/DeepfakeTotal/backend/engines/visual.py)
Mock implementations: `LipForensicsEngine`, `DeepfakeHopEngine` — return simulated scores + Grad-CAM heatmap data.

#### [NEW] [engines/audio.py](file:///c:/Users/D1248959/Documents/DeepfakeTotal/backend/engines/audio.py)
Mock: `AASISTEngine`, `ConformerEngine` — return scores + anomaly segment indices.

#### [NEW] [engines/sync.py](file:///c:/Users/D1248959/Documents/DeepfakeTotal/backend/engines/sync.py)
Mock: `SyncNetEngine`, `LipFDEngine` — return sync probability + offset curve data.

#### [NEW] [services/fusion.py](file:///c:/Users/D1248959/Documents/DeepfakeTotal/backend/services/fusion.py)
Implements the scoring formulas from the proposal:
- Per-engine normalization: `s_{m,k} = Norm(x_{m,k})` → [0,1]
- Per-modality weighted average: `S_m = Σ w_{m,k} · s_{m,k}`
- Cross-modality total: `S_total = W_A·S_A + W_B·S_B + W_C·S_C`
- Contribution ratios: `r_m = (W_m · S_m) / (S_total + ε)`

#### [NEW] [services/diagnostics.py](file:///c:/Users/D1248959/Documents/DeepfakeTotal/backend/services/diagnostics.py)
Rule-based diagnostic text generator:
- Low / Medium / High risk tiers based on `S_total` thresholds
- Dominant modality identification via `r_m` values
- Generates human-readable Chinese/English diagnostic summary

#### [NEW] [models/schemas.py](file:///c:/Users/D1248959/Documents/DeepfakeTotal/backend/models/schemas.py)
Pydantic models:
- `UploadResponse`, `AnalysisResult`, `EngineResult`, `ModalityScore`, `DiagnosticReport`, `CommunityVote`

#### [NEW] [database.py](file:///c:/Users/D1248959/Documents/DeepfakeTotal/backend/database.py)
SQLite with tables: `files` (hash, filename, url, format, size, created_at), `results` (hash, engine_name, modality, score, evidence_json), `votes` (hash, user_id, vote).

---

### 5. API Engine Registration (Scalability)

The backend will use a **registry pattern** — engines self-register at startup:

```python
# config.yaml
engines:
  visual:
    - name: LipForensics
      weight: 0.6
    - name: DeepfakeHop
      weight: 0.4
  audio:
    - name: AASIST
      weight: 0.5
    - name: Conformer
      weight: 0.5
  sync:
    - name: SyncNet
      weight: 0.7
    - name: LipFD
      weight: 0.3
```

Adding a new engine = add a Python class + config entry. No frontend changes needed — the UI dynamically renders all registered engines.

---

## Verification Plan

### Automated Tests

1. **Backend unit tests** (pytest):
   ```bash
   cd backend
   pip install -r requirements.txt
   pytest tests/ -v
   ```
   - Test score fusion math (Eq. 8–11) with known inputs/outputs
   - Test hash lookup cache hit / miss
   - Test engine registry loads correctly
   - Test diagnostic text generation for edge cases

2. **Frontend build check**:
   ```bash
   cd frontend
   npm run build
   ```
   - Ensures no TypeScript / import errors

### Browser-Based Verification

3. **End-to-end flow** (via browser tool):
   - Start both frontend (`npm run dev`) and backend (`uvicorn main:app`)
   - Navigate to landing page → verify upload UI renders
   - Upload a test video → verify redirect to results page
   - Verify pie chart, engine list, tabs all render correctly
   - Click through all 4 tabs
   - Test hash search with existing hash → verify cache redirect

### Manual Verification

4. **User tests** (ask user to):
   - Confirm overall UI aesthetic matches VirusTotal-like professional feel
   - Verify the video trimmer works in their browser
   - Confirm Chinese text / diagnostic messages display correctly
