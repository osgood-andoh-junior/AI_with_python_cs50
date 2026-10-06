from fastapi import APIRouter, Depends, HTTPException, Query, Response

from backend.app.api.dependencies import repository
from backend.app.database.repository import Repository
from backend.app.schemas.contracts import Ticket, TicketCreate, TicketUpdate

router = APIRouter(prefix="/api/tickets", tags=["tickets"])


@router.post("", response_model=Ticket, status_code=201)
def create_ticket(data: TicketCreate, repo: Repository = Depends(repository)):
    return repo.create_ticket(data.text, data.actual_category)


@router.get("", response_model=list[Ticket])
def list_tickets(
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    repo: Repository = Depends(repository),
):
    return repo.list_tickets(limit, offset)


@router.get("/{ticket_id}", response_model=Ticket)
def get_ticket(ticket_id: int, repo: Repository = Depends(repository)):
    ticket = repo.get_ticket(ticket_id)
    if ticket is None:
        raise HTTPException(404, "Ticket not found")
    return ticket


@router.patch("/{ticket_id}", response_model=Ticket)
def label_ticket(ticket_id: int, data: TicketUpdate, repo: Repository = Depends(repository)):
    if not repo.get_ticket(ticket_id):
        raise HTTPException(404, "Ticket not found")
    return repo.label_ticket(ticket_id, data.actual_category)


@router.delete("/{ticket_id}", status_code=204)
def delete_ticket(ticket_id: int, repo: Repository = Depends(repository)):
    if not repo.delete_ticket(ticket_id):
        raise HTTPException(404, "Ticket not found")
    return Response(status_code=204)
