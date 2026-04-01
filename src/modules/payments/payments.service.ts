import { MOCK_PAYMENT_PROVIDER } from "./payments.constants.js";
import type { MockPaymentDecision, MockPaymentResult } from "./payments.types.js";

function hashBookingId(bookingId: string): number {
  return Array.from(bookingId).reduce((accumulator, char, index) => {
    return accumulator + char.charCodeAt(0) * (index + 1);
  }, 0);
}

function decideMockPaymentStatus(bookingId: string): MockPaymentDecision {
  const hash = hashBookingId(bookingId) % 10;

  if (hash <= 4) {
    return "SUCCESS";
  }

  if (hash <= 7) {
    return "FAILED";
  }

  return "PENDING";
}

export function getMockPaymentResult(bookingId: string): MockPaymentResult {
  return {
    bookingId,
    provider: MOCK_PAYMENT_PROVIDER,
    status: decideMockPaymentStatus(bookingId),
    providerReference: `mock-${bookingId}`,
    checkedAt: new Date(),
  };
}

