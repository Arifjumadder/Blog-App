import { db } from "../db.js"
import { slugify } from "../utils/slugify.js"

// Generates a slug from the title, appending "-2", "-3", etc. if that
// slug is already taken by another post.
const makeUniqueSlug = (title, callback) => {
  const base = slugify(title) || "post"
  const q = "SELECT slug FROM posts WHERE slug = ? OR slug LIKE ?"
  db.query(q, [base, `${base}-%`], (err, rows) => {
    if (err) return callback(err)
    if (rows.length === 0) return callback(null, base)

    const taken = new Set(rows.map((r) => r.slug))
    if (!taken.has(base)) return callback(null, base)

    let i = 2
    while (taken.has(`${base}-${i}`)) i++
    callback(null, `${base}-${i}`)
  })
}

const POST_SELECT = `
  SELECT p.id, p.title, p.slug, p.\`desc\`, p.img, p.status, p.views, p.uid,
         p.created_at, p.updated_at,
         u.username, u.img AS userImg,
         c.id AS catId, c.name AS catName, c.slug AS catSlug,
         (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS likeCount,
         (SELECT COUNT(*) FROM comments cm WHERE cm.post_id = p.id) AS commentCount
  FROM posts p
  JOIN users u ON u.id = p.uid
  LEFT JOIN categories c ON c.id = p.cat_id
`

// GET /api/posts  (public feed — published posts only)
// Supports: ?cat=slug  ?search=text  ?sort=newest|oldest|popular|mostliked  ?page=1  ?limit=9
export const getPosts = (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 9))
  const offset = (page - 1) * limit

  const where = ["p.status = 'published'"]
  const values = []

  if (req.query.cat) {
    where.push("c.slug = ?")
    values.push(req.query.cat)
  }

  if (req.query.author) {
    where.push("u.username = ?")
    values.push(req.query.author)
  }

  const search = req.query.search?.trim()
  if (search) {
    where.push("MATCH(p.title, p.`desc`) AGAINST (? IN NATURAL LANGUAGE MODE)")
    values.push(search)
  }

  const whereClause = "WHERE " + where.join(" AND ")

  let orderBy
  switch (req.query.sort) {
    case "oldest":
      orderBy = "p.created_at ASC"
      break
    case "popular":
      orderBy = "p.views DESC"
      break
    case "mostliked":
      orderBy = "likeCount DESC"
      break
    default:
      orderBy = "p.created_at DESC"
  }

  const countQ = `SELECT COUNT(*) AS total FROM posts p JOIN users u ON u.id = p.uid LEFT JOIN categories c ON c.id = p.cat_id ${whereClause}`

  db.query(countQ, values, (err, countRows) => {
    if (err) { console.error(err); return res.status(500).json(err) }
    const total = countRows[0].total

    const dataQ = `${POST_SELECT} ${whereClause} ORDER BY ${orderBy} LIMIT ? OFFSET ?`
    db.query(dataQ, [...values, limit, offset], (err, data) => {
      if (err) { console.error(err); return res.status(500).json(err) }
      return res.status(200).json({
        posts: data,
        pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
      })
    })
  })
}

// GET /api/posts/mine  (the logged-in user's own posts, any status)
export const getMyPosts = (req, res) => {
  const q = POST_SELECT + " WHERE p.uid = ? ORDER BY p.updated_at DESC"
  db.query(q, [req.user.id], (err, data) => {
    if (err) { console.error(err); return res.status(500).json(err) }
    return res.status(200).json(data)
  })
}

// GET /api/posts/:id  (accepts a numeric id OR a slug)
export const getPost = (req, res) => {
  const idOrSlug = req.params.id
  const q = POST_SELECT + " WHERE p.id = ? OR p.slug = ?"

  db.query(q, [idOrSlug, idOrSlug], (err, data) => {
    if (err) { console.error(err); return res.status(500).json(err) }
    if (!data.length) return res.status(404).json("Post not found!")

    const post = data[0]

    if (post.status === "draft") {
      const isOwner = req.user && req.user.id === post.uid
      const isAdmin = req.user && req.user.role === "admin"
      if (!isOwner && !isAdmin) return res.status(404).json("Post not found!")
    } else {
      db.query("UPDATE posts SET views = views + 1 WHERE id = ?", [post.id])
    }

    return res.status(200).json(post)
  })
}

