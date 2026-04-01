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

