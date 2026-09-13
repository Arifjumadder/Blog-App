import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { AuthContext } from '../context/authContext'

const PostActions = ({ postId }) => {
  const { currentUser } = useContext(AuthContext)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [bookmarked, setBookmarked] = useState(false)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const likeRes = await axios.get(`/api/likes/${postId}`)
        setLiked(likeRes.data.liked)
        setLikeCount(likeRes.data.count)

        if (currentUser) {
          const bmRes = await axios.get(`/api/bookmarks/${postId}`)
          setBookmarked(bmRes.data.bookmarked)
        }
      } catch (err) {
        console.log(err)
      }
    }
    fetchStatus()
  }, [postId, currentUser])

  const toggleLike = async () => {
    if (!currentUser) return
    try {
      const res = await axios.post(`/api/likes/${postId}`)
      setLiked(res.data.liked)
      setLikeCount((c) => (res.data.liked ? c + 1 : c - 1))
    } catch (err) {
      console.log(err)
    }
  }

  const toggleBookmark = async () => {
    if (!currentUser) return
    try {
      const res = await axios.post(`/api/bookmarks/${postId}`)
      setBookmarked(res.data.bookmarked)
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={toggleLike}
        disabled={!currentUser}
        title={currentUser ? "" : "Log in to like"}
        className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition disabled:opacity-50 disabled:cursor-not-allowed ${
          liked ? "bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-800 text-red-600 dark:text-red-400" : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
        }`}
      >
        <span>{liked ? "♥" : "♡"}</span> {likeCount}
      </button>

      <button
        onClick={toggleBookmark}
        disabled={!currentUser}
        title={currentUser ? "" : "Log in to bookmark"}
        className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition disabled:opacity-50 disabled:cursor-not-allowed ${
          bookmarked ? "bg-brand-50 dark:bg-brand-950 border-brand-300 dark:border-brand-800 text-brand-600 dark:text-brand-400" : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
        }`}
      >
        {bookmarked ? "🔖 Saved" : "🔖 Save"}
      </button>
    </div>
  )
}

export default PostActions
