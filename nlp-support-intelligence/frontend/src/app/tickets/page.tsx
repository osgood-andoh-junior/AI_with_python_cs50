"use client";
import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { api, categories, type Category, type Ticket } from "../../lib/api";
import {
  date,
  Empty,
  ErrorNotice,
  PageHeading,
  percent,
} from "../../components/ui";
export default function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [text, setText] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState<unknown>();
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setTickets(await api.tickets(offset));
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [offset]);
  useEffect(() => {
    void reload();
  }, [reload]);
  async function add(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(undefined);
    try {
      await api.createTicket(text, (category as Category) || null);
      setText("");
      setCategory("");
      if (offset) setOffset(0);
      else await reload();
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }
  async function change(id: number, label: string) {
    setBusy(true);
    setError(undefined);
    try {
      await api.labelTicket(id, (label as Category) || null);
      await reload();
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }
  async function remove(id: number) {
    if (!window.confirm(`Delete ticket #${id}? This cannot be undone.`)) return;
    setBusy(true);
    setError(undefined);
    try {
      await api.deleteTicket(id);
      await reload();
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeading eyebrow="YOUR DATASET" title="Tickets">
        Collect support requests and add the labels your models will learn from.
      </PageHeading>
      <ErrorNotice error={error} />
      <form onSubmit={add} className="panel form-panel ticket-form">
        <div>
          <label htmlFor="new-ticket">New support ticket</label>
          <textarea
            id="new-ticket"
            required
            maxLength={10000}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter a support request…"
            rows={2}
          />
        </div>
        <div>
          <label htmlFor="new-category">Actual category</label>
          <select
            id="new-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Unlabeled</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <button className="button primary" disabled={busy || !text.trim()}>
          <Plus size={17} /> Add ticket
        </button>
      </form>
      <section className="panel">
        <div className="panel-heading">
          <h2>Ticket dataset</h2>
          <span className="muted">{tickets.length} on this page</span>
        </div>
        {loading ? (
          <Empty title="Loading tickets…" />
        ) : tickets.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Actual category</th>
                  <th>Prediction</th>
                  <th>Confidence</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td className="ticket-cell">
                      <small>#{ticket.id}</small>
                      {ticket.text}
                    </td>
                    <td>
                      <select
                        aria-label={`Category for ticket ${ticket.id}`}
                        disabled={busy}
                        value={ticket.actual_category || ""}
                        onChange={(e) => void change(ticket.id, e.target.value)}
                      >
                        <option value="">Unlabeled</option>
                        {categories.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </td>
                    <td>{ticket.predicted_category || "—"}</td>
                    <td>{percent(ticket.confidence)}</td>
                    <td>{date(ticket.created_at)}</td>
                    <td>
                      <button
                        className="icon-button"
                        disabled={busy}
                        onClick={() => void remove(ticket.id)}
                        aria-label={`Delete ticket ${ticket.id}`}
                      >
                        <Trash2 size={17} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title={
              error
                ? "Could not load tickets"
                : "Your dataset starts with one ticket"
            }
          >
            Add a support request above to start collecting your data.
          </Empty>
        )}
        <div className="panel-foot">
          <button
            disabled={offset === 0 || loading}
            onClick={() => setOffset(Math.max(0, offset - 50))}
          >
            Previous
          </button>
          <span>Page {offset / 50 + 1}</span>
          <button
            disabled={tickets.length < 50 || loading}
            onClick={() => setOffset(offset + 50)}
          >
            Next
          </button>
        </div>
      </section>
    </>
  );
}
