import { Employer, Applicant } from "@prisma/client";
import { Request } from "express";



export interface requestwithUser extends Request {
    user?: Employer | Applicant | null;
    // user:string
}
