export type MockPaymentDecision = "SUCCESS" | "FAILED" | "PENDING";

export interface MockPaymentResult {
  bookingId: string;
  provider: "MOCK";
  status: MockPaymentDecision;
  providerReference: string;
  checkedAt: Date;
}

