from fastapi import APIRouter, HTTPException, Request

from backend.app.schemas.contracts import Prediction, PredictionRequest

router = APIRouter(prefix="/api/predictions", tags=["predictions"])


@router.post("", response_model=Prediction)
def predict(data: PredictionRequest, request: Request):
    ticket = request.app.state.repository.get_ticket(data.ticket_id)
    if not ticket:
        raise HTTPException(404, "Ticket not found")
    return request.app.state.intelligence.predict(ticket)
