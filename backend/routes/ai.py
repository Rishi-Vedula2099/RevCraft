"""
AutoForge AI — AI Insights Routes
"""

from fastapi import APIRouter
from schemas import AiInsightsRequest, AiInsightsResponse
from ai_engine import generate_insights

router = APIRouter(prefix="/ai", tags=["AI Engine"])


@router.post("/insights", response_model=AiInsightsResponse)
def get_ai_insights(data: AiInsightsRequest):
    """Generate AI-powered performance insights for a car build."""
    return generate_insights(data.config, data.stats)
