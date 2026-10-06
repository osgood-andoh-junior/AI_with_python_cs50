# ML learning path

| Order / component | Purpose | Expected input | Expected output | Dependencies | Implementation file |
| --- | --- | --- | --- | --- | --- |
| 1. Preprocessing | Prepare ticket text | Raw string | Prepared string | None | `ml/src/preprocessing/text.py` |
| 2. Tokenization | Represent text as tokens | Prepared string | List of token strings | Preprocessing | `ml/src/preprocessing/tokenization.py` |
| 3. Vocabulary | Define token feature identities | Tokenized documents | Token-to-index mapping | Tokenization | `ml/src/representations/vocabulary.py` |
| 4. Bag of Words | Represent documents as features | Tokenized documents, vocabulary | Feature matrix | Vocabulary | `ml/src/representations/bow.py` |
| 5. Class priors | Describe class-level training statistics | Category labels | Category-to-probability mapping | Labeled dataset | `ml/src/training/priors.py` |
| 6. Conditional probabilities | Describe class-specific feature statistics | Feature matrix, labels | Conditional-probability structure | Bag of Words, labels | `ml/src/training/probabilities.py` |
| 7. Laplace smoothing | Support probability estimation | Count structure, smoothing parameter | Smoothed-probability structure | Count statistics | `ml/src/training/smoothing.py` |
| 8. Naive Bayes fit | Prepare a fitted classifier | Raw ticket strings, labels | Fitted classifier state | Items 1–7 | `ml/src/models/naive_bayes.py` (`fit`) |
| 9. Naive Bayes prediction | Assign categories and confidence | Raw ticket strings, fitted state | Category list, probability rows | Fitted classifier | `ml/src/models/naive_bayes.py` (`predict`, `predict_proba`, `classes`) |
| 10. Evaluation | Measure classification performance | Actual and predicted category lists | Metric-name-to-score mapping | Predictions, actual labels | `ml/src/evaluation/metrics.py` |
| 11. TF-IDF | Provide an alternative text representation | Tokenized documents | Feature representation | Preprocessing, tokenization, vocabulary | `ml/src/representations/tfidf.py`; `ml/src/models/tfidf_classifier.py` |
| 12. Embeddings | Represent text in a vector space | Text strings | Document or token vectors | Prepared data | `ml/src/representations/embeddings.py`; optional similarity interface in `ml/src/evaluation/similarity.py` |
| 13. Neural network | Classify tickets using a neural model | Ticket strings, labels, vector representation | Fitted state, categories, probabilities | Embeddings, evaluation | `ml/src/models/neural_network.py` |
| 14. RNN | Classify sequential text representations | Ticket strings, labels, sequences | Fitted state, categories, probabilities | Sequential representation, evaluation | `ml/src/representations/sequences.py`; `ml/src/models/rnn.py` |
| 15. Attention | Extend a sequential classifier | Sequential model representations | Attention output, categories, probabilities | RNN, evaluation | `ml/src/models/attention.py`; `ml/src/models/rnn_attention.py` |
| 16. Transformer | Explore Transformer classification | Ticket strings, labels, model inputs | Fitted state, categories, probabilities | Prior representation and evaluation work | `ml/src/models/self_attention.py`; `ml/src/models/transformer.py` |
