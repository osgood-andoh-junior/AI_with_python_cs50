"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Box,
  CheckCheck,
  FlaskConical,
  ScanText,
  Ticket,
} from "lucide-react";
import { api, categories, type Summary } from "../lib/api";
import { Empty, ErrorNotice, PageHeading, percent } from "../components/ui";
export default function Dashboard() {
  const [data, setData] = useState<Summary>();
  const [error, setError] = useState<unknown>();
  useEffect(() => {
    api.summary().then(setData).catch(setError);
  }, []);
  return (
    <>
      <div className="heading-row">
        <PageHeading eyebrow="YOUR NLP WORKSPACE" title="Overview">
          A clear view of your tickets, models, and learning progress.
        </PageHeading>
        <Link className="button primary" href="/classify">
          <ScanText size={17} /> Classify a ticket
        </Link>
      </div>
      <ErrorNotice error={error} />
      <section className="welcome">
        <div>
          <span className="chip">LEARNING LAB · EXPERIMENT 01</span>
          <h2>Small experiments. Better understanding.</h2>
          <p>
            Your infrastructure is ready. Bring your first classifier to life
            <br className="desktop-break" /> with Bag of Words + Naive Bayes.
          </p>
          <Link href="/experiments">
            Open the learning path <ArrowRight size={16} />
          </Link>
        </div>
        <div className="pipeline" aria-hidden="true">
          <span>
            <Ticket size={24} /> Ticket
          </span>
          <i>→</i>
          <span className="pipeline-model">
            <FlaskConical size={24} /> Your model
          </span>
          <i>→</i>
          <span>
            <CheckCheck size={24} /> Category
          </span>
        </div>
      </section>
      <section className="stats-grid">
        <div className="stat">
          <span>
            Total tickets
            <Ticket size={18} />
          </span>
          <strong>{data ? data.total_tickets : "—"}</strong>
          <small>Tickets in your dataset</small>
        </div>
        <div className="stat">
          <span>
            Current model
            <Box size={18} />
          </span>
          <strong className="stat-text">
            {data?.current_model || "No trained model"}
          </strong>
          <small>
            {data?.current_model
              ? "Active classifier"
              : "Complete your first experiment"}
          </small>
        </div>
        <div className="stat">
          <span>
            Latest accuracy
            <CheckCheck size={18} />
          </span>
          <strong>{percent(data?.latest_evaluation?.accuracy)}</strong>
          <small>
            {data?.latest_evaluation
              ? data.latest_evaluation.dataset_name
              : "Available after evaluation"}
          </small>
        </div>
        <div className="stat">
          <span>
            Experiments
            <FlaskConical size={18} />
          </span>
          <strong>
            06 <em>planned</em>
          </strong>
          <small>From word counts to Transformers</small>
        </div>
      </section>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-heading">
            <h2>Ticket categories</h2>
            <span className="muted">Actual labels</span>
          </div>
          <div className="category-list">
            {categories.map((category, index) => {
              const count =
                data?.distribution.find((row) => row.category === category)
                  ?.count || 0;
              return (
                <div className="category-row" key={category}>
                  <span>
                    <i className={`category-dot dot-${index}`} />
                    {category}
                  </span>
                  <div className="bar-track">
                    <div
                      style={{
                        width: `${data?.total_tickets ? (count / data.total_tickets) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <b>{data ? count : "—"}</b>
                </div>
              );
            })}
          </div>
          <div className="panel-foot">
            {data
              ? `${data.distribution.find((row) => row.category === null)?.count || 0} unlabeled tickets`
              : "Waiting for ticket data"}
            <Link href="/tickets">
              Manage tickets <ArrowRight size={14} />
            </Link>
          </div>
        </section>
        <section className="panel">
          <div className="panel-heading">
            <h2>Latest evaluation</h2>
            <span className="badge">
              {data?.latest_evaluation ? "Recorded" : "Not evaluated"}
            </span>
          </div>
          <div className="metrics">
            <div>
              <strong>{percent(data?.latest_evaluation?.precision)}</strong>
              <span>Precision</span>
            </div>
            <div>
              <strong>{percent(data?.latest_evaluation?.recall)}</strong>
              <span>Recall</span>
            </div>
            <div>
              <strong>{percent(data?.latest_evaluation?.f1)}</strong>
              <span>F1 score</span>
            </div>
          </div>
          <div className="evaluation-note">
            <FlaskConical size={20} />
            <p>
              {data?.latest_evaluation
                ? `Measured on ${data.latest_evaluation.dataset_name}.`
                : "Train and evaluate a model to see how it performs. Your results will appear here."}
            </p>
          </div>
          <div className="panel-foot">
            Measure. Compare. Improve.
            <Link href="/models">
              View models <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </div>
      <section className="panel recent">
        <div className="panel-heading">
          <h2>Recent predictions</h2>
          <Link href="/tickets">
            View all tickets <ArrowRight size={14} />
          </Link>
        </div>
        {data?.recent_predictions.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Category</th>
                  <th>Confidence</th>
                  <th>Model</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_predictions.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>{ticket.text}</td>
                    <td>{ticket.predicted_category}</td>
                    <td>{percent(ticket.confidence)}</td>
                    <td>{ticket.model_version}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title={
              data
                ? "Your first prediction starts here"
                : error
                  ? "Ticket data unavailable"
                  : "Loading your workspace…"
            }
          >
            Once your classifier is implemented, classified tickets will appear
            here.
          </Empty>
        )}
      </section>
    </>
  );
}
