import React from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from "axios"

const Register = () => {
  const [inputs, setInputs] = useState({
    username: "",
    email: "",
    password: "",
  })
  const [err, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate()

  const handleChange = e => {
    setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await axios.post("/api/auth/register", inputs)
      navigate("/login")
    } catch (err) {
      setError(err.response?.data || "Something went wrong.")
    } finally {
      setLoading(false)
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-brand-50 px-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8 w-full max-w-sm flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-brand-700 text-center">Register</h1>

        <input
          required
          type="text"
          placeholder="Username"
          name="username"
          onChange={handleChange}
          className="border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-brand-400"
        />
        <input
          required
          type="email"
          placeholder="Email"
          name="email"
          onChange={handleChange}
          className="border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-brand-400"
        />
        <input
          required
          type="password"
          placeholder="Password"
          name="password"
          onChange={handleChange}
          className="border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-brand-400"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-brand-600 text-white rounded-md py-2 text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? "Creating account…" : "Register"}
        </button>

        {err && <p className="text-red-500 text-sm text-center">{typeof err === "string" ? err : "Registration failed."}</p>}

        <span className="text-sm text-gray-500 text-center">
          Already have an account? <Link to="/login" className="text-brand-600 hover:underline">Login</Link>
        </span>
      </form>
    </div>
  )
}

export default Register
