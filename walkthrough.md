# FormosaDeepAV — Build Walkthrough

## What Was Built

A full-stack **multi-modal deepfake detection platform** modeled after VirusTotal, with:

### Backend (FastAPI + Python)
| Component | Files |
|-----------|-------|
| **API Entry** | [main.py](file:///c:/Users/D1248959/Documents/DeepfakeTotal/backend/main.py) — CORS, router mounts, DB init |
| **Upload Router** | [upload.py](file:///c:/Users/D1248959/Documents/DeepfakeTotal/backend/routers/upload.py) — SHA-256 hashing + cache lookup |
| **Analysis Router** | [analysis.py](file:///c:/Users/D1248959/Documents/DeepfakeTotal/backend/routers/analysis.py) — Async parallel detection dispatch |
| **Community Router** | [community.py](file:///c:/Users/D1248959/Documents/DeepfakeTotal/backend/routers/community.py) — Voting endpoints |
| **6 Mock Engines** | [visual.py](file:///c:/Users/D1248959/Documents/DeepfakeTotal/backend/engines/visual.py), [audio.py](file:///c:/Users/D1248959/Documents/DeepfakeTotal/backend/engines/audio.py), [sync.py](file:///c:/Users/D1248959/Documents/DeepfakeTotal/backend/engines/sync.py) |
| **Score Fusion** | [fusion.py](file:///c:/Users/D1248959/Documents/DeepfakeTotal/backend/services/fusion.py) — Implements Eq. 8–11 from proposal |
| **Diagnostics** | [diagnostics.py](file:///c:/Users/D1248959/Documents/DeepfakeTotal/backend/services/diagnostics.py) — Bilingual CN/EN report generation |
| **Database** | [database.py](file:///c:/Users/D1248959/Documents/DeepfakeTotal/backend/database.py) — SQLite cache for results + votes |

### Frontend (Next.js + Tailwind CSS)
| Component | Files |
|-----------|-------|
| **Design System** | [globals.css](file:///c:/Users/D1248959/Documents/DeepfakeTotal/frontend/src/app/globals.css) — Dark theme, glass effects, animations |
| **Layout** | [layout.tsx](file:///c:/Users/D1248959/Documents/DeepfakeTotal/frontend/src/app/layout.tsx) — Glass nav bar, logo, hash search |
| **Landing Page** | [page.tsx](file:///c:/Users/D1248959/Documents/DeepfakeTotal/frontend/src/app/page.tsx) — Hero, upload zone, hash search, feature cards |
| **Results Dashboard** | [page.tsx](file:///c:/Users/D1248959/Documents/DeepfakeTotal/frontend/src/app/results/%5Bhash%5D/page.tsx) — Pie chart, 4 tabs, engine cards, evidence viz |
| **API Client** | [api.ts](file:///c:/Users/D1248959/Documents/DeepfakeTotal/frontend/src/lib/api.ts) — Typed fetch wrappers |
| **Providers** | [providers.tsx](file:///c:/Users/D1248959/Documents/DeepfakeTotal/frontend/src/lib/providers.tsx) — TanStack QueryClient |

---

## How to Run

```bash
# Backend (terminal 1)
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000

# Frontend (terminal 2)
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000**

---

## Verification Results

### ✅ Build
- `npm run build` passed with zero errors

### ✅ Landing Page

![FormosaDeepAV Landing Page](C:/Users/D1248959/.gemini/antigravity/brain/89ee5e65-85b6-4327-947c-82b8c074bfa4/formosa_deepav_landing_page_1774203921845.png)

### ✅ Browser Recording

![Landing page browser test](C:/Users/D1248959/.gemini/antigravity/brain/89ee5e65-85b6-4327-947c-82b8c074bfa4/landing_page_verify_1774203907259.webp)

---

## Next Steps
- Replace mock engines with real PyTorch inference (LipForensics, AASIST, SyncNet)
- Integrate `ffmpeg.wasm` for client-side video trimming
- Add vector DB (Milvus/Pinecone) for Relations tab
- Deploy to production server
