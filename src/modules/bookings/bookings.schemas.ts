import { z } from "zod";

export const createBookingSchema = z.object({});

export const cancelBookingSchema = z.object({});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;

