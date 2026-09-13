import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import moment from 'moment'
import { AuthContext } from '../context/authContext'

const STATUS_BADGE = {
  draft: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400",
  published: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400",
}

const Profile = () => {
  const { username } = useParams()
  const { currentUser, updateUser } = useContext(AuthContext)
  const navigate = useNavigate()

  const isOwnProfile = currentUser?.username === username

  const [profile, setProfile] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [tab, setTab] = useState("posts") // "posts" | "saved"
  const [posts, setPosts] = useState([])
  const [saved, setSaved] = useState([])
  const [editing, setEditing] = useState(false)

  // Edit form state
  const [bio, setBio] = useState("")
  const [file, setFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`/api/users/${username}`)
        setProfile(res.data)
        setBio(res.data.bio || "")
        setNotFound(false)
      } catch (err) {
        console.log(err)
        setNotFound(true)
      }
    }
    fetchProfile()
  }, [username])

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        if (isOwnProfile) {
          const res = await axios.get("/api/posts/mine")
          setPosts(res.data)
        } else {
          const res = await axios.get(`/api/posts?author=${username}&sort=newest&limit=50`)
          setPosts(res.data.posts)
        }
      } catch (err) {
        console.log(err)
      }
    }
    if (profile) fetchPosts()
  }, [profile, isOwnProfile, username])

  useEffect(() => {
    const fetchSaved = async () => {
      if (!isOwnProfile || tab !== "saved") return
      try {
        const res = await axios.get("/api/bookmarks/mine/all")
        setSaved(res.data)
      } catch (err) {
        console.log(err)
      }
    }
    fetchSaved()
  }, [isOwnProfile, tab])

  const saveProfile = async () => {
    setError("")
    setSaving(true)
    try {
      let img = profile.img
      if (file) {
        const formData = new FormData()
        formData.append("file", file)
        const res = await axios.post("/api/upload", formData)
        img = res.data
      }

      const res = await axios.put("/api/users/me", { bio, img })
      setProfile((p) => ({ ...p, bio: res.data.bio, img: res.data.img }))
      updateUser({ bio: res.data.bio, img: res.data.img })
      setEditing(false)
      setFile(null)
    } catch (err) {
      console.error(err)
      const data = err.response?.data
      setError(typeof data === "string" ? data : "Could not save your profile.")
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Delete this post?")) return
    try {
      await axios.delete(`/api/posts/${postId}`)
      setPosts((prev) => prev.filter((p) => p.id !== postId))
    } catch (err) {
      console.log(err)
    }
  }

  if (notFound) {
    return <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500 dark:text-slate-400">User not found.</div>
  }
  if (!profile) {
    return <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400 dark:text-slate-500">Loading…</div>
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm p-6">
        {profile.img ? (
          <img
            src={profile.img}
            alt={profile.username}
            className="w-20 h-20 rounded-full object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 flex items-center justify-center text-2xl font-semibold shrink-0">
            {profile.username[0].toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <h1 className="text-2xl font-bold">{profile.username}</h1>
            {profile.role === "admin" && (
              <span className="text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded-full">Admin</span>
            )}
          </div>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
            Joined {moment(profile.created_at).format("MMMM YYYY")} · {profile.postCount} posts
          </p>

          {!editing && (
            <p className="text-slate-600 dark:text-slate-300 mt-2 whitespace-pre-line">{profile.bio || "No bio yet."}</p>
          )}

          {isOwnProfile && !editing && (
            <button
              onClick={() => setEditing(true)}
              className="mt-3 text-sm border border-slate-300 dark:border-slate-600 rounded-md px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-900"
            >
              Edit profile
            </button>
          )}

          {isOwnProfile && editing && (
            <div className="mt-3 flex flex-col gap-2 max-w-md">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write something about yourself..."
                rows={3}
                className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-md px-3 py-2 text-sm outline-none focus:border-brand-400"
              />
              <input type="file" onChange={(e) => setFile(e.target.files[0])} className="text-sm" />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex gap-2">
                <button
                  disabled={saving}
                  onClick={saveProfile}
                  className="text-sm bg-brand-600 text-white px-4 py-1.5 rounded-md disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={() => { setEditing(false); setBio(profile.bio || ""); setFile(null) }}
                  className="text-sm border border-slate-300 dark:border-slate-600 px-4 py-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isOwnProfile && (
        <div className="flex gap-4 border-b border-slate-100 dark:border-slate-800 mt-4">
          <button
            onClick={() => setTab("posts")}
            className={`pb-2 text-sm font-medium ${tab === "posts" ? "border-b-2 border-brand-600 text-brand-600 dark:text-brand-400" : "text-slate-400 dark:text-slate-500"}`}
          >
            My Posts
          </button>
          <button
            onClick={() => setTab("saved")}
            className={`pb-2 text-sm font-medium ${tab === "saved" ? "border-b-2 border-brand-600 text-brand-600 dark:text-brand-400" : "text-slate-400 dark:text-slate-500"}`}
          >
            Saved
          </button>
        </div>
      )}

      {(!isOwnProfile || tab === "posts") && (
        <div className="flex flex-col gap-3 mt-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm p-4">
          {!posts.length && <p className="text-slate-400 dark:text-slate-500 text-center py-8">No posts yet.</p>}
          {posts.map((post) => (
            <div key={post.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-slate-800 last:border-0 pb-3 last:pb-0">
              <div className="flex items-center gap-3 min-w-0">
                {isOwnProfile && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_BADGE[post.status]}`}>
                    {post.status}
                  </span>
                )}
                <Link to={`/post/${post.slug}`} className="font-medium hover:text-brand-600 dark:hover:text-brand-400 transition truncate">
                  {post.title}
                </Link>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400 dark:text-slate-500 shrink-0">
                <span>{moment(post.created_at).fromNow()}</span>
                {isOwnProfile && (
                  <>
                    <Link to="/write" state={post} className="text-brand-600 dark:text-brand-400 hover:underline">
                      Edit
                    </Link>
                    <button onClick={() => handleDeletePost(post.id)} className="text-red-500 hover:underline">
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isOwnProfile && tab === "saved" && (
        <div className="flex flex-col gap-3 mt-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm p-4">
          {!saved.length && <p className="text-slate-400 dark:text-slate-500 text-center py-8">No saved posts yet.</p>}
          {saved.map((post) => (
            <div key={post.id} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 last:border-0 pb-3 last:pb-0">
              <Link to={`/post/${post.slug}`} className="font-medium hover:text-brand-600 dark:hover:text-brand-400 transition">
                {post.title}
              </Link>
              <span className="text-sm text-slate-400 dark:text-slate-500">by {post.username}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Profile
