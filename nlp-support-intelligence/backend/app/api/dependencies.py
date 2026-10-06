from fastapi import Request

from backend.app.database.repository import Repository


def repository(request: Request) -> Repository:
    return request.app.state.repository
