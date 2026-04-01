import { Router } from "express";

import { getZodFieldErrors } from "../../common/utils/zod-error.js";
import { cancelBookingSchema, createBookingSchema } from "./bookings.schemas.js";

const bookingsRouter = Router();

bookingsRouter.post("/events/:id/bookings", (request, response) => {
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

  response.status(501).json({
    message: "Create booking endpoint sonraki fazda uygulanacak.",
  });
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
