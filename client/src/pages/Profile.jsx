import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import moment from 'moment'
import { AuthContext } from '../context/authContext'

const STATUS_BADGE = {
  draft: "bg-amber-100 text-amber-700",
  published: "bg-emerald-100 text-emerald-700",
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
    return <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-500">User not found.</div>
  }
  if (!profile) {
    return <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-400">Loading…</div>
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-start gap-5 border-b border-gray-100 pb-6">
        {profile.img ? (
          <img
            src={profile.img}
            alt={profile.username}
            className="w-20 h-20 rounded-full object-cover bg-gray-100"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-2xl font-semibold shrink-0">
            {profile.username[0].toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{profile.username}</h1>
            {profile.role === "admin" && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Admin</span>
            )}
          </div>
          <p className="text-sm text-gray-400 mt-0.5">
            Joined {moment(profile.created_at).format("MMMM YYYY")} · {profile.postCount} posts
          </p>

          {!editing && (
            <p className="text-gray-600 mt-2 whitespace-pre-line">{profile.bio || "No bio yet."}</p>
          )}

          {isOwnProfile && !editing && (
            <button
              onClick={() => setEditing(true)}
              className="mt-3 text-sm border border-gray-300 rounded-md px-3 py-1.5 hover:bg-gray-50"
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
                className="border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-brand-400"
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
                  className="text-sm border border-gray-300 px-4 py-1.5 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isOwnProfile && (
        <div className="flex gap-4 border-b border-gray-100 mt-4">
          <button
            onClick={() => setTab("posts")}
            className={`pb-2 text-sm font-medium ${tab === "posts" ? "border-b-2 border-brand-600 text-brand-600" : "text-gray-400"}`}
          >
            My Posts
          </button>
          <button
            onClick={() => setTab("saved")}
            className={`pb-2 text-sm font-medium ${tab === "saved" ? "border-b-2 border-brand-600 text-brand-600" : "text-gray-400"}`}
          >
            Saved
          </button>
        </div>
      )}

      {(!isOwnProfile || tab === "posts") && (
        <div className="flex flex-col gap-4 mt-6">
          {!posts.length && <p className="text-gray-400 text-center py-8">No posts yet.</p>}
          {posts.map((post) => (
            <div key={post.id} className="flex items-center justify-between border-b border-gray-50 pb-4">
              <div className="flex items-center gap-3">
                {isOwnProfile && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[post.status]}`}>
                    {post.status}
                  </span>
                )}
                <Link to={`/post/${post.slug}`} className="font-medium hover:text-brand-600 transition">
                  {post.title}
                </Link>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <span>{moment(post.created_at).fromNow()}</span>
                {isOwnProfile && (
                  <>
                    <Link to="/write" state={post} className="text-brand-600 hover:underline">
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
        <div className="flex flex-col gap-4 mt-6">
          {!saved.length && <p className="text-gray-400 text-center py-8">No saved posts yet.</p>}
          {saved.map((post) => (
            <div key={post.id} className="flex items-center justify-between border-b border-gray-50 pb-4">
              <Link to={`/post/${post.slug}`} className="font-medium hover:text-brand-600 transition">
                {post.title}
              </Link>
              <span className="text-sm text-gray-400">by {post.username}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Profile
