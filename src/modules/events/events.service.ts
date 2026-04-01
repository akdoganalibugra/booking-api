import { EventStatus, type Event } from "@prisma/client";

import { AppError } from "../../common/errors/app-error.js";
import { EVENTS_MESSAGES } from "./events.constants.js";
import type { CreateEventInput } from "./events.schemas.js";
import type { EventDetail, EventSummary } from "./events.types.js";
import { createEvent, findActiveEventById, listActiveEvents } from "./events.repository.js";

function toEventSummary(event: Event): EventSummary {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    location: event.location,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    totalCapacity: event.totalCapacity,
    availableCapacity: event.availableCapacity,
    status: event.status,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };
}

function toEventDetail(event: Event): EventDetail {
  return {
    ...toEventSummary(event),
    deletedAt: event.deletedAt,
  };
}

export async function createEventRecord(input: CreateEventInput): Promise<EventDetail> {
  const event = await createEvent({
    title: input.title,
    description: input.description ?? null,
    location: input.location,
    startsAt: new Date(input.startsAt),
    endsAt: new Date(input.endsAt),
    totalCapacity: input.totalCapacity,
    availableCapacity: input.totalCapacity,
    status: input.status ?? EventStatus.ACTIVE,
  });

  return toEventDetail(event);
}

export async function getActiveEvents(): Promise<EventSummary[]> {
  const events = await listActiveEvents();
  return events.map(toEventSummary);
}

export async function getActiveEventDetail(id: string): Promise<EventDetail> {
  const event = await findActiveEventById(id);

  if (!event) {
    throw new AppError(EVENTS_MESSAGES.notFound, 404, "EVENT_NOT_FOUND");
  }

  return toEventDetail(event);
}
