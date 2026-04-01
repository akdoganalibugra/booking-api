import { createServer } from "node:http";

import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";

const app = createApp();
const server = createServer(app);

async function bootstrap() {
  try {
    await prisma.$connect();

    server.listen(env.PORT, () => {
      console.log(`Server is running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

void bootstrap();

async function shutdown(signal: string) {
  console.log(`${signal} received. Shutting down gracefully.`);

  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

