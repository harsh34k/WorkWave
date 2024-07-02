import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient, Applicant } from '@prisma/client';
const prisma = new PrismaClient();


const hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, 10);
};

const isPasswordCorrect = async (modelName: 'employer' | 'applicant', applicantId: string, password: string): Promise<boolean> => {
    if (modelName === "employer") {
        const employer = await prisma.employer.findUnique({ where: { id: applicantId } });
        if (!employer) {
            throw new Error('Applicant not found');
        }
        return await bcrypt.compare(password, employer.password);
    }
    else {
        const applicant = await prisma.applicant.findUnique({ where: { id: applicantId } });
        if (!applicant) {
            throw new Error('Applicant not found');
        }
        return await bcrypt.compare(password, applicant.password);
    }
};

const generateAccessToken = (user: Applicant): string => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            fullName: user.fullName
        },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
};

// Service function to generate refresh token
const generateRefreshToken = (applicant: Applicant): string => {
    return jwt.sign(
        {
            id: applicant.id
        },
        process.env.REFRESH_TOKEN_SECRET!,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
};

export { generateRefreshToken, generateAccessToken, isPasswordCorrect, hashPassword }