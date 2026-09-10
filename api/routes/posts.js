import express from "express"
import {
  addPost,
  deletePost,
  getMyPosts,
  getPost,
  getPosts,
  setPostStatus,
  updatePost,
} from "../controllers/post.js"
import { attachUserIfPresent, verifyToken } from "../middleware/verifyToken.js"

const router = express.Router()

router.get("/", getPosts)
router.get("/mine", verifyToken, getMyPosts)
router.get("/:id", attachUserIfPresent, getPost)
router.post("/", verifyToken, addPost)
router.put("/:id", verifyToken, updatePost)
router.delete("/:id", verifyToken, deletePost)
router.patch("/:id/status", verifyToken, setPostStatus)

export default router
