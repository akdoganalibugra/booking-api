import { BookingStatus, Prisma, UserRole } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "../../common/errors/app-error.js";
import type { AuthTokenPayload } from "../auth/auth.types.js";
import * as bookingsRepository from "./bookings.repository.js";
import {
  cancelBookingForUser,
  createBookingForUser,
  listBookingsForUser,
} from "./bookings.service.js";

function createUser(role: UserRole = UserRole.CUSTOMER): AuthTokenPayload {
  return {
    sub: "user-1",
    email: "customer@example.com",
    role,
  };
}

describe("bookings service", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("creates pending bookings for customers", async () => {
    vi.spyOn(bookingsRepository, "createPendingBooking").mockResolvedValue({
      id: "booking-1",
      userId: "user-1",
      eventId: "event-1",
      status: BookingStatus.PENDING,
      reservedAt: new Date("2026-04-02T10:00:00.000Z"),
      expiresAt: new Date("2026-04-02T10:30:00.000Z"),
      confirmedAt: null,
      cancelledAt: null,
      createdAt: new Date("2026-04-02T10:00:00.000Z"),
      updatedAt: new Date("2026-04-02T10:00:00.000Z"),
    } as never);

    const result = await createBookingForUser(createUser(), "event-1");

    expect(result.status).toBe(BookingStatus.PENDING);
    expect(result.eventId).toBe("event-1");
  });

  it("rejects booking creation for non-customer roles", async () => {
    await expect(createBookingForUser(createUser(UserRole.ADMIN), "event-1")).rejects.toMatchObject({
      statusCode: 403,
      code: "FORBIDDEN",
    } satisfies Partial<AppError>);
  });

  it("maps reservable event conflicts to domain error", async () => {
    vi.spyOn(bookingsRepository, "createPendingBooking").mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("EVENT_NOT_AVAILABLE", {
        code: "P2025",
        clientVersion: Prisma.prismaVersion.client,
      }),
    );

    await expect(createBookingForUser(createUser(), "event-1")).rejects.toMatchObject({
      statusCode: 409,
      code: "EVENT_NOT_AVAILABLE",
    } satisfies Partial<AppError>);
  });

  it("lists bookings for the authenticated user", async () => {
    vi.spyOn(bookingsRepository, "listBookingsByUserId").mockResolvedValue([
      {
        id: "booking-1",
        userId: "user-1",
        eventId: "event-1",
        status: BookingStatus.CONFIRMED,
        reservedAt: new Date("2026-04-02T10:00:00.000Z"),
        expiresAt: new Date("2026-04-02T10:30:00.000Z"),
        confirmedAt: new Date("2026-04-02T10:05:00.000Z"),
        cancelledAt: null,
        createdAt: new Date("2026-04-02T10:00:00.000Z"),
        updatedAt: new Date("2026-04-02T10:05:00.000Z"),
      } as never,
    ]);

    const result = await listBookingsForUser(createUser());

    expect(result).toHaveLength(1);
    expect(result.at(0)?.status).toBe(BookingStatus.CONFIRMED);
  });

  it("returns 404 when booking does not belong to user", async () => {
    vi.spyOn(bookingsRepository, "cancelBookingById").mockResolvedValue(null);

    await expect(cancelBookingForUser(createUser(), "booking-1")).rejects.toMatchObject({
      statusCode: 404,
      code: "BOOKING_NOT_FOUND",
    } satisfies Partial<AppError>);
  });

  it("returns 409 when booking is already terminal", async () => {
    vi.spyOn(bookingsRepository, "cancelBookingById").mockResolvedValue({
      id: "booking-1",
      userId: "user-1",
      eventId: "event-1",
      status: BookingStatus.CONFIRMED,
      reservedAt: new Date("2026-04-02T10:00:00.000Z"),
      expiresAt: new Date("2026-04-02T10:30:00.000Z"),
      confirmedAt: new Date("2026-04-02T10:05:00.000Z"),
      cancelledAt: null,
      createdAt: new Date("2026-04-02T10:00:00.000Z"),
      updatedAt: new Date("2026-04-02T10:05:00.000Z"),
    } as never);

    await expect(cancelBookingForUser(createUser(), "booking-1")).rejects.toMatchObject({
      statusCode: 409,
      code: "BOOKING_NOT_CANCELABLE",
    } satisfies Partial<AppError>);
  });

  it("returns cancelled bookings after successful cancel", async () => {
    vi.spyOn(bookingsRepository, "cancelBookingById").mockResolvedValue({
      id: "booking-1",
      userId: "user-1",
      eventId: "event-1",
      status: BookingStatus.CANCELLED,
      reservedAt: new Date("2026-04-02T10:00:00.000Z"),
      expiresAt: new Date("2026-04-02T10:30:00.000Z"),
      confirmedAt: null,
      cancelledAt: new Date("2026-04-02T10:10:00.000Z"),
      createdAt: new Date("2026-04-02T10:00:00.000Z"),
      updatedAt: new Date("2026-04-02T10:10:00.000Z"),
    } as never);

    const result = await cancelBookingForUser(createUser(), "booking-1");

    expect(result.status).toBe(BookingStatus.CANCELLED);
    expect(result.cancelledAt).not.toBeNull();
  });
});
