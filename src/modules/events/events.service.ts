import { EventStatus, type Event } from "@prisma/client";

import { AppError } from "../../common/errors/app-error.js";
import { EVENTS_MESSAGES } from "./events.constants.js";
import type { CreateEventInput, UpdateEventInput } from "./events.schemas.js";
import type { EventDetail, EventSummary } from "./events.types.js";
import {
  createEvent,
  findActiveEventById,
  findEventById,
  listActiveEvents,
  updateEvent,
} from "./events.repository.js";

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

export async function updateEventRecord(id: string, input: UpdateEventInput): Promise<EventDetail> {
  const event = await findEventById(id);

  if (!event || event.deletedAt) {
    throw new AppError(EVENTS_MESSAGES.notFound, 404, "EVENT_NOT_FOUND");
  }

  const nextStartsAt = input.startsAt ? new Date(input.startsAt) : event.startsAt;
  const nextEndsAt = input.endsAt ? new Date(input.endsAt) : event.endsAt;

  if (nextEndsAt <= nextStartsAt) {
    throw new AppError("Bitiş tarihi başlangıç tarihinden sonra olmalıdır.", 400, "INVALID_DATE_RANGE");
  }

  const nextTotalCapacity = input.totalCapacity ?? event.totalCapacity;
  const reservedCount = event.totalCapacity - event.availableCapacity;

  if (nextTotalCapacity < reservedCount) {
    throw new AppError(
      "Toplam kapasite mevcut rezervasyon sayısından küçük olamaz.",
      400,
      "INVALID_CAPACITY",
    );
  }

  const nextAvailableCapacity = nextTotalCapacity - reservedCount;
  const updatePayload: Record<string, unknown> = {
    totalCapacity: nextTotalCapacity,
    availableCapacity: nextAvailableCapacity,
  };

  if (input.title !== undefined) {
    updatePayload.title = input.title;
  }

  if (input.description !== undefined) {
    updatePayload.description = input.description ?? null;
  }

  if (input.location !== undefined) {
    updatePayload.location = input.location;
  }

  if (input.startsAt !== undefined) {
    updatePayload.startsAt = new Date(input.startsAt);
  }

  if (input.endsAt !== undefined) {
    updatePayload.endsAt = new Date(input.endsAt);
  }

  if (input.status !== undefined) {
    updatePayload.status = input.status;
  }

  const updatedEvent = await updateEvent(id, updatePayload);

  return toEventDetail(updatedEvent);
}

export async function softDeleteEventRecord(id: string): Promise<void> {
  const event = await findEventById(id);

  if (!event || event.deletedAt) {
    throw new AppError(EVENTS_MESSAGES.notFound, 404, "EVENT_NOT_FOUND");
  }

  await updateEvent(id, {
    deletedAt: new Date(),
    status: EventStatus.INACTIVE,
  });
}
