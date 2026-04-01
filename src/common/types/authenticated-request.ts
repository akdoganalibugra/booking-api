import type { Request } from "express";

import type { AuthTokenPayload } from "../../modules/auth/auth.types.js";

export interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload;
}

