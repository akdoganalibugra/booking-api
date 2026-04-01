import { z, type ZodError } from "zod";

export function getZodFieldErrors(error: ZodError): Record<string, string[] | undefined> {
  return z.flattenError(error).fieldErrors;
}

