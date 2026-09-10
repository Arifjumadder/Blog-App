import express from "express"
import { getLikeStatus, toggleLike } from "../controllers/like.js"
import { attachUserIfPresent, verifyToken } from "../middleware/verifyToken.js"

const router = express.Router()

router.get("/:postId", attachUserIfPresent, getLikeStatus)
router.post("/:postId", verifyToken, toggleLike)

export default router
