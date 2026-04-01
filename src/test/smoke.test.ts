import { describe, expect, it } from "vitest";

import { createTestClient } from "./http.js";

describe("application smoke tests", () => {
  it("returns health response", async () => {
    const response = await createTestClient().get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "ok",
      service: "booking-api",
    });
  });
});
