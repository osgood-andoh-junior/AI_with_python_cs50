from fastapi import APIRouter, Request

from backend.app.schemas.contracts import TrainingRequest, TrainingRun

router = APIRouter(prefix="/api/training", tags=["training"])


@router.post("/start")
def start_training(data: TrainingRequest, request: Request):
    return request.app.state.intelligence.train(data.model_key)


@router.get("/runs", response_model=list[TrainingRun])
def list_runs(request: Request):
    return request.app.state.repository.list_runs()
