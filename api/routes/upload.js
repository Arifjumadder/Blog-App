import express from "express"
import multer from "multer"
import cloudinary from "../config/cloudinary.js"
import { verifyToken } from "../middleware/verifyToken.js"

const router = express.Router()

// Keep the file in memory only (never touches the server's disk) — this
// works the same way whether the server runs on a normal host, Render,
// or a serverless platform with no persistent filesystem.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
})

router.post("/", verifyToken, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json("No file uploaded")

  const stream = cloudinary.uploader.upload_stream(
    { folder: "blog-app", resource_type: "image" },
    (error, result) => {
      if (error) {
        console.error(error)
        return res.status(500).json("Image upload failed.")
      }
      // Store/return the full Cloudinary URL — the frontend uses it as-is.
      return res.status(200).json(result.secure_url)
    }
  )
  stream.end(req.file.buffer)
})

export default router
