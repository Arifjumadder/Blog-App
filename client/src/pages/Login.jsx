import axios from 'axios';
import React from 'react'
import { useContext } from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/authContext';

const Login = () => {
  const [inputs, setInputs] = useState({
    username: "",
    password: "",
  })
  const [err, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate()

  const { login } = useContext(AuthContext);

  const handleChange = e => {
    setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(inputs)
      navigate("/")
    } catch (err) {
      setError(err.response?.data || "Something went wrong.")
    } finally {
      setLoading(false)
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-50 dark:bg-slate-950 px-4">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-8 w-full max-w-sm flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-brand-700 text-center">Login</h1>

        <input
          required
          type="text"
          placeholder="Username"
          name="username"
          onChange={handleChange}
          className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-md px-3 py-2 text-sm outline-none focus:border-brand-400"
        />
        <input
          required
          type="password"
          placeholder="Password"
          name="password"
          onChange={handleChange}
          className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-md px-3 py-2 text-sm outline-none focus:border-brand-400"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-brand-600 text-white rounded-md py-2 text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? "Logging in…" : "Login"}
        </button>

        {err && <p className="text-red-500 text-sm text-center">{typeof err === "string" ? err : "Login failed."}</p>}

        <span className="text-sm text-slate-500 dark:text-slate-400 text-center">
          Don't have an account? <Link to="/register" className="text-brand-600 dark:text-brand-400 hover:underline">Register</Link>
        </span>
      </form>
    </div>
  )
}

export default Login
