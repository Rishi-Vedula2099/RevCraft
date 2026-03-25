"""
# RevCraft — AI Insights Engine
Generates performance insights, class explanations, and upgrade suggestions via OpenAI.
"""

import json
from config import settings

# Attempt OpenAI import
try:
    from openai import OpenAI
except ImportError:
    OpenAI = None  # type: ignore

from schemas import CarConfig, PerformanceStats, AiInsightsResponse


def _get_client():
    """Get OpenAI client if API key is available."""
    if not settings.openai_api_key or OpenAI is None:
        return None
    return OpenAI(api_key=settings.openai_api_key)


def _build_prompt(config: CarConfig, stats: PerformanceStats) -> str:
    return f"""You are an expert automotive performance analyst for the RevCraft car builder platform.

Analyze this car build and provide insights:

**Car Configuration:**
- Body: {config.body_type}
- Engine: {config.engine}
- Turbo: {"Yes" if config.turbo else "No"}
- Transmission: {config.transmission}
- Wheels: {config.wheels}
- Spoiler: {config.spoiler}
- Suspension: {config.suspension}
- Brakes: {config.brakes}
- Exhaust: {config.exhaust}
- Aero Kit: {config.aero_kit}
- Weight Reduction: {config.weight_reduction}

**Performance Stats:**
- Horsepower: {stats.horsepower} HP
- Torque: {stats.torque} lb-ft
- Weight: {stats.weight} kg
- Top Speed: {stats.top_speed} mph
- 0-60 Acceleration: {stats.acceleration}s
- Handling Score: {stats.handling}/100
- Performance Score: {stats.score}/1000
- Class: {stats.car_class}

Respond in this exact JSON format:
{{
    "performance_analysis": "A 2-3 sentence analysis of the build's strengths and weaknesses.",
    "class_explanation": "A 1-2 sentence explanation of why this build earned its class rating and what it would take to reach the next class.",
    "upgrade_suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}}

Only respond with the JSON, no other text."""


def generate_insights(config: CarConfig, stats: PerformanceStats) -> AiInsightsResponse:
    """Generate AI-powered insights for a car build."""

    client = _get_client()

    if client is None:
        return _mock_insights(config, stats)

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": _build_prompt(config, stats)}],
            temperature=0.7,
            max_tokens=500,
        )
        content = response.choices[0].message.content or ""
        # Strip markdown code fences if present
        content = content.strip()
        if content.startswith("```"):
            content = content.split("\n", 1)[1] if "\n" in content else content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()

        parsed = json.loads(content)
        return AiInsightsResponse(
            performance_analysis=parsed.get("performance_analysis", ""),
            class_explanation=parsed.get("class_explanation", ""),
            upgrade_suggestions=parsed.get("upgrade_suggestions", []),
        )
    except Exception:
        return _mock_insights(config, stats)


def _mock_insights(config: CarConfig, stats: PerformanceStats) -> AiInsightsResponse:
    """Generate deterministic mock insights when OpenAI is unavailable."""

    # Performance analysis
    strengths = []
    weaknesses = []

    if stats.horsepower > 500:
        strengths.append("impressive horsepower output")
    elif stats.horsepower < 200:
        weaknesses.append("limited power delivery")

    if stats.handling > 70:
        strengths.append("exceptional handling characteristics")
    elif stats.handling < 40:
        weaknesses.append("compromised handling")

    if stats.weight < 1400:
        strengths.append("lightweight construction")
    elif stats.weight > 2000:
        weaknesses.append("excessive weight")

    if stats.top_speed > 200:
        strengths.append("remarkable top speed")

    analysis_parts = []
    if strengths:
        analysis_parts.append(f"This build excels with {', '.join(strengths)}.")
    if weaknesses:
        analysis_parts.append(f"Areas for improvement include {', '.join(weaknesses)}.")
    if not analysis_parts:
        analysis_parts.append("This is a well-balanced build with no major standout characteristics.")

    performance_analysis = " ".join(analysis_parts)

    # Class explanation
    next_class_map = {"D": "C (300+)", "C": "B (450+)", "B": "A (600+)", "A": "S (750+)", "S": "the top"}
    next_target = next_class_map.get(stats.car_class, "higher")
    if stats.car_class == "S":
        class_explanation = f"This build has achieved S-Class status with a score of {stats.score}. It represents peak performance engineering."
    else:
        gap = {"D": 300, "C": 450, "B": 600, "A": 750}.get(stats.car_class, 1000) - stats.score
        class_explanation = f"Rated Class {stats.car_class} with {stats.score} points. You need {gap:.0f} more points to reach {next_target}."

    # Suggestions
    suggestions = []
    if not config.turbo:
        suggestions.append("Enable turbo for a ~25% horsepower boost")
    if config.engine in ("i4_economy", "v6_standard", "i4_turbo"):
        suggestions.append("Upgrade to a higher-tier engine for significantly more power")
    if config.suspension == "standard":
        suggestions.append("Install sport or racing suspension for better handling")
    if config.weight_reduction == "none":
        suggestions.append("Apply weight reduction for improved power-to-weight ratio")
    if config.spoiler == "none":
        suggestions.append("Add a spoiler for improved downforce and handling")
    if config.brakes == "standard":
        suggestions.append("Upgrade brakes for better handling scores")
    if config.exhaust == "standard":
        suggestions.append("Install a sport or racing exhaust for bonus horsepower")

    return AiInsightsResponse(
        performance_analysis=performance_analysis,
        class_explanation=class_explanation,
        upgrade_suggestions=suggestions[:5],
    )
