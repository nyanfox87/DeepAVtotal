"""Community voting router."""
from __future__ import annotations

from fastapi import APIRouter

from database import add_vote, get_vote_stats
from models.schemas import CommunityStats, CommunityVote

router = APIRouter(prefix="/api", tags=["community"])


@router.post("/community/{file_hash}/vote")
async def cast_vote(file_hash: str, body: CommunityVote):
    """Cast a community vote (REAL or FAKE) for a file."""
    add_vote(file_hash, body.vote)
    stats = get_vote_stats(file_hash)
    return CommunityStats(**stats)


@router.get("/community/{file_hash}/stats", response_model=CommunityStats)
async def vote_stats(file_hash: str):
    """Get community voting statistics for a file."""
    stats = get_vote_stats(file_hash)
    return CommunityStats(**stats)
