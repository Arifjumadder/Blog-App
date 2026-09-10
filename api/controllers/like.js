import { db } from "../db.js"

export const getLikeStatus = (req, res) => {
  const postId = req.params.postId
  const countQ = "SELECT COUNT(*) AS count FROM likes WHERE post_id = ?"

  db.query(countQ, [postId], (err, countRows) => {
    if (err) return res.status(500).json(err)
    const count = countRows[0].count

    if (!req.user) return res.status(200).json({ count, liked: false })

    db.query("SELECT id FROM likes WHERE post_id = ? AND uid = ?", [postId, req.user.id], (err, rows) => {
      if (err) return res.status(500).json(err)
      return res.status(200).json({ count, liked: rows.length > 0 })
    })
  })
}

export const toggleLike = (req, res) => {
  const postId = req.params.postId

  db.query("SELECT id FROM likes WHERE post_id = ? AND uid = ?", [postId, req.user.id], (err, rows) => {
    if (err) return res.status(500).json(err)

    if (rows.length) {
      db.query("DELETE FROM likes WHERE id = ?", [rows[0].id], (err) => {
        if (err) return res.status(500).json(err)
        return res.status(200).json({ liked: false })
      })
    } else {
      db.query("INSERT INTO likes (`post_id`,`uid`) VALUES (?,?)", [postId, req.user.id], (err) => {
        if (err) return res.status(500).json(err)
        return res.status(200).json({ liked: true })
      })
    }
  })
}
