"use client";
import { useEffect, useState } from "react";
import { api, type Model, type Evaluation } from "../../lib/api";
import {
  date,
  Empty,
  ErrorNotice,
  PageHeading,
  percent,
} from "../../components/ui";
export default function Models() {
  const [models, setModels] = useState<Model[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [error, setError] = useState<unknown>();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([api.models(), api.evaluations()])
      .then(([m, e]) => {
        setModels(m);
        setEvaluations(e);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);
  return (
    <>
      <PageHeading eyebrow="MODEL REGISTRY" title="Your models">
        Compare recorded evaluations across your classifier versions.
      </PageHeading>
      <ErrorNotice error={error} />
      <section className="panel">
        <div className="panel-heading">
          <h2>Registered versions</h2>
          <span className="badge">{models.length} models</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {[
                  "Model",
                  "Version",
                  "Accuracy",
                  "Precision",
                  "Recall",
                  "F1",
                  "Training date",
                ].map((label) => (
                  <th key={label}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {models.map((model) => {
                const evaluation = evaluations.find(
                  (e) => e.model_id === model.id,
                );
                return (
                  <tr key={model.id}>
                    <td>{model.model_key}</td>
                    <td>{model.version}</td>
                    <td>{percent(evaluation?.accuracy)}</td>
                    <td>{percent(evaluation?.precision)}</td>
                    <td>{percent(evaluation?.recall)}</td>
                    <td>{percent(evaluation?.f1)}</td>
                    <td>{date(model.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!models.length && (
          <Empty
            title={
              loading
                ? "Loading models…"
                : error
                  ? "Model registry unavailable"
                  : "A home for your trained models"
            }
          >
            Successful training registers the artifact and version here.
            Evaluation metrics stay empty until you record them.
          </Empty>
        )}
      </section>
      <div className="notice">
        <p>
          Model artifacts live in <code>ml/artifacts/</code>. SQLite stores
          their paths and metadata. Scores shown here come only from recorded
          student evaluations.
        </p>
      </div>
    </>
  );
}
