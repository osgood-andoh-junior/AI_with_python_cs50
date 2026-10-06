from datetime import datetime, timezone

from backend.app.database.session import Database
from backend.app.schemas.contracts import EvaluationCreate


def now():
    return datetime.now(timezone.utc).isoformat()


class Repository:
    def __init__(self, database: Database):
        self.database = database

    def rows(self, sql, params=()):
        with self.database.connect() as conn:
            return [dict(row) for row in conn.execute(sql, params).fetchall()]

    def execute(self, sql, params=()):
        with self.database.connect() as conn:
            return conn.execute(sql, params).lastrowid

    def create_ticket(self, text, category=None):
        ticket_id = self.execute(
            "INSERT INTO tickets(text,actual_category,created_at) VALUES(?,?,?)",
            (text, category, now()),
        )
        return self.get_ticket(ticket_id)

    def get_ticket(self, ticket_id):
        rows = self.rows("SELECT * FROM tickets WHERE id=?", (ticket_id,))
        return rows[0] if rows else None

    def list_tickets(self, limit=100, offset=0):
        return self.rows("SELECT * FROM tickets ORDER BY id DESC LIMIT ? OFFSET ?", (limit, offset))

    def label_ticket(self, ticket_id, category):
        self.execute("UPDATE tickets SET actual_category=? WHERE id=?", (category, ticket_id))
        return self.get_ticket(ticket_id)

    def delete_ticket(self, ticket_id):
        with self.database.connect() as conn:
            return conn.execute("DELETE FROM tickets WHERE id=?", (ticket_id,)).rowcount > 0

    def record_prediction(self, ticket_id, category, confidence, version):
        self.execute(
            "UPDATE tickets SET predicted_category=?,confidence=?,model_version=? WHERE id=?",
            (category, confidence, version, ticket_id),
        )

    def register_model(self, model_key, version, artifact_path):
        model_id = self.execute(
            "INSERT INTO model_versions(model_key,version,artifact_path,created_at) VALUES(?,?,?,?)",
            (model_key, version, str(artifact_path), now()),
        )
        return self.rows("SELECT * FROM model_versions WHERE id=?", (model_id,))[0]

    def list_models(self):
        return self.rows("SELECT * FROM model_versions ORDER BY id DESC")

    def store_evaluation(self, evaluation: EvaluationCreate):
        evaluation_id = self.execute(
            "INSERT INTO evaluation_results(model_id,accuracy,precision,recall,f1,dataset_name,created_at) VALUES(?,?,?,?,?,?,?)",
            (*evaluation.model_dump().values(), now()),
        )
        return self.rows("SELECT * FROM evaluation_results WHERE id=?", (evaluation_id,))[0]

    def list_evaluations(self):
        return self.rows("SELECT * FROM evaluation_results ORDER BY id DESC")

    def start_run(self, model_key):
        return self.execute(
            "INSERT INTO training_runs(model_key,status,created_at) VALUES(?,'running',?)",
            (model_key, now()),
        )

    def finish_run(self, run_id, status, error=None):
        self.execute(
            "UPDATE training_runs SET status=?,error=?,completed_at=? WHERE id=?",
            (status, error, now(), run_id),
        )

    def list_runs(self):
        return self.rows("SELECT * FROM training_runs ORDER BY id DESC")

    def labeled_tickets(self):
        return self.rows("SELECT * FROM tickets WHERE actual_category IS NOT NULL ORDER BY id")

    def summary(self):
        return {
            "total_tickets": self.rows("SELECT COUNT(*) AS total FROM tickets")[0]["total"],
            "distribution": self.rows(
                "SELECT actual_category AS category,COUNT(*) AS count FROM tickets GROUP BY actual_category"
            ),
            "recent_predictions": self.rows(
                "SELECT * FROM tickets WHERE predicted_category IS NOT NULL ORDER BY id DESC LIMIT 5"
            ),
        }
