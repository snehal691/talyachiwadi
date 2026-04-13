import express, {Router} from "express";
import { getPackages } from "../controllers/package.controller.js";
const router = Router();

router.get("/packages", getPackages);

export default router;