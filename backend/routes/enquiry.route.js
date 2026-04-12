import express from "express";
import { createEnquiry, deleteEnquiry, getAllEnquiry, getEnquiryById, updateEnquiry } from "../controllers/enquiryForm.controller.js";
import { verifyJWT } from "../middleware/verifyJWT.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

router.post("/", createEnquiry);


// TO-DO: add auth middleware
//protected routes 
router.get("/", verifyJWT, isAdmin, getAllEnquiry);
router.get("/:id",verifyJWT, isAdmin, getEnquiryById);
router.delete("/:id", verifyJWT, isAdmin, deleteEnquiry);
router.patch("/",verifyJWT, isAdmin, updateEnquiry);

export default router;