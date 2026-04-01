import type { EventStatus } from "@prisma/client";

export interface EventSummary {
  id: string;
  title: string;
  description: string | null;
  location: string;
  startsAt: Date;
  endsAt: Date;
  totalCapacity: number;
  availableCapacity: number;
  status: EventStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventDetail extends EventSummary {
  deletedAt: Date | null;
}

