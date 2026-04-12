import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Admin } from "../models/admin.model.js";
import { z } from "zod";


const loginCredentialsSchema = z.object({
    usernameOrEmail: z.string().or(z.email()),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .max(30, "Password must be at most 30 characters")
})

const createAdminSchema = z.object({
    email: z.email().optional().trim(),
    username: z.string()
        .min(2, "Username must be at least 2 characters")
        .max(20, "Username must be at most 20 characters"),
    role: z.enum(['admin', 'user', 'developer']).default('user'),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .max(30, "Password must be at most 30 characters"),
    confirmPassword: z.string()
        .min(8, "Password must be at least 8 characters")
        .max(30, "Password must be at most 30 characters"),
}).refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords must match",
})

export const loginAdmin = asyncHandler(async (req, res) => {

    const body = req.body;

    if (!body || Object.keys(body).length === 0) {
        throw new ApiError(400, "Invalid Form Data")
    }

    const parseResult = loginCredentialsSchema.safeParse(body);

    console.log({ parseResult });

    if (!parseResult.success) {
        throw new ApiError(400, parseResult.error.message[0]?.message || "Form Data is Invalid");
    }

    const usernameOrEmail = parseResult.data.usernameOrEmail;
    const password = parseResult.data.password;

    //since we are accepting both email or username but mostly it will be admin like that only 
    const user = await Admin
        .findOne(
            {
                $or: [
                    { username: usernameOrEmail },
                    { email: usernameOrEmail }
                ]
            }
        );

    console.log({ user })

    if (!user) {
        throw new ApiError(400, "User does not exist");
    }

    const isPasswordCorrect = await user.comparePassword(password);

    console.log({ isPasswordCorrect });

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid Username or Password");
    }

    //generate Access Token and Refresh Token

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    console.log({ accessToken, refreshToken })

    user.setRefreshToken(refreshToken);

    await user.save({ validateBeforeSave: false });

    console.log("new user", user);

    const options = {
        httpOnly: true,
        secure: process.env.ENVIRONMENT === "PROD" ? true : false,
        sameSite: "none",
        path: "/"
    };

    //it is used wrong 
    const loggedInUser = user.toObject();
    delete loggedInUser.password;
    delete loggedInUser.__v;
    delete loggedInUser.refreshToken;


    if (!loggedInUser) {
        throw new ApiError(400, "User does not exist");
    }

    return res.status(200)
        .cookie("accessToken", accessToken, {
            ...options, maxAge: 1000 * 60 * 60,
        })
        .cookie("refreshToken", refreshToken, {
            ...options, maxAge: 1000 * 60 * 60 * 24 * 7
            //maxAge: milliseconds * seconds * minutes * hours * days
        })
        .json((
            new ApiResponse(
                200,
                //best practice if we are designing api for mobile app
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "Admin logged in  Successfully"
            )
        ))
})


export const refreshAccessToken = asyncHandler(async (req, res) => {
    //get id and access token from cookie

    // const body = req.body;

    //do i need body here or not
    // console.log({ body })

    const refreshToken = req.cookies?.refreshToken;

    console.log({ refreshToken });

    if (!refreshToken) {
        throw new ApiError(401, "Refresh Token not found");
    }

    const user = await Admin.findOne({ refreshToken });

    if (!user) {
        throw new ApiError(400, "Invalid User");
    }

    const newAccessToken = await user.generateAccessToken();
    const newRefreshToken = await user.generateRefreshToken();

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    const options = {
        httpOnly: true,
        secure: process.env.ENVIRONMENT === "PROD",
        sameSite: "none",
        path: "/"
    };


    res.status(200)
        .cookie("accessToken", newAccessToken, {
            ...options, maxAge: 1000 * 60 * 60,
        })
        .cookie("refreshToken", newRefreshToken, {
            ...options, maxAge: 1000 * 60 * 60 * 24 * 7
        })
        .json(
            new ApiResponse(
                200,
                {
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken
                },
                "Access Token Refreshed Successfully"
            )
        )
})


export const logoutAdmin = asyncHandler(async (req, res) => {
    // take data 
    // clear cookies 
    // clear refresh token from db

    const admin = req.admin;

    console.log({ admin });

    const id = admin._id;

    await Admin.findByIdAndUpdate(
        id,
        {
            $unset: { refreshToken: 1 },
        },
        { new: true }
    )

    const options = {
        httpOnly: true,
        secure: process.env.ENVIRONMENT === "PROD",
        sameSite: "none",
        path: "/"
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"))

})

//forgot password for that we gonna need some 
//add user in future 
// export const 

export const createAdmin = asyncHandler(async (req, res) => {
    //take body
    //see if admin exists if it exists then throw error
    //create admin
    //send response

    const body = req.body;

    if (!body || Object.keys(body).length === 0) {
        throw new ApiError(400, "Invalid form data")
    }

    const parseResult = createAdminSchema.safeParse(body);

    if (!parseResult.success) {
        throw new ApiError(400, parseResult.error.message[0]?.message || "Invalid form data");
    }

    const existingAdmin = await Admin.findOne({ username: parseResult.data.username });

    if (existingAdmin) {
        throw new ApiError(400, "Admin already exists");
    }

    const admin = await Admin.create(parseResult.data);

    if (!admin) {
        throw new ApiError(500, "Error while creating admin");
    }

    const result = admin.toObject();
    delete result?.password;
    delete result?.__v;
    delete result?.refreshToken;


    return res.status(201)
        .json(new ApiResponse(
            201,
            result,
            "Admin created successfully"
        ));

})