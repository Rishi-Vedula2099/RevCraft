"""
AutoForge AI — Performance Scoring Engine
Maps car configurations to performance stats and calculates class rankings.
"""

from schemas import CarConfig, PerformanceStats


# ─── Part Stat Tables ────────────────────────────────────────────────

ENGINE_STATS = {
    "i4_economy":    {"hp": 120, "torque": 130, "weight": 180},
    "i4_turbo":      {"hp": 200, "torque": 210, "weight": 190},
    "v6_standard":   {"hp": 280, "torque": 290, "weight": 220},
    "v6_turbo":      {"hp": 350, "torque": 370, "weight": 235},
    "v8_standard":   {"hp": 420, "torque": 460, "weight": 280},
    "v8_supercharged": {"hp": 550, "torque": 580, "weight": 300},
    "v10_racing":    {"hp": 630, "torque": 600, "weight": 310},
    "v12_flagship":  {"hp": 750, "torque": 720, "weight": 350},
    "electric_dual": {"hp": 480, "torque": 620, "weight": 400},
    "electric_tri":  {"hp": 680, "torque": 800, "weight": 420},
    "hybrid_v6":     {"hp": 380, "torque": 400, "weight": 260},
    "hybrid_v8":     {"hp": 520, "torque": 550, "weight": 310},
}

BODY_STATS = {
    "sedan":   {"weight": 1500, "handling": 60, "aero": 0.32},
    "coupe":   {"weight": 1350, "handling": 70, "aero": 0.28},
    "suv":     {"weight": 2100, "handling": 40, "aero": 0.40},
    "truck":   {"weight": 2400, "handling": 30, "aero": 0.45},
    "sports":  {"weight": 1200, "handling": 85, "aero": 0.24},
    "hypercar":{"weight": 1100, "handling": 90, "aero": 0.22},
}

WHEEL_STATS = {
    "economy_16":  {"handling": 0, "weight": 0},
    "sport_18":    {"handling": 8, "weight": -10},
    "performance_19": {"handling": 14, "weight": -15},
    "racing_20":   {"handling": 20, "weight": -25},
    "offroad_17":  {"handling": -5, "weight": 20},
    "lightweight_18": {"handling": 12, "weight": -30},
}

SPOILER_STATS = {
    "none":        {"handling": 0, "top_speed": 0},
    "lip":         {"handling": 5, "top_speed": -2},
    "mid_wing":    {"handling": 12, "top_speed": -5},
    "gt_wing":     {"handling": 22, "top_speed": -10},
    "active_aero": {"handling": 18, "top_speed": 3},
}

SUSPENSION_STATS = {
    "standard":     {"handling": 0},
    "sport":        {"handling": 12},
    "racing":       {"handling": 22},
    "adjustable":   {"handling": 18},
    "offroad":      {"handling": -5},
}

BRAKE_STATS = {
    "standard":      {"handling": 0},
    "sport":         {"handling": 8},
    "ceramic":       {"handling": 15},
    "carbon_ceramic":{"handling": 22},
}

EXHAUST_STATS = {
    "standard":    {"hp_bonus": 0},
    "sport":       {"hp_bonus": 15},
    "racing":      {"hp_bonus": 30},
    "titanium":    {"hp_bonus": 45},
}

TRANSMISSION_STATS = {
    "automatic":   {"accel_bonus": 0, "top_speed_bonus": 0},
    "manual_6":    {"accel_bonus": 5, "top_speed_bonus": 5},
    "dct_7":       {"accel_bonus": 12, "top_speed_bonus": 8},
    "sequential":  {"accel_bonus": 18, "top_speed_bonus": 12},
}

AERO_KIT_STATS = {
    "none":       {"handling": 0, "top_speed": 0, "weight": 0},
    "street":     {"handling": 8, "top_speed": 3, "weight": 10},
    "track":      {"handling": 18, "top_speed": -5, "weight": 20},
    "widebody":   {"handling": 12, "top_speed": -3, "weight": 30},
}

WEIGHT_REDUCTION_STATS = {
    "none":       {"weight_reduction": 0},
    "stage_1":    {"weight_reduction": 80},
    "stage_2":    {"weight_reduction": 160},
    "stage_3":    {"weight_reduction": 280},
    "extreme":    {"weight_reduction": 400},
}


