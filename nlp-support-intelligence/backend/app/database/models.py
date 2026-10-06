SCHEMA = """
CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL CHECK(length(trim(text)) BETWEEN 1 AND 10000),
    actual_category TEXT CHECK(actual_category IN ('Network','Account','Payment','Software','Hardware','Other')),
    predicted_category TEXT CHECK(predicted_category IN ('Network','Account','Payment','Software','Hardware','Other')),
    confidence REAL CHECK(confidence BETWEEN 0 AND 1),
    model_version TEXT,
    created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS model_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_key TEXT NOT NULL,
    version TEXT NOT NULL UNIQUE,
    artifact_path TEXT NOT NULL,
    created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS evaluation_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_id INTEGER NOT NULL REFERENCES model_versions(id),
    accuracy REAL NOT NULL CHECK(accuracy BETWEEN 0 AND 1),
    precision REAL NOT NULL CHECK(precision BETWEEN 0 AND 1),
    recall REAL NOT NULL CHECK(recall BETWEEN 0 AND 1),
    f1 REAL NOT NULL CHECK(f1 BETWEEN 0 AND 1),
    dataset_name TEXT NOT NULL,
    created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS training_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_key TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('running','blocked','failed','completed')),
    error TEXT,
    created_at TEXT NOT NULL,
    completed_at TEXT
);
"""
