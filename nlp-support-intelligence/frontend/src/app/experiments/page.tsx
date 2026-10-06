import { ArrowRight, BookOpen, FlaskConical } from "lucide-react";
import { PageHeading } from "../../components/ui";
const experiments = [
  [
    "01",
    "Bag of Words + Naive Bayes",
    "Build your first multiclass text classifier.",
    "01_bow_naive_bayes.ipynb",
    "preprocessing · vocabulary · classification",
  ],
  [
    "02",
    "TF-IDF",
    "Explore a different text representation.",
    "02_tfidf.ipynb",
    "representation · comparison",
  ],
  [
    "03",
    "Embeddings + Neural Network",
    "Move into learned text representations.",
    "03_embeddings_nn.ipynb",
    "embeddings · neural networks",
  ],
  [
    "04",
    "RNN",
    "Explore sequential text classification.",
    "04_rnn.ipynb",
    "sequences · recurrent networks",
  ],
  [
    "05",
    "Attention",
    "Extend your recurrent model with attention.",
    "05_attention.ipynb",
    "attention · evaluation",
  ],
  [
    "06",
    "Transformer",
    "Complete the journey and compare your models.",
    "06_transformer.ipynb",
    "transformers · final comparison",
  ],
];
export default function Experiments() {
  return (
    <>
      <PageHeading
        eyebrow="THE LEARNING PATH"
        title="Six experiments. Your implementations."
      >
        A structured path from your first word representation to a Transformer.
      </PageHeading>
      <div className="notice">
        <BookOpen size={20} />
        <p>
          Open notebooks from <code>ml/notebooks/</code> in JupyterLab. Each
          notebook contains empty experiment sections. Implementation order and
          contracts are in <code>docs/ML_LEARNING_PATH.md</code>.
        </p>
      </div>
      <div className="experiment-grid">
        {experiments.map(([number, title, description, notebook, tags]) => (
          <article
            className={`panel experiment ${number === "01" ? "first" : ""}`}
            key={number}
          >
            <div className="experiment-top">
              <span className="experiment-number">{number}</span>
              <span className="badge">
                {number === "01" ? "Start here" : "Student implementation"}
              </span>
            </div>
            <FlaskConical size={24} />
            <h2>{title}</h2>
            <p>{description}</p>
            <small>{tags}</small>
            <div className="notebook">
              <code>{notebook}</code>
              <ArrowRight size={16} />
            </div>
          </article>
        ))}
      </div>
      <p className="hint">
        The learning sequence is planned; completion and metrics are not
        inferred.
      </p>
    </>
  );
}
