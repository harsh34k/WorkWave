import { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import { PrismaClient } from "@prisma/client";
import { requestwithUser } from "../types/express";
import { uploadOnCloudinary } from '../utils/cloudinary';
const prisma = new PrismaClient();
// Apply for a job

export const applyForJob = async (req: requestwithUser, res: Response) => {
    try {
        console.log("req.body", req.body);

        const coverLetter = req.body.coverLetter
        const jobId = req.body.jobId || req.params as { jobId: string };
        const applicantId = req.user?.id;

        if (!applicantId) {
            return res.status(401).json(new ApiResponse(401, null, "Unauthorized"));
        }
        console.log("jobId", jobId);


        // Check if the applicant has already applied for this job
        const existingApplication = await prisma.application.findFirst({
            where: { applicantId, jobId },
        });

        if (existingApplication) {
            return res.status(409).json(new ApiResponse(409, null, "You have already applied for this job"));
        }
        console.log("req.files", req.files);

        const resumeFile = req.files as { [fieldname: string]: Express.Multer.File[] };
        const resume = resumeFile.resume?.[0];
        const resumeLocalPath = resume.path;

        console.log("resume: ", resume);
        if (!resume) {
            return res.status(400).json(new ApiResponse(400, null, "Please provide a Resume"))
        }
        console.log("resumelocalpath", resumeLocalPath);

        const resumeUrl = await uploadOnCloudinary(resumeLocalPath)

        if (!resumeUrl || resumeUrl === null) {
            return res.status(400).json(
                new ApiResponse(400, null, "Resume is required")
            )
        }
        const appliedJob = await prisma.job.findUnique({
            where: {
                id: jobId
            }
        })
        console.log("applied job", appliedJob);


        // Create the application
        const application = await prisma.application.create({
            data: {
                jobId,
                applicantId,
                coverLetter,
                resumeUrl: resumeUrl.url
            },
        });

        return res.status(201).json(new ApiResponse(201, { application, appliedJob }, "Application submitted successfully"));
    } catch (error) {
        console.error('Error applying for job:', error);
        return res.status(500).json(new ApiResponse(500, null, "Internal server error"));
    }
};

export const getAllAppliedJobs = async (req: requestwithUser, res: Response) => {
    try {
        console.log("here getAllAppliedJobs");

        const applicantId = req.user?.id;

        if (!applicantId) {
            return res.status(401).json(new ApiResponse(401, null, "Unauthorized"));
        }

        const applications = await prisma.application.findMany({
            where: {
                applicantId,
            },
            include: {
                job: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        location: true,
                        workMode: true,
                        experience: true,
                        salary: true,
                        education: true,
                        postedAt: true,
                    }
                }
            },
        });

        return res.status(200).json(new ApiResponse(200, applications, "Jobs retrieved successfully"));
    } catch (error) {
        console.error('Error retrieving applied jobs:', error);
        return res.status(500).json(new ApiResponse(500, null, "Internal server error"));
    }
};

export const getApplicationById = async (req: requestwithUser, res: Response) => {
    try {
        const { applicationId } = req.params;
        const applicantId = req.user?.id;
        console.log("applicationId", applicationId);
        console.log("applicantId", applicantId);


        if (!applicantId) {
            return res.status(401).json(new ApiResponse(401, null, "Unauthorized"));
        }

        const application = await prisma.application.findFirst({
            where: {
                AND: {
                    jobId: applicationId,
                    applicantId,
                }
            },
            include: {
                job: true,
            },
        });

        if (!application) {
            return res.status(404).json(new ApiResponse(404, null, "Application not found"));
        }

        return res.status(200).json(new ApiResponse(200, application, "Application retrieved successfully"));
    } catch (error) {
        console.error('Error retrieving application:', error);
        return res.status(500).json(new ApiResponse(500, null, "Internal server error"));
    }
};

export const withdrawApplication = async (req: requestwithUser, res: Response) => {
    try {
        const { applicationId } = req.params;
        const applicantId = req.user?.id;

        if (!applicantId) {
            return res.status(401).json(new ApiResponse(401, null, "Unauthorized"));
        }

        const application = await prisma.application.findFirst({
            where: {
                id: applicationId,
                applicantId,
            },
        });

        if (!application) {
            return res.status(404).json(new ApiResponse(404, null, "Application not found"));
        }

        await prisma.application.delete({
            where: { id: applicationId },
        });

        return res.status(200).json(new ApiResponse(200, null, "Application withdrawn successfully"));
    } catch (error) {
        console.error('Error withdrawing application:', error);
        return res.status(500).json(new ApiResponse(500, null, "Internal server error"));
    }
};

export const getAllApplicationOfJobById = async (req: requestwithUser, res: Response) => {
    try {
        const { applicationId } = req.params;
        if (!applicationId) {
            return res.status(400).json(new ApiResponse(400, null, "Invalid application id"));
        }

        // Fetch the job to verify ownership
        const allApplicatant = await prisma.application.findMany({
            where: { jobId: applicationId },
            include: {
                applicant: true
            }
        });

        // Check if job exists and belongs to the employer
        if (!allApplicatant) {
            return res.status(404).json(new ApiResponse(404, null, 'No Applicant was found'));
        }

        return res.status(200).json(new ApiResponse(200, allApplicatant, 'Applicants retrieved successfully.'));
    } catch (error) {
        console.error('Error deleting job:', error);
        return res.status(500).json(new ApiResponse(500, null, 'Internal server error.'));
    }
};
