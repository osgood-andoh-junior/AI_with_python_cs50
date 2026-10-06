from collections.abc import Callable
from dataclasses import dataclass

from ml.src.contracts import Classifier
from ml.src.models.naive_bayes import NaiveBayesClassifier
from ml.src.models.neural_network import NeuralNetworkClassifier
from ml.src.models.rnn import RNNClassifier
from ml.src.models.rnn_attention import AttentionRNNClassifier
from ml.src.models.tfidf_classifier import TfidfClassifier
from ml.src.models.transformer import TransformerClassifier


@dataclass
class ModelBinding:
    classifier: Classifier
    version: str


class ModelRegistry:
    """Composition boundary: register factories here, without changing API routes."""

    def __init__(self):
        self.factories: dict[str, Callable[[], Classifier]] = {
            "naive_bayes": NaiveBayesClassifier,
            "tfidf": TfidfClassifier,
            "neural_network": NeuralNetworkClassifier,
            "rnn": RNNClassifier,
            "attention": AttentionRNNClassifier,
            "transformer": TransformerClassifier,
        }
        self.active = ModelBinding(NaiveBayesClassifier(), "naive-bayes-v1")
        self.active_registered = False

    def create(self, key: str) -> Classifier:
        return self.factories[key]()

    def activate(self, classifier: Classifier, version: str):
        self.active = ModelBinding(classifier, version)
        self.active_registered = True
