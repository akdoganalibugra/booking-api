import { z } from "zod";

export const registerSchema = z.object({
  email: z.email("Geçerli bir e-posta adresi girilmelidir."),
  password: z
    .string()
    .min(8, "Şifre en az 8 karakter olmalıdır.")
    .max(72, "Şifre en fazla 72 karakter olabilir."),
});

export const loginSchema = z.object({
  email: z.email("Geçerli bir e-posta adresi girilmelidir."),
  password: z
    .string()
    .min(1, "Şifre zorunludur.")
    .max(72, "Şifre en fazla 72 karakter olabilir."),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

