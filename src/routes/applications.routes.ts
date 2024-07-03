import { Router } from "express";
import { applyForJob, getAllAppliedJobs, getApplicationById, withdrawApplication } from "../controllers/applications.controllers";
import { verifyJWT } from "../middleware/auth";
import validate from "../middleware/authValidator.middleware";
import { ApplicationData, applicationSchema } from "../Validators/applicationValidator";

const router = Router();

// Apply for a job
router.route("/apply")
    .post(
        verifyJWT("applicant"),
        validate<ApplicationData>(applicationSchema),
        applyForJob
    );

// Get all jobs applied by the applicant
router.route("/applied-jobs")
    .get(
        verifyJWT("applicant"),
        getAllAppliedJobs
    );

// Get a specific application by ID
router.route("/:applicationId")
    .get(
        verifyJWT("applicant"),
        getApplicationById
    );

// Withdraw an application
router.route("/withdraw/:applicationId")
    .delete(
        verifyJWT("applicant"),
        withdrawApplication
    );

export default router;
