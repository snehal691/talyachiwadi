import express from "express"; 
import { loginAdmin, logoutAdmin, refreshAccessToken } from "../controllers/auth.controller.js";
import { verifyJWT } from "../middleware/verifyJWT.js";


const router = express.Router();


router.post("/login", loginAdmin);


//protected 
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", verifyJWT, logoutAdmin);


export default router;
