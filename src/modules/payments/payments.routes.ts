import { Router } from "express";

const paymentsRouter = Router();

paymentsRouter.get("/mock-payments/:bookingId", (request, response) => {
  response.status(200).json({
    bookingId: request.params.bookingId,
    provider: "MOCK",
    status: "PENDING",
    message: "Mock payment endpoint sonraki fazda gerçek logic ile doldurulacak.",
  });
});

export { paymentsRouter };

