"use client";
import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import { api, type Run } from "../../lib/api";
import { date, Empty, ErrorNotice, PageHeading } from "../../components/ui";
export default function Training() {
  const [key, setKey] = useState("naive_bayes");
  const [runs, setRuns] = useState<Run[]>([]);
  const [error, setError] = useState<unknown>();
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState("");
  useEffect(() => {
    api.runs().then(setRuns).catch(setError);
  }, []);
  async function train(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(undefined);
    setSuccess("");
    try {
      const result = await api.train(key);
      setSuccess(`Training complete: ${result.model_version}`);
    } catch (e) {
      setError(e);
    } finally {
      try {
        setRuns(await api.runs());
      } catch (e) {
        setError((current: unknown) => current || e);
      }
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeading eyebrow="TRAINING WORKSPACE" title="Train your model">
        Connect your student implementation to the labeled ticket dataset.
      </PageHeading>
      <div className="notice">
        <p>
          Training runs synchronously in V1. The selected classifier receives
          all labeled tickets. Use your notebooks for dataset splits,
          evaluation, and longer experiments.
        </p>
      </div>
      <form className="panel form-panel training-form" onSubmit={train}>
        <div>
          <label htmlFor="model-key">Classifier</label>
          <select
            id="model-key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
          >
            {[
              ["naive_bayes", "Bag of Words + Naive Bayes"],
              ["tfidf", "TF-IDF classifier"],
              ["neural_network", "Embeddings + Neural Network"],
              ["rnn", "RNN"],
              ["attention", "RNN + Attention"],
              ["transformer", "Transformer"],
            ].map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <button className="button primary" disabled={busy}>
          <Play size={16} />
          {busy ? "Training…" : "Start training"}
        </button>
      </form>
      <ErrorNotice error={error} />
      {success && (
        <p role="status" className="notice">
          {success}
        </p>
      )}
      <section className="panel">
        <div className="panel-heading">
          <h2>Training history</h2>
          <span className="muted">Persisted local runs</span>
        </div>
        {runs.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Run</th>
                  <th>Classifier</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr key={run.id}>
                    <td>#{run.id}</td>
                    <td>{run.model_key}</td>
                    <td>
                      <span className="badge">{run.status}</span>
                    </td>
                    <td>{date(run.created_at)}</td>
                    <td>{run.error || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title="No training runs yet">
            Your training attempts and their status will appear here.
          </Empty>
        )}
      </section>
    </>
  );
}
