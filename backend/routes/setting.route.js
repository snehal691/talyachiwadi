import express from "express";
import { getSettings, updateSettings } from "../controllers/settings.controller.js";
import { verifyJWT } from "../middleware/verifyJWT.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

//Admin Settings Endpoints
router.get("/", verifyJWT, isAdmin, getSettings);
router.patch("/", verifyJWT, isAdmin, updateSettings);

export default router;
