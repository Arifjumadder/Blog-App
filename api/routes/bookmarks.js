import express from "express"
import { getBookmarkStatus, getMyBookmarks, toggleBookmark } from "../controllers/bookmark.js"
import { verifyToken } from "../middleware/verifyToken.js"

const router = express.Router()

router.get("/mine/all", verifyToken, getMyBookmarks)
router.get("/:postId", verifyToken, getBookmarkStatus)
router.post("/:postId", verifyToken, toggleBookmark)

export default router
