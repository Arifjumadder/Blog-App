import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import axios from "axios"
import moment from "moment"

const Home = () => {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const cat = params.get("cat")
  const search = params.get("search")

  const [posts, setPosts] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [sort, setSort] = useState("newest")
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  // Reset to page 1 whenever the category or search term changes.
  useEffect(() => {
    setPage(1)
  }, [cat, search])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const query = new URLSearchParams()
        if (cat) query.set("cat", cat)
        if (search) query.set("search", search)
        query.set("sort", sort)
        query.set("page", page)
        query.set("limit", 9)

        const res = await axios.get(`/api/posts?${query.toString()}`)
        setPosts(res.data.posts)
        setPagination(res.data.pagination)
      } catch (err) {
        console.log(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [cat, search, sort, page])

  const getText = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html")
    return doc.body.textContent
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="text-sm text-gray-500">
          {search && <>Search results for &ldquo;{search}&rdquo; · </>}
          {cat && <>Category: {cat} · </>}
          {pagination.total} post{pagination.total !== 1 ? "s" : ""}
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border border-gray-200 rounded-md px-2 py-1.5 text-sm outline-none"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="popular">Most viewed</option>
          <option value="mostliked">Most liked</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-16">Loading…</div>
      ) : !posts.length ? (
        <div className="text-center text-gray-400 py-16">No posts found.</div>
      ) : (
        <div className="flex flex-col gap-10">
          {posts.map((post) => (
            <article key={post.id} className="flex flex-col md:flex-row gap-6 border-b border-gray-100 pb-8">
              {post.img && (
                <Link to={`/post/${post.slug}`} className="md:w-64 shrink-0">
                  <img
                    src={post.img}
                    alt={post.title}
                    className="w-full h-48 md:h-full object-cover rounded-xl"
                  />
                </Link>
              )}
              <div className="flex flex-col gap-2">
                {post.catName && (
                  <Link
                    to={`/?cat=${post.catSlug}`}
                    className="text-xs font-semibold uppercase tracking-wide text-brand-600 w-fit"
                  >
                    {post.catName}
                  </Link>
                )}
                <Link to={`/post/${post.slug}`}>
                  <h1 className="text-2xl font-bold hover:text-brand-600 transition">{post.title}</h1>
                </Link>
                <p className="text-gray-500 line-clamp-3">{getText(post.desc)}</p>
                <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                  <span>{post.username}</span>
                  <span>·</span>
                  <span>{moment(post.created_at).fromNow()}</span>
                  <span>·</span>
                  <span>♥ {post.likeCount}</span>
                  <span>·</span>
                  <span>{post.commentCount} comments</span>
                </div>
                <Link
                  to={`/post/${post.slug}`}
                  className="text-sm font-medium text-brand-600 hover:underline w-fit mt-1"
                >
                  Read more →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-md disabled:opacity-40"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-500">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-md disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}

export default Home
