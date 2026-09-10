import { db } from "../db.js"
import bcrypt from "bcryptjs"

// GET /api/users/:username  (public profile)
export const getUserProfile = (req, res) => {
  const q = `
    SELECT id, username, img, bio, role, created_at,
           (SELECT COUNT(*) FROM posts p WHERE p.uid = users.id AND p.status = 'published') AS postCount
    FROM users WHERE username = ?
  `
  db.query(q, [req.params.username], (err, data) => {
    if (err) { console.error(err); return res.status(500).json(err) }
    if (!data.length) return res.status(404).json("User not found!")
    return res.status(200).json(data[0])
  })
}

// PUT /api/users/me  (the logged-in user updates their own profile)
export const updateProfile = (req, res) => {
  const { username, email, bio, img, password } = req.body
  const userId = req.user.id

  const applyUpdate = () => {
    const fields = []
    const values = []

    if (username) { fields.push("username = ?"); values.push(username) }
    if (email) { fields.push("email = ?"); values.push(email) }
    if (bio !== undefined) { fields.push("bio = ?"); values.push(bio) }
    if (img !== undefined) { fields.push("img = ?"); values.push(img) }
    if (password) {
      const salt = bcrypt.genSaltSync(10)
      fields.push("password = ?")
      values.push(bcrypt.hashSync(password, salt))
    }

    if (!fields.length) return res.status(400).json("Nothing to update.")

    const q = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`
    db.query(q, [...values, userId], (err) => {
      if (err) { console.error(err); return res.status(500).json(err) }

      db.query(
        "SELECT id, username, email, img, bio, role, created_at FROM users WHERE id = ?",
        [userId],
        (err, rows) => {
          if (err) { console.error(err); return res.status(500).json(err) }
          return res.status(200).json(rows[0])
        }
      )
    })
  }

  if (username || email) {
    const q = "SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?"
    db.query(q, [username || "", email || "", userId], (err, rows) => {
      if (err) { console.error(err); return res.status(500).json(err) }
      if (rows.length) return res.status(409).json("Username or email is already taken.")
      applyUpdate()
    })
  } else {
    applyUpdate()
  }
}
