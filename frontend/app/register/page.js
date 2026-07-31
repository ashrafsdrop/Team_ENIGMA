"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
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
      const { confirm_password, ...submitData } = formData
      const headers = { "Content-Type": "application/json" }
      const token = localStorage.getItem("access_token")
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/register/`, {
        method: "POST",
        headers,
        body: JSON.stringify(submitData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(Object.values(data).flat()[0] || "Registration failed")
      }

      // Auto login after registration
      const loginRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: formData.username, password: formData.password }),
      })

      if (loginRes.ok) {
        const loginData = await loginRes.json()
        localStorage.setItem("access_token", loginData.access)
        localStorage.setItem("refresh_token", loginData.refresh)
        router.push("/admin")
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
      {/* Background decorations */}
      <div className="pointer-events-none absolute -left-24 top-24 h-80 w-80 rounded-full bg-brand/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-24 h-80 w-80 rounded-full bg-mint/10 blur-3xl" />
      
      <div className="w-full max-w-md animate-floaty focus-within:[animation-play-state:paused] hover:[animation-play-state:paused]" style={{ animationDuration: '9s' }}>
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <div className="ring-gradient glass rounded-[2rem] border border-border bg-card/50 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight">Create an account</h1>
            <p className="mt-2 text-sm text-muted-foreground">Join us to start building your web3 project</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="rounded-xl bg-destructive/10 p-3 text-center text-sm font-medium text-destructive">
                {error}
              </div>
            )}
            
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

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-muted-foreground">Role (Default: House Owner)</label>
              <select
                name="role"
                value={formData.role || "house_owner"}
                onChange={handleChange}
                className="rounded-xl border border-border bg-background/50 px-4 py-2 text-foreground transition-colors focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              >
                <option value="house_owner">House Owner</option>
                <option value="sts_manager">STS Manager</option>
                <option value="area_head">Area Head</option>
                <option value="driver">Driver</option>
                <option value="landfill_manager">Landfill Manager</option>
                <option value="truck_owner">Truck Owner</option>
                <option value="admin">Admin</option>
              </select>
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
