import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import moment from 'moment'
import { AuthContext } from '../context/authContext'

const CommentItem = ({ comment, childrenMap, postId, currentUser, onReplyAdded, onDeleted, depth = 0 }) => {
  const [replying, setReplying] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const kids = childrenMap[comment.id] || []
  const isOwner = currentUser?.id === comment.uid

  const submitReply = async () => {
    if (!replyText.trim()) return
    setSubmitting(true)
    try {
      const res = await axios.post("/api/comments", {
        postId,
        content: replyText,
        parentId: comment.id,
      })
      onReplyAdded({
        id: res.data.id,
        post_id: postId,
        uid: currentUser.id,
        parent_id: comment.id,
        content: replyText,
        created_at: new Date().toISOString(),
        username: currentUser.username,
        userImg: currentUser.img,
      })
      setReplyText("")
      setReplying(false)
    } catch (err) {
      console.log(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm("Delete this comment?")) return
    try {
      await axios.delete(`/api/comments/${comment.id}`)
      onDeleted(comment.id)
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <div className={depth > 0 ? "ml-8 mt-3" : "mt-4"}>
      <div className="flex gap-3">
        {comment.userImg ? (
          <img src={comment.userImg} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{comment.username}</span>
            <span className="text-xs text-gray-400">{moment(comment.created_at).fromNow()}</span>
          </div>
          <p className="text-sm text-gray-700 mt-0.5">{comment.content}</p>
          <div className="flex gap-3 mt-1">
            {currentUser && (
              <button onClick={() => setReplying(!replying)} className="text-xs text-brand-600 hover:underline">
                Reply
              </button>
            )}
            {isOwner && (
              <button onClick={handleDelete} className="text-xs text-red-500 hover:underline">
                Delete
              </button>
            )}
          </div>

          {replying && (
            <div className="flex gap-2 mt-2">
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${comment.username}...`}
                className="flex-1 border border-gray-200 rounded-md px-3 py-1.5 text-sm outline-none focus:border-brand-400"
              />
              <button
                disabled={submitting}
                onClick={submitReply}
                className="text-sm bg-brand-600 text-white px-3 py-1.5 rounded-md disabled:opacity-50"
              >
                Post
              </button>
            </div>
          )}
        </div>
      </div>

      {kids.map((child) => (
        <CommentItem
          key={child.id}
          comment={child}
          childrenMap={childrenMap}
          postId={postId}
          currentUser={currentUser}
          onReplyAdded={onReplyAdded}
          onDeleted={onDeleted}
          depth={depth + 1}
        />
      ))}
    </div>
  )
}

const Comments = ({ postId }) => {
  const [comments, setComments] = useState([])
  const [text, setText] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const { currentUser } = useContext(AuthContext)

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(`/api/comments/${postId}`)
        setComments(res.data)
      } catch (err) {
        console.log(err)
      }
    }
    fetchComments()
  }, [postId])

  // Group the flat list into { parentId: [replies] } for easy recursive rendering.
  const childrenMap = {}
  const topLevel = []
  comments.forEach((c) => {
    if (c.parent_id) {
      if (!childrenMap[c.parent_id]) childrenMap[c.parent_id] = []
      childrenMap[c.parent_id].push(c)
    } else {
      topLevel.push(c)
    }
  })

  const handleAdd = async () => {
    if (!text.trim()) return
    setSubmitting(true)
    try {
      const res = await axios.post("/api/comments", { postId, content: text })
      setComments((prev) => [
        ...prev,
        {
          id: res.data.id,
          post_id: postId,
          uid: currentUser.id,
          parent_id: null,
          content: text,
          created_at: new Date().toISOString(),
          username: currentUser.username,
          userImg: currentUser.img,
        },
      ])
      setText("")
    } catch (err) {
      console.log(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReplyAdded = (newComment) => {
    setComments((prev) => [...prev, newComment])
  }

  const handleDeleted = (id) => {
    // Remove the comment along with any of its descendants.
    setComments((prev) => {
      const toRemove = new Set([id])
      let changed = true
      while (changed) {
        changed = false
        prev.forEach((c) => {
          if (c.parent_id && toRemove.has(c.parent_id) && !toRemove.has(c.id)) {
            toRemove.add(c.id)
            changed = true
          }
        })
      }
      return prev.filter((c) => !toRemove.has(c.id))
    })
  }

  return (
    <div className="mt-10 border-t border-gray-100 pt-6">
      <h2 className="font-semibold text-lg mb-3">Comments ({comments.length})</h2>

      {currentUser ? (
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-brand-400"
          />
          <button
            disabled={submitting}
            onClick={handleAdd}
            className="text-sm bg-brand-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            Post
          </button>
        </div>
      ) : (
        <p className="text-sm text-gray-400">Log in to leave a comment.</p>
      )}

      <div>
        {topLevel.map((c) => (
          <CommentItem
            key={c.id}
            comment={c}
            childrenMap={childrenMap}
            postId={postId}
            currentUser={currentUser}
            onReplyAdded={handleReplyAdded}
            onDeleted={handleDeleted}
          />
        ))}
      </div>
    </div>
  )
}

export default Comments
