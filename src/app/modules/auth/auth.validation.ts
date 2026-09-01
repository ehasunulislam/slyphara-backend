import z from "zod";

const registerUserZodSchema = z.object({
	name: z
		.string()
		.min(3, { message: "Name must be at least 3 characters long" })
		.max(50, { message: "Name must not exceed 50 characters" }),

	email: z
		.email({
			message: "Please provide a valid email address",
		})
		.toLowerCase(),

	password: z
		.string()
		.min(8, { message: "Password must be at least 8 characters long" })
		.regex(/[A-Z]/, {
			message: "Password must contain at least one uppercase letter",
		})
		.regex(/[0-9]/, {
			message: "Password must contain at least one number",
		})
		.regex(/[^A-Za-z0-9]/, {
			message: "Password must contain at least one special character",
		}),

	profilePhoto: z
		.string()
		.url({ message: "Profile photo must be a valid URL" })
		.optional(),

	role: z.enum(["Student", "Developer", "Admin"]),
});


export const userValidation = {
	registerUserZodSchema,
};