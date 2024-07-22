import { requestwithUser } from "../types/express";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Education, Experience, PrismaClient, Salary, WorkMode } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

const publishJob = asyncHandler(async (req: requestwithUser, res: Response) => {
    try {
        const { title, description, location, workMode, experience, salary, education } = req.body;
        const employerId = req.user?.id as string;

        const job = await prisma.job.create({
            data: {
                title,
                description,
                location,
                workMode,
                experience,
                salary,
                education,
                employerId,
            }
        });
        return res.status(200).json(new ApiResponse(200, job, "Job Published Succesfully"))
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, null, "Unable to Publish Job"))
    }
})

// Assuming `applyForJob` controller function handles application submission

// const applyForJob = async (req: Request, res: Response) => {
//     try {
//       const { jobId, coverLetter } = req.body;
//       const applicantId = req.user?.id; // Assuming applicant ID is retrieved from authenticated user

//       // Validate required fields
//       if (!jobId || !applicantId || !coverLetter) {
//         return res.status(400).json({ error: 'Please provide jobId, applicantId, and coverLetter.' });
//       }

//       // Create application using Prisma
//       const createdApplication = await prisma.application.create({
//         data: {
//           jobId,
//           applicantId,
//           coverLetter,
//         },
//       });

//       return res.status(201).json({
//         message: 'Application submitted successfully.',
//         application: createdApplication,
//       });
//     } catch (error) {
//       console.error('Error submitting application:', error);
//       return res.status(500).json({ error: 'Internal server error.' });
//     }
//   };


const getAllJobs = asyncHandler(async (req: Request, res: Response) => {
    try {
        const jobs = await prisma.job.findMany();

        return res.status(200).json(new ApiResponse(200, jobs, "Retrieved all Jobs succesfully"));
    } catch (error) {
        console.error('Error fetching jobs:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
})

const getJobById = async (req: Request, res: Response) => {
    try {
        console.log("i am reaching here");

        const jobId = req.params.jobId as string;

        const job = await prisma.job.findUnique({
            where: { id: jobId },
        });

        if (!job) {
            return res.status(404).json({ error: 'Job not found.' });
        }
        return res.status(200).json(new ApiResponse(200, job, "Retrieved Job succesfully"));
    } catch (error) {
        console.error('Error fetching job details:', error);
        return res.status(500).json(new ApiResponse(500, null, "Internal server error"));
    }
};


const updateJob = async (req: Request, res: Response) => {
    try {
        const jobId = req.params?.jobId;
        const { title, description, location, workMode, experience, salary, duration, education } = req.body;

        // Check if at least one field is provided
        if (!title && !description && !location && !workMode && !experience && !salary && !duration && !education) {
            return res.status(400).json(new ApiResponse(400, {}, "Please provide at least one field to update"));
        }

        // Create an object with only the fields that are defined
        const updateData: Partial<{
            title: string;
            description: string;
            location: string;
            workMode: WorkMode;  // Use the actual type or enum if available
            experience: Experience; // Use the actual type or enum if available
            salary: Salary; // Use the actual type or enum if available
            education: Education;
        }> = {};

        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (location) updateData.location = location;
        if (workMode) updateData.workMode = workMode;
        if (experience) updateData.experience = experience;
        if (salary) updateData.salary = salary;
        if (education) updateData.education = education;
        console.log("jobId now", jobId);
        console.log("updateData", updateData);


        const updatedJob = await prisma.job.update({
            where: { id: jobId },
            data: updateData,
        });
        console.log("ab to ho gya hoga bhai", updatedJob);


        return res.status(200).json(new ApiResponse(200, updatedJob, 'Job updated successfully.'));
    } catch (error) {
        console.error('Error updating job:', error);
        return res.status(500).json(new ApiResponse(500, {}, 'Internal server error.'));
    }
};

const deleteJob = async (req: requestwithUser, res: Response) => {
    try {
        const jobId = req.params.jobId;
        const employerId = req.user?.id as string; // Assuming req.user contains authenticated user info

        // Fetch the job to verify ownership
        const job = await prisma.job.findUnique({
            where: { id: jobId },
            select: { employerId: true }, // Only select employerId for verification
        });

        // Check if job exists and belongs to the employer
        if (!job) {
            return res.status(404).json(new ApiResponse(404, null, 'Job not found by Id.'));
        }

        if (job.employerId !== employerId) {
            return res.status(403).json(new ApiResponse(403, null, 'You are not authorized to delete this job.'));
        }

        // Proceed to delete the job
        await prisma.job.delete({
            where: { id: jobId },
        });

        return res.status(200).json(new ApiResponse(200, null, 'Job deleted successfully.'));
    } catch (error) {
        console.error('Error deleting job:', error);
        return res.status(500).json(new ApiResponse(500, null, 'Internal server error.'));
    }
};



// Define possible query parameters and their types
interface JobFilters {
    title?: string;
    description?: string;
    location?: string;
    workMode?: WorkMode;
    experience?: Experience;
    salary?: Salary;
    education?: string;
}

const filterJob = asyncHandler(async (req: requestwithUser, res: Response) => {
    console.log("atleast reached here");

    try {
        const {
            title,
            location,
            workMode,
            experience,
            salary,
            education
        } = req.query as Partial<JobFilters>;

        // Build the filter object for Prisma
        const filters: any = {};

        if (title) {
            filters.title = {
                contains: title,
                mode: "insensitive"
            };
        }
        if (location) {
            filters.location = {
                contains: location,
                mode: "insensitive"
            };
        }
        if (workMode) {
            filters.workMode = workMode;
        }
        if (experience) {
            filters.experience = experience;
        }
        if (salary) {
            filters.salary = salary;
        }
        if (education) {
            filters.education = education
        }
        console.log("tiitle", title);


        // Fetch filtered jobs from Prisma
        const jobs = await prisma.job.findMany({
            where: filters
        });
        if (!jobs) {
            return res.status(404).json(new ApiResponse(404, null, "No Job Found for filtered criteria"));
        }

        return res.status(200).json(new ApiResponse(200, jobs, "Filtered jobs retrieved successfully"));
    } catch (error) {
        console.error('Error filtering jobs:', error);
        return res.status(500).json(new ApiResponse(500, null, "Internal server error"));
    }
});






export { publishJob, getAllJobs, updateJob, getJobById, deleteJob, filterJob }