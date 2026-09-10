import { db } from "../db.js"

export const getBookmarkStatus = (req, res) => {
  if (!req.user) return res.status(200).json({ bookmarked: false })

  db.query(
    "SELECT id FROM bookmarks WHERE post_id = ? AND uid = ?",
    [req.params.postId, req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json(err)
      return res.status(200).json({ bookmarked: rows.length > 0 })
    }
  )
}

export const toggleBookmark = (req, res) => {
  const postId = req.params.postId

  db.query("SELECT id FROM bookmarks WHERE post_id = ? AND uid = ?", [postId, req.user.id], (err, rows) => {
    if (err) return res.status(500).json(err)

    if (rows.length) {
      db.query("DELETE FROM bookmarks WHERE id = ?", [rows[0].id], (err) => {
        if (err) return res.status(500).json(err)
        return res.status(200).json({ bookmarked: false })
      })
    } else {
      db.query("INSERT INTO bookmarks (`post_id`,`uid`) VALUES (?,?)", [postId, req.user.id], (err) => {
        if (err) return res.status(500).json(err)
        return res.status(200).json({ bookmarked: true })
      })
    }
  })
}

// Used by the Profile page (Phase 5) to show "Saved posts".
export const getMyBookmarks = (req, res) => {
  const q = `
    SELECT p.id, p.title, p.slug, p.img, p.created_at, u.username
    FROM bookmarks b
    JOIN posts p ON p.id = b.post_id
    JOIN users u ON u.id = p.uid
    WHERE b.uid = ?
    ORDER BY b.created_at DESC
  `
  db.query(q, [req.user.id], (err, data) => {
    if (err) return res.status(500).json(err)
    return res.status(200).json(data)
  })
}
