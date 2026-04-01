import { Router } from "express";
import { UserRole } from "@prisma/client";

import { AppError } from "../../common/errors/app-error.js";
import { requireAuth, requireRole } from "../auth/auth.middleware.js";
import { createEventSchema, updateEventSchema } from "./events.schemas.js";
import {
  createEventRecord,
  getActiveEventDetail,
  getActiveEvents,
  softDeleteEventRecord,
  updateEventRecord,
} from "./events.service.js";

const eventsRouter = Router();

function getRouteId(value: string | string[] | undefined): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new AppError("Geçersiz etkinlik kimliği.", 400, "INVALID_EVENT_ID");
  }

  return value;
}

eventsRouter.get("/", async (_request, response, next) => {
  try {
    const events = await getActiveEvents();

    response.status(200).json({
      data: events,
    });
  } catch (error) {
    next(error);
  }
});

eventsRouter.get("/:id", async (request, response, next) => {
  try {
    const event = await getActiveEventDetail(getRouteId(request.params.id));

    response.status(200).json({
      data: event,
    });
  } catch (error) {
    next(error);
  }
});

eventsRouter.post("/", requireAuth, requireRole(UserRole.ADMIN), async (request, response, next) => {
  const result = createEventSchema.safeParse(request.body);

  if (!result.success) {
    response.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Create event payload doğrulanamadı.",
        details: result.error.flatten().fieldErrors,
      },
    });
    return;
  }

  try {
    const event = await createEventRecord(result.data);

    response.status(201).json({
      data: event,
    });
  } catch (error) {
    next(error);
  }
});

eventsRouter.patch("/:id", requireAuth, requireRole(UserRole.ADMIN), async (request, response, next) => {
  const result = updateEventSchema.safeParse(request.body);

  if (!result.success) {
    response.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Update event payload doğrulanamadı.",
        details: result.error.flatten().fieldErrors,
      },
    });
    return;
  }

  try {
    const event = await updateEventRecord(getRouteId(request.params.id), result.data);

    response.status(200).json({
      data: event,
    });
  } catch (error) {
    next(error);
  }
});

eventsRouter.delete("/:id", requireAuth, requireRole(UserRole.ADMIN), async (request, response, next) => {
  try {
    await softDeleteEventRecord(getRouteId(request.params.id));

    response.status(204).send();
  } catch (error) {
    next(error);
  }
});

export { eventsRouter };
