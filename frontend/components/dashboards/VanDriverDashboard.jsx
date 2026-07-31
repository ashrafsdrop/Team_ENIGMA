"use client"

import { useState, useEffect } from "react"
import {
  ClipboardCheck,
  MapPin,
  Fuel,
  BellRing,
  Trash2,
  CheckCircle2,
  Calendar,
  Navigation,
  Home,
  Droplets,
  Loader2,
} from "lucide-react"
import Badge from "@/components/common/Badge"
import Card from "@/components/common/Card"
import StatCard from "@/components/common/StatCard"
import StatusDot from "@/components/common/StatusDot"
import Map from "@/components/common/Map"
import { formatDate, formatNumber, formatTime, formatWeight, apiRequest, useAuth } from "@/utils/helpers"
import { WASTE_TYPES } from "@/utils/constants"

const wasteLabel = (key) => {
  const w = WASTE_TYPES.find((t) => t.key === key)
  return w ? w.label : key
}

const wasteColor = (key) => {
  const w = WASTE_TYPES.find((t) => t.key === key)
  return w ? w.color : "bg-secondary text-muted-foreground"
}

// Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)))
}

function OverviewSection() {
  const { userName } = useAuth()
  const [requests, setRequests] = useState([])
  const [van, setVan] = useState(null)
  const [driverLoc, setDriverLoc] = useState({ lat: 23.8103, lng: 90.4125 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const [reqData, vanData] = await Promise.all([
           apiRequest("/waste-requests/"),
           apiRequest("/vans/my_van/").catch(() => null)
        ])
        setRequests(reqData)
        setVan(vanData)
      } catch (e) {
        console.error("Failed to fetch driver data", e)
      } finally {
        setLoading(false)
      }
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setDriverLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.warn("Using default location"),
        { timeout: 5000 }
      )
    }
    
    fetchRequests()
  }, [])

  const handleDump = async () => {
    try {
      const res = await apiRequest("/vans/dump/", { method: "POST" })
      alert(res.message || "Dump request submitted to STS Manager!")
    } catch(e) {
      console.error(e)
      alert(e.data?.error || "Failed to request dump")
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    )
  }

  const completedCount = requests.filter(r => r.status === "collected" && r.driver === userName).length
  const totalCount = requests.filter(r => r.driver === userName).length
  const routeProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  // Nearest-Neighbor Route Optimization
  const pendingRequests = requests.filter(r => r.status === "assigned" && r.driver === userName)
  
  let optimizedRoute = []
  let currentLat = driverLoc.lat
  let currentLng = driverLoc.lng
  let unvisited = [...pendingRequests]
  
  while (unvisited.length > 0) {
    let nearestIdx = 0
    let minDistance = Infinity
    
    for (let i = 0; i < unvisited.length; i++) {
       const req = unvisited[i]
       const dist = calculateDistance(currentLat, currentLng, parseFloat(req.latitude), parseFloat(req.longitude))
       if (dist < minDistance) {
         minDistance = dist
         nearestIdx = i
       }
    }
    
    const nearest = unvisited[nearestIdx]
    optimizedRoute.push({...nearest, distance: minDistance})
    currentLat = parseFloat(nearest.latitude)
    currentLng = parseFloat(nearest.longitude)
    unvisited.splice(nearestIdx, 1)
  }

  const nextStop = optimizedRoute[0]

  const mapRoute = [
    { lat: driverLoc.lat, lng: driverLoc.lng },
    ...optimizedRoute.map(r => ({ lat: parseFloat(r.latitude), lng: parseFloat(r.longitude) }))
  ]

  const mapMarkers = [
    {
      lat: driverLoc.lat,
      lng: driverLoc.lng,
      type: "van",
      pulse: true,
      label: "Your Van",
      sub: "Current Location",
    },
    ...optimizedRoute.map((r, i) => {
      const lat = parseFloat(r.latitude) || 23.8103
      const lng = parseFloat(r.longitude) || 90.4125
      return {
      lat,
      lng,
      type: "home",
      pulse: i === 0,
      label: `Stop ${i + 1}`,
      sub: `Req #${r.id} (${r.weight}kg)`,
      }
    }),
  ]

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between bg-[#1a1a2e] p-4 rounded-xl border border-[#2a2a40]">
        <div>
           <p className="text-[#e8e8f0] font-semibold">Van Status: <Badge variant={van?.status === "returning" ? "warning" : "success"}>{van?.status?.toUpperCase() || "IDLE"}</Badge></p>
           <p className="text-xs text-[#8888aa] mt-1">STS Manager must verify weight upon arrival.</p>
        </div>
        <button 
           onClick={handleDump}
           disabled={!van || van.current_load_kg === 0}
           className="bg-[#fdcb6e] text-[#1a1a2e] px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#fdcb6e]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
           Arrived at STS (Request Dump)
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Van Load (kg)" value={`${van?.current_load_kg || 0} / ${van?.capacity_kg || 1000}`} delta={0} icon={Trash2} tone="brand" />
        <StatCard label="Trips Today" value={`${van?.trips_today || 0} / ${van?.max_trips_per_day || 2}`} delta={0} icon={ClipboardCheck} tone="mint" />
        <StatCard label="Completed Stops" value={completedCount} delta={0} icon={CheckCircle2} tone="primary" />
        <StatCard label="Pending Stops" value={pendingRequests.length} delta={0} icon={MapPin} tone="amber" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Live Route Optimization" subtitle="Nearest-neighbor paths mapped via Leaflet">
          <div className="h-[400px] w-full rounded-xl overflow-hidden relative border border-[#1a1a2e]">
            {optimizedRoute.length > 0 ? (
               <Map markers={mapMarkers} route={mapRoute} className="h-full w-full" />
            ) : (
               <div className="flex flex-col items-center justify-center h-full bg-[#0a0a0f] text-muted-foreground z-10">
                  <CheckCircle2 className="w-10 h-10 mb-2 text-emerald-500/40" />
                  <p className="text-sm">No pending pickups!</p>
               </div>
            )}
          </div>
        </Card>

        <Card
          title="Optimized Queue"
          subtitle="Requests sorted by proximity"
          bodyClassName="p-0"
        >
          <div className="divide-y divide-border/40 h-72 overflow-y-auto">
            {optimizedRoute.length === 0 ? (
               <div className="p-6 text-center text-muted-foreground text-sm">All caught up!</div>
            ) : (
              optimizedRoute.map((p, index) => (
                <div key={p.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                  <span className={`flex h-8 w-8 flex-none items-center justify-center rounded-lg text-xs font-bold ${index === 0 ? "bg-brand text-white" : "bg-secondary text-muted-foreground"}`}>
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">Request #{p.id}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground flex items-center gap-2">
                      <Badge className={`${wasteColor(p.waste_type)} scale-75 origin-left`}>{wasteLabel(p.waste_type)}</Badge>
                      {p.distance.toFixed(2)} km
                    </p>
                  </div>
                  {index === 0 && (
                     <StatusDot status="blue" pulse label="Next" />
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
         <Card
          title="Today's Progress"
          subtitle="Overall completion"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint/15 text-mint">
              <ClipboardCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">Progress</p>
              <p className="text-lg font-bold">{completedCount} of {totalCount} completed</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Completion Rate</span>
              <span className="font-semibold text-mint">{routeProgress}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand to-mint transition-all duration-500"
                style={{ width: `${routeProgress}%` }}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

function PickupsSection() {
  const { userName } = useAuth()
  const [stops, setStops] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
     try {
       const data = await apiRequest("/waste-requests/")
       setStops(data)
     } catch (e) {
       console.error(e)
     } finally {
       setLoading(false)
     }
  }

  const markCollected = async (id) => {
    try {
      await apiRequest(`/waste-requests/${id}/accept/`, { method: "POST" })
      setStops((prev) => prev.map((p) => (p.id === id ? { ...p, status: "collected" } : p)))
    } catch(e) {
      console.error(e)
      alert(e.data?.error || "Failed to mark as collected")
    }
  }

  const myStops = stops.filter(p => p.driver === userName)
  const completed = myStops.filter((p) => p.status === "collected").length
  const pending = myStops.filter((p) => p.status === "assigned").length

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-brand" /></div>

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Stops Completed" value={completed} delta={0} icon={ClipboardCheck} tone="mint" />
        <StatCard label="Pending Stops" value={pending} delta={0} icon={MapPin} tone="amber" />
      </div>

      <Card title="Pickup Stops" subtitle="Tap 'Mark Collected' when waste is loaded onto the van" bodyClassName="p-0">
        <div className="divide-y divide-border/40">
          {myStops.map((p) => {
            const done = p.status === "collected"
            return (
              <div key={p.id} className="flex flex-wrap items-center gap-4 px-6 py-4">
                <span
                  className={`flex h-9 w-9 flex-none items-center justify-center rounded-lg ${
                    done ? "bg-mint/15 text-mint" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {done ? <CheckCircle2 className="h-4 w-4" /> : <Home className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">Request #{p.id}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {wasteLabel(p.waste_type)} · {formatWeight(p.weight)}
                  </p>
                </div>
                <Badge variant={done ? "success" : "warning"}>
                  {done ? "Collected" : "En Route"}
                </Badge>
                {done ? (
                  <StatusDot status="green" label="Collected" />
                ) : (
                  <button
                    type="button"
                    onClick={() => markCollected(p.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Mark Collected
                  </button>
                )}
              </div>
            )
          })}
          {myStops.length === 0 && (
             <div className="p-8 text-center text-muted-foreground">No requests assigned to you.</div>
          )}
        </div>
      </Card>
    </div>
  )
}

// Keep static fallback for other tabs for hackathon demo speed
function AreaSection() { return <div className="p-8 text-center text-muted-foreground">Area settings disabled for demo.</div> }
function FuelSection() { return <div className="p-8 text-center text-muted-foreground">Fuel logs disabled for demo.</div> }
function RequestsSection() { return <PickupsSection /> }

export default function VanDriverDashboard({ active }) {
  if (active === "pickups" || active === "requests") return <PickupsSection />
  if (active === "area") return <AreaSection />
  if (active === "fuel") return <FuelSection />
  return <OverviewSection />
}
