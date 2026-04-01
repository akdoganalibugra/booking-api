import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { StringValue } from "ms";

import { env } from "../../config/env.js";
import { AppError } from "../../common/errors/app-error.js";
import { AUTH_MESSAGES, AUTH_TOKEN_TYPE } from "./auth.constants.js";
import type { LoginInput, RegisterInput } from "./auth.schemas.js";
import type { AuthResponse, AuthTokenPayload } from "./auth.types.js";
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

export async function loginUser(input: LoginInput): Promise<AuthResponse> {
  const user = await findUserByEmail(input.email);

  if (!user) {
    throw new AppError(AUTH_MESSAGES.invalidCredentials, 401, "INVALID_CREDENTIALS");
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError(AUTH_MESSAGES.invalidCredentials, 401, "INVALID_CREDENTIALS");
  }

  const payload: AuthTokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as unknown as number | StringValue,
  });

  return {
    accessToken,
    tokenType: AUTH_TOKEN_TYPE,
    expiresIn: env.JWT_EXPIRES_IN,
  };
}
