"use client"

import { useState, useEffect } from "react"
import {
  Route,
  ClipboardList,
  Fuel,
  MessageSquare,
  Truck,
  MapPin,
  Timer,
  Droplets,
  Navigation,
  Building2,
  Loader2,
  CheckCircle,
} from "lucide-react"
import Badge from "@/components/common/Badge"
import Card from "@/components/common/Card"
import StatCard from "@/components/common/StatCard"
import StatusDot from "@/components/common/StatusDot"
import { formatNumber, formatWeight, formatDate, formatTime, timeAgo, apiRequest } from "@/utils/helpers"

export default function TruckDriverDashboard({ active }) {
  const [mission, setMission] = useState(null)
  const [loading, setLoading] = useState(true)
  const [arriving, setArriving] = useState(false)

  // Mock data for fuel/trips tabs
  const [stats] = useState([
    { label: "Trips Today", value: "2", delta: 12.5, icon: Route, tone: "brand" },
    { label: "Waste Moved", value: "14.2 t", delta: 5.6, icon: Truck, tone: "mint" },
    { label: "Fuel Used", value: "42 L", delta: -2.1, icon: Fuel, tone: "amber", hint: "efficient" },
    { label: "Driving Hours", value: "3.5 h", delta: 0, icon: Timer, tone: "destructive", hint: "out of 8h" },
  ])
  
  const fuelSummary = { litres: 165, cost: 18476, distance: 890, avg: 18.5 }

  const fetchMission = async () => {
    try {
      const data = await apiRequest("/waste-transfers/my_mission/")
      setMission(data.mission)
    } catch (e) {
      console.error("Failed to fetch mission", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMission()
  }, [])

  const handleArrive = async () => {
    if (!mission) return
    setArriving(true)
    try {
      await apiRequest(`/waste-transfers/${mission.id}/arrived_at_sts/`, { method: "POST" })
      await fetchMission()
    } catch (e) {
      console.error("Failed to mark arrival", e)
      alert(e.data?.error || "Failed to mark arrival")
    } finally {
      setArriving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    )
  }

  // Derived state from mission
  const hasMission = !!mission
  const isAssigned = hasMission && mission.status === "truck_assigned"
  const inTransit = hasMission && mission.status === "in_transit"
  
  // Calculate ETA dynamically (rough estimate based on distance)
  const etaMinutes = hasMission ? Math.max(5, Math.round((mission.distance_km / 30) * 60)) : 0

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card
          title="Current Mission"
          subtitle={hasMission ? `Transfer #${mission.id}` : "No active dispatch"}
          className="lg:col-span-2"
        >
          {hasMission ? (
            <>
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-brand/15 text-brand">
                  <Navigation className="h-6 w-6" />
                </span>
                <div className="flex-1">
                  <p className="text-lg font-bold">Transfer to {mission.landfill_name || "Landfill"}</p>
                  <p className="text-xs text-muted-foreground">
                    Assigned: {formatDate(mission.created_at)}
                  </p>
                </div>
                <Badge variant={inTransit ? "info" : "warning"}>
                  {inTransit ? "In Transit" : "Assigned"}
                </Badge>
              </div>
              
              <div className="mt-5 grid grid-cols-3 gap-4">
                <div>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> Origin STS
                  </p>
                  <p className="mt-1 text-sm font-semibold">{mission.sts_name}</p>
                </div>
                <div>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5" /> Destination
                  </p>
                  <p className="mt-1 text-sm font-semibold">{mission.landfill_name || "Landfill"}</p>
                </div>
                <div>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Truck className="h-3.5 w-3.5" /> Expected Load
                  </p>
                  <p className="mt-1 text-sm font-semibold">{formatWeight(mission.requested_tonnes * 1000)}</p>
                </div>
              </div>
              
              {isAssigned && (
                <div className="mt-5">
                  <div className="flex items-center justify-between rounded-xl bg-background/60 px-4 py-3 border border-border/50">
                    <div>
                      <p className="text-xs text-muted-foreground">Action Required</p>
                      <p className="text-sm font-semibold mt-0.5">Are you at {mission.sts_name}?</p>
                    </div>
                    <button
                      onClick={handleArrive}
                      disabled={arriving}
                      className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
                    >
                      {arriving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      Confirm Arrival
                    </button>
                  </div>
                </div>
              )}
              
              {inTransit && (
                <div className="mt-5">
                  <div className="flex items-center justify-between rounded-xl bg-background/60 px-4 py-3 border border-border/50">
                    <div>
                      <p className="text-xs text-muted-foreground">Load Confirmed by STS</p>
                      <p className="text-lg font-bold text-mint">{formatWeight(mission.weight_leaving_sts * 1000)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Estimated Distance & Time</p>
                      <p className="text-sm font-semibold mt-0.5">{mission.distance_km} km · {etaMinutes} mins</p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-brand/10 border border-brand/20 rounded-lg text-center">
                    <p className="text-sm text-brand font-medium flex justify-center items-center gap-2">
                      <Navigation className="w-4 h-4 animate-pulse" />
                      Proceed to {mission.landfill_name || "Landfill"} weighbridge
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-10">
              <CheckCircle className="w-12 h-12 text-emerald-500/40 mb-3" />
              <p className="text-lg font-bold text-muted-foreground">No Active Mission</p>
              <p className="text-sm text-muted-foreground mt-1">You are currently idle. Waiting for dispatch.</p>
            </div>
          )}
        </Card>

        <Card title="Vehicle Overview" subtitle="Assigned Truck">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-secondary">
              <Truck className="h-6 w-6 text-muted-foreground" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-lg">Heavy Compactor</p>
              <p className="text-xs text-brand flex items-center gap-1 mt-0.5">
                <StatusDot status="green" /> Online & Ready
              </p>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-2 gap-3">
             <div className="bg-[#131313] border border-border/50 rounded-xl p-3 text-center">
                <p className="text-emerald-500 font-bold">{fuelSummary.litres} L</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Fuel Used</p>
             </div>
             <div className="bg-[#131313] border border-border/50 rounded-xl p-3 text-center">
                <p className="text-amber-500 font-bold">{formatNumber(fuelSummary.distance)} km</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Driven</p>
             </div>
          </div>
        </Card>
      </div>
      
      {/* Route map mock visual */}
      {hasMission && (
        <Card title="Live Route" subtitle="Recommended path to destination">
          <div className="h-64 w-full rounded-xl bg-[#0a0a0f] border border-border/40 relative overflow-hidden flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
             <div className="absolute inset-0 bg-gradient-to-r from-brand/10 to-transparent"></div>
             
             {/* Map Mock Path */}
             <div className="w-3/4 h-32 relative">
                {/* Line */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-border rounded-full transform -translate-y-1/2">
                   {inTransit && (
                      <div className="h-full bg-brand rounded-full animate-[pulse_2s_ease-in-out_infinite]" style={{width: '45%'}}></div>
                   )}
                </div>
                
                {/* Start */}
                <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1/2 flex flex-col items-center">
                   <div className="w-5 h-5 bg-brand rounded-full border-4 border-[#0a0a0f]"></div>
                   <p className="text-xs font-bold mt-2 text-muted-foreground">{mission.sts_name}</p>
                </div>
                
                {/* End */}
                <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/2 flex flex-col items-center">
                   <div className="w-5 h-5 bg-emerald-500 rounded-full border-4 border-[#0a0a0f]"></div>
                   <p className="text-xs font-bold mt-2 text-emerald-500">{mission.landfill_name || "Landfill"}</p>
                </div>
                
                {/* Truck marker */}
                {inTransit && (
                   <div className="absolute top-1/2 left-[45%] transform -translate-y-1/2 -translate-x-1/2 z-10 text-brand">
                      <div className="bg-[#0a0a0f] p-1.5 rounded-full border border-brand shadow-[0_0_15px_rgba(79,70,229,0.5)]">
                         <Truck className="w-4 h-4" />
                      </div>
                   </div>
                )}
             </div>
          </div>
        </Card>
      )}
    </div>
  )
}
