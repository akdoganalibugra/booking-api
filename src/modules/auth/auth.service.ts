import bcrypt from "bcrypt";

import { AppError } from "../../common/errors/app-error.js";
import { AUTH_MESSAGES } from "./auth.constants.js";
import type { RegisterInput } from "./auth.schemas.js";
import { DEFAULT_USER_ROLE } from "./auth.utils.js";
import { createUser, findUserByEmail } from "./auth.repository.js";

const PASSWORD_SALT_ROUNDS = 10;

export interface RegisterResult {
  id: string;
  email: string;
  role: string;
  createdAt: Date;
}

export async function registerUser(input: RegisterInput): Promise<RegisterResult> {
  const existingUser = await findUserByEmail(input.email);

  if (existingUser) {
    throw new AppError(AUTH_MESSAGES.emailAlreadyExists, 409, "EMAIL_ALREADY_EXISTS");
  }

  const passwordHash = await bcrypt.hash(input.password, PASSWORD_SALT_ROUNDS);

  const user = await createUser({
    email: input.email,
    passwordHash,
    role: DEFAULT_USER_ROLE,
  });

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

