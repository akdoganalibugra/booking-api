import { Router } from "express";

import { loginSchema, registerSchema } from "./auth.schemas.js";

const authRouter = Router();

authRouter.post("/register", (request, response) => {
  const result = registerSchema.safeParse(request.body);

  if (!result.success) {
    response.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Register payload doğrulanamadı.",
        details: result.error.flatten().fieldErrors,
      },
    });
    return;
  }

  response.status(501).json({
    message: "Register endpoint sonraki fazda uygulanacak.",
  });
});

authRouter.post("/login", (request, response) => {
  const result = loginSchema.safeParse(request.body);

  if (!result.success) {
    response.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Login payload doğrulanamadı.",
        details: result.error.flatten().fieldErrors,
      },
    });
    return;
  }

  response.status(501).json({
    message: "Login endpoint sonraki fazda uygulanacak.",
  });
});

export { authRouter };
