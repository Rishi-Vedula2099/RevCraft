"""
# RevCraft — FastAPI Application Entry Point

Cloud-Native Car Builder & Analytics Platform
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from database import engine, Base
from routes.auth import router as auth_router
from routes.builds import router as builds_router
from routes.ai import router as ai_router
from routes.analytics import router as analytics_router
from routes.scoring import router as scoring_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — create tables on startup."""
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="RevCraft",
    description="Cloud-Native Car Builder & Analytics Platform — Build, customize, and analyze cars in real-time with AI-powered insights.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
origins = [o.strip() for o in settings.cors_origins.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(builds_router)
app.include_router(scoring_router)
app.include_router(ai_router)
app.include_router(analytics_router)


@app.get("/", tags=["Health"])
def root():
    return {
        "name": "RevCraft",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}
