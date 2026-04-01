import { beforeEach, vi } from "vitest";

process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "mysql://test:test@localhost:3306/booking_api_test";
process.env.JWT_SECRET = "test-secret";
process.env.JWT_EXPIRES_IN = "1h";

beforeEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
});
