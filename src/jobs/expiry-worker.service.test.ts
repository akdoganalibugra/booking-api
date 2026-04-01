import { BookingStatus } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as bookingsRepository from "../modules/bookings/bookings.repository.js";
import * as paymentsService from "../modules/payments/payments.service.js";
import { processPendingBookings } from "./expiry-worker.service.js";

describe("expiry worker service", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("confirms paid pending bookings", async () => {
    vi.spyOn(bookingsRepository, "listPendingBookingsForProcessing").mockResolvedValue([
      {
        id: "booking-success",
        userId: "user-1",
        eventId: "event-1",
        status: BookingStatus.PENDING,
        reservedAt: new Date("2026-04-02T10:00:00.000Z"),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        confirmedAt: null,
        cancelledAt: null,
        createdAt: new Date("2026-04-02T10:00:00.000Z"),
        updatedAt: new Date("2026-04-02T10:00:00.000Z"),
      } as never,
    ]);
    vi.spyOn(paymentsService, "getMockPaymentResult").mockReturnValue({
      bookingId: "booking-success",
      provider: "MOCK",
      status: "SUCCESS",
      providerReference: "mock-booking-success",
      checkedAt: new Date("2026-04-02T10:05:00.000Z"),
    });
    vi.spyOn(bookingsRepository, "createPaymentAttempt").mockResolvedValue();
    vi.spyOn(bookingsRepository, "confirmBookingById").mockResolvedValue({
      id: "booking-success",
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

    const summary = await processPendingBookings();

    expect(summary).toEqual({
      scanned: 1,
      confirmed: 1,
      expired: 0,
      skipped: 0,
    });
  });

  it("expires unpaid bookings after timeout", async () => {
    vi.spyOn(bookingsRepository, "listPendingBookingsForProcessing").mockResolvedValue([
      {
        id: "booking-expired",
        userId: "user-1",
        eventId: "event-1",
        status: BookingStatus.PENDING,
        reservedAt: new Date("2026-04-02T10:00:00.000Z"),
        expiresAt: new Date(Date.now() - 60 * 1000),
        confirmedAt: null,
        cancelledAt: null,
        createdAt: new Date("2026-04-02T10:00:00.000Z"),
        updatedAt: new Date("2026-04-02T10:00:00.000Z"),
      } as never,
    ]);
    vi.spyOn(paymentsService, "getMockPaymentResult").mockReturnValue({
      bookingId: "booking-expired",
      provider: "MOCK",
      status: "FAILED",
      providerReference: "mock-booking-expired",
      checkedAt: new Date("2026-04-02T10:31:00.000Z"),
    });
    vi.spyOn(bookingsRepository, "createPaymentAttempt").mockResolvedValue();
    vi.spyOn(bookingsRepository, "expireBookingById").mockResolvedValue({
      id: "booking-expired",
      userId: "user-1",
      eventId: "event-1",
      status: BookingStatus.EXPIRED,
      reservedAt: new Date("2026-04-02T10:00:00.000Z"),
      expiresAt: new Date("2026-04-02T10:30:00.000Z"),
      confirmedAt: null,
      cancelledAt: null,
      createdAt: new Date("2026-04-02T10:00:00.000Z"),
      updatedAt: new Date("2026-04-02T10:31:00.000Z"),
    } as never);

    const summary = await processPendingBookings();

    expect(summary).toEqual({
      scanned: 1,
      confirmed: 0,
      expired: 1,
      skipped: 0,
    });
  });

  it("skips pending bookings that are neither paid nor expired", async () => {
    vi.spyOn(bookingsRepository, "listPendingBookingsForProcessing").mockResolvedValue([
      {
        id: "booking-pending",
        userId: "user-1",
        eventId: "event-1",
        status: BookingStatus.PENDING,
        reservedAt: new Date("2026-04-02T10:00:00.000Z"),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        confirmedAt: null,
        cancelledAt: null,
        createdAt: new Date("2026-04-02T10:00:00.000Z"),
        updatedAt: new Date("2026-04-02T10:00:00.000Z"),
      } as never,
    ]);
    vi.spyOn(paymentsService, "getMockPaymentResult").mockReturnValue({
      bookingId: "booking-pending",
      provider: "MOCK",
      status: "PENDING",
      providerReference: "mock-booking-pending",
      checkedAt: new Date("2026-04-02T10:05:00.000Z"),
    });
    vi.spyOn(bookingsRepository, "createPaymentAttempt").mockResolvedValue();

    const summary = await processPendingBookings();

    expect(summary).toEqual({
      scanned: 1,
      confirmed: 0,
      expired: 0,
      skipped: 1,
    });
  });

  it("counts terminal repository results as skipped", async () => {
    vi.spyOn(bookingsRepository, "listPendingBookingsForProcessing").mockResolvedValue([
      {
        id: "booking-raced",
        userId: "user-1",
        eventId: "event-1",
        status: BookingStatus.PENDING,
        reservedAt: new Date("2026-04-02T10:00:00.000Z"),
        expiresAt: new Date(Date.now() - 60 * 1000),
        confirmedAt: null,
        cancelledAt: null,
        createdAt: new Date("2026-04-02T10:00:00.000Z"),
        updatedAt: new Date("2026-04-02T10:00:00.000Z"),
      } as never,
    ]);
    vi.spyOn(paymentsService, "getMockPaymentResult").mockReturnValue({
      bookingId: "booking-raced",
      provider: "MOCK",
      status: "SUCCESS",
      providerReference: "mock-booking-raced",
      checkedAt: new Date("2026-04-02T10:31:00.000Z"),
    });
    vi.spyOn(bookingsRepository, "createPaymentAttempt").mockResolvedValue();
    vi.spyOn(bookingsRepository, "confirmBookingById").mockResolvedValue({
      id: "booking-raced",
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

    const summary = await processPendingBookings();

    expect(summary).toEqual({
      scanned: 1,
      confirmed: 0,
      expired: 0,
      skipped: 1,
    });
  });
});
