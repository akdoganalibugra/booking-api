import express from "express";
import swaggerUi from "swagger-ui-express";

import { errorHandler } from "./common/middleware/error-handler.js";
import { notFoundHandler } from "./common/middleware/not-found-handler.js";
import { openApiDocument } from "./docs/openapi.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { bookingsRouter } from "./modules/bookings/bookings.routes.js";
import { eventsRouter } from "./modules/events/events.routes.js";
import { paymentsRouter } from "./modules/payments/payments.routes.js";

export function createApp() {
  const app = express();

  app.use(express.json());

  app.get("/health", (_request, response) => {
    response.status(200).json({
      status: "ok",
      service: "booking-api",
    });
  });
  app.get("/docs.json", (_request, response) => {
    response.status(200).json(openApiDocument);
  });
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

  app.use("/auth", authRouter);
  app.use("/events", eventsRouter);
  app.use(bookingsRouter);
  app.use(paymentsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
