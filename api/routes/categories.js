import express from "express"
import { db } from "../db.js"

const router = express.Router()

// Basic "list all categories" endpoint so the Write page / filters
// can populate a dropdown right away. Admin create/edit/delete for
// categories is added in Phase 6.
router.get("/", (req, res) => {
  const q = "SELECT * FROM categories ORDER BY name ASC"
  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err)
    return res.status(200).json(data)
  })
})

export default router
