import { z } from "zod";

// Define the schema for the registration data
export const registrationSchema = z.object({
    fullName: z
        .string({ required_error: "fullname is required" })
        .min(3, { message: "Full name is required from zod" }),
    email: z.
        string({ required_error: "email is required" })
        .email({ message: "Invalid Email Address" }),
    password: z.
        string({ required_error: "password is required" })
        .min(3, { message: "Password is required" }),
    companyName: z
        .string({ required_error: "companyName is required" })
        .min(3, { message: "Company name is required" }),
    jobTitle: z
        .string({ required_error: "jobTitle is required" })
        .min(3, { message: "Job title is required" }),
});

// Type definition for the validated data
export type RegistrationData = z.infer<typeof registrationSchema>;
