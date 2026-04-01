import { Router } from "express";

const authRouter = Router();

authRouter.post("/register", (_request, response) => {
  response.status(501).json({
    message: "Register endpoint sonraki fazda uygulanacak.",
  });
});

authRouter.post("/login", (_request, response) => {
  response.status(501).json({
    message: "Login endpoint sonraki fazda uygulanacak.",
  });
});

export { authRouter };

