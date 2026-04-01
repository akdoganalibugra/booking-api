import { Router } from "express";

import { loginSchema, registerSchema } from "./auth.schemas.js";
import { registerUser } from "./auth.service.js";

const authRouter = Router();

authRouter.post("/register", async (request, response, next) => {
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

  try {
    const user = await registerUser(result.data);

    response.status(201).json({
      user,
    });
  } catch (error) {
    next(error);
  }
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
