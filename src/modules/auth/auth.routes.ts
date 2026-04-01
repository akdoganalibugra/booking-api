import { Router } from "express";

import { loginSchema, registerSchema } from "./auth.schemas.js";
import { loginUser, registerUser } from "./auth.service.js";

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

authRouter.post("/login", async (request, response, next) => {
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

  try {
    const auth = await loginUser(result.data);

    response.status(200).json(auth);
  } catch (error) {
    next(error);
  }
});

export { authRouter };
