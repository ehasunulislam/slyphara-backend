import { z } from "zod";

const updateProfileValidationSchema = z.object({
  linkedin: z.string().url().optional(),
  github: z.string().url().optional(),

  studentIdCardNumber: z
    .string()
    .min(3, "Student ID card number is required")
    .optional(),

  institutionName: z
    .string()
    .min(2, "Institution name is required")
    .optional(),
});

export const profileSchema = {
    updateProfileValidationSchema
}