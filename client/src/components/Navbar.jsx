import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AuthContext } from '../context/authContext'
import { ThemeContext } from '../context/themeContext'

const Navbar = () => {
  const { currentUser, logout } = useContext(AuthContext)
  const { theme, toggleTheme } = useContext(ThemeContext)
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)
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
    setMenuOpen(false)
  }

  const linkClass = "text-sm text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition"

  return (
    <div className="sticky top-0 z-20 bg-white/90 dark:bg-slate-950/90 backdrop-blur border-b border-slate-100 dark:border-slate-800 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center gap-4">
        <Link to="/" className="shrink-0 text-xl font-bold text-brand-600 dark:text-brand-400">
          Blog App
        </Link>

        {/* Desktop-only: categories */}
        <div className="hidden md:flex flex-wrap gap-4 flex-1">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/?cat=${c.slug}`}
              className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition"
            >
              {c.name}
            </Link>
          ))}
        </div>
        <div className="flex-1 md:hidden" />

        {/* Desktop-only: search */}
        <form onSubmit={handleSearch} className="hidden md:flex">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts..."
            className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-l-md px-3 py-1.5 text-sm outline-none focus:border-brand-400 w-40"
          />
          <button
            type="submit"
            className="bg-slate-100 dark:bg-slate-800 border border-l-0 border-slate-200 dark:border-slate-700 rounded-r-md px-3 text-sm hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            🔍
          </button>
        </form>

        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        {/* Desktop-only: account links */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {currentUser?.role === "admin" && (
            <Link to="/admin" className="text-sm text-purple-600 dark:text-purple-400 hover:underline">
              Admin
            </Link>
          )}
          {currentUser && (
            <Link to={`/profile/${currentUser.username}`} className={linkClass}>
              {currentUser.username}
            </Link>
          )}
          {currentUser ? (
            <button onClick={logout} className={linkClass}>
              Logout
            </button>
          ) : (
            <Link to="/login" className={linkClass}>
              Login
            </Link>
          )}
          <Link to="/write" className="text-sm bg-brand-600 text-white px-3 py-1.5 rounded-md hover:bg-brand-700">
            Write
          </Link>
        </div>

        {/* Mobile-only: hamburger toggle */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="md:hidden shrink-0 w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Toggle menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile dropdown panel */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 dark:border-slate-800 px-4 py-4 flex flex-col gap-4">
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts..."
              className="flex-1 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-l-md px-3 py-1.5 text-sm outline-none focus:border-brand-400"
            />
            <button
              type="submit"
              className="bg-slate-100 dark:bg-slate-800 border border-l-0 border-slate-200 dark:border-slate-700 rounded-r-md px-3 text-sm hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              🔍
            </button>
          </form>

          <div className="flex flex-wrap gap-3">
            {categories.map((c) => (
              <Link
                key={c.id}
                to={`/?cat=${c.slug}`}
                onClick={() => setMenuOpen(false)}
                className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition"
              >
                {c.name}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            {currentUser?.role === "admin" && (
              <Link to="/admin" onClick={() => setMenuOpen(false)} className="text-sm text-purple-600 dark:text-purple-400">
                Admin
              </Link>
            )}
            {currentUser && (
              <Link to={`/profile/${currentUser.username}`} onClick={() => setMenuOpen(false)} className={linkClass}>
                {currentUser.username}'s profile
              </Link>
            )}
            {currentUser ? (
              <button onClick={() => { logout(); setMenuOpen(false) }} className={`${linkClass} text-left`}>
                Logout
              </button>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)} className={linkClass}>
                Login
              </Link>
            )}
            <Link
              to="/write"
              onClick={() => setMenuOpen(false)}
              className="text-sm bg-brand-600 text-white px-3 py-1.5 rounded-md hover:bg-brand-700 w-fit"
            >
              Write
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default Navbar
