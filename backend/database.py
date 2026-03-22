"""SQLite database helper — stores cached analysis results and community votes."""
from __future__ import annotations

import json
import sqlite3
from datetime import datetime
from pathlib import Path

DB_PATH = Path(__file__).parent / "data" / "formosa.db"


def _get_conn() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db() -> None:
    conn = _get_conn()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS files (
            hash       TEXT PRIMARY KEY,
            filename   TEXT NOT NULL,
            file_size  INTEGER,
            file_format TEXT,
            source_url TEXT,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS results (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            file_hash   TEXT NOT NULL,
            result_json TEXT NOT NULL,
            analyzed_at TEXT NOT NULL,
            FOREIGN KEY (file_hash) REFERENCES files(hash)
        );

        CREATE TABLE IF NOT EXISTS votes (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            file_hash TEXT NOT NULL,
            vote      TEXT NOT NULL CHECK(vote IN ('REAL','FAKE')),
            voted_at  TEXT NOT NULL,
            FOREIGN KEY (file_hash) REFERENCES files(hash)
        );
    """)
    conn.commit()
    conn.close()


# ── File operations ────────────────────────────────────────────────────
def file_exists(file_hash: str) -> bool:
    conn = _get_conn()
    row = conn.execute("SELECT 1 FROM files WHERE hash = ?", (file_hash,)).fetchone()
    conn.close()
    return row is not None


def save_file_record(file_hash: str, filename: str, file_size: int, file_format: str, source_url: str | None = None) -> None:
    conn = _get_conn()
    conn.execute(
        "INSERT OR IGNORE INTO files (hash, filename, file_size, file_format, source_url, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        (file_hash, filename, file_size, file_format, source_url, datetime.utcnow().isoformat()),
    )
    conn.commit()
    conn.close()


# ── Result cache ───────────────────────────────────────────────────────
def get_cached_result(file_hash: str) -> dict | None:
    conn = _get_conn()
    row = conn.execute(
        "SELECT result_json FROM results WHERE file_hash = ? ORDER BY analyzed_at DESC LIMIT 1",
        (file_hash,),
    ).fetchone()
    conn.close()
    if row:
        return json.loads(row["result_json"])
    return None


def save_result(file_hash: str, result_json: str) -> None:
    conn = _get_conn()
    conn.execute(
        "INSERT INTO results (file_hash, result_json, analyzed_at) VALUES (?, ?, ?)",
        (file_hash, result_json, datetime.utcnow().isoformat()),
    )
    conn.commit()
    conn.close()


# ── Community votes ────────────────────────────────────────────────────
def add_vote(file_hash: str, vote: str) -> None:
    conn = _get_conn()
    conn.execute(
        "INSERT INTO votes (file_hash, vote, voted_at) VALUES (?, ?, ?)",
        (file_hash, vote, datetime.utcnow().isoformat()),
    )
    conn.commit()
    conn.close()


def get_vote_stats(file_hash: str) -> dict:
    conn = _get_conn()
    rows = conn.execute(
        "SELECT vote, COUNT(*) as cnt FROM votes WHERE file_hash = ? GROUP BY vote",
        (file_hash,),
    ).fetchall()
    conn.close()

    stats = {"REAL": 0, "FAKE": 0}
    for row in rows:
        stats[row["vote"]] = row["cnt"]

    total = stats["REAL"] + stats["FAKE"]
    return {
        "total_votes": total,
        "real_votes": stats["REAL"],
        "fake_votes": stats["FAKE"],
        "real_ratio": round(stats["REAL"] / total, 4) if total > 0 else 0.0,
        "fake_ratio": round(stats["FAKE"] / total, 4) if total > 0 else 0.0,
    }
