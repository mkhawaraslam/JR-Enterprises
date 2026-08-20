import { z } from "zod";
import { DOCUMENT_TYPES } from "@/lib/types";

export const lineItemSchema = z.object({
  description: z.string().trim().min(1, "Each item needs a description."),
  quantity: z.coerce.number().finite("Quantity is required.").min(0, "Quantity cannot be negative."),
  unit_price: z.coerce
    .number()
    .finite("Unit price is required.")
    .min(0, "Unit price cannot be negative."),
  total: z.coerce.number().finite("Line total is required."),
});

export const documentSchema = z.object({
  customer_name: z.string().trim().min(1, "Customer / M/s. is required."),
  document_type: z.enum(DOCUMENT_TYPES),
  items: z.array(lineItemSchema).min(1, "Add at least one line item."),
});

export type DocumentFormValues = z.infer<typeof documentSchema>;

export function flattenZodError(error: z.ZodError): string {
  return error.issues.map((issue) => issue.message).join(" ");
}
