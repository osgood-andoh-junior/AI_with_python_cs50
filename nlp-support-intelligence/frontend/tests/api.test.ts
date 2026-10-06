import { afterEach, describe, expect, it, vi } from "vitest";
import { api, ApiError } from "../src/lib/api";
afterEach(() => vi.unstubAllGlobals());
describe("API client", () => {
  it("preserves structured student errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({
              error: "STUDENT_ML_NOT_IMPLEMENTED",
              component: "naive_bayes",
              message: "Complete TODO(STUDENT-ML) in the ML module.",
            }),
            { status: 501 },
          ),
        ),
    );
    await expect(api.predict(1)).rejects.toMatchObject({
      code: "STUDENT_ML_NOT_IMPLEMENTED",
      component: "naive_bayes",
      status: 501,
    });
  });
  it("sends the actual label without inserting a prediction", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ id: 1 }), { status: 201 }),
      );
    vi.stubGlobal("fetch", fetchMock);
    await api.createTicket("test", "Network");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      text: "test",
      actual_category: "Network",
    });
  });
  it("handles no-content deletion", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 204 })),
    );
    await expect(api.deleteTicket(1)).resolves.toBeUndefined();
  });
  it("reports network failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    await expect(api.models()).rejects.toBeInstanceOf(ApiError);
    await expect(api.models()).rejects.toMatchObject({
      code: "CONNECTION_ERROR",
    });
  });
});
