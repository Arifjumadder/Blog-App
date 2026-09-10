import express from "express"
import { verifyToken, verifyAdmin } from "../middleware/verifyToken.js"
import {
  getStats,
  getAllUsers,
  setUserRole,
  deleteUser,
  getAllPosts,
  deleteAnyPost,
  getAllComments,
  deleteAnyComment,
  addCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/admin.js"

const router = express.Router()

// Every admin route requires a valid token AND the "admin" role.
router.use(verifyToken, verifyAdmin)

router.get("/stats", getStats)

router.get("/users", getAllUsers)
router.patch("/users/:id/role", setUserRole)
router.delete("/users/:id", deleteUser)

router.get("/posts", getAllPosts)
router.delete("/posts/:id", deleteAnyPost)

router.get("/comments", getAllComments)
router.delete("/comments/:id", deleteAnyComment)

router.post("/categories", addCategory)
router.put("/categories/:id", updateCategory)
router.delete("/categories/:id", deleteCategory)

export default router
