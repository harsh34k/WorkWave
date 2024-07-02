// index.js

import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { app } from "./app";

dotenv.config({ path: './.env' });

const prisma = new PrismaClient();

const startServer = async () => {
    try {
        await prisma.$connect();
        app.listen(process.env.PORT || 8000, () => {
            console.log(`⚙️ Server is running at port : ${process.env.PORT || 8000}`);
        });
    } catch (error) {
        console.error("Error connecting to database:", error);
        process.exit(1); // Exit process on database connection error
    }
};

startServer();











/*
import express from "express"
const app = express()
( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("errror", (error) => {
            console.log("ERRR: ", error);
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
        })

    } catch (error) {
        console.error("ERROR: ", error)
        throw err
    }
})()

*/