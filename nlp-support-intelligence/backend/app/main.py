import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.api import evaluations, models, predictions, tickets, training
from backend.app.database.repository import Repository
from backend.app.database.session import Database
from backend.app.services.intelligence import IntelligenceService
from backend.app.services.registry import ModelRegistry
from ml.src.contracts import StudentMLNotImplemented

ROOT = Path(__file__).resolve().parents[2]
load_dotenv(ROOT / ".env")
logger = logging.getLogger(__name__)


def create_app(
    database_path: str | None = None,
    registry: ModelRegistry | None = None,
    artifact_root: Path | None = None,
):
    db_path = Path(database_path or os.getenv("DATABASE_PATH", "backend/data/support.sqlite3"))
    database = Database(str(db_path if db_path.is_absolute() else ROOT / db_path))
    repo = Repository(database)
    model_registry = registry or ModelRegistry()

    @asynccontextmanager
    async def lifespan(app):
        database.initialize()
        # Restore only metadata created by our local training flow.
        registered = repo.list_models()
        if registered and not model_registry.active_registered:
            latest = registered[0]
            classifier = model_registry.create(latest["model_key"])
            classifier.load(Path(latest["artifact_path"]))
            model_registry.activate(classifier, latest["version"])
        yield

    app = FastAPI(title="NLP Support-Ticket Intelligence", lifespan=lifespan)
    app.state.repository = repo
    app.state.registry = model_registry
    app.state.intelligence = IntelligenceService(
        repo, model_registry, artifact_root or ROOT / "ml/artifacts"
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")],
        allow_methods=["GET", "POST", "PATCH", "DELETE"],
        allow_headers=["Content-Type"],
    )

    @app.exception_handler(StudentMLNotImplemented)
    async def student_error(request: Request, exc: StudentMLNotImplemented):
        return JSONResponse(
            status_code=501,
            content={
                "error": "STUDENT_ML_NOT_IMPLEMENTED",
                "component": exc.component,
                "message": str(exc),
            },
        )

    @app.exception_handler(Exception)
    async def internal_error(request: Request, exc: Exception):
        logger.error("Request failed", exc_info=exc)
        return JSONResponse(
            status_code=500,
            content={
                "error": "INTERNAL_ERROR",
                "message": "The operation failed. Inspect the backend logs.",
            },
        )

    @app.get("/health")
    def health():
        repo.rows("SELECT 1")
        return {"status": "ok", "database": "ok"}

    @app.get("/api/dashboard")
    def dashboard():
        return {
            **repo.summary(),
            "current_model": model_registry.active.version
            if model_registry.active_registered
            else None,
            "latest_evaluation": next(iter(repo.list_evaluations()), None),
        }

    for router in [
        tickets.router,
        predictions.router,
        training.router,
        models.router,
        evaluations.router,
    ]:
        app.include_router(router)
    return app


app = create_app()
