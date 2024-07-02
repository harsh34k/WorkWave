import { PrismaClient } from '@prisma/client';
import { ApiResponse } from "../utils/ApiResponse"
import { generateAccessToken, generateRefreshToken, hashPassword } from '../utils/utils';
import { asyncHandler } from '../utils/asyncHandler';
import { isPasswordCorrect } from "../utils/utils"
import fs from "fs"
import { uploadOnCloudinary } from '../utils/cloudinary';
import { registrationSchema } from '../Validators/registrationValidator';
import { z } from 'zod';

const prisma = new PrismaClient();

interface TokenResponse {
    accessToken: string;
    refreshToken: string;
}

const generateAccessAndRefereshTokens = async (userId: string): Promise<TokenResponse | null> => {
    try {
        const user = await prisma.employer.findUnique({
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
        await prisma.employer.update({
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


    const { fullName, email, password, companyName, jobTitle } = req.body

    const existedUser = await prisma.employer.findUnique({
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

    const user = await prisma.employer.create({
        data: {
            email,
            password: hashedPassword,
            avatarUrl: avatar.url,
            fullName: fullName,
            companyName,
            jobTitle,
        }
    })

    const createdUser = await prisma.employer.findUnique({
        where: {
            id: user.id
        },
        select: {
            id: true,
            email: true,
            fullName: true,
            companyName: true,
            jobTitle: true,
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

    const user = await prisma.employer.findFirst({
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

    const isPasswordValid = await isPasswordCorrect('employer', user.id, password)

    if (!isPasswordValid) {
        return res.status(400).json(new ApiResponse(400, null, "Password is not correct"))
    }
    const tokenResponse = await generateAccessAndRefereshTokens(user.id);


    if (!tokenResponse) {
        return res.status(404).json({ message: "User not found" });
    }
    console.log("tokenrespone",);
    const { accessToken, refreshToken } = tokenResponse;

    const loggedInUser = await prisma.employer.findUnique({
        where: {
            id: user.id
        },
        select: {
            id: true,
            email: true,
            fullName: true,
            companyName: true,
            jobTitle: true,
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

// const logoutUser = asyncHandler(async (req, res) => {
//     const userId = req.employer.id; // Assuming req.user._id contains the authenticated user's ID

//     // Update the user's refreshToken to null
//     await prisma.user.update({
//         where: { id: userId },
//         data: { refreshToken: null },
//     });

//     // Options for clearing cookies
//     const options = {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production', // secure should be true only in production
//         sameSite: 'lax', // Helps prevent CSRF attacks
//         path: '/', // Path to apply the cookie
//     };

//     // Clear cookies and send response
//     return res
//         .status(200)
//         .clearCookie('accessToken', options)
//         .clearCookie('refreshToken', options)
//         .json(new ApiResponse(200, {}, 'User logged out'));
// });

const logoutUser = asyncHandler(async (req, res) => {
    return res.status(200).send("done hai bhai")
})

export { registerUser, generateAccessAndRefereshTokens, loginUser, logoutUser }