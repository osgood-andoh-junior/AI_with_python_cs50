from datetime import datetime
from enum import Enum
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, StringConstraints


class Category(str, Enum):
    network = "Network"
    account = "Account"
    payment = "Payment"
    software = "Software"
    hardware = "Hardware"
    other = "Other"


TicketText = Annotated[
    str, StringConstraints(strip_whitespace=True, min_length=1, max_length=10000)
]


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class TicketCreate(StrictModel):
    text: TicketText
    actual_category: Category | None = None


class TicketUpdate(StrictModel):
    actual_category: Category | None


class Ticket(TicketCreate):
    id: int
    predicted_category: Category | None = None
    confidence: float | None = None
    model_version: str | None = None
    created_at: datetime


class PredictionRequest(StrictModel):
    ticket_id: int = Field(gt=0)


class Prediction(StrictModel):
    ticket_id: int
    category: Category
    confidence: float = Field(ge=0, le=1)
    model: str
    processing_time_ms: float = Field(ge=0)


class TrainingRequest(StrictModel):
    model_key: Literal[
        "naive_bayes", "tfidf", "neural_network", "rnn", "attention", "transformer"
    ] = "naive_bayes"


class ModelVersion(StrictModel):
    id: int
    model_key: str
    version: str
    artifact_path: str
    created_at: datetime


class EvaluationCreate(StrictModel):
    model_id: int = Field(gt=0)
    accuracy: float = Field(ge=0, le=1)
    precision: float = Field(ge=0, le=1)
    recall: float = Field(ge=0, le=1)
    f1: float = Field(ge=0, le=1)
    dataset_name: str = Field(min_length=1, max_length=200)


class Evaluation(EvaluationCreate):
    id: int
    created_at: datetime


class TrainingRun(StrictModel):
    id: int
    model_key: str
    status: str
    error: str | None
    created_at: datetime
    completed_at: datetime | None
