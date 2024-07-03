// app.js

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { PrismaClient } from "@prisma/client";
import applicantRouter from "./routes/applicants.routes"
import employerRouter from "./routes/employers.routes"
import jobRouter from "./routes/jobs.routes"
import applicationRouter from "./routes/applications.routes"


const app = express();
const prisma = new PrismaClient();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Example health check route
app.get("/api/v1/healthcheck", (req, res) => {
    res.status(200).json({ message: "Health check OK" });
});
app.use('/api/v1/applicants', applicantRouter);
app.use('/api/v1/employers', employerRouter);


app.use("/api/v1/jobs", jobRouter);
app.use("/api/v1/applications", applicationRouter);
// app.use("/api/v1/jobs", jobRouter); // Use your job routes similarly
// Use other routes as needed

// Handle undefined routes
// app.use((req, res, next) => {
//     res.status(404).json({ message: "Route not found" });
// });

// Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ message: "Internal server error" });
// });

export { app };
