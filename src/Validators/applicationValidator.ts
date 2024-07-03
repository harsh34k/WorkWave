import { z } from "zod";



export const applicationSchema = z.object({
    jobId: z.string({ required_error: "JobId is required" }),
    applicantId: z.string({ required_error: "ApplicantId is required" }),
    coverLetter: z.string({ required_error: "CoverLetter is required" }).max(100, { message: "Maximum 100 characters is allowed only" }),


});

// Type definition for the validated data
export type ApplicationData = z.infer<typeof applicationSchema>;
