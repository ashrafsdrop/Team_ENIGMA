"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, Recycle } from "lucide-react"
import { API_BASE_URL, ROLES } from "@/utils/constants"
import { dashboardRouteForRole, setTokens, setStoredUser } from "@/utils/helpers"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    role: "house_owner",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)

    try {
      const { confirm_password, role, ...submitData } = formData
      const res = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(Object.values(data).flat()[0] || "Registration failed")
      }

      const loginRes = await fetch(`${API_BASE_URL}/auth/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: formData.username, password: formData.password }),
      })

      if (loginRes.ok) {
        const loginData = await loginRes.json()
        setTokens(loginData)
        setStoredUser({ role, name: formData.username })
        router.push(dashboardRouteForRole(role))
      } else {
        router.push("/login")
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-5 py-10">
      <div className="pointer-events-none absolute -left-24 top-24 h-80 w-80 rounded-full bg-brand/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-24 h-80 w-80 rounded-full bg-mint/10 blur-3xl" />

      <div className="w-full max-w-md animate-floaty focus-within:[animation-play-state:paused] hover:[animation-play-state:paused]" style={{ animationDuration: "9s" }}>
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <div className="ring-gradient glass rounded-[2rem] border border-border bg-card/50 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
          <div className="mb-8 text-center">
            <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-mint shadow-lg shadow-brand/20">
              <Recycle className="h-6 w-6 text-white" />
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">Create an account</h1>
            <p className="mt-2 text-sm text-muted-foreground">Join EcoNexus smart waste management</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="rounded-xl bg-destructive/10 p-3 text-center text-sm font-medium text-destructive">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-muted-foreground">I am a *</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="rounded-xl border border-border bg-background/50 px-4 py-2 text-foreground transition-colors focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              >
                {Object.entries(ROLES).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-muted-foreground">Username *</label>
              <input
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="rounded-xl border border-border bg-background/50 px-4 py-2 text-foreground transition-colors focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                placeholder="Choose a username"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-muted-foreground">Email Address *</label>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="rounded-xl border border-border bg-background/50 px-4 py-2 text-foreground transition-colors focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                placeholder="you@example.com"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-muted-foreground">Password *</label>
              <input
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="rounded-xl border border-border bg-background/50 px-4 py-2 text-foreground transition-colors focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                placeholder="Create a secure password"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-muted-foreground">Confirm Password *</label>
              <input
                name="confirm_password"
                type="password"
                required
                value={formData.confirm_password}
                onChange={handleChange}
                className="rounded-xl border border-border bg-background/50 px-4 py-2 text-foreground transition-colors focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                placeholder="Confirm your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="glow-brand mt-2 flex items-center justify-center gap-2 rounded-xl bg-brand py-3 font-semibold text-brand-foreground transition-transform hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-brand transition-colors hover:text-brand/80">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
