from fastapi import APIRouter, Request

from backend.app.schemas.contracts import ModelVersion

router = APIRouter(prefix="/api/models", tags=["models"])


@router.get("", response_model=list[ModelVersion])
def models(request: Request):
    return request.app.state.repository.list_models()
