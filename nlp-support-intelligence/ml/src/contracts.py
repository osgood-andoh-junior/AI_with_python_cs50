from abc import ABC, abstractmethod
from pathlib import Path
from typing import Sequence


class StudentMLNotImplemented(NotImplementedError):
    def __init__(self, component: str):
        self.component = component
        super().__init__("Complete TODO(STUDENT-ML) in the ML module.")


class Classifier(ABC):
    """Boundary for student classifiers; probability columns follow classes."""

    @property
    @abstractmethod
    def classes(self) -> Sequence[str]: ...

    @abstractmethod
    def fit(self, texts: Sequence[str], labels: Sequence[str]) -> None: ...

    @abstractmethod
    def predict(self, texts: Sequence[str]) -> Sequence[str]: ...

    @abstractmethod
    def predict_proba(self, texts: Sequence[str]) -> Sequence[Sequence[float]]: ...

    @abstractmethod
    def save(self, path: Path) -> None: ...

    @abstractmethod
    def load(self, path: Path) -> None: ...
