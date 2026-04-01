import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";

async function startWorker() {
  try {
    await prisma.$connect();
    console.log(`Expiry worker booted in ${env.NODE_ENV} mode.`);
    console.log("Worker logic sonraki fazda uygulanacak.");
  } catch (error) {
    console.error("Failed to start expiry worker", error);
    process.exit(1);
  }
}

void startWorker();
