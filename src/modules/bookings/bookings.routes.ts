import { Router } from "express";

import { AppError } from "../../common/errors/app-error.js";
import type { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import { getZodFieldErrors } from "../../common/utils/zod-error.js";
import { requireAuth } from "../auth/auth.middleware.js";
import { cancelBookingSchema, createBookingSchema } from "./bookings.schemas.js";
import { createBookingForUser } from "./bookings.service.js";

const bookingsRouter = Router();

function getRouteId(value: string | string[] | undefined): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new AppError("Geçersiz rezervasyon parametresi.", 400, "INVALID_ROUTE_ID");
  }

  return value;
}

bookingsRouter.post("/events/:id/bookings", requireAuth, async (request: AuthenticatedRequest, response, next) => {
  const result = createBookingSchema.safeParse(request.body);

  if (!result.success) {
    response.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Create booking payload doğrulanamadı.",
        details: getZodFieldErrors(result.error),
      },
    });
    return;
  }

  if (!request.user) {
    next(new AppError("Kimlik doğrulama gereklidir.", 401, "UNAUTHORIZED"));
    return;
  }

  try {
    const booking = await createBookingForUser(request.user, getRouteId(request.params.id));

    response.status(201).json({
      data: booking,
    });
  } catch (error) {
    next(error);
  }
});

bookingsRouter.get("/me/bookings", (_request, response) => {
  response.status(501).json({
    message: "List my bookings endpoint sonraki fazda uygulanacak.",
  });
});

bookingsRouter.patch("/bookings/:id/cancel", (request, response) => {
  const result = cancelBookingSchema.safeParse(request.body);

  if (!result.success) {
    response.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Cancel booking payload doğrulanamadı.",
        details: getZodFieldErrors(result.error),
      },
    });
    return;
  }

  response.status(501).json({
    message: "Cancel booking endpoint sonraki fazda uygulanacak.",
  });
});

export { bookingsRouter };
