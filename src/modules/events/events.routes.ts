import { Router } from "express";

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

eventsRouter.post("/", (_request, response) => {
  response.status(501).json({
    message: "Event create endpoint sonraki fazda uygulanacak.",
  });
});

eventsRouter.patch("/:id", (_request, response) => {
  response.status(501).json({
    message: "Event update endpoint sonraki fazda uygulanacak.",
  });
});

eventsRouter.delete("/:id", (_request, response) => {
  response.status(501).json({
    message: "Event delete endpoint sonraki fazda uygulanacak.",
  });
});

export { eventsRouter };

