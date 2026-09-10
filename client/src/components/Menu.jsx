import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const Menu = ({ catSlug, excludeId }) => {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    if (!catSlug) {
      setPosts([])
      return
    }
    const fetchData = async () => {
      try {
        const res = await axios.get(`/api/posts?cat=${catSlug}`)
        setPosts(res.data.posts.filter((p) => p.id !== excludeId).slice(0, 4))
      } catch (err) {
        console.log(err)
      }
    }
    fetchData()
  }, [catSlug, excludeId])

  if (!posts.length) return null

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-semibold text-lg">Related posts</h2>
      {posts.map((post) => (
        <Link
          to={`/post/${post.slug}`}
          key={post.id}
          className="flex gap-3 items-start hover:opacity-80 transition"
        >
          {post.img && (
            <img src={post.img} alt="" className="w-16 h-16 object-cover rounded-md shrink-0" />
          )}
          <h3 className="text-sm font-medium leading-snug">{post.title}</h3>
        </Link>
      ))}
    </div>
  )
}

export default Menu
