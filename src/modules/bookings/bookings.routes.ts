import { Router } from "express";

const bookingsRouter = Router();

bookingsRouter.post("/events/:id/bookings", (_request, response) => {
  response.status(501).json({
    message: "Create booking endpoint sonraki fazda uygulanacak.",
  });
});

bookingsRouter.get("/me/bookings", (_request, response) => {
  response.status(501).json({
    message: "List my bookings endpoint sonraki fazda uygulanacak.",
  });
});

bookingsRouter.patch("/bookings/:id/cancel", (_request, response) => {
  response.status(501).json({
    message: "Cancel booking endpoint sonraki fazda uygulanacak.",
  });
});

export { bookingsRouter };

