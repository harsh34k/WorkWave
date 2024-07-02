import { Employer, Applicant } from "@prisma/client";

declare global {
    namespace Express {
        interface Request {
            user?: Employer | Applicant | null; // Add optional `user` property
        }
    }
}