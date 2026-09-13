import React, { useContext, useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import axios from 'axios'
import moment from 'moment'
import { AuthContext } from '../context/authContext'

const TABS = [
  { key: "stats", label: "Dashboard" },
  { key: "users", label: "Users" },
  { key: "posts", label: "Posts" },
  { key: "comments", label: "Comments" },
  { key: "categories", label: "Categories" },
]

const StatCard = ({ label, value }) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 border-l-4 border-l-brand-500 rounded-lg p-4 shadow-sm">
    <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</p>
    <p className="text-2xl font-bold mt-1">{value}</p>
  </div>
)

const AdminDashboard = () => {
  const { currentUser } = useContext(AuthContext)
  const [tab, setTab] = useState("stats")

  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [posts, setPosts] = useState([])
  const [comments, setComments] = useState([])
  const [categories, setCategories] = useState([])
  const [newCategory, setNewCategory] = useState("")
  const [editingCat, setEditingCat] = useState(null)
  const [editCatName, setEditCatName] = useState("")
  const [error, setError] = useState("")

  const loadTab = async (which) => {
    setError("")
    try {
      if (which === "stats") setStats((await axios.get("/api/admin/stats")).data)
      if (which === "users") setUsers((await axios.get("/api/admin/users")).data)
      if (which === "posts") setPosts((await axios.get("/api/admin/posts")).data)
      if (which === "comments") setComments((await axios.get("/api/admin/comments")).data)
      if (which === "categories") setCategories((await axios.get("/api/categories")).data)
    } catch (err) {
      console.error(err)
      setError("Could not load this section.")
    }
  }

  useEffect(() => {
    if (currentUser?.role === "admin") loadTab(tab)
  }, [tab, currentUser])

  if (!currentUser) return <Navigate to="/login" />
  if (currentUser.role !== "admin") {
    return <div className="max-w-3xl mx-auto px-4 py-16 text-center text-slate-500 dark:text-slate-400">Admins only.</div>
  }

  const handleRoleChange = async (id, role) => {
    try {
      await axios.patch(`/api/admin/users/${id}/role`, { role })
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)))
    } catch (err) {
      alert(err.response?.data || "Could not update role.")
    }
  }

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user and all their content?")) return
    try {
      await axios.delete(`/api/admin/users/${id}`)
      setUsers((prev) => prev.filter((u) => u.id !== id))
    } catch (err) {
      alert(err.response?.data || "Could not delete user.")
    }
  }

  const handleDeletePost = async (id) => {
    if (!window.confirm("Delete this post?")) return
    try {
      await axios.delete(`/api/admin/posts/${id}`)
      setPosts((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      alert(err.response?.data || "Could not delete post.")
    }
  }

  const handleDeleteComment = async (id) => {
    if (!window.confirm("Delete this comment?")) return
    try {
      await axios.delete(`/api/admin/comments/${id}`)
      setComments((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      alert(err.response?.data || "Could not delete comment.")
    }
  }

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return
    try {
      const res = await axios.post("/api/admin/categories", { name: newCategory.trim() })
      setCategories((prev) => [...prev, res.data])
      setNewCategory("")
    } catch (err) {
      alert(err.response?.data || "Could not add category.")
    }
  }

  const startEditCategory = (cat) => {
    setEditingCat(cat.id)
    setEditCatName(cat.name)
  }

  const saveEditCategory = async (id) => {
    try {
      await axios.put(`/api/admin/categories/${id}`, { name: editCatName })
      setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name: editCatName } : c)))
      setEditingCat(null)
    } catch (err) {
      alert(err.response?.data || "Could not update category.")
    }
  }

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Delete this category? Posts in it will become uncategorized.")) return
    try {
      await axios.delete(`/api/admin/categories/${id}`)
      setCategories((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      alert(err.response?.data || "Could not delete category.")
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      <div className="flex gap-4 border-b border-slate-100 dark:border-slate-800 mb-6 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`pb-2 text-sm font-medium whitespace-nowrap ${
              tab === t.key ? "border-b-2 border-brand-600 text-brand-600 dark:text-brand-400" : "text-slate-400 dark:text-slate-500"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {tab === "stats" && stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard label="Users" value={stats.userCount} />
          <StatCard label="Published posts" value={stats.publishedCount} />
          <StatCard label="Drafts" value={stats.draftCount} />
          <StatCard label="Comments" value={stats.commentCount} />
          <StatCard label="Categories" value={stats.categoryCount} />
          <StatCard label="Likes" value={stats.likeCount} />
        </div>
      )}

      {tab === "users" && (
        <div className="flex flex-col gap-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm p-4">
          {users.map((u) => (
            <div key={u.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="min-w-0">
                <Link to={`/profile/${u.username}`} className="font-medium hover:text-brand-600 dark:hover:text-brand-400">
                  {u.username}
                </Link>
                <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{u.email} · {u.postCount} posts · joined {moment(u.created_at).format("MMM YYYY")}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <select
                  value={u.role}
                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  disabled={u.id === currentUser.id}
                  className="text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-md px-2 py-1 disabled:opacity-50"
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
                <button
                  onClick={() => handleDeleteUser(u.id)}
                  disabled={u.id === currentUser.id}
                  className="text-sm text-red-500 hover:underline disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "posts" && (
        <div className="flex flex-col gap-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm p-4">
          {posts.map((p) => (
            <div key={p.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="min-w-0">
                <Link to={`/post/${p.slug}`} className="font-medium hover:text-brand-600 dark:hover:text-brand-400">
                  {p.title}
                </Link>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  by {p.username} · {p.catName || "Uncategorized"} · {p.status} · {p.views} views
                </p>
              </div>
              <button onClick={() => handleDeletePost(p.id)} className="text-sm text-red-500 hover:underline shrink-0 w-fit">
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "comments" && (
        <div className="flex flex-col gap-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm p-4">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-4">
              <div>
                <p className="text-sm">{c.content}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  {c.username} on{" "}
                  <Link to={`/post/${c.postSlug}`} className="hover:text-brand-600 dark:hover:text-brand-400">
                    {c.postTitle}
                  </Link>{" "}
                  · {moment(c.created_at).fromNow()}
                </p>
              </div>
              <button onClick={() => handleDeleteComment(c.id)} className="text-sm text-red-500 hover:underline shrink-0">
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "categories" && (
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New category name"
              className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-md px-3 py-1.5 text-sm outline-none focus:border-brand-400"
            />
            <button onClick={handleAddCategory} className="text-sm bg-brand-600 text-white px-4 py-1.5 rounded-md">
              Add
            </button>
          </div>

          <div className="flex flex-col gap-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm p-4">
            {categories.map((c) => (
              <div key={c.id} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                {editingCat === c.id ? (
                  <input
                    value={editCatName}
                    onChange={(e) => setEditCatName(e.target.value)}
                    className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-md px-2 py-1 text-sm"
                  />
                ) : (
                  <span className="text-sm">{c.name}</span>
                )}
                <div className="flex gap-3 text-sm">
                  {editingCat === c.id ? (
                    <button onClick={() => saveEditCategory(c.id)} className="text-brand-600 dark:text-brand-400 hover:underline">
                      Save
                    </button>
                  ) : (
                    <button onClick={() => startEditCategory(c)} className="text-brand-600 dark:text-brand-400 hover:underline">
                      Edit
                    </button>
                  )}
                  <button onClick={() => handleDeleteCategory(c.id)} className="text-red-500 hover:underline">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