# ─── Calculation Engine ──────────────────────────────────────────────

def _safe_lookup(table: dict, key: str, default_key: str) -> dict:
    """Safely look up a value from a stat table, falling back to default."""
    return table.get(key, table.get(default_key, {}))


def calculate_stats(config: CarConfig) -> PerformanceStats:
    """Calculate performance stats from a car configuration."""

    engine = _safe_lookup(ENGINE_STATS, config.engine, "v6_standard")
    body = _safe_lookup(BODY_STATS, config.body_type, "sedan")
    wheels = _safe_lookup(WHEEL_STATS, config.wheels, "sport_18")
    spoiler = _safe_lookup(SPOILER_STATS, config.spoiler, "none")
    suspension = _safe_lookup(SUSPENSION_STATS, config.suspension, "standard")
    brakes = _safe_lookup(BRAKE_STATS, config.brakes, "standard")
    exhaust = _safe_lookup(EXHAUST_STATS, config.exhaust, "standard")
    trans = _safe_lookup(TRANSMISSION_STATS, config.transmission, "automatic")
    aero = _safe_lookup(AERO_KIT_STATS, config.aero_kit, "none")
    weight_red = _safe_lookup(WEIGHT_REDUCTION_STATS, config.weight_reduction, "none")

    # --- Horsepower ---
    hp = engine["hp"] + exhaust.get("hp_bonus", 0)
    if config.turbo:
        hp = int(hp * 1.25)

    # --- Torque ---
    torque = engine["torque"]
    if config.turbo:
        torque = int(torque * 1.20)

    # --- Weight ---
    total_weight = (
        body["weight"]
        + engine["weight"]
        + wheels.get("weight", 0)
        + aero.get("weight", 0)
        - weight_red.get("weight_reduction", 0)
    )
    total_weight = max(total_weight, 800)  # minimum realistic weight

    # --- Handling ---
    handling = (
        body["handling"]
        + wheels.get("handling", 0)
        + spoiler.get("handling", 0)
        + suspension.get("handling", 0)
        + brakes.get("handling", 0)
        + aero.get("handling", 0)
    )
    handling = max(0, min(handling, 100))

    # --- Top Speed (derived from HP, weight, aero) ---
    power_to_weight = hp / (total_weight / 1000)
    aero_coeff = body.get("aero", 0.32)
    base_top_speed = 80 + (power_to_weight * 0.35) - (aero_coeff * 50)
    top_speed = base_top_speed + spoiler.get("top_speed", 0) + aero.get("top_speed", 0) + trans.get("top_speed_bonus", 0)
    top_speed = max(60, min(top_speed, 320))

    # --- Acceleration (0-60 derived from power-to-weight + transmission) ---
    base_accel = 18 - (power_to_weight * 0.02)
    accel_bonus = trans.get("accel_bonus", 0) * 0.05
    accel_time = max(1.8, base_accel - accel_bonus)

    # Convert to a 0–100 score (lower time = higher score)
    accel_score = max(0, min(100, (15 - accel_time) * 12))

    # --- Normalize all stats to 0–1000 range for scoring ---
    hp_norm = min(hp / 800 * 1000, 1000)
    speed_norm = min(top_speed / 320 * 1000, 1000)
    handling_norm = handling * 10
    accel_norm = accel_score * 10
    torque_norm = min(torque / 800 * 1000, 1000)
    weight_norm = min(total_weight / 2500 * 1000, 1000)

    # --- Score formula ---
    score = (
        0.35 * hp_norm
        + 0.20 * speed_norm
        + 0.15 * handling_norm
        + 0.15 * accel_norm
        + 0.10 * torque_norm
        - 0.05 * weight_norm
    )
    score = round(max(0, score), 1)

    # --- Class assignment ---
    car_class = assign_class(score)

    return PerformanceStats(
        horsepower=round(hp, 1),
        torque=round(torque, 1),
        weight=round(total_weight, 1),
        top_speed=round(top_speed, 1),
        acceleration=round(accel_time, 2),
        handling=round(handling, 1),
        score=score,
        car_class=car_class,
    )


def assign_class(score: float) -> str:
    """Assign a class ranking based on performance score."""
    if score >= 750:
        return "S"
    elif score >= 600:
        return "A"
    elif score >= 450:
        return "B"
    elif score >= 300:
        return "C"
    else:
        return "D"
