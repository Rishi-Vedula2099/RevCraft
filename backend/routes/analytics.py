"""
AutoForge AI — Analytics Routes
Cached analytics queries from PostgreSQL (Redshift simulation for local dev).
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from database import get_db
from models import CarBuild, User
from schemas import LeaderboardEntry, ClassDistribution, TrendPoint

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/leaderboard", response_model=list[LeaderboardEntry])
def get_leaderboard(limit: int = 20, db: Session = Depends(get_db)):
    """Top builds by performance score."""
    results = (
        db.query(
            CarBuild.performance_score,
            CarBuild.car_class,
            CarBuild.name,
            User.username,
        )
        .join(User, CarBuild.user_id == User.id)
        .order_by(desc(CarBuild.performance_score))
        .limit(limit)
        .all()
    )

    return [
        LeaderboardEntry(
            rank=i + 1,
            username=r.username,
            build_name=r.name,
            performance_score=round(r.performance_score, 1),
            car_class=r.car_class,
        )
        for i, r in enumerate(results)
    ]


@router.get("/class-distribution", response_model=list[ClassDistribution])
def get_class_distribution(db: Session = Depends(get_db)):
    """Distribution of builds by class."""
    total = db.query(func.count(CarBuild.id)).scalar() or 0
    if total == 0:
        return []

    results = (
        db.query(CarBuild.car_class, func.count(CarBuild.id).label("count"))
        .group_by(CarBuild.car_class)
        .order_by(CarBuild.car_class)
        .all()
    )

    return [
        ClassDistribution(
            car_class=r.car_class,
            count=r.count,
            percentage=round(r.count / total * 100, 1),
        )
        for r in results
    ]


@router.get("/trends", response_model=list[TrendPoint])
def get_trends(days: int = 30, db: Session = Depends(get_db)):
    """Average scores and build counts over time."""
    results = (
        db.query(
            func.date(CarBuild.created_at).label("date"),
            func.avg(CarBuild.performance_score).label("avg_score"),
            func.count(CarBuild.id).label("build_count"),
        )
        .group_by(func.date(CarBuild.created_at))
        .order_by(func.date(CarBuild.created_at))
        .limit(days)
        .all()
    )

    return [
        TrendPoint(
            date=str(r.date),
            avg_score=round(float(r.avg_score), 1),
            build_count=r.build_count,
        )
        for r in results
    ]


@router.get("/popular-configs")
def get_popular_configs(db: Session = Depends(get_db)):
    """Most popular configuration choices."""
    builds = db.query(CarBuild.config).all()
    if not builds:
        return {"body_types": {}, "engines": {}, "total_builds": 0}

    body_counts: dict[str, int] = {}
    engine_counts: dict[str, int] = {}

    for (config,) in builds:
        if isinstance(config, dict):
            bt = config.get("body_type", "unknown")
            eng = config.get("engine", "unknown")
            body_counts[bt] = body_counts.get(bt, 0) + 1
            engine_counts[eng] = engine_counts.get(eng, 0) + 1

    return {
        "body_types": dict(sorted(body_counts.items(), key=lambda x: x[1], reverse=True)),
        "engines": dict(sorted(engine_counts.items(), key=lambda x: x[1], reverse=True)),
        "total_builds": len(builds),
    }


@router.get("/stats")
def get_overall_stats(db: Session = Depends(get_db)):
    """Overall platform statistics."""
    total_builds = db.query(func.count(CarBuild.id)).scalar() or 0
    total_users = db.query(func.count(User.id)).scalar() or 0
    avg_score = db.query(func.avg(CarBuild.performance_score)).scalar() or 0
    max_score = db.query(func.max(CarBuild.performance_score)).scalar() or 0

    return {
        "total_builds": total_builds,
        "total_users": total_users,
        "avg_score": round(float(avg_score), 1),
        "max_score": round(float(max_score), 1),
    }
