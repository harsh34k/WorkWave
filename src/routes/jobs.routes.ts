import { Router } from 'express';
import { JobData, JobSchema } from '@/Validators/JobValidator';
import { getAllJobs, getJobById, publishJob, updateJob, deleteJob } from '@/controllers/jobs.controllers';
import { verifyJWT } from '@/middleware/auth';
import validate from '@/middleware/authValidator.middleware';

const router = Router();

// Route to publish a job (only accessible by employers)
router.route('/')
    .post(
        verifyJWT("employer"),
        validate<JobData>(JobSchema),
        publishJob
    );

// Route to get all jobs (accessible by all users)
router.route('/getAllJobs')
    .get(
        getAllJobs
    );

// Route to get job by ID (accessible by all users)
router.route('/:jobId')
    .get(
        getJobById
    );

// Route to update a job by ID (only accessible by employers)
router.route('/:jobId')
    .put(
        verifyJWT("employer"),
        validate<Partial<JobData>>(JobSchema),
        updateJob
    );

// Route to delete a job by ID (only accessible by employers)
router.route('/:jobId')
    .delete(
        verifyJWT("employer"),
        deleteJob
    );

export default router;
