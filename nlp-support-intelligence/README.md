# NLP Support-Ticket Intelligence System

A local learning laboratory for multiclass support-ticket classification. The software infrastructure works; all NLP and ML algorithms belong to the student and intentionally raise `STUDENT_ML_NOT_IMPLEMENTED` until implemented.

Categories: **Network, Account, Payment, Software, Hardware, Other**.

## Setup

Use Python 3.11+ and Node.js 22.6+ (Node 24 is also supported). Run commands from this directory, not its parent.

```powershell
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r backend/requirements-dev.txt -r ml/requirements.txt
Copy-Item .env.example .env
Copy-Item frontend/.env.example frontend/.env.local
cd frontend
npm ci
cd ..
```

On macOS/Linux, use `.venv/bin/python` in place of `.venv/Scripts/python.exe`, and `cp` in place of `Copy-Item`. If using uv, `uv pip install --python .venv/Scripts/python.exe -r backend/requirements-dev.txt -r ml/requirements.txt` is equivalent. The working environment created with this project is already installed.

## Run

Backend, in a terminal at the project root:

```powershell
.venv/Scripts/python.exe -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```

Frontend, in a second terminal:

```powershell
cd frontend
npm run dev
```

Open [the dashboard](http://localhost:3000), [API documentation](http://localhost:8000/docs), or [health check](http://localhost:8000/health).

For notebooks, start Jupyter from the project root so the `ml` package is importable:

```powershell
.venv/Scripts/python.exe -m jupyterlab
```

Open `ml/notebooks/01_bow_naive_bayes.ipynb`. In the first code cell, you may add environment setup (not an algorithm):

```python
from pathlib import Path
import sys

root = next(path for path in [Path.cwd(), *Path.cwd().parents] if (path / "pyproject.toml").exists())
sys.path.insert(0, str(root))
```

## Working with the dashboard

- **Dashboard:** live ticket totals, actual-label distribution, active model, stored evaluation metrics, and recent ticket predictions. Empty states are intentional.
- **Tickets:** create, list, label, and delete tickets. Ticket text is immutable; labels can be corrected or cleared. The list is paginated.
- **Classify Ticket:** saves a ticket, then requests its classification. Retrying unchanged text reuses the saved ticket. A development error leaves prediction fields empty.
- **Training:** sends all labeled tickets to the selected classifier's `fit`, then `save`. V1 training runs synchronously. Unimplemented methods produce a persisted `blocked` run.
- **Models:** successful training registers versions and artifact paths. Metrics appear only after student evaluations are stored.
- **Experiments:** six notebook locations and their learning sequence; no fabricated completion state.

## API

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/health` | Database connectivity |
| POST / GET | `/api/tickets` | Create / list tickets |
| GET / PATCH / DELETE | `/api/tickets/{id}` | Read / update actual label / delete |
| POST | `/api/predictions` | Classify `{ "ticket_id": 1 }` |
| POST | `/api/training/start` | Train `{ "model_key": "naive_bayes" }` |
| GET | `/api/training/runs` | Persisted training history |
| GET | `/api/models` | Stored model versions |
| GET | `/api/evaluations` | Stored student evaluations |
| GET | `/api/dashboard` | Dashboard aggregates |

Create a ticket using `{ "text": "I cannot connect to the Wi-Fi.", "actual_category": "Network" }`. The label is optional. Blank or over-10,000-character text and invalid category names are rejected. Unknown request fields are rejected.

Unfinished ML requests return HTTP **501** with:

```json
{
  "error": "STUDENT_ML_NOT_IMPLEMENTED",
  "component": "naive_bayes",
  "message": "Complete TODO(STUDENT-ML) in the ML module."
}
```

No inference fallback, external LLM, or seeded prediction data exists.

## Student integration

Implement the interfaces under `ml/src/` in the sequence described in [the learning path](docs/ML_LEARNING_PATH.md). Do not move ML logic into the API. Classifiers expose `classes`, `fit`, `predict`, `predict_proba`, `save`, and `load`. The backend depends on `Classifier`; `backend/app/services/registry.py` is the composition point for implementations.

The six classifier keys are `naive_bayes`, `tfidf`, `neural_network`, `rnn`, `attention`, and `transformer`. `fit` receives raw ticket strings and their labels; the student classifier owns all text transformations. `predict_proba` returns one row per input, with columns in `classes` order. `classes` must contain all six category strings exactly once. `save(path)` must create a file or directory at that path; `load(path)` restores the same contract. The latest successful training becomes active and is loaded on backend restart.

Evaluation computation remains student-owned. After computing your metrics in a notebook, use the infrastructure storage boundary:

```python
from backend.app.database.session import Database
from backend.app.database.repository import Repository
from backend.app.schemas.contracts import EvaluationCreate

database = Database(str(root / "backend/data/support.sqlite3"))
database.initialize()
repository = Repository(database)
models = repository.list_models()
# Supply your measured values and the corresponding registered model ID.
# repository.store_evaluation(EvaluationCreate(...))
```

`EvaluationCreate` requires `model_id`, `accuracy`, `precision`, `recall`, `f1`, and `dataset_name`. Scores must be in `[0, 1]`. Store values you measured on a documented evaluation split. Student evaluation owns the averaging convention. No metric calculation is supplied here.

## Verification

```powershell
.venv/Scripts/python.exe -m pytest -q
.venv/Scripts/ruff.exe check backend ml scripts
.venv/Scripts/python.exe scripts/audit_student_ml.py
cd frontend
npm test
npm run lint
npm run typecheck
npm run build
cd ..
.venv/Scripts/python.exe scripts/verify_integration.py
```

The integration script starts FastAPI on an available local port with a temporary SQLite database, runs the actual frontend API client against it, and removes temporary data after shutdown. It creates no sample data in your development database. Backend protocol mocks and frontend test fixtures are isolated to test files and are never used by the application.

`ml/tests/` belongs to you. It contains empty test locations without ML solutions. `scripts/audit_student_ml.py` verifies initial stubs and valid empty notebooks, prints the directory tree, and lists every student marker grouped by experiment. Once you intentionally implement ML, this initial-scaffold audit will need to change; it is separate from the infrastructure tests.

See [architecture](docs/ARCHITECTURE.md), [verification results](docs/VERIFICATION.md), and [the generated tree and student TODO inventory](docs/STUDENT_TODO_INVENTORY.md).

V1 is a local, single-process development application. There is no authentication, job queue, cloud service, Docker, or deployment configuration. Keep it bound to localhost. Stop training before stopping the server; interrupted synchronous runs may retain a `running` status. A missing or incompatible persisted artifact causes startup to fail visibly rather than silently substituting a model.

Start with Experiment 01: Bag of Words + Naive Bayes.
