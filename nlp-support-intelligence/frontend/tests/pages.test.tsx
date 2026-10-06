import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import Classify from "../src/app/classify/page";
import Dashboard from "../src/app/page";
import Models from "../src/app/models/page";
import Tickets from "../src/app/tickets/page";
import Training from "../src/app/training/page";
import Experiments from "../src/app/experiments/page";
import { api, ApiError } from "../src/lib/api";
vi.mock("../src/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../src/lib/api")>();
  return {
    ...actual,
    api: {
      createTicket: vi.fn(),
      predict: vi.fn(),
      summary: vi.fn(),
      models: vi.fn(),
      evaluations: vi.fn(),
      tickets: vi.fn(),
      runs: vi.fn(),
      train: vi.fn(),
    },
  };
});
beforeEach(() => vi.resetAllMocks());
const stubError = new ApiError(
  "Complete TODO(STUDENT-ML) in the ML module.",
  "STUDENT_ML_NOT_IMPLEMENTED",
  501,
  "naive_bayes",
);
it("shows the backend development error and reuses the saved ticket on retry", async () => {
  vi.mocked(api.createTicket).mockResolvedValue({ id: 7 } as Awaited<
    ReturnType<typeof api.createTicket>
  >);
  vi.mocked(api.predict).mockRejectedValue(stubError);
  render(<Classify />);
  fireEvent.change(screen.getByLabelText("Support request"), {
    target: { value: "Wi-Fi issue" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Classify" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "STUDENT_ML_NOT_IMPLEMENTED",
  );
  expect(screen.getByRole("alert")).toHaveTextContent("naive_bayes");
  fireEvent.click(screen.getByRole("button", { name: "Classify" }));
  await waitFor(() => expect(api.predict).toHaveBeenCalledTimes(2));
  expect(api.createTicket).toHaveBeenCalledTimes(1);
  expect(screen.getByText("Confidence").nextElementSibling).toHaveTextContent(
    "—",
  );
});
it("renders real response fields after successful inference", async () => {
  vi.mocked(api.createTicket).mockResolvedValue({ id: 8 } as Awaited<
    ReturnType<typeof api.createTicket>
  >);
  vi.mocked(api.predict).mockResolvedValue({
    ticket_id: 8,
    category: "Network",
    confidence: 0.75,
    model: "test-only",
    processing_time_ms: 12,
  });
  render(<Classify />);
  fireEvent.change(screen.getByLabelText("Support request"), {
    target: { value: "fixture" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Classify" }));
  expect(await screen.findByText("75.0%")).toBeVisible();
  expect(screen.getByText("12.00 ms")).toBeVisible();
});
it("shows honest dashboard empty states", async () => {
  vi.mocked(api.summary).mockResolvedValue({
    total_tickets: 0,
    distribution: [],
    current_model: null,
    latest_evaluation: null,
    recent_predictions: [],
  });
  render(<Dashboard />);
  expect(
    await screen.findByText("Your first prediction starts here"),
  ).toBeVisible();
  expect(screen.getByText("No trained model")).toBeVisible();
});
it("shows an empty model registry", async () => {
  vi.mocked(api.models).mockResolvedValue([]);
  vi.mocked(api.evaluations).mockResolvedValue([]);
  render(<Models />);
  expect(
    await screen.findByText("A home for your trained models"),
  ).toBeVisible();
});
it("creates labeled tickets through the API", async () => {
  vi.mocked(api.tickets).mockResolvedValue([]);
  vi.mocked(api.createTicket).mockResolvedValue({ id: 1 } as Awaited<
    ReturnType<typeof api.createTicket>
  >);
  render(<Tickets />);
  await screen.findByText("Your dataset starts with one ticket");
  fireEvent.change(screen.getByLabelText("New support ticket"), {
    target: { value: "fixture" },
  });
  fireEvent.change(screen.getByLabelText("Actual category"), {
    target: { value: "Account" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Add ticket" }));
  await waitFor(() =>
    expect(api.createTicket).toHaveBeenCalledWith("fixture", "Account"),
  );
});
it("shows blocked training errors", async () => {
  vi.mocked(api.runs).mockResolvedValue([]);
  vi.mocked(api.train).mockRejectedValue(stubError);
  render(<Training />);
  fireEvent.click(screen.getByRole("button", { name: "Start training" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "STUDENT_ML_NOT_IMPLEMENTED",
  );
});
it("lists all six notebook locations without claiming completion", () => {
  render(<Experiments />);
  expect(screen.getByText("01_bow_naive_bayes.ipynb")).toBeVisible();
  expect(screen.getByText("06_transformer.ipynb")).toBeVisible();
  expect(screen.getAllByText("Student implementation")).toHaveLength(5);
});
