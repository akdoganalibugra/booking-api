import type { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";

import { env } from "../../config/env.js";
import { AppError } from "../../common/errors/app-error.js";
import type { AuthenticatedRequest } from "../../common/types/authenticated-request.js";
import type { AuthTokenPayload } from "./auth.types.js";

function extractBearerToken(authorizationHeader?: string): string | null {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
}

export function requireAuth(
  request: AuthenticatedRequest,
  _response: Response,
  next: NextFunction,
): void {
  const token = extractBearerToken(request.headers.authorization);

  if (!token) {
    next(new AppError("Kimlik doğrulama gereklidir.", 401, "UNAUTHORIZED"));
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
    request.user = payload;
    next();
  } catch {
    next(new AppError("Geçersiz veya süresi dolmuş token.", 401, "INVALID_TOKEN"));
  }
}
