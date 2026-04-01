import { Prisma, UserRole, type Booking } from "@prisma/client";

import { AppError } from "../../common/errors/app-error.js";
import type { AuthTokenPayload } from "../auth/auth.types.js";
import { BOOKINGS_MESSAGES } from "./bookings.constants.js";
import type { BookingSummary } from "./bookings.types.js";
import { createPendingBooking } from "./bookings.repository.js";

function toBookingSummary(booking: Booking): BookingSummary {
  return {
    id: booking.id,
    userId: booking.userId,
    eventId: booking.eventId,
    status: booking.status,
    reservedAt: booking.reservedAt,
    expiresAt: booking.expiresAt,
    confirmedAt: booking.confirmedAt,
    cancelledAt: booking.cancelledAt,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
  };
}

export async function createBookingForUser(user: AuthTokenPayload, eventId: string): Promise<BookingSummary> {
  if (user.role !== UserRole.CUSTOMER) {
    throw new AppError("Yalnızca müşteriler rezervasyon oluşturabilir.", 403, "FORBIDDEN");
  }

  try {
    const booking = await createPendingBooking({
      userId: user.sub,
      eventId,
    });

    return toBookingSummary(booking);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      throw new AppError(BOOKINGS_MESSAGES.eventNotAvailable, 409, "EVENT_NOT_AVAILABLE");
    }

    throw error;
  }
}

