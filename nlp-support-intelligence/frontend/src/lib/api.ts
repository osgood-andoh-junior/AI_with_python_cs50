export const categories = [
  "Network",
  "Account",
  "Payment",
  "Software",
  "Hardware",
  "Other",
] as const;
export type Category = (typeof categories)[number];
export type Ticket = {
  id: number;
  text: string;
  actual_category: Category | null;
  predicted_category: Category | null;
  confidence: number | null;
  model_version: string | null;
  created_at: string;
};
export type Prediction = {
  ticket_id: number;
  category: Category;
  confidence: number;
  model: string;
  processing_time_ms: number;
};
export type Model = {
  id: number;
  model_key: string;
  version: string;
  artifact_path: string;
  created_at: string;
};
export type Evaluation = {
  id: number;
  model_id: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  dataset_name: string;
  created_at: string;
};
export type Run = {
  id: number;
  model_key: string;
  status: string;
  error: string | null;
  created_at: string;
  completed_at: string | null;
};
export type Summary = {
  total_tickets: number;
  distribution: { category: Category | null; count: number }[];
  current_model: string | null;
  latest_evaluation: Evaluation | null;
  recent_predictions: Ticket[];
};
export class ApiError extends Error {
  code: string;
  component?: string;
  status: number;
  constructor(
    message: string,
    code: string,
    status: number,
    component?: string,
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.component = component;
  }
}
export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  let response: Response;
  try {
    response = await fetch(`${base}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiError(
      "Cannot reach the backend. Start FastAPI and try again.",
      "CONNECTION_ERROR",
      0,
    );
  }
  if (response.status === 204) return undefined as T;
  const body = await response.json();
  if (!response.ok)
    throw new ApiError(
      body.message ||
        (typeof body.detail === "string"
          ? body.detail
          : "Check the request fields and try again."),
      body.error || "REQUEST_ERROR",
      response.status,
      body.component,
    );
  return body as T;
}
export const api = {
  summary: () => request<Summary>("/api/dashboard"),
  tickets: (offset = 0) =>
    request<Ticket[]>(`/api/tickets?limit=50&offset=${offset}`),
  createTicket: (text: string, actual_category: Category | null = null) =>
    request<Ticket>("/api/tickets", {
      method: "POST",
      body: JSON.stringify({ text, actual_category }),
    }),
  labelTicket: (id: number, actual_category: Category | null) =>
    request<Ticket>(`/api/tickets/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ actual_category }),
    }),
  deleteTicket: (id: number) =>
    request<void>(`/api/tickets/${id}`, { method: "DELETE" }),
  predict: (ticket_id: number) =>
    request<Prediction>("/api/predictions", {
      method: "POST",
      body: JSON.stringify({ ticket_id }),
    }),
  train: (model_key: string) =>
    request<{ run_id: number; status: string; model_version: string }>(
      "/api/training/start",
      { method: "POST", body: JSON.stringify({ model_key }) },
    ),
  models: () => request<Model[]>("/api/models"),
  evaluations: () => request<Evaluation[]>("/api/evaluations"),
  runs: () => request<Run[]>("/api/training/runs"),
};
