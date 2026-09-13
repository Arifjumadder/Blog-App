import React, { useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"
import axios from "axios"
import { AuthContext } from "../context/authContext"

const Write = () => {
  // When navigating here from the Edit button on a post, the full post
  // object is passed as router state. Its presence means "editing".
  const state = useLocation().state
  const isEditing = Boolean(state?.id)

  const { currentUser } = useContext(AuthContext)
  const navigate = useNavigate()

  const [title, setTitle] = useState(state?.title || "")
  const [content, setContent] = useState(state?.desc || "")
  const [file, setFile] = useState(null)
  const [catId, setCatId] = useState(state?.catId || "")
  const [categories, setCategories] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!currentUser) navigate("/login")
  }, [currentUser, navigate])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("/api/categories")
        setCategories(res.data)
      } catch (err) {
        console.log(err)
      }
    }
    fetchCategories()
  }, [])

  const upload = async () => {
    const formData = new FormData()
    formData.append("file", file)
    const res = await axios.post("/api/upload", formData)
    return res.data
  }

  const save = async (status) => {
    setError("")
    if (!title.trim() || !content.trim()) {
      setError("Title and content are both required.")
      return
    }

    setSaving(true)
    try {
      const imgUrl = file ? await upload() : state?.img || ""

      const payload = {
        title,
        desc: content,
        img: imgUrl,
        catId: catId || null,
        status,
      }

      if (isEditing) {
        await axios.put(`/api/posts/${state.id}`, payload)
        navigate(`/post/${state.slug || state.id}`)
      } else {
        const res = await axios.post("/api/posts", payload)
        navigate(`/post/${res.data.slug}`)
      }
    } catch (err) {
      console.error(err)
      const serverMsg = err.response?.data
      if (typeof serverMsg === "string") setError(serverMsg)
      else if (serverMsg?.sqlMessage) setError(serverMsg.sqlMessage)
      else if (serverMsg?.message) setError(serverMsg.message)
      else if (err.message) setError(err.message)
      else setError("Something went wrong.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
      <div className="flex flex-col gap-4">
        <input
          type="text"
          value={title}
          placeholder="Title"
          onChange={(e) => setTitle(e.target.value)}
          className="text-3xl font-bold outline-none border-b border-slate-200 dark:border-slate-700 pb-3 placeholder:text-slate-300 dark:placeholder:text-slate-600"
        />
        <div className="min-h-[420px]">
          <ReactQuill theme="snow" value={content} onChange={setContent} className="h-[350px] mb-12" />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg p-4 flex flex-col gap-3 shadow-sm">
          <h2 className="font-semibold text-lg">Publish</h2>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            <b>Status:</b> {isEditing ? state.status : "Draft"}
          </span>

          <input
            style={{ display: "none" }}
            type="file"
            id="file"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <label
            htmlFor="file"
            className="cursor-pointer text-center text-sm border border-brand-500 text-brand-600 dark:text-brand-400 rounded-md py-2 hover:bg-brand-50 dark:hover:bg-brand-950 transition"
          >
            {file ? file.name : "Upload cover image"}
          </label>

          {error && (
            <p className="text-red-500 text-sm">
              {typeof error === "string" ? error : "Something went wrong."}
            </p>
          )}

          <div className="flex gap-2">
            <button
              disabled={saving}
              onClick={() => save("draft")}
              className="flex-1 border border-slate-300 dark:border-slate-600 rounded-md py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-50"
            >
              Save as draft
            </button>
            <button
              disabled={saving}
              onClick={() => save("published")}
              className="flex-1 bg-brand-600 text-white rounded-md py-2 text-sm hover:bg-brand-700 disabled:opacity-50"
            >
              Publish
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg p-4 flex flex-col gap-2 shadow-sm">
          <h2 className="font-semibold text-lg">Category</h2>
          {categories.map((c) => (
            <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="cat"
                checked={Number(catId) === c.id}
                onChange={() => setCatId(c.id)}
              />
              {c.name}
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Write