// POST /api/posts  (requires login; defaults to draft unless status: "published")
export const addPost = (req, res) => {
  if (!req.body.title || !req.body.desc) {
    return res.status(400).json("Title and content are required.")
  }

  makeUniqueSlug(req.body.title, (err, slug) => {
    if (err) { console.error(err); return res.status(500).json(err) }

    const status = req.body.status === "published" ? "published" : "draft"

    const q = `
      INSERT INTO posts (\`uid\`, \`cat_id\`, \`title\`, \`slug\`, \`desc\`, \`img\`, \`status\`)
      VALUES (?)
    `
    const values = [
      req.user.id,
      req.body.catId || null,
      req.body.title,
      slug,
      req.body.desc,
      req.body.img || null,
      status,
    ]

    db.query(q, [values], (err, data) => {
      if (err) { console.error(err); return res.status(500).json(err) }
      return res.status(200).json({ message: "Post has been created.", id: data.insertId, slug })
    })
  })
}

// PUT /api/posts/:id  (owner or admin only)
export const updatePost = (req, res) => {
  const postId = req.params.id

  db.query("SELECT uid, title FROM posts WHERE id = ?", [postId], (err, rows) => {
    if (err) { console.error(err); return res.status(500).json(err) }
    if (!rows.length) return res.status(404).json("Post not found!")

    const isOwner = rows[0].uid === req.user.id
    const isAdmin = req.user.role === "admin"
    if (!isOwner && !isAdmin) return res.status(403).json("You can only edit your own posts!")

    const applyUpdate = (slug) => {
      const fields = ["title = ?", "`desc` = ?", "img = ?", "cat_id = ?"]
      const values = [req.body.title, req.body.desc, req.body.img || null, req.body.catId || null]

      if (slug) {
        fields.push("slug = ?")
        values.push(slug)
      }
      if (req.body.status === "published" || req.body.status === "draft") {
        fields.push("status = ?")
        values.push(req.body.status)
      }

      const q = `UPDATE posts SET ${fields.join(", ")} WHERE id = ?`
      db.query(q, [...values, postId], (err) => {
        if (err) { console.error(err); return res.status(500).json(err) }
        return res.status(200).json("Post has been updated.")
      })
    }

    if (req.body.title && req.body.title !== rows[0].title) {
      makeUniqueSlug(req.body.title, (err, slug) => {
        if (err) { console.error(err); return res.status(500).json(err) }
        applyUpdate(slug)
      })
    } else {
      applyUpdate(null)
    }
  })
}

// DELETE /api/posts/:id  (owner or admin only)
export const deletePost = (req, res) => {
  const postId = req.params.id

  db.query("SELECT uid FROM posts WHERE id = ?", [postId], (err, rows) => {
    if (err) { console.error(err); return res.status(500).json(err) }
    if (!rows.length) return res.status(404).json("Post not found!")

    const isOwner = rows[0].uid === req.user.id
    const isAdmin = req.user.role === "admin"
    if (!isOwner && !isAdmin) return res.status(403).json("You can only delete your own posts!")

    db.query("DELETE FROM posts WHERE id = ?", [postId], (err) => {
      if (err) { console.error(err); return res.status(500).json(err) }
      return res.status(200).json("Post has been deleted!")
    })
  })
}

// PATCH /api/posts/:id/status  — dedicated Draft <-> Published toggle
export const setPostStatus = (req, res) => {
  const postId = req.params.id
  const status = req.body.status

  if (!["draft", "published"].includes(status)) {
    return res.status(400).json("Status must be 'draft' or 'published'.")
  }

  db.query("SELECT uid FROM posts WHERE id = ?", [postId], (err, rows) => {
    if (err) { console.error(err); return res.status(500).json(err) }
    if (!rows.length) return res.status(404).json("Post not found!")

    const isOwner = rows[0].uid === req.user.id
    const isAdmin = req.user.role === "admin"
    if (!isOwner && !isAdmin) return res.status(403).json("You can only publish/unpublish your own posts!")

    db.query("UPDATE posts SET status = ? WHERE id = ?", [status, postId], (err) => {
      if (err) { console.error(err); return res.status(500).json(err) }
      return res.status(200).json(`Post is now ${status}.`)
    })
  })
}
