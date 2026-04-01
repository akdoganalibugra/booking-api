import request from "supertest";

import { createApp } from "../app.js";

export function createTestClient() {
  return request(createApp());
}

