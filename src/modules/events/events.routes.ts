import { Router } from "express";
import { UserRole } from "@prisma/client";

import { requireAuth, requireRole } from "../auth/auth.middleware.js";
import { createEventSchema, updateEventSchema } from "./events.schemas.js";
import { createEventRecord, getActiveEventDetail, getActiveEvents } from "./events.service.js";

const eventsRouter = Router();

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
    const event = await getActiveEventDetail(request.params.id);

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

eventsRouter.patch("/:id", requireAuth, requireRole(UserRole.ADMIN), (request, response) => {
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

  response.status(501).json({
    message: "Event update endpoint sonraki fazda uygulanacak.",
  });
});

eventsRouter.delete("/:id", requireAuth, requireRole(UserRole.ADMIN), (_request, response) => {
  response.status(501).json({
    message: "Event delete endpoint sonraki fazda uygulanacak.",
  });
});

export { eventsRouter };
