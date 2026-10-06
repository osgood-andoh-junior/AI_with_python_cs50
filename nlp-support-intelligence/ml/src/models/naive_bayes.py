from pathlib import Path
from typing import Sequence

from ml.src.contracts import Classifier, StudentMLNotImplemented


class NaiveBayesClassifier(Classifier):
    @property
    def classes(self) -> Sequence[str]:
        """TODO(STUDENT-ML): student implementation required."""
        raise StudentMLNotImplemented("naive_bayes")

    def fit(self, texts: Sequence[str], labels: Sequence[str]) -> None:
        """TODO(STUDENT-ML): student implementation required."""
        raise StudentMLNotImplemented("naive_bayes")

    def predict(self, texts: Sequence[str]) -> Sequence[str]:
        """TODO(STUDENT-ML): student implementation required."""
        raise StudentMLNotImplemented("naive_bayes")

    def predict_proba(self, texts: Sequence[str]) -> Sequence[Sequence[float]]:
        """TODO(STUDENT-ML): student implementation required."""
        raise StudentMLNotImplemented("naive_bayes")

    def save(self, path: Path) -> None:
        """TODO(STUDENT-ML): student implementation required."""
        raise StudentMLNotImplemented("naive_bayes")

    def load(self, path: Path) -> None:
        """TODO(STUDENT-ML): student implementation required."""
        raise StudentMLNotImplemented("naive_bayes")
