import { BookingStatus, Prisma, UserRole, type Booking } from "@prisma/client";

import { AppError } from "../../common/errors/app-error.js";
import type { AuthTokenPayload } from "../auth/auth.types.js";
import { BOOKINGS_MESSAGES } from "./bookings.constants.js";
import type { BookingSummary } from "./bookings.types.js";
import { cancelBookingById, createPendingBooking, listBookingsByUserId } from "./bookings.repository.js";

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

export async function listBookingsForUser(user: AuthTokenPayload): Promise<BookingSummary[]> {
  const bookings = await listBookingsByUserId(user.sub);
  return bookings.map(toBookingSummary);
}

export async function cancelBookingForUser(
  user: AuthTokenPayload,
  bookingId: string,
): Promise<BookingSummary> {
  const booking = await cancelBookingById({
    bookingId,
    userId: user.sub,
  });

  if (!booking) {
    throw new AppError(BOOKINGS_MESSAGES.notFound, 404, "BOOKING_NOT_FOUND");
  }

  if (booking.status !== BookingStatus.CANCELLED && booking.status !== BookingStatus.PENDING) {
    throw new AppError(BOOKINGS_MESSAGES.notCancelable, 409, "BOOKING_NOT_CANCELABLE");
  }

  if (booking.status !== BookingStatus.CANCELLED && booking.cancelledAt === null) {
    throw new AppError(BOOKINGS_MESSAGES.notCancelable, 409, "BOOKING_NOT_CANCELABLE");
  }

  return toBookingSummary(booking);
}
