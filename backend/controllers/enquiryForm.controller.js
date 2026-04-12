import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import z from "zod";
import { Enquiry } from "../models/enquiry.model.js";
import mongoose from "mongoose";

const enquiryFormSchema = z.object({
    fullName: z.string()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name must be at most 50 characters"),
    email: z.email(),
    mobileNumber: z.string()
        .min(10, "Phone number must be at least 10 characters")
        .max(20, "Phone number must be at most 20 characters"),
    bookingType: z
        .enum(['destinationWedding', 'birthdayCelebration', 'kittyParty', 'corporateMeetings', 'schoolTrip', 'collegeEvent', 'culturalEvent', 'other'])
        .default('other'),
    message: z.string()
        .min(2, "Message must be at least 2 characters")
        .max(1000, "Message must be at most 1000 characters"),
})

export const createEnquiry = asyncHandler(async (req, res) => {
    //get body
    //sanitise
    //validate
    //process
    //send response
    const body = req.body;

    if (!body || Object.keys(body).length === 0) {
        throw new ApiError(400, "Form Data is Invalid")
    }
    

    if (body.bookingType === "" || body.bookingType === undefined) {
        body.bookingType = "other";
    }
    const parseResult = enquiryFormSchema.safeParse(body);

    
    if (!parseResult.success) {
        throw new ApiError(400, parseResult.error.issues[0]?.message || "Invalid form data");
    }

    //save enquiryForm in database

    const response = await Enquiry.create(parseResult.data);


    if (!response) {
        throw new ApiError(500, "Error while saving enquiry form");
    }

    return res.json(new ApiResponse(200, response, "Enquiry Submitted Successfully"));

})

export const getAllEnquiry = asyncHandler(async (req, res) => {
    //get all enquiries from database
    // null check & undefined check
    // check response and all 
    // check if it is admin and all

    const { bookingType, status, page = 1, limit = 10 } = req.query;

    console.log(req.query);

    const filter = {
        isDeleted: false
    }

    if (bookingType) {
        filter.bookingType = bookingType;
    }

    if (status) {
        filter.status = status;
    }

    //aggregate pipeline 
    const aggregate = Enquiry.aggregate([
        { $match: filter }, //get this by filter
        { $sort: { createdAt: -1 } }, //ascending order
    ]);

    // console.log({aggregate});

    const options = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10
    }
    const allOptions = { ...options, ...filter };

    const result = await Enquiry.aggregatePaginate(aggregate, allOptions);

    if (!result) {
        throw new ApiError(500, "Error while fetching enquiries");
    }

    // console.log({result});

    //like if it consists params 
    // take params and filter by that 

    //newest to oldest 

    //TO-DO : pagination here
    // const enquiries = await Enquiry
    //                     .find(filter, "-isDeleted")
    //                     .sort({createdAt: -1})
    //                     .lean();

    return res.json(new ApiResponse(200, result, "Enquiries Fetched Successfully"));
})

export const getEnquiryById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, "Id is required");
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid enquiry id");
    }

    const enquiry = await Enquiry
        .findOne({ _id: id, isDeleted: false })
        .sort({ createdAt: -1 });

    if (!enquiry) {
        throw new ApiError(404, "Enquiry not found");
    }

    return res.json(new ApiResponse(200, enquiry, "Enquiry Fetched Successfully"));

})

export const deleteEnquiry = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, "Id is required");
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Inavalid enquiry id");
    }

    const deleted = await Enquiry
                                .findByIdAndUpdate(
                                    id,
                                    { isDeleted: true },
                                    { new: true },
                                )

    if (!deleted) {
        throw new ApiError(404, "Enquiry not found");
    }

    return res.json(new ApiResponse(200, deleted, "Enquiry deleted Successfully"));

})

export const updateEnquiry = asyncHandler(async (req, res) => {

    const body = req.body

    if (!body) {
        throw new ApiError(400, "Form Data is Invalid")
    }

    const id = body.id

    if (!id) {
        throw new ApiError(400, "Id is required");
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid enquiry id");
    }

    const updated = await Enquiry
                                .findOneAndUpdate(
                                    {
                                        _id: id,
                                        isDeleted: false
                                    },
                                    { status: body.status },
                                    { runValidators: true, new : true},
                                );

    if (!updated) {
        throw new ApiError(404, "Enquiry not found");
    }

    return res.json(new ApiResponse(200, updated, "Enquiry updated Successfully"));
})


