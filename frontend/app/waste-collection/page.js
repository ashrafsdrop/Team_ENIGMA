"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, MapPin } from "lucide-react"

export default function WasteCollectionPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [image, setImage] = useState(null)
  const router = useRouter()

  const handleRequestCollection = async () => {
    setMessage("")
    setError("")
    setLoading(true)

    // Simulating getting user's location
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser")
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {

        try {
          const token = localStorage.getItem("access_token")
          if (!token) {
            router.push("/login")
            return
          }

          const formData = new FormData()
          formData.append('latitude', position.coords.latitude)
          formData.append('longitude', position.coords.longitude)
          if (image) {
            formData.append('image', image)
          }

          const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/waste-requests/`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`
            },
            body: formData
          })

          if (!res.ok) {
            throw new Error("Failed to submit request")
          }

          const data = await res.json()
          setMessage(`Success! Your waste collection request has been submitted. Status: ${data.status}`)
          alert("Waste collection request submitted successfully!") // As requested: alert is given
          
        } catch (err) {
          setError(err.message)
        } finally {
          setLoading(false)
        }
      },
      () => {
        setError("Unable to retrieve your location")
        setLoading(false)
      }
    )
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
        <div className="ring-gradient glass rounded-[2rem] border border-border bg-card/50 p-8 shadow-2xl backdrop-blur-xl sm:p-10 text-center">
          <div className="mb-8">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/15 text-brand">
              <MapPin className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Waste Collection</h1>
            <p className="mt-2 text-sm text-muted-foreground">Request a pickup and we will automatically save your location.</p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl bg-destructive/10 p-3 text-sm font-medium text-destructive">
              {error}
            </div>
          )}
          
          {message && (
            <div className="mb-5 rounded-xl bg-mint/10 p-3 text-sm font-medium text-mint">
              {message}
            </div>
          )}

          <div className="mb-6 flex flex-col gap-1.5 text-left">
            <label className="text-sm font-medium text-muted-foreground">Upload Image of Waste</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="w-full rounded-xl border border-border bg-background/50 px-4 py-2 text-sm text-foreground transition-colors file:mr-4 file:rounded-full file:border-0 file:bg-brand file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-foreground hover:file:bg-brand/90 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          <button
            onClick={handleRequestCollection}
            disabled={loading}
            className="glow-brand flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 font-semibold text-brand-foreground transition-transform hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Getting location & sending..." : "Request Waste Collection"}
          </button>
        </div>
      </div>
    </main>
  )
}
