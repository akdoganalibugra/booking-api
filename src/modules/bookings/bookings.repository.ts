import { BookingStatus, EventStatus, Prisma, type Booking } from "@prisma/client";

import { prisma } from "../../config/prisma.js";

const BOOKING_EXPIRY_MINUTES = 30;

type TransactionClient = Omit<
  Prisma.TransactionClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export async function createPendingBooking(input: {
  userId: string;
  eventId: string;
}): Promise<Booking> {
  return prisma.$transaction(async (tx) => {
    const event = await lockReservableEvent(tx, input.eventId);

    if (!event || event.availableCapacity <= 0) {
      throw new Prisma.PrismaClientKnownRequestError("EVENT_NOT_AVAILABLE", {
        code: "P2025",
        clientVersion: Prisma.prismaVersion.client,
      });
    }

    const expiresAt = new Date(Date.now() + BOOKING_EXPIRY_MINUTES * 60 * 1000);

    await tx.event.update({
      where: {
        id: event.id,
      },
      data: {
        availableCapacity: {
          decrement: 1,
        },
      },
    });

    return tx.booking.create({
      data: {
        userId: input.userId,
        eventId: input.eventId,
        status: BookingStatus.PENDING,
        expiresAt,
      },
    });
  });
}

export async function listBookingsByUserId(userId: string): Promise<Booking[]> {
  return prisma.booking.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function cancelBookingById(input: {
  bookingId: string;
  userId: string;
}): Promise<Booking | null> {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findFirst({
      where: {
        id: input.bookingId,
        userId: input.userId,
      },
    });

    if (!booking) {
      return null;
    }

    if (booking.status !== BookingStatus.PENDING) {
      return booking;
    }

    await tx.booking.update({
      where: {
        id: booking.id,
      },
      data: {
        status: BookingStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    });

    await tx.event.update({
      where: {
        id: booking.eventId,
      },
      data: {
        availableCapacity: {
          increment: 1,
        },
      },
    });

    return tx.booking.findUnique({
      where: {
        id: booking.id,
      },
    });
  });
}

async function lockReservableEvent(
  tx: TransactionClient,
  eventId: string,
): Promise<{ id: string; availableCapacity: number } | null> {
  const rows = await tx.$queryRaw<Array<{ id: string; availableCapacity: number }>>`
    SELECT id, availableCapacity
    FROM events
    WHERE id = ${eventId}
      AND deletedAt IS NULL
      AND status = ${EventStatus.ACTIVE}
    FOR UPDATE
  `;

  return rows[0] ?? null;
}
