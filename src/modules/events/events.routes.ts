import { Router } from "express";
import { UserRole } from "@prisma/client";

import { requireAuth, requireRole } from "../auth/auth.middleware.js";
import { createEventSchema, updateEventSchema } from "./events.schemas.js";

const eventsRouter = Router();

eventsRouter.get("/", (_request, response) => {
  response.status(501).json({
    message: "Events listing endpoint sonraki fazda uygulanacak.",
  });
});

eventsRouter.get("/:id", (_request, response) => {
  response.status(501).json({
    message: "Event detail endpoint sonraki fazda uygulanacak.",
  });
});

eventsRouter.post("/", requireAuth, requireRole(UserRole.ADMIN), (request, response) => {
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

  response.status(501).json({
    message: "Event create endpoint sonraki fazda uygulanacak.",
  });
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
