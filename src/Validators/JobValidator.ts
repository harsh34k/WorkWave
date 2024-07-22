
import { z } from "zod";

const WorkModeValues = ["ONSITE", "REMOTE", "HYBRID"] as const;
const ExperienceValues = ["FRESHER", "ONE_TO_TWO_YEARS", "TWO_TO_THREE_YEARS", "THREE_TO_FOUR_YEARS", "FOUR_TO_FIVE_YEARS", "ABOVE_FIVE_YEARS"] as const;
const SalaryValues = ["BELOW_3_LAKHS", "FROM_3_TO_6_LAKHS", "FROM_6_TO_10_LAKHS", "FROM_10_TO_15_LAKHS", "ABOVE_15_LAKHS"] as const;
const EducationValues = ["TENTH",
    "TWELFTH",
    "GRADUATION",
    "POSTGRADUATION",
    "PHD"] as const;

export const JobSchema = z.object({
    title: z.string({ required_error: "Title is required" }).min(1, { message: "Title is required" }),
    description: z.string({ required_error: "Description is required" }).min(1, { message: "Description is required" }),
    location: z.string({ required_error: "Location is required" }).min(1, { message: "Location is required" }),
    workMode: z.enum(WorkModeValues, { required_error: "Work mode is required" }),
    experience: z.enum(ExperienceValues, { required_error: "Experience level is required" }),
    salary: z.enum(SalaryValues, { required_error: "Salary is required" }),
    education: z.enum(EducationValues, { required_error: "Education is required" })
});

export type JobData = z.infer<typeof JobSchema>;