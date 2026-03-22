# FormosaDeepAV - Multi-Modal Deepfake Detection Platform

## Phase 1: Project Scaffolding
- [ ] Initialize Next.js project with App Router
- [ ] Set up Tailwind CSS + Shadcn UI
- [ ] Set up FastAPI backend project structure
- [ ] Configure monorepo folder structure (frontend/ + backend/)

## Phase 2: Frontend - Core UI & Design System
- [ ] Create global design tokens (colors, typography, spacing)
- [ ] Build layout shell (header, sidebar, main content area)
- [ ] Build the Landing/Upload page (Entry Point)
  - [ ] File upload component (drag & drop)
  - [ ] SHA-256 hash search box
  - [ ] URL link parser input (FB/YT/LINE)
  - [ ] Client-side video trimmer (ffmpeg.wasm, 30s limit)
- [ ] Build the Results Dashboard page
  - [ ] Top section: file metadata + SHA-256 + re-analyze button
  - [ ] Summary pie chart (3-modality weighted score)
  - [ ] Tab 1: Detection results (modular engine list + Grad-CAM/spectrogram/timeline)
  - [ ] Tab 2: Details (binary info, metadata, codec)
  - [ ] Tab 3: Relations (similar videos)
  - [ ] Tab 4: Community (dual-track voting)

## Phase 3: Backend - FastAPI
- [ ] Project structure & config
- [ ] File upload & SHA-256 hashing endpoint
- [ ] Hash lookup / cache endpoint
- [ ] Modular detection dispatcher (async parallel)
  - [ ] Visual module endpoint (`/analyze/visual`)
  - [ ] Audio module endpoint (`/analyze/audio`)
  - [ ] Sync module endpoint (`/analyze/sync`)
- [ ] Score fusion logic (weighted per-modality & cross-modality)
- [ ] Diagnostic comment generation logic
- [ ] Database schema (SQLite/PostgreSQL for results cache)

## Phase 4: Integration & Data Flow
- [ ] Connect frontend upload to backend API
- [ ] Wire detection progress tracking (TanStack Query)
- [ ] Display live results from backend engines
- [ ] Implement re-analyze flow

## Phase 5: Visualization Components
- [ ] Grad-CAM heatmap overlay component
- [ ] Audio spectrogram visualization
- [ ] Timeline waveform (sync offset chart)
- [ ] Consensus heatmap aggregation

## Phase 6: Community & Relations
- [ ] Community voting UI + backend
- [ ] Relations page with similarity search placeholder

## Phase 7: Polish & Verification
- [ ] Responsive design check
- [ ] End-to-end flow test (upload → results)
- [ ] Performance optimization
