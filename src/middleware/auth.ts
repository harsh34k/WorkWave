// import  ApiError  from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import jwt, { JwtPayload } from "jsonwebtoken"
//import .env
import dotenv from "dotenv"
import { PrismaClient } from '@prisma/client';
import { NextFunction, Request, Response } from "express";
import { requestwithUser } from "@/types/express";

const prisma = new PrismaClient();

interface TokenInterface {

    id: string;
    email: string;
    fullName: string;
}

export const verifyJWT = (role: "employer" | "applicant") => asyncHandler(async (req: requestwithUser, res: Response, next: NextFunction) => {
    try {
        console.log("hey i am here");
        console.log("req.cookies", req.cookies.accessToken);
        console.log("req.header", req.header("Set-cookie"));
        console.log("req.headers", req.headers);
        console.log("req.user hai from auth middleware", res.locals.user);


        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        const secret = process.env.ACCESS_TOKEN_SECRET as string;

        console.log(token);
        if (!token) {
            return res.status(300).json(new ApiResponse(300, null, "Unauthorized request"))

        }

        const decodedToken = jwt.verify(token, secret) as TokenInterface;
        console.log("decodedToken", decodedToken);

        const userId = decodedToken.id as string;

        let user;
        if (role === "applicant") {
            user = await prisma.applicant.findUnique({
                where: {
                    id: decodedToken.id
                }
            })
        }
        else {
            user = await prisma.employer.findUnique({
                where: {
                    id: decodedToken.id
                }
            })
        }

        if (!user) {
            res.status(401).json(new ApiResponse(401, null, "Invalid Access Token"))
        }
        console.log("current user", user);

        req.user = user;
        next()
    } catch (error) {
        // throw new ApiError(401, error?.message || "Invalid access token")
    }

})