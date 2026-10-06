from pathlib import Path
from typing import Sequence

from ml.src.contracts import Classifier, StudentMLNotImplemented


class RNNClassifier(Classifier):
    @property
    def classes(self) -> Sequence[str]:
        """TODO(STUDENT-ML): student implementation required."""
        raise StudentMLNotImplemented("rnn")

    def fit(self, texts: Sequence[str], labels: Sequence[str]) -> None:
        """TODO(STUDENT-ML): student implementation required."""
        raise StudentMLNotImplemented("rnn")

    def predict(self, texts: Sequence[str]) -> Sequence[str]:
        """TODO(STUDENT-ML): student implementation required."""
        raise StudentMLNotImplemented("rnn")

    def predict_proba(self, texts: Sequence[str]) -> Sequence[Sequence[float]]:
        """TODO(STUDENT-ML): student implementation required."""
        raise StudentMLNotImplemented("rnn")

    def save(self, path: Path) -> None:
        """TODO(STUDENT-ML): student implementation required."""
        raise StudentMLNotImplemented("rnn")

    def load(self, path: Path) -> None:
        """TODO(STUDENT-ML): student implementation required."""
        raise StudentMLNotImplemented("rnn")
