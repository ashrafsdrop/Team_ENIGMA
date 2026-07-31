"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, MapPin, CheckCircle2 } from "lucide-react"

export default function DriverDashboard() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [error, setError] = useState("")
  const router = useRouter()

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        router.push("/login")
        return
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/waste-requests/`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (!res.ok) {
        throw new Error("Failed to fetch requests. Make sure you are logged in as a driver.")
      }

      const data = await res.json()
      setRequests(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleAccept = async (id) => {
    setActionLoading(id)
    setError("")

    try {
      const token = localStorage.getItem("access_token")
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/waste-requests/${id}/accept/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to accept request")
      }

      // Update the local state to show it as collected
      setRequests(requests.map(req => 
        req.id === id ? { ...req, status: 'collected', driver: 'You' } : req
      ))
      
      alert("Successfully accepted and marked as collected!")
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <main className="relative min-h-screen bg-background px-5 py-10">
      {/* Background decorations */}
      <div className="pointer-events-none fixed -left-24 top-24 h-80 w-80 rounded-full bg-brand/20 blur-3xl" />
      <div className="pointer-events-none fixed -right-16 bottom-24 h-80 w-80 rounded-full bg-mint/10 blur-3xl" />
      
      <div className="mx-auto max-w-4xl relative">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
          <h1 className="text-2xl font-extrabold tracking-tight">Driver Dashboard</h1>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-destructive/10 p-4 text-sm font-medium text-destructive">
            {error}
          </div>
        )}

        <div className="ring-gradient glass rounded-[2rem] border border-border bg-card/50 p-6 shadow-2xl backdrop-blur-xl sm:p-10">
          <h2 className="mb-6 text-xl font-bold">Waste Collection Requests</h2>
          
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-brand" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No waste requests found.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {requests.map((req) => (
                <div key={req.id} className="rounded-2xl border border-border bg-background p-5 shadow-sm transition-transform hover:-translate-y-1">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Req #{req.id}
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      req.status === 'pending' ? 'bg-brand/15 text-brand' : 'bg-mint/15 text-mint'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  
                  <div className="mb-4 space-y-2">
                    <p className="flex items-center gap-2 text-sm font-medium">
                      <MapPin className="h-4 w-4 text-muted-foreground" /> 
                      <a href={`https://www.google.com/maps?q=${req.latitude},${req.longitude}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
                        {req.latitude.toFixed(4)}, {req.longitude.toFixed(4)}
                      </a>
                    </p>
                    <p className="text-xs text-muted-foreground">Requested by: {req.user}</p>
                    {req.waste_type_details && (
                      <p className="text-xs text-muted-foreground">Type: <span className="font-medium text-foreground">{req.waste_type_details.name}</span></p>
                    )}
                    {req.weight > 0 && (
                      <p className="text-xs text-muted-foreground">Weight: <span className="font-medium text-foreground">{req.weight} kg</span></p>
                    )}
                    <p className="text-xs text-muted-foreground">Date: {new Date(req.created_at).toLocaleString()}</p>
                    {req.driver && (
                      <p className="text-xs font-semibold text-mint">Handled by: {req.driver}</p>
                    )}
                    {req.image && (
                      <div className="mt-2 overflow-hidden rounded-xl border border-border">
                        <img src={req.image} alt="Waste" className="h-32 w-full object-cover" />
                      </div>
                    )}
                  </div>

                  {req.status === 'pending' && (
                    <button
                      onClick={() => handleAccept(req.id)}
                      disabled={actionLoading === req.id}
                      className="glow-brand flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-2 text-sm font-semibold text-brand-foreground transition-transform hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100"
                    >
                      {actionLoading === req.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      Accept & Collect
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
