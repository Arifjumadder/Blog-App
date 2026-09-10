import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AuthContext } from '../context/authContext'

const Navbar = () => {
  const { currentUser, logout } = useContext(AuthContext)
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState("")
  const navigate = useNavigate()

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

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(search.trim() ? `/?search=${encodeURIComponent(search.trim())}` : "/")
  }

  return (
    <div className="border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center gap-4">
        <Link to="/" className="shrink-0 text-xl font-bold text-brand-600">
          Blog App
        </Link>

        <div className="flex flex-wrap gap-4 flex-1">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/?cat=${c.slug}`}
              className="text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-brand-600 transition"
            >
              {c.name}
            </Link>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts..."
            className="border border-gray-200 rounded-l-md px-3 py-1.5 text-sm outline-none focus:border-brand-400 w-40"
          />
          <button type="submit" className="bg-gray-100 border border-l-0 border-gray-200 rounded-r-md px-3 text-sm hover:bg-gray-200">
            🔍
          </button>
        </form>

        <div className="flex items-center gap-3 shrink-0">
          {currentUser?.role === "admin" && (
            <Link to="/admin" className="text-sm text-purple-600 hover:underline">
              Admin
            </Link>
          )}
          {currentUser && (
            <Link to={`/profile/${currentUser.username}`} className="text-sm text-gray-500 hover:text-brand-600">
              {currentUser.username}
            </Link>
          )}
          {currentUser ? (
            <button onClick={logout} className="text-sm text-gray-500 hover:text-brand-600">
              Logout
            </button>
          ) : (
            <Link to="/login" className="text-sm text-gray-500 hover:text-brand-600">
              Login
            </Link>
          )}
          <Link to="/write" className="text-sm bg-brand-600 text-white px-3 py-1.5 rounded-md hover:bg-brand-700">
            Write
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Navbar
