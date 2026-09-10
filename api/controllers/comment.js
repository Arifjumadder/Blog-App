import { db } from "../db.js"

// Returns a flat list of comments for a post; the frontend groups them
// into a reply tree using parent_id.
export const getComments = (req, res) => {
  const q = `
    SELECT c.id, c.post_id, c.uid, c.parent_id, c.content, c.created_at,
           u.username, u.img AS userImg
    FROM comments c
    JOIN users u ON u.id = c.uid
    WHERE c.post_id = ?
    ORDER BY c.created_at ASC
  `
  db.query(q, [req.params.postId], (err, data) => {
    if (err) return res.status(500).json(err)
    return res.status(200).json(data)
  })
}

export const addComment = (req, res) => {
  const { postId, content, parentId } = req.body
  if (!postId || !content || !content.trim()) {
    return res.status(400).json("postId and content are required.")
  }

  const insertComment = () => {
    const q = "INSERT INTO comments (`post_id`,`uid`,`parent_id`,`content`) VALUES (?)"
    const values = [postId, req.user.id, parentId || null, content]
    db.query(q, [values], (err, data) => {
      if (err) return res.status(500).json(err)
      return res.status(200).json({ message: "Comment added.", id: data.insertId })
    })
  }

  if (parentId) {
    // A reply must point at a comment that actually belongs to this post.
    db.query("SELECT post_id FROM comments WHERE id = ?", [parentId], (err, rows) => {
      if (err) return res.status(500).json(err)
      if (!rows.length || rows[0].post_id !== Number(postId)) {
        return res.status(400).json("Invalid parent comment.")
      }
      insertComment()
    })
  } else {
    insertComment()
  }
}

export const deleteComment = (req, res) => {
  const commentId = req.params.id
  db.query("SELECT uid FROM comments WHERE id = ?", [commentId], (err, rows) => {
    if (err) return res.status(500).json(err)
    if (!rows.length) return res.status(404).json("Comment not found!")

    const isOwner = rows[0].uid === req.user.id
    const isAdmin = req.user.role === "admin"
    if (!isOwner && !isAdmin) return res.status(403).json("You can only delete your own comments!")

    // ON DELETE CASCADE on comments.parent_id takes care of deleting replies too.
    db.query("DELETE FROM comments WHERE id = ?", [commentId], (err) => {
      if (err) return res.status(500).json(err)
      return res.status(200).json("Comment deleted.")
    })
  })
}
