"""
AutoForge AI — Scoring Routes
Quick performance calculation without saving.
"""

from fastapi import APIRouter
from schemas import CarConfig, PerformanceStats
from scoring import calculate_stats

router = APIRouter(prefix="/scoring", tags=["Scoring"])


@router.post("/calculate", response_model=PerformanceStats)
def calculate_performance(config: CarConfig):
    """Calculate performance stats for a car config (stateless, no save)."""
    return calculate_stats(config)
