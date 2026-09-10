import express from "express"
import { addComment, deleteComment, getComments } from "../controllers/comment.js"
import { verifyToken } from "../middleware/verifyToken.js"

const router = express.Router()

router.get("/:postId", getComments)
router.post("/", verifyToken, addComment)
router.delete("/:id", verifyToken, deleteComment)

export default router
