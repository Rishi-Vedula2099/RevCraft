"""
AutoForge AI — Car Build Routes
CRUD operations for car builds with scoring and S3 snapshots.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User, CarBuild
from schemas import BuildCreate, BuildUpdate, BuildResponse, CarConfig
from auth import get_current_user
from scoring import calculate_stats
from s3_service import store_build_snapshot, store_activity_log

router = APIRouter(prefix="/builds", tags=["Car Builds"])


def _apply_stats(build: CarBuild, config: CarConfig):
    """Calculate and apply performance stats to a build."""
    stats = calculate_stats(config)
    build.horsepower = stats.horsepower
    build.torque = stats.torque
    build.weight = stats.weight
    build.top_speed = stats.top_speed
    build.acceleration = stats.acceleration
    build.handling = stats.handling
    build.performance_score = stats.score
    build.car_class = stats.car_class
    return stats


@router.post("", response_model=BuildResponse, status_code=status.HTTP_201_CREATED)
def create_build(
    data: BuildCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new car build."""
    build = CarBuild(
        user_id=user.id,
        name=data.name,
        config=data.config.model_dump(),
    )

    stats = _apply_stats(build, data.config)

    db.add(build)
    db.commit()
    db.refresh(build)

    # Store snapshot to S3
    store_build_snapshot(
        user_id=user.id,
        build_id=build.id,
        config=build.config,
        stats=stats.model_dump(),
    )
    store_activity_log(user.id, "create_build", {"build_id": build.id, "name": build.name})

    return build


@router.get("", response_model=list[BuildResponse])
def list_builds(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all builds for the current user (garage)."""
    builds = (
        db.query(CarBuild)
        .filter(CarBuild.user_id == user.id)
        .order_by(CarBuild.updated_at.desc())
        .all()
    )
    return builds


@router.get("/{build_id}", response_model=BuildResponse)
def get_build(
    build_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a single build by ID."""
    build = db.query(CarBuild).filter(CarBuild.id == build_id, CarBuild.user_id == user.id).first()
    if not build:
        raise HTTPException(status_code=404, detail="Build not found")
    return build


@router.put("/{build_id}", response_model=BuildResponse)
def update_build(
    build_id: str,
    data: BuildUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a car build's config and/or name."""
    build = db.query(CarBuild).filter(CarBuild.id == build_id, CarBuild.user_id == user.id).first()
    if not build:
        raise HTTPException(status_code=404, detail="Build not found")

    if data.name is not None:
        build.name = data.name

    if data.config is not None:
        build.config = data.config.model_dump()
        stats = _apply_stats(build, data.config)

        store_build_snapshot(
            user_id=user.id,
            build_id=build.id,
            config=build.config,
            stats=stats.model_dump(),
        )

    db.commit()
    db.refresh(build)

    store_activity_log(user.id, "update_build", {"build_id": build.id})

    return build


@router.delete("/{build_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_build(
    build_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a car build."""
    build = db.query(CarBuild).filter(CarBuild.id == build_id, CarBuild.user_id == user.id).first()
    if not build:
        raise HTTPException(status_code=404, detail="Build not found")

    store_activity_log(user.id, "delete_build", {"build_id": build.id, "name": build.name})

    db.delete(build)
    db.commit()
