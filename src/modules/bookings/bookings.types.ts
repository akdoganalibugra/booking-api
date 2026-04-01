import type { BookingStatus } from "@prisma/client";

export interface BookingSummary {
  id: string;
  userId: string;
  eventId: string;
  status: BookingStatus;
  reservedAt: Date;
  expiresAt: Date;
  confirmedAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

