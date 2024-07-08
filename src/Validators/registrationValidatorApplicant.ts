import { z } from "zod";

// Define the schema for the registration data
export const ApplicantRegistrationSchema = z.object({
    fullName: z
        .string({ required_error: "fullname is required" })
        .min(3, { message: "Full name is required from zod" }),
    email: z.
        string({ required_error: "email is required" })
        .email({ message: "Invalid Email Address" }),
    password: z.
        string({ required_error: "password is required" })
        .min(3, { message: "Password is required" }),
});

// Type definition for the validated data
export type ApplicantRegistrationData = z.infer<typeof ApplicantRegistrationSchema>;