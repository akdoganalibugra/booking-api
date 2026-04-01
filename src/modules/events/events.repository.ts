import { EventStatus, type Event, type Prisma } from "@prisma/client";

import { prisma } from "../../config/prisma.js";

export async function createEvent(data: Prisma.EventCreateInput): Promise<Event> {
  return prisma.event.create({
    data,
  });
}

export async function listActiveEvents(): Promise<Event[]> {
  return prisma.event.findMany({
    where: {
      deletedAt: null,
      status: EventStatus.ACTIVE,
    },
    orderBy: {
      startsAt: "asc",
    },
  });
}

export async function findActiveEventById(id: string): Promise<Event | null> {
  return prisma.event.findFirst({
    where: {
      id,
      deletedAt: null,
      status: EventStatus.ACTIVE,
    },
  });
}

export async function findEventById(id: string): Promise<Event | null> {
  return prisma.event.findUnique({
    where: {
      id,
    },
  });
}

export async function updateEvent(id: string, data: Prisma.EventUpdateInput): Promise<Event> {
  return prisma.event.update({
    where: {
      id,
    },
    data,
  });
}
