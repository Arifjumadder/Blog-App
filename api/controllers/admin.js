import { db } from "../db.js"
import { slugify } from "../utils/slugify.js"

// ---- Dashboard ----
export const getStats = (req, res) => {
  const q = `
    SELECT
      (SELECT COUNT(*) FROM users) AS userCount,
      (SELECT COUNT(*) FROM posts WHERE status = 'published') AS publishedCount,
      (SELECT COUNT(*) FROM posts WHERE status = 'draft') AS draftCount,
      (SELECT COUNT(*) FROM comments) AS commentCount,
      (SELECT COUNT(*) FROM categories) AS categoryCount,
      (SELECT COUNT(*) FROM likes) AS likeCount
  `
  db.query(q, (err, data) => {
    if (err) { console.error(err); return res.status(500).json(err) }
    return res.status(200).json(data[0])
  })
}

// ---- Users ----
export const getAllUsers = (req, res) => {
  const q = `
    SELECT id, username, email, img, role, created_at,
           (SELECT COUNT(*) FROM posts p WHERE p.uid = users.id) AS postCount
    FROM users ORDER BY created_at DESC
  `
  db.query(q, (err, data) => {
    if (err) { console.error(err); return res.status(500).json(err) }
    return res.status(200).json(data)
  })
}

export const setUserRole = (req, res) => {
  const { role } = req.body
  if (!["user", "admin"].includes(role)) return res.status(400).json("Role must be 'user' or 'admin'.")
  if (Number(req.params.id) === req.user.id) return res.status(400).json("You cannot change your own role.")

  db.query("UPDATE users SET role = ? WHERE id = ?", [role, req.params.id], (err) => {
    if (err) { console.error(err); return res.status(500).json(err) }
    return res.status(200).json("Role updated.")
  })
}

export const deleteUser = (req, res) => {
  if (Number(req.params.id) === req.user.id) return res.status(400).json("You cannot delete your own account here.")
  db.query("DELETE FROM users WHERE id = ?", [req.params.id], (err) => {
    if (err) { console.error(err); return res.status(500).json(err) }
    return res.status(200).json("User deleted.")
  })
}

// ---- Posts ----
export const getAllPosts = (req, res) => {
  const q = `
    SELECT p.id, p.title, p.slug, p.status, p.views, p.created_at,
           u.username, c.name AS catName
    FROM posts p
    JOIN users u ON u.id = p.uid
    LEFT JOIN categories c ON c.id = p.cat_id
    ORDER BY p.created_at DESC
  `
  db.query(q, (err, data) => {
    if (err) { console.error(err); return res.status(500).json(err) }
    return res.status(200).json(data)
  })
}

export const deleteAnyPost = (req, res) => {
  db.query("DELETE FROM posts WHERE id = ?", [req.params.id], (err) => {
    if (err) { console.error(err); return res.status(500).json(err) }
    return res.status(200).json("Post deleted.")
  })
}

// ---- Comments ----
export const getAllComments = (req, res) => {
  const q = `
    SELECT c.id, c.content, c.created_at, c.post_id,
           u.username, p.title AS postTitle, p.slug AS postSlug
    FROM comments c
    JOIN users u ON u.id = c.uid
    JOIN posts p ON p.id = c.post_id
    ORDER BY c.created_at DESC
    LIMIT 200
  `
  db.query(q, (err, data) => {
    if (err) { console.error(err); return res.status(500).json(err) }
    return res.status(200).json(data)
  })
}

export const deleteAnyComment = (req, res) => {
  db.query("DELETE FROM comments WHERE id = ?", [req.params.id], (err) => {
    if (err) { console.error(err); return res.status(500).json(err) }
    return res.status(200).json("Comment deleted.")
  })
}

// ---- Categories ----
export const addCategory = (req, res) => {
  const { name } = req.body
  if (!name || !name.trim()) return res.status(400).json("Category name is required.")
  const slug = slugify(name)

  db.query("INSERT INTO categories (name, slug) VALUES (?, ?)", [name.trim(), slug], (err, data) => {
    if (err) {
      console.error(err)
      if (err.code === "ER_DUP_ENTRY") return res.status(409).json("Category already exists.")
      return res.status(500).json(err)
    }
    return res.status(200).json({ id: data.insertId, name: name.trim(), slug })
  })
}

export const updateCategory = (req, res) => {
  const { name } = req.body
  if (!name || !name.trim()) return res.status(400).json("Category name is required.")
  const slug = slugify(name)

  db.query("UPDATE categories SET name = ?, slug = ? WHERE id = ?", [name.trim(), slug, req.params.id], (err) => {
    if (err) {
      console.error(err)
      if (err.code === "ER_DUP_ENTRY") return res.status(409).json("Category already exists.")
      return res.status(500).json(err)
    }
    return res.status(200).json("Category updated.")
  })
}

export const deleteCategory = (req, res) => {
  db.query("DELETE FROM categories WHERE id = ?", [req.params.id], (err) => {
    if (err) { console.error(err); return res.status(500).json(err) }
    return res.status(200).json("Category deleted.")
  })
}
