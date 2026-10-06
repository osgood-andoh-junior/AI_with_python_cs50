import pytest

from backend.app.schemas.contracts import EvaluationCreate


def test_health_and_empty_state(client):
    assert client.get("/health").json() == {"status": "ok", "database": "ok"}
    for route in ["tickets", "models", "evaluations", "training/runs"]:
        assert client.get(f"/api/{route}").json() == []
    assert client.get("/api/dashboard").json() == {
        "total_tickets": 0,
        "distribution": [],
        "recent_predictions": [],
        "current_model": None,
        "latest_evaluation": None,
    }


def test_ticket_crud(client):
    response = client.post("/api/tickets", json={"text": "  Wi-Fi issue  "})
    assert response.status_code == 201
    ticket = response.json()
    assert ticket["text"] == "Wi-Fi issue"
    assert ticket["predicted_category"] is None
    assert ticket["confidence"] is None
    assert ticket["model_version"] is None
    assert ticket["created_at"].endswith("Z")
    path = f"/api/tickets/{ticket['id']}"
    assert client.get(path).json() == ticket
    assert client.get("/api/tickets").json() == [ticket]
    assert (
        client.patch(path, json={"actual_category": "Network"}).json()["actual_category"]
        == "Network"
    )
    assert client.patch(path, json={"actual_category": None}).json()["actual_category"] is None
    assert client.delete(path).status_code == 204
    assert client.get(path).status_code == 404
    assert client.delete(path).status_code == 404
    assert client.patch(path, json={"actual_category": "Other"}).status_code == 404


@pytest.mark.parametrize(
    "body",
    [
        {},
        {"text": ""},
        {"text": "   "},
        {"text": "x" * 10001},
        {"text": "hi", "actual_category": "Unknown"},
        {"text": 9},
        {"text": "hi", "confidence": 0.9},
    ],
)
def test_invalid_ticket(client, body):
    assert client.post("/api/tickets", json=body).status_code == 422
    assert client.get("/api/tickets").json() == []


def test_pagination(client):
    for text in ["a", "b", "c"]:
        client.post("/api/tickets", json={"text": text})
    assert [t["text"] for t in client.get("/api/tickets?limit=1&offset=1").json()] == ["b"]
    for query in ["limit=0", "limit=501", "offset=-1"]:
        assert client.get(f"/api/tickets?{query}").status_code == 422


def test_prediction_not_implemented_is_clean_and_persists_no_result(client):
    ticket = client.post("/api/tickets", json={"text": "Cannot connect"}).json()
    response = client.post("/api/predictions", json={"ticket_id": ticket["id"]})
    assert response.status_code == 501
    assert response.json() == {
        "error": "STUDENT_ML_NOT_IMPLEMENTED",
        "component": "naive_bayes",
        "message": "Complete TODO(STUDENT-ML) in the ML module.",
    }
    assert client.get(f"/api/tickets/{ticket['id']}").json() == ticket
    assert client.get("/api/dashboard").json()["recent_predictions"] == []


@pytest.mark.parametrize(
    "key, component",
    [
        ("naive_bayes", "naive_bayes"),
        ("tfidf", "tfidf_classifier"),
        ("neural_network", "neural_network"),
        ("rnn", "rnn"),
        ("attention", "rnn_attention"),
        ("transformer", "transformer"),
    ],
)
def test_training_stubs_record_blocked_runs(client, key, component):
    response = client.post("/api/training/start", json={"model_key": key})
    assert response.status_code == 501
    assert response.json()["component"] == component
    run = client.get("/api/training/runs").json()[0]
    assert run["status"] == "blocked"
    assert run["completed_at"] is not None
    assert client.get("/api/models").json() == []


def test_prediction_and_training_validation(client):
    assert client.post("/api/predictions", json={"ticket_id": 999}).status_code == 404
    assert client.post("/api/predictions", json={"ticket_id": -1}).status_code == 422
    assert client.post("/api/predictions", json={"text": "hi"}).status_code == 422
    assert client.post("/api/training/start", json={"model_key": "unknown"}).status_code == 422
    assert client.get("/api/training/runs").json() == []


def test_metadata_endpoints(client, app):
    repo = app.state.repository
    model = repo.register_model("naive_bayes", "metadata-fixture", "ml/artifacts/test-only")
    evaluation = repo.store_evaluation(
        EvaluationCreate(
            model_id=model["id"],
            accuracy=0.5,
            precision=0.4,
            recall=0.3,
            f1=0.2,
            dataset_name="Infrastructure test fixture",
        )
    )
    assert client.get("/api/models").json()[0]["version"] == model["version"]
    assert client.get("/api/evaluations").json()[0]["id"] == evaluation["id"]
    assert client.get("/api/dashboard").json()["latest_evaluation"]["f1"] == 0.2


def test_cors(client):
    response = client.options(
        "/api/tickets",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type",
        },
    )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"
    assert (
        "access-control-allow-origin"
        not in client.get("/health", headers={"Origin": "https://untrusted.example"}).headers
    )
