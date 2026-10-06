from fastapi import APIRouter, Request

from backend.app.schemas.contracts import Evaluation

router = APIRouter(prefix="/api/evaluations", tags=["evaluations"])


@router.get("", response_model=list[Evaluation])
def evaluations(request: Request):
    return request.app.state.repository.list_evaluations()
