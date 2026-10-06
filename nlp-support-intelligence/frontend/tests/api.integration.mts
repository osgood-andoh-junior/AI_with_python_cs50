// Run against an isolated live FastAPI server; uses the production frontend client.
import assert from "node:assert/strict";
import { test } from "node:test";
import { api, ApiError, request } from "../src/lib/api.ts";

test("frontend client integrates with live FastAPI and SQLite", async () => {
  assert.equal((await request<{ status: string }>("/health")).status, "ok");
  const ticket = await api.createTicket("Integration test ticket", "Network");
  try {
    assert.equal(ticket.predicted_category, null);
    assert.equal(
      (await api.tickets()).some((item) => item.id === ticket.id),
      true,
    );
    assert.equal(
      (await api.labelTicket(ticket.id, "Other")).actual_category,
      "Other",
    );
    await assert.rejects(
      api.predict(ticket.id),
      (error: unknown) =>
        error instanceof ApiError &&
        error.code === "STUDENT_ML_NOT_IMPLEMENTED" &&
        error.component === "naive_bayes",
    );
    await assert.rejects(
      api.train("naive_bayes"),
      (error: unknown) => error instanceof ApiError && error.status === 501,
    );
    assert.equal((await api.runs())[0].status, "blocked");
    assert.deepEqual(await api.models(), []);
    assert.deepEqual(await api.evaluations(), []);
  } finally {
    await api.deleteTicket(ticket.id);
  }
});
