import { BookingStatus, type Booking } from "@prisma/client";

import {
  confirmBookingById,
  createPaymentAttempt,
  expireBookingById,
  listPendingBookingsForProcessing,
} from "../modules/bookings/bookings.repository.js";
import { getMockPaymentResult } from "../modules/payments/payments.service.js";

interface WorkerRunSummary {
  scanned: number;
  confirmed: number;
  expired: number;
  skipped: number;
}

function isExpired(booking: Booking): boolean {
  return booking.expiresAt.getTime() <= Date.now();
}

export async function processPendingBookings(limit = 100): Promise<WorkerRunSummary> {
  const bookings = await listPendingBookingsForProcessing(limit);

  const summary: WorkerRunSummary = {
    scanned: bookings.length,
    confirmed: 0,
    expired: 0,
    skipped: 0,
  };

  for (const booking of bookings) {
    const payment = getMockPaymentResult(booking.id);

    await createPaymentAttempt({
      bookingId: booking.id,
      providerReference: payment.providerReference,
      status: payment.status,
      payload: {
        bookingId: payment.bookingId,
        provider: payment.provider,
        status: payment.status,
        checkedAt: payment.checkedAt.toISOString(),
      },
    });

    if (payment.status === "SUCCESS") {
      const confirmedBooking = await confirmBookingById(booking.id);

      if (confirmedBooking?.status === BookingStatus.CONFIRMED) {
        summary.confirmed += 1;
      } else {
        summary.skipped += 1;
      }

      continue;
    }

    if (isExpired(booking)) {
      const expiredBooking = await expireBookingById(booking.id);

      if (expiredBooking?.status === BookingStatus.EXPIRED) {
        summary.expired += 1;
      } else {
        summary.skipped += 1;
      }

      continue;
    }

    summary.skipped += 1;
  }

  return summary;
}

