import { z } from "zod";

const eventStatusSchema = z.enum(["ACTIVE", "INACTIVE"]);

const baseEventSchema = z.object({
  title: z
    .string()
    .min(3, "Etkinlik adı en az 3 karakter olmalıdır.")
    .max(120, "Etkinlik adı en fazla 120 karakter olabilir."),
  description: z
    .string()
    .max(2000, "Açıklama en fazla 2000 karakter olabilir.")
    .optional(),
  location: z
    .string()
    .min(3, "Lokasyon en az 3 karakter olmalıdır.")
    .max(160, "Lokasyon en fazla 160 karakter olabilir."),
  startsAt: z.iso.datetime("Geçerli bir başlangıç tarihi girilmelidir."),
  endsAt: z.iso.datetime("Geçerli bir bitiş tarihi girilmelidir."),
  totalCapacity: z.coerce
    .number()
    .int("Kapasite tam sayı olmalıdır.")
    .positive("Kapasite pozitif olmalıdır."),
  status: eventStatusSchema.optional(),
});

export const createEventSchema = baseEventSchema
  .refine((input) => new Date(input.endsAt) > new Date(input.startsAt), {
    error: "Bitiş tarihi başlangıç tarihinden sonra olmalıdır.",
    path: ["endsAt"],
  });

export const updateEventSchema = baseEventSchema
  .partial()
  .refine(
    (input) =>
      !input.startsAt || !input.endsAt || new Date(input.endsAt) > new Date(input.startsAt),
    {
      error: "Bitiş tarihi başlangıç tarihinden sonra olmalıdır.",
      path: ["endsAt"],
    },
  );

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
