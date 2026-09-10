import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"

import authRoutes from "./routes/auth.js"
import userRoutes from "./routes/users.js"
import postRoutes from "./routes/posts.js"
import commentRoutes from "./routes/comments.js"
import categoryRoutes from "./routes/categories.js"
import likeRoutes from "./routes/likes.js"
import bookmarkRoutes from "./routes/bookmarks.js"
import adminRoutes from "./routes/admin.js"
import uploadRoutes from "./routes/upload.js"

dotenv.config()

const app = express()

app.use(express.json())
app.use(cookieParser())

app.use("/api/upload", uploadRoutes)

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/comments", commentRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/likes", likeRoutes)
app.use("/api/bookmarks", bookmarkRoutes)
app.use("/api/admin", adminRoutes)

// Catches errors thrown in route handlers (e.g. multer failing to write a
// file) so the client always gets a JSON response instead of a hung
// connection, and so the real error is visible in this terminal.
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json(err.message || "Something went wrong on the server.")
})

const PORT = process.env.PORT || 8800
app.listen(PORT, () => {
  console.log(`Connected! Server running on port ${PORT}`)
})
