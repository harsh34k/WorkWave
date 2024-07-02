import { Request, Response, NextFunction } from "express";
import { ZodError, ZodSchema } from "zod";
import { ApiResponse } from "../utils/ApiResponse";

const validate = <T>(schema: ZodSchema<T>) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parseBody = await schema.parseAsync(req.body);
        req.body = parseBody;
        next();
    } catch (error: any) {
        // console.log('error', error.errors);
        let message;
        if (error.errors.length > 1) {
            message = "Please provide all the required fields with correct details "

        } else {
            message = error.errors[0].message
        }
        // console.log("messagee", message);


        res.status(400).json(new ApiResponse(400, null, message));
    }
};
export default validate;



