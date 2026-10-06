import sqlite3

import pytest
from pydantic import ValidationError

from backend.app.database.repository import Repository
from backend.app.database.session import Database
from backend.app.schemas.contracts import EvaluationCreate


def test_initialization_is_idempotent_and_data_persists(tmp_path):
    path = str(tmp_path / "nested" / "tickets.sqlite3")
    database = Database(path)
    database.initialize()
    repo = Repository(database)
    ticket = repo.create_ticket("Customer's ticket; DROP TABLE tickets;", "Other")
    database.initialize()
    assert Repository(Database(path)).get_ticket(ticket["id"]) == ticket
    tables = repo.rows("SELECT name FROM sqlite_master WHERE type='table'")
    assert {"tickets", "model_versions", "evaluation_results", "training_runs"} <= {
        row["name"] for row in tables
    }


def test_registry_constraints_and_evaluation_storage(client, app):
    repo = app.state.repository
    model = repo.register_model("naive_bayes", "unit-fixture", "artifacts/unit-fixture")
    with pytest.raises(sqlite3.IntegrityError):
        repo.register_model("naive_bayes", "unit-fixture", "artifacts/duplicate")
    data = dict(
        model_id=model["id"],
        accuracy=0.1,
        precision=0.2,
        recall=0.3,
        f1=0.4,
        dataset_name="test fixture",
    )
    stored = repo.store_evaluation(EvaluationCreate(**data))
    for key, value in data.items():
        assert stored[key] == value
    with pytest.raises(sqlite3.IntegrityError):
        repo.store_evaluation(EvaluationCreate(**{**data, "model_id": 999}))
    with pytest.raises(ValidationError):
        EvaluationCreate(**{**data, "accuracy": 2})
    assert len(repo.list_evaluations()) == 1


def test_transaction_rolls_back(client, app):
    db = app.state.repository.database
    with pytest.raises(RuntimeError), db.connect() as conn:
        conn.execute("INSERT INTO tickets(text,created_at) VALUES('rollback','today')")
        raise RuntimeError("test rollback")
    assert app.state.repository.list_tickets() == []
