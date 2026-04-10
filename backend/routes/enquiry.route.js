import express from "express";
import { createEnquiry, deleteEnquiry, getAllEnquiry, getEnquiryById, updateEnquiry } from "../controllers/enquiryForm.controller.js";


const router = express.Router();

router.post("/", createEnquiry);


// TO-DO: add auth middleware
//protected routes 
router.get("/", getAllEnquiry);
router.get("/:id", getEnquiryById);
router.delete("/:id", deleteEnquiry);
router.patch("/", updateEnquiry);

export default router;