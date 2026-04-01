import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { processPendingBookings } from "./expiry-worker.service.js";

const WORKER_POLL_INTERVAL_MS = 15_000;

async function runCycle() {
  const summary = await processPendingBookings();

  console.log(
    `[expiry-worker] scanned=${summary.scanned} confirmed=${summary.confirmed} expired=${summary.expired} skipped=${summary.skipped}`,
  );
}

async function startWorker() {
  try {
    await prisma.$connect();
    console.log(`Expiry worker booted in ${env.NODE_ENV} mode.`);
    await runCycle();
    setInterval(() => {
      void runCycle();
    }, WORKER_POLL_INTERVAL_MS);
  } catch (error) {
    console.error("Failed to start expiry worker", error);
    process.exit(1);
  }
}

void startWorker();
