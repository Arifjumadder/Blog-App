import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Menu from "../components/Menu"
import Comments from "../components/Comments"
import PostActions from "../components/PostActions"
import axios from 'axios'
import moment from "moment"
import { AuthContext } from "../context/authContext"

const Single = () => {
  const [post, setPost] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const { id: postId } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useContext(AuthContext)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/api/posts/${postId}`)
        setPost(res.data)
        setNotFound(false)
      } catch (err) {
        console.log(err)
        setNotFound(true)
      }
    }
    fetchData()
  }, [postId])

  const handleDelete = async () => {
    if (!window.confirm("Delete this post? This cannot be undone.")) return
    try {
      await axios.delete(`/api/posts/${post.id}`)
      navigate("/")
    } catch (err) {
      console.log(err)
    }
  }

  const getText = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html")
    return doc.body.textContent
  }

  if (notFound) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-500">
        Post not found (it may have been removed, or is still a draft).
      </div>
    )
  }

  if (!post) {
    return <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-400">Loading…</div>
  }

  const isOwner = currentUser?.id === post.uid

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10">
      <div className="flex flex-col gap-5">
        {post.status === "draft" && (
          <span className="w-fit text-xs font-semibold uppercase tracking-wide bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
            Draft — only visible to you
          </span>
        )}

        {post.img && (
          <img src={post.img} alt={post.title} className="w-full rounded-xl object-cover max-h-[420px]" />
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={`/profile/${post.username}`}>
              {post.userImg && (
                <img src={post.userImg} alt="" className="w-10 h-10 rounded-full object-cover" />
              )}
            </Link>
            <div>
              <Link to={`/profile/${post.username}`} className="font-medium block hover:text-brand-600">
                {post.username}
              </Link>
              <p className="text-xs text-gray-400">Posted {moment(post.created_at).fromNow()}</p>
            </div>
          </div>

          {isOwner && (
            <div className="flex gap-3">
              <Link to="/write" state={post} className="text-sm text-brand-600 hover:underline">
                Edit
              </Link>
              <button onClick={handleDelete} className="text-sm text-red-500 hover:underline">
                Delete
              </button>
            </div>
          )}
        </div>

        <h1 className="text-3xl font-bold">{post.title}</h1>
        <PostActions postId={post.id} />
        <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
          {getText(post.desc)}
        </div>

        <Comments postId={post.id} />
      </div>

      <Menu catSlug={post.catSlug} excludeId={post.id} />
    </div>
  )
}

export default Single
