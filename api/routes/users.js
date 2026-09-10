import express from "express"
import { getUserProfile, updateProfile } from "../controllers/user.js"
import { verifyToken } from "../middleware/verifyToken.js"

const router = express.Router()

router.put("/me", verifyToken, updateProfile)
router.get("/:username", getUserProfile)

export default router
