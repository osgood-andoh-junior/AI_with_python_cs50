"use client";
import { useState } from "react";
import { ScanText } from "lucide-react";
import { api, type Prediction } from "../../lib/api";
import { ErrorNotice, PageHeading, percent } from "../../components/ui";
export default function Classify() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<Prediction>();
  const [error, setError] = useState<unknown>();
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState<{ text: string; id: number }>();
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(undefined);
    setResult(undefined);
    try {
      const ticket =
        saved?.text === text ? saved : await api.createTicket(text);
      setSaved({ text, id: ticket.id });
      setResult(await api.predict(ticket.id));
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeading eyebrow="MODEL INFERENCE" title="Classify a ticket">
        See how your classifier understands a support request.
      </PageHeading>
      <div className="two-column">
        <form className="panel form-panel" onSubmit={submit}>
          <h2>Ticket text</h2>
          <p className="muted">
            Describe the issue in the customer’s own words.
          </p>
          <label htmlFor="ticket-text">Support request</label>
          <textarea
            id="ticket-text"
            required
            maxLength={10000}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. I cannot connect to the Wi-Fi."
            rows={8}
          />
          <div className="form-foot">
            <small>{text.length.toLocaleString()} / 10,000 characters</small>
            <button className="button primary" disabled={busy || !text.trim()}>
              <ScanText size={17} />
              {busy ? "Classifying…" : "Classify"}
            </button>
          </div>
          <p className="hint">
            Submitting saves the ticket to your dataset. Retrying the same text
            reuses that ticket.
          </p>
        </form>
        <section className="panel form-panel">
          <h2>Prediction result</h2>
          <p className="muted">Output from your active classifier.</p>
          <ErrorNotice error={error} />
          <dl className="result-list">
            <div>
              <dt>Predicted category</dt>
              <dd>{result?.category || "—"}</dd>
            </div>
            <div>
              <dt>Confidence</dt>
              <dd>{percent(result?.confidence)}</dd>
            </div>
            <div>
              <dt>Model</dt>
              <dd>{result?.model || "—"}</dd>
            </div>
            <div>
              <dt>Processing time</dt>
              <dd>
                {result ? `${result.processing_time_ms.toFixed(2)} ms` : "—"}
              </dd>
            </div>
          </dl>
          {!result && (
            <div className="notice">
              <p>
                Implement the student ML interface to enable predictions. No
                results are generated until your model is ready.
              </p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
