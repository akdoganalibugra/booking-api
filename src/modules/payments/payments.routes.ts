import { Router } from "express";

import { AppError } from "../../common/errors/app-error.js";
import { getMockPaymentResult } from "./payments.service.js";

const paymentsRouter = Router();

function getRouteId(value: string | string[] | undefined): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new AppError("Geçersiz ödeme parametresi.", 400, "INVALID_PAYMENT_ID");
  }

  return value;
}

paymentsRouter.get("/mock-payments/:bookingId", (request, response) => {
  response.status(200).json({
    data: getMockPaymentResult(getRouteId(request.params.bookingId)),
  });
});

export { paymentsRouter };
