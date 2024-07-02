import { PrismaClient } from '@prisma/client';
import { ApiResponse } from "../utils/ApiResponse"
import { generateAccessToken, generateRefreshToken, hashPassword, isPasswordCorrect } from '../utils/utils';
import { asyncHandler } from '../utils/asyncHandler';
import { uploadOnCloudinary } from '../utils/cloudinary';
import { CookieOptions, Request, Response } from 'express';
import { requestwithUser } from '@/types/express';
import jwt, { JwtPayload } from "jsonwebtoken"

const prisma = new PrismaClient();

interface TokenResponse {
    accessToken: string;
    refreshToken: string;
}

const generateAccessAndRefereshTokens = async (userId: string): Promise<TokenResponse | null> => {
    try {
        const user = await prisma.applicant.findUnique({
            where: {
                id: userId
            }
        })
        if (!user) return null;
        const accessToken = generateAccessToken(user)
        const refreshToken = generateRefreshToken(user)

        console.log("accestoken", accessToken);
        console.log("refreshToken", refreshToken);

        user.refreshToken = refreshToken
        await prisma.applicant.update({
            where: {
                id: userId
            },
            data: {
                refreshToken: refreshToken
            }
        })
        // return new ApiResponse(200, { accessToken, refreshToken }, "Tokens generated successfully")
        return { accessToken, refreshToken }
        // await user.save({ validateBeforeSave: false })


    } catch (error) {
        throw new Error("something went wrong while generating accessToken adn refreshToken")
    }
}


const registerUser = asyncHandler(async (req, res) => {


    const { fullName, email, password } = req.body

    const existedUser = await prisma.applicant.findUnique({
        where: {
            email: email
        }
    })
    if (existedUser) {
        res.status(400).json(
            new ApiResponse(400, null, "User already exists")
        )
    }
    const avatarFiles = req.files as { [fieldname: string]: Express.Multer.File[] };
    const avatarFile = avatarFiles.avatarUrl?.[0];
    const avatarLocalPath = avatarFiles.avatarUrl?.[0].path;

    console.log("avatarFile: ", avatarFile);
    if (!avatarFile) {
        return res.status(400).json(new ApiResponse(400, null, "Please provide a profile image"))
    }
    const hashedPassword = await hashPassword(password);

    const avatar = await uploadOnCloudinary(avatarLocalPath)



    if (!avatar || avatar === null) {
        return res.status(400).json(
            new ApiResponse(400, null, "Avatar file is required")
        )
    }

    const user = await prisma.applicant.create({
        data: {
            email,
            password: hashedPassword,
            avatarUrl: avatar.url,
            fullName: fullName,
        }
    })

    const createdUser = await prisma.applicant.findUnique({
        where: {
            id: user.id
        },
        select: {
            id: true,
            email: true,
            fullName: true,
            avatarUrl: true,

        }
    })

    if (!createdUser) {
        return res.status(500).json(new ApiResponse(500, null, "Something went wrong while registering the user"))
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

})

const loginUser = asyncHandler(async (req, res) => {
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const { email, fullName, password } = req.body

    const user = await prisma.applicant.findFirst({
        where: {
            OR: [
                { email },
                { fullName }
            ]
        }
    })

    if (!user) {
        return res.status(404).json(new ApiResponse(404, null, "User not found"))
    }

    const isPasswordValid = await isPasswordCorrect('applicant', user.id, password)

    if (!isPasswordValid) {
        return res.status(400).json(new ApiResponse(400, null, "Password is not correct"))
    }
    const tokenResponse = await generateAccessAndRefereshTokens(user.id);


    if (!tokenResponse) {
        return res.status(404).json({ message: "User not found" });
    }
    console.log("tokenrespone",);
    const { accessToken, refreshToken } = tokenResponse;

    const loggedInUser = await prisma.applicant.findUnique({
        where: {
            id: user.id
        },
        select: {
            id: true,
            email: true,
            fullName: true,
            avatarUrl: true,
        }
    })

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged In Successfully"
            )
        )

})

const logoutUser = asyncHandler(async (req: requestwithUser, res) => {
    const userId = req.user?.id; // here the user will always be the applicant

    // Update the user's refreshToken to null
    await prisma.applicant.update({
        where: { id: userId },
        data: { refreshToken: null },
    });

    // Options for clearing cookies
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // secure should be true only in production
        sameSite: 'lax', // Helps prevent CSRF attacks
        path: '/', // Path to apply the cookie
    };

    // Clear cookies and send response
    return res
        .status(200)
        .clearCookie('accessToken', options as CookieOptions)
        .clearCookie('refreshToken', options as CookieOptions)
        .json(new ApiResponse(200, {}, 'User logged out'));
});

