from pathlib import Path
from unittest.mock import Mock

import pytest
from fastapi.testclient import TestClient

from backend.app.main import create_app
from backend.app.schemas.contracts import Category
from ml.src.contracts import Classifier


def contract_mock():
    # Fixed protocol fixtures only: no classifier logic or production fallback.
    classifier = Mock(spec=Classifier)
    classifier.classes = [c.value for c in Category]
    classifier.predict.return_value = ["Network"]
    classifier.predict_proba.return_value = [[1, 0, 0, 0, 0, 0]]
    return classifier


def test_swappable_classifier_and_prediction_storage(client, app):
    classifier = contract_mock()
    app.state.registry.activate(classifier, "test-protocol-only")
    ticket = client.post("/api/tickets", json={"text": "protocol fixture"}).json()
    response = client.post("/api/predictions", json={"ticket_id": ticket["id"]})
    assert response.status_code == 200
    assert response.json()["model"] == "test-protocol-only"
    assert response.json()["processing_time_ms"] >= 0
    classifier.predict.assert_called_once_with(["protocol fixture"])
    assert client.get(f"/api/tickets/{ticket['id']}").json()["predicted_category"] == "Network"


@pytest.mark.parametrize(
    "probabilities",
    [[], [[0.1]], [[2, 0, 0, 0, 0, 0]], [[0.1] * 6], [[float("nan"), 0, 0, 0, 0, 0]]],
)
def test_invalid_model_output_never_saved(client, app, probabilities):
    classifier = contract_mock()
    classifier.predict_proba.return_value = probabilities
    app.state.registry.activate(classifier, "invalid-fixture")
    ticket = app.state.repository.create_ticket("fixture")
    with pytest.raises(ValueError):
        app.state.intelligence.predict(ticket)
    assert app.state.repository.get_ticket(ticket["id"])["confidence"] is None


def test_training_lifecycle_artifacts_and_restart(client, app, tmp_path):
    classifier = contract_mock()
    classifier.save.side_effect = lambda path: path.write_text("protocol fixture", encoding="utf-8")
    app.state.registry.factories["naive_bayes"] = lambda: classifier
    client.post("/api/tickets", json={"text": "labeled", "actual_category": "Other"})
    client.post("/api/tickets", json={"text": "unlabeled"})
    response = client.post("/api/training/start", json={"model_key": "naive_bayes"})
    assert response.status_code == 200
    classifier.fit.assert_called_once_with(["labeled"], ["Other"])
    model = app.state.repository.list_models()[0]
    assert Path(model["artifact_path"]).read_text() == "protocol fixture"
    assert app.state.repository.list_runs()[0]["status"] == "completed"
    app.state.registry.active_registered = False
    restarted = create_app(str(app.state.repository.database.path), registry=app.state.registry)
    with TestClient(restarted) as new_client:
        classifier.load.assert_called_once_with(Path(model["artifact_path"]))
        assert new_client.get("/api/dashboard").json()["current_model"] == model["version"]


def test_training_failure_does_not_register(client, app):
    classifier = contract_mock()
    classifier.fit.side_effect = RuntimeError("fixture failure")
    app.state.registry.factories["naive_bayes"] = lambda: classifier
    with pytest.raises(RuntimeError):
        app.state.intelligence.train("naive_bayes")
    assert app.state.repository.list_runs()[0]["status"] == "failed"
    assert app.state.repository.list_models() == []
