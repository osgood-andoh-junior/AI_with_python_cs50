import pytest
from fastapi.testclient import TestClient

from backend.app.main import create_app


@pytest.fixture
def app(tmp_path):
    return create_app(str(tmp_path / "test.sqlite3"), artifact_root=tmp_path / "artifacts")


@pytest.fixture
def client(app):
    with TestClient(app) as client:
        yield client
