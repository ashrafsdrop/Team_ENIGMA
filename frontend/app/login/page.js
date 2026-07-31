"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"

export default function LoginPage() {
  const [formData, setFormData] = useState({ username: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        throw new Error("Invalid username or password")
      }

      const data = await res.json()
      // Store tokens
      localStorage.setItem("access_token", data.access)
      localStorage.setItem("refresh_token", data.refresh)
      
      router.push("/admin") // redirect to admin or dashboard
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-5 py-10">
      {/* Background decorations */}
      <div className="pointer-events-none absolute -left-24 top-24 h-80 w-80 rounded-full bg-brand/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-24 h-80 w-80 rounded-full bg-mint/10 blur-3xl" />
      
      <div className="w-full max-w-md animate-floaty focus-within:[animation-play-state:paused] hover:[animation-play-state:paused]" style={{ animationDuration: '8s' }}>
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <div className="ring-gradient glass rounded-[2rem] border border-border bg-card/50 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight">Welcome back</h1>
            <p className="mt-2 text-sm text-muted-foreground">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="rounded-xl bg-destructive/10 p-3 text-center text-sm font-medium text-destructive">
                {error}
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-muted-foreground">Username</label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="rounded-xl border border-border bg-background/50 px-4 py-2.5 text-foreground transition-colors focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                placeholder="Enter your username"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-muted-foreground">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="rounded-xl border border-border bg-background/50 px-4 py-2.5 text-foreground transition-colors focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="glow-brand mt-2 flex items-center justify-center gap-2 rounded-xl bg-brand py-3 font-semibold text-brand-foreground transition-transform hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="font-semibold text-brand transition-colors hover:text-brand/80">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