const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
    console.log("req.cookies", req.cookies);

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        return res.status(400).json(new ApiResponse(400, {}, "unauthorized request"))
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET as string
        ) as JwtPayload
        console.log("decodedtoken", decodedToken);


        const user = await prisma.applicant.findUnique(
            {
                where: { id: decodedToken.id },
            })

        if (!user) {
            return res.status(400).json(new ApiResponse(400, {}, "Invalid refresh token"))
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            return res.status(400).json(new ApiResponse(400, {}, "Refresh token is expired or used"))

        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const tokenResponse = await generateAccessAndRefereshTokens(user.id);

        if (tokenResponse) {
            const { accessToken, refreshToken } = tokenResponse;
            return res
                .status(200)
                .cookie("accessToken", accessToken, options)
                .cookie("refreshToken", refreshToken, options)
                .json(
                    new ApiResponse(
                        200,
                        { accessToken, refreshToken: refreshToken },
                        "Access token refreshed"
                    )
                )
            // Use accessToken and refreshToken here
        } else {
            // Handle case where tokenResponse is null
            return res.status(500).json(new ApiResponse(500, null, "Unable to generate tokens"))
        }

    } catch (error) {
        // throw new ApiError(401, error?.message || "Invalid refresh token")
        return res.status(401).json(new ApiResponse(401, null, "Invalid refresh token"))
    }

})

const changeCurrentPassword = asyncHandler(async (req: requestwithUser, res: Response) => {
    const { oldPassword, newPassword } = req.body;
    // const user = req.user

    if (!(oldPassword || newPassword) && !req.user) {
        return res.status(400).json(new ApiResponse(400, {}, "Please provide old and new password"))
    }

    const user = await prisma.applicant.findUnique(
        {
            where: {
                id: req.user?.id
            }
        }
    )
    if (!user) {
        return res.status(400).json(new ApiResponse(400, {}, "User not found"))
    }
    // isPasswordCorrect('applicant', user.id, password)
    const isPasswordRight = await isPasswordCorrect('applicant', req.user?.id as string, oldPassword)


    if (!isPasswordRight) {
        return res.status(400).json(new ApiResponse(400, {}, "Invalid old password"))
    }

    user.password = newPassword;

    await prisma.applicant.update({
        where: {
            id: req.user?.id
        },
        data: user
    })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"))
})


const getCurrentUser = asyncHandler(async (req: requestwithUser, res: Response) => {
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            req.user,
            "User fetched successfully"
        ))
})

const updateAccountDetails = asyncHandler(async (req: requestwithUser, res: Response) => {
    const { fullName, email } = req.body;

    // Check if at least one field is provided
    if (!fullName && !email) {
        return res.status(400).json(new ApiResponse(400, {}, "Please provide at least one field to update"));
    }

    // Create an object with only the fields that are defined
    const updateData: Partial<{
        fullName: string;
        email: string;
    }> = {};

    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email;

    // Update the user with the filtered fields
    const user = await prisma.applicant.update({
        where: {
            id: req.user?.id,
        },
        data: updateData,
        select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
        }
    });

    // Exclude the password in the response

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req: requestwithUser, res: Response) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        return res.status(400).json(new ApiResponse(400, {}, "Please provide an avatar"));
    }

    //TODO: delete old image - assignment

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar?.url) {
        return res.status(400).json(new ApiResponse(400, {}, "Failed to upload avatar"));

    }

    const user = await prisma.applicant.update(
        {
            where: {
                id: req.user?.id,
            },
            data: {
                avatarUrl: avatar.url
            }
        }
    )

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Avatar image updated successfully")
        )
})

// // Middleware to get all jobs created by the current applicant
const getAllAppliedJobs = asyncHandler(async (req: requestwithUser, res: Response) => {
    try {
        // Ensure the request has the user set by the authentication middleware
        const applicantId = req.user?.id;

        if (!applicantId) {
            return res.status(401).json(new ApiResponse(401, null, "Unauthorized"));
        }

        // Fetch all jobs created by the applicant
        const jobs = await prisma.application.findMany({
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
                        duration: true,
                        education: true,
                        postedAt: true,
                    }
                }
            }

        });

        return res.status(200).json(new ApiResponse(200, jobs, "Jobs retrieved successfully"));
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, null, "Server error"));
    }
});



export { registerUser, generateAccessAndRefereshTokens, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, getAllAppliedJobs }
