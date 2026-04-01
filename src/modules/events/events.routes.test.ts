import { EventStatus, UserRole } from "@prisma/client";
import jwt from "jsonwebtoken";
import type { StringValue } from "ms";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "../../common/errors/app-error.js";
import { env } from "../../config/env.js";
import { createTestClient } from "../../test/http.js";
import * as eventsService from "./events.service.js";

function createAccessToken(role: UserRole) {
  return jwt.sign(
    {
      sub: "user-1",
      email: "admin@example.com",
      role,
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN as unknown as number | StringValue,
    },
  );
}

describe("event routes", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("lists active events", async () => {
    vi.spyOn(eventsService, "getActiveEvents").mockResolvedValue([
      {
        id: "event-1",
        title: "Test Event",
        description: "Test Description",
        location: "Istanbul",
        startsAt: new Date("2026-04-03T18:00:00.000Z"),
        endsAt: new Date("2026-04-03T20:00:00.000Z"),
        totalCapacity: 100,
        availableCapacity: 100,
        status: EventStatus.ACTIVE,
        createdAt: new Date("2026-04-02T00:00:00.000Z"),
        updatedAt: new Date("2026-04-02T00:00:00.000Z"),
      },
    ]);

    const response = await createTestClient().get("/events");

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].title).toBe("Test Event");
  });

  it("returns active event detail", async () => {
    vi.spyOn(eventsService, "getActiveEventDetail").mockResolvedValue({
      id: "event-1",
      title: "Test Event",
      description: "Test Description",
      location: "Istanbul",
      startsAt: new Date("2026-04-03T18:00:00.000Z"),
      endsAt: new Date("2026-04-03T20:00:00.000Z"),
      totalCapacity: 100,
      availableCapacity: 100,
      status: EventStatus.ACTIVE,
      createdAt: new Date("2026-04-02T00:00:00.000Z"),
      updatedAt: new Date("2026-04-02T00:00:00.000Z"),
      deletedAt: null,
    });

    const response = await createTestClient().get("/events/event-1");

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe("event-1");
  });

  it("returns 404 when detail service reports deleted or missing event", async () => {
    vi.spyOn(eventsService, "getActiveEventDetail").mockRejectedValue(
      new AppError("Etkinlik bulunamadı.", 404, "EVENT_NOT_FOUND"),
    );

    const response = await createTestClient().get("/events/event-deleted");

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("EVENT_NOT_FOUND");
  });

  it("requires authentication for event creation", async () => {
    const response = await createTestClient().post("/events").send({
      title: "Test Event",
      location: "Istanbul",
      startsAt: "2026-04-03T18:00:00.000Z",
      endsAt: "2026-04-03T20:00:00.000Z",
      totalCapacity: 100,
    });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  it("forbids non-admin users from creating events", async () => {
    const response = await createTestClient()
      .post("/events")
      .set("Authorization", `Bearer ${createAccessToken(UserRole.CUSTOMER)}`)
      .send({
        title: "Test Event",
        location: "Istanbul",
        startsAt: "2026-04-03T18:00:00.000Z",
        endsAt: "2026-04-03T20:00:00.000Z",
        totalCapacity: 100,
      });

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it("creates events for admin users with valid payload", async () => {
    vi.spyOn(eventsService, "createEventRecord").mockResolvedValue({
      id: "event-1",
      title: "Test Event",
      description: null,
      location: "Istanbul",
      startsAt: new Date("2026-04-03T18:00:00.000Z"),
      endsAt: new Date("2026-04-03T20:00:00.000Z"),
      totalCapacity: 100,
      availableCapacity: 100,
      status: EventStatus.ACTIVE,
      createdAt: new Date("2026-04-02T00:00:00.000Z"),
      updatedAt: new Date("2026-04-02T00:00:00.000Z"),
      deletedAt: null,
    });

    const response = await createTestClient()
      .post("/events")
      .set("Authorization", `Bearer ${createAccessToken(UserRole.ADMIN)}`)
      .send({
        title: "Test Event",
        location: "Istanbul",
        startsAt: "2026-04-03T18:00:00.000Z",
        endsAt: "2026-04-03T20:00:00.000Z",
        totalCapacity: 100,
      });

    expect(response.status).toBe(201);
    expect(response.body.data.id).toBe("event-1");
  });

  it("rejects invalid create payload for admin users", async () => {
    const response = await createTestClient()
      .post("/events")
      .set("Authorization", `Bearer ${createAccessToken(UserRole.ADMIN)}`)
      .send({
        title: "",
        location: "Istanbul",
        startsAt: "2026-04-03T20:00:00.000Z",
        endsAt: "2026-04-03T18:00:00.000Z",
        totalCapacity: 0,
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });
});
