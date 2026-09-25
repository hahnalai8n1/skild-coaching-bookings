import { z } from "zod";

const requiredDateTime = z
  .string()
  .trim()
  .min(1, "Choose a date and time")
  .refine((value) => !Number.isNaN(Date.parse(value)), "Enter a valid date and time");

export const sessionSchema = z
  .object({
    title: z.string().trim().min(2, "Use at least 2 characters").max(80, "Keep the title under 80 characters"),
    startsAt: requiredDateTime,
    endsAt: requiredDateTime,
    location: z.string().trim().max(120, "Keep the location under 120 characters").optional(),
    notes: z.string().trim().max(1000, "Keep notes under 1,000 characters").optional(),
  })
  .refine((data) => new Date(data.endsAt) > new Date(data.startsAt), {
    message: "End time must be after the start time",
    path: ["endsAt"],
  });

export type SessionInput = z.infer<typeof sessionSchema>;

export function sessionInputFromFormData(formData: FormData): Record<keyof SessionInput, string> {
  return {
    title: String(formData.get("title") ?? ""),
    startsAt: String(formData.get("startsAtUtc") ?? ""),
    endsAt: String(formData.get("endsAtUtc") ?? ""),
    location: String(formData.get("location") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  };
}
