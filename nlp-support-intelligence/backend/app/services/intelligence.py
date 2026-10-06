import math
from time import perf_counter
from uuid import uuid4

from backend.app.database.repository import Repository
from backend.app.schemas.contracts import Category, Prediction
from backend.app.services.registry import ModelRegistry
from ml.src.contracts import StudentMLNotImplemented


class IntelligenceService:
    def __init__(self, repository: Repository, registry: ModelRegistry, artifact_root):
        self.repository = repository
        self.registry = registry
        self.artifact_root = artifact_root

    def predict(self, ticket):
        start = perf_counter()
        binding = self.registry.active
        predictions = binding.classifier.predict([ticket["text"]])
        probabilities = binding.classifier.predict_proba([ticket["text"]])
        classes = list(binding.classifier.classes)
        valid = {category.value for category in Category}
        if len(classes) != len(set(classes)) or set(classes) != valid:
            raise ValueError("Classifier classes must contain the six ticket categories.")
        if len(predictions) != 1 or predictions[0] not in valid or len(probabilities) != 1:
            raise ValueError("Classifier returned an invalid prediction shape or category.")
        row = probabilities[0]
        if len(row) != len(classes) or any(not math.isfinite(p) or p < 0 or p > 1 for p in row):
            raise ValueError("Classifier returned invalid probabilities.")
        if not math.isclose(sum(row), 1.0, abs_tol=1e-5):
            raise ValueError("Classifier probabilities must sum to one.")
        result = Prediction(
            ticket_id=ticket["id"],
            category=predictions[0],
            confidence=row[classes.index(predictions[0])],
            model=binding.version,
            processing_time_ms=(perf_counter() - start) * 1000,
        )
        self.repository.record_prediction(
            ticket["id"], result.category, result.confidence, result.model
        )
        return result

    def train(self, key):
        run_id = self.repository.start_run(key)
        try:
            classifier = self.registry.create(key)
            tickets = self.repository.labeled_tickets()
            classifier.fit([t["text"] for t in tickets], [t["actual_category"] for t in tickets])
            version = f"{key}-{uuid4().hex}"
            artifact = self.artifact_root / version
            artifact.parent.mkdir(parents=True, exist_ok=True)
            classifier.save(artifact)
            if not artifact.exists():
                raise ValueError("Classifier.save must create its artifact at the supplied path.")
            self.repository.register_model(key, version, artifact)
            self.repository.finish_run(run_id, "completed")
            self.registry.activate(classifier, version)
            return {"run_id": run_id, "status": "completed", "model_version": version}
        except StudentMLNotImplemented as exc:
            self.repository.finish_run(run_id, "blocked", str(exc))
            raise
        except Exception:
            self.repository.finish_run(run_id, "failed", "Training failed; inspect server logs.")
            raise
