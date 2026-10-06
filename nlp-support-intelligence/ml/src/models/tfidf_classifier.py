from pathlib import Path
from typing import Sequence

from ml.src.contracts import Classifier, StudentMLNotImplemented


class TfidfClassifier(Classifier):
    @property
    def classes(self) -> Sequence[str]:
        """TODO(STUDENT-ML): student implementation required."""
        raise StudentMLNotImplemented("tfidf_classifier")

    def fit(self, texts: Sequence[str], labels: Sequence[str]) -> None:
        """TODO(STUDENT-ML): student implementation required."""
        raise StudentMLNotImplemented("tfidf_classifier")

    def predict(self, texts: Sequence[str]) -> Sequence[str]:
        """TODO(STUDENT-ML): student implementation required."""
        raise StudentMLNotImplemented("tfidf_classifier")

    def predict_proba(self, texts: Sequence[str]) -> Sequence[Sequence[float]]:
        """TODO(STUDENT-ML): student implementation required."""
        raise StudentMLNotImplemented("tfidf_classifier")

    def save(self, path: Path) -> None:
        """TODO(STUDENT-ML): student implementation required."""
        raise StudentMLNotImplemented("tfidf_classifier")

    def load(self, path: Path) -> None:
        """TODO(STUDENT-ML): student implementation required."""
        raise StudentMLNotImplemented("tfidf_classifier")
