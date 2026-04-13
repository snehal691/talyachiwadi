import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Package } from "../models/package.model.js";
import z from "zod";

const createPackageSchema = z.object({
    name: z.string().trim().min(2).max(80),
    slug: z.string().trim().min(2).max(100).toLowerCase(),
    category: z.enum(["tent", "room", "other"]),
    baseRatePerNight: z.coerce.number().int().min(0),
    maxGuests: z.coerce.number().int().min(1),
    totalUnits: z.coerce.number().int().min(1),
    isActive: z.coerce.boolean().optional().default(true),
    description: z.string().trim().min(2).max(1000).optional().default("")
})



export const getPackagesCategory = asyncHandler(async (req, res) => {

    //get data from db
    // validate data 
    // return it to fe
    const packages = await Package.find(
        { isActive: true },
        { name: 1, slug: 1, category: 1 }
    )
        .sort({ name: 1 })
        .lean();

    if (!packages || packages.length === 0) {
        throw new ApiError(404, "Packages not found");
    }

    return res.json(new ApiResponse(200, packages, "Packages fetched successfully"));

})


export const getPackageById = asyncHandler(async (req, res) => {

    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid package id");
    }

    const pkg = await Package
        .findOne(
            { _id: id, isActive: true },
            { name: 1, slug: 1, category: 1, baseRatePerNight: 1, maxGuests: 1 }
        ).lean();

    if (!pkg) {
        throw new ApiError(404, "Package not found");
    }

    return res.json(new ApiResponse(200, pkg, "Package fetched successfully"));

})

export const createPackage = asyncHandler(async (req, res) => {
    const body = req.body || {};

    if (!body || Object.keys(body).length === 0) {
        throw new ApiError(400, "Empty Body")
    }

    const parsedResult = createPackageSchema.safeParse(body);

    if (!parsedResult.success) {
        throw new ApiError(400, parsedResult.error.issues[0]?.message || "Invalid form data");
    }
    const payload = parsedResult.data;

    const existingPackage = await Package.findOne({ slug: payload.slug });

    if (existingPackage) {
        throw new ApiError(400, "Package slug already exists");
    }

    const pkg = await Package.create(parsedResult.data);

    if (!pkg) {
        throw new ApiError(500, "Error while creating package");
    }

    return res.json(new ApiResponse(200, pkg, "Package created successfully"));
})

export const updatePackage = asyncHandler(async (req, res) => {


});

export const getAllPackagesAdmin = asyncHandler(async (req, res) => {
    const { isActive } = req.query;

    if (isActive !== undefined && isActive !== "true" && isActive !== "false") {
        throw new ApiError(400, "Invalid isActive value");
    }

    const filter = {};

    if (typeof isActive === "string") {
        filter.isActive = isActive === "true" ? true : false;
    }

    const packages = await Package.find(filter).sort({ createdAt: -1 }).lean();

    if (!packages || packages.length === 0) {
        throw new ApiError(404, "Packages not found");
    }

    return res.json(new ApiResponse(200, packages, "Packages fetched successfully"));

})