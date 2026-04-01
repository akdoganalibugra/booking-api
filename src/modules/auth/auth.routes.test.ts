import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "../../common/errors/app-error.js";
import { createTestClient } from "../../test/http.js";
import * as authService from "./auth.service.js";

describe("auth routes", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("registers a user with valid payload", async () => {
    vi.spyOn(authService, "registerUser").mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
      role: "CUSTOMER",
      createdAt: new Date("2026-04-02T00:00:00.000Z"),
    });

    const response = await createTestClient().post("/auth/register").send({
      email: "test@example.com",
      password: "password123",
    });

    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe("test@example.com");
  });

  it("rejects invalid register payload", async () => {
    const response = await createTestClient().post("/auth/register").send({
      email: "invalid-email",
      password: "123",
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 409 when register service reports duplicate email", async () => {
    vi.spyOn(authService, "registerUser").mockRejectedValue(
      new AppError("Bu e-posta adresi zaten kayıtlı.", 409, "EMAIL_ALREADY_EXISTS"),
    );

    const response = await createTestClient().post("/auth/register").send({
      email: "test@example.com",
      password: "password123",
    });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("EMAIL_ALREADY_EXISTS");
  });

  it("logs in with valid credentials", async () => {
    vi.spyOn(authService, "loginUser").mockResolvedValue({
      accessToken: "token",
      tokenType: "Bearer",
      expiresIn: "1h",
    });

    const response = await createTestClient().post("/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      accessToken: "token",
      tokenType: "Bearer",
      expiresIn: "1h",
    });
  });

  it("rejects invalid login payload", async () => {
    const response = await createTestClient().post("/auth/login").send({
      email: "invalid-email",
      password: "",
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 401 when login service rejects credentials", async () => {
    vi.spyOn(authService, "loginUser").mockRejectedValue(
      new AppError("E-posta veya şifre hatalı.", 401, "INVALID_CREDENTIALS"),
    );

    const response = await createTestClient().post("/auth/login").send({
      email: "test@example.com",
      password: "wrong-password",
    });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("INVALID_CREDENTIALS");
  });
});
