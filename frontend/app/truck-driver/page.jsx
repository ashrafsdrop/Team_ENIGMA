"use client"

import { useState, useEffect } from "react"
import {
  TruckIcon,
  Gauge,
  Clock,
  Send,
  CheckCircle,
  Navigation,
  ArrowDownRight,
  Fuel,
  Droplets,
  History,
} from "lucide-react"
import { Card } from "@/components/common/Card"
import { Badge } from "@/components/common/Badge"
import { StatCard } from "@/components/common/StatCard"
import { apiRequest } from "@/utils/helpers"

const inputCls =
  "w-full rounded-lg border border-[#1a1a2e] bg-[#0a0a0f] px-3 py-2 text-sm text-[#e8e8f0] placeholder-[#55557a] focus:border-[#00d4aa]/60 focus:outline-none"
const labelCls = "mb-1 block text-xs font-medium text-[#8888aa]"

export default function TruckDriverDashboard() {
  const [stats] = useState({
    truckId: "T-018",
    driver: "Rahim Khan",
    capacity: "12.0",
    currentLoad: "8.2",
    loadPercent: 68,
    hoursDriven: 6,
    maxHours: 8,
    tripsToday: 3,
    destination: "Landfill-1",
    eta: "22 min",
    status: "moving",
  })

  const [mission, setMission] = useState(null)
  const [myTruck, setMyTruck] = useState(null)
  const [loading, setLoading] = useState(true)

  const [fuel, setFuel] = useState({ percent: 68, usedToday: 42 })
  const [fuelForm, setFuelForm] = useState({ percent: "", used: "" })
  const [fuelLog, setFuelLog] = useState([
    { id: 1, time: "8:05 AM", percent: 80, used: 0, note: "Start of day" },
  ])
  const [notice, setNotice] = useState("")

  const updateFuel = (e) => {
    e.preventDefault()
    const pct = Number(fuelForm.percent)
    const used = Number(fuelForm.used) || 0
    if (!Number.isFinite(pct) || pct < 0 || pct > 100) return
    setFuel((prev) => ({
      percent: pct,
      usedToday: prev.usedToday + used,
    }))
    setFuelLog((prev) => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        percent: pct,
        used,
        note: used > 0 ? `${used} L added to usage` : "Fuel level updated",
      },
      ...prev,
    ])
    setNotice(`Fuel updated to ${pct}%${used > 0 ? ` · ${used} L used` : ""}`)
    setFuelForm({ percent: "", used: "" })
  }

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)
        const [m, t] = await Promise.all([
          apiRequest('/waste-transfers/my_mission/', { auth: true }).catch(() => ({ mission: null })),
          apiRequest('/trucks/my_truck/', { auth: true }).catch(() => null),
        ])
        if (!mounted) return
        setMission(m && m.mission ? m.mission : null)
        setMyTruck(t || null)
      } catch (e) {
        console.error('Failed to load truck data', e)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const [trips] = useState([
    { id: 1, from: "STS Mirpur", to: "Landfill-1", load: "8.2t", status: "in-progress", time: "10:30 AM" },
    { id: 2, from: "STS Gulshan", to: "Landfill-1", load: "11.5t", status: "completed", time: "9:15 AM" },
    { id: 3, from: "STS Dhanmondi", to: "Landfill-1", load: "7.8t", status: "completed", time: "8:00 AM" },
  ])

  const [nextDispatch] = useState({
    from: "STS Motijheel",
    to: "Landfill-1",
    load: "10.0t",
    pickupTime: "11:30 AM",
    distance: "8.4 km",
    eta: "25 min",
  })

  const getStatusVariant = (status) => {
    const map = {
      "in-progress": "success",
      completed: "default",
      moving: "success",
      loading: "warning",
      idle: "default",
      returning: "info",
    }
    return map[status] || "default"
  }

  const fuelColor = fuel.percent > 50 ? "bg-[#00d4aa]" : fuel.percent > 25 ? "bg-[#fdcb6e]" : "bg-[#ff6b6b]"

  const arriveAtSts = async () => {
    if (!mission) return
    try {
      await apiRequest(`/waste-transfers/${mission.id}/arrived_at_sts/`, { method: 'POST', auth: true })
      setNotice('Marked as arrived at STS')
      // refresh mission
      const refreshed = await apiRequest('/waste-transfers/my_mission/', { auth: true })
      setMission(refreshed && refreshed.mission ? refreshed.mission : null)
    } catch (e) {
      console.error(e)
      setNotice('Failed to mark arrival')
    }
  }

  return (
    <div className="p-6 space-y-6">
      <Card className="bg-gradient-to-r from-[#6c5ce7]/10 to-[#00d4aa]/10 border-[#6c5ce7]/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#8888aa] uppercase tracking-wider">Truck</p>
            <p className="text-2xl font-bold text-[#e8e8f0]">{myTruck ? myTruck.registration_number : stats.truckId}</p>
            <p className="text-sm text-[#8888aa]">{myTruck ? (myTruck.driver_name || stats.driver) : stats.driver}</p>
          </div>
          <div className="text-right">
            <Badge variant={myTruck ? (myTruck.status === "moving" ? "success" : "default") : (stats.status === "moving" ? "success" : "default")} className="text-sm px-3 py-1">
              {myTruck ? myTruck.status : stats.status}
            </Badge>
            <p className="text-xs text-[#8888aa] mt-1">ETA: {mission ? mission.distance_km + ' km' : stats.eta}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={TruckIcon} label="Capacity" value={`${stats.currentLoad}/${stats.capacity}t`} color="primary" />
        <StatCard icon={Gauge} label="Load" value={`${stats.loadPercent}%`} color="secondary" />
        <StatCard icon={Clock} label="Hours Driven" value={`${stats.hoursDriven}/${stats.maxHours}h`} color="warning" />
        <StatCard icon={Send} label="Trips Today" value={stats.tripsToday} color="primary" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#e8e8f0]">Trip History</h3>
            <span className="text-xs text-[#8888aa]">Today</span>
          </div>
            <div className="space-y-3">
            {trips.map((trip) => (
              <div key={trip.id} className="flex items-center gap-4 p-3 bg-[#0a0a0f] rounded-lg border border-[#1a1a2e]">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#e8e8f0]">{trip.from} → {trip.to}</span>
                    <Badge variant={getStatusVariant(trip.status)}>{trip.status}</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-[#8888aa]">
                    <span>Load: {trip.load}</span>
                    <span>{trip.time}</span>
                  </div>
                </div>
                {trip.status === "in-progress" && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#00d4aa]">Live</span>
                    <span className="w-2 h-2 rounded-full bg-[#00d4aa] animate-pulse" />
                  </div>
                )}
                {trip.status === "completed" && <CheckCircle className="w-4 h-4 text-[#8888aa]" />}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-[#e8e8f0] mb-4">Next Dispatch</h3>
          <div className="p-4 bg-[#0a0a0f] rounded-lg border border-[#1a1a2e]">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-[#00d4aa]" />
              <span className="text-sm font-medium text-[#e8e8f0]">{nextDispatch.from}</span>
            </div>
            <div className="flex items-center gap-2 mt-1 ml-5">
              <ArrowDownRight className="w-4 h-4 text-[#8888aa]" />
              <span className="text-sm text-[#8888aa]">{nextDispatch.to}</span>
            </div>
            <div className="mt-3 space-y-1.5 text-xs text-[#8888aa]">
              <div className="flex justify-between">
                <span>Load</span>
                <span className="text-[#e8e8f0]">{nextDispatch.load}</span>
              </div>
              <div className="flex justify-between">
                <span>Pickup</span>
                <span className="text-[#e8e8f0]">{nextDispatch.pickupTime}</span>
              </div>
              <div className="flex justify-between">
                <span>Distance</span>
                <span className="text-[#e8e8f0]">{nextDispatch.distance}</span>
              </div>
              <div className="flex justify-between">
                <span>ETA</span>
                <span className="text-[#00d4aa] font-medium">{nextDispatch.eta}</span>
              </div>
            </div>
            {mission && mission.status === 'truck_assigned' ? (
              <button type="button" onClick={arriveAtSts} className="w-full mt-4 bg-[#00d4aa] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#00d4aa]/80 transition-colors">Arrived at STS</button>
            ) : (
              <button className="w-full mt-4 bg-[#00d4aa] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#00d4aa]/80 transition-colors">Start Trip</button>
            )}
          </div>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Fuel className="w-4 h-4 text-[#00d4aa]" />
            <h3 className="text-sm font-semibold text-[#e8e8f0]">Fuel & Consumption</h3>
          </div>
          {notice && (
            <span className="flex items-center gap-1.5 text-xs text-[#00d4aa]">
              <CheckCircle className="w-3.5 h-3.5" /> {notice}
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-6">
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h4 className="flex items-center gap-1.5 text-sm font-semibold text-[#e8e8f0]">
                <Gauge className="w-4 h-4 text-[#4a9eff]" /> Fuel Level
              </h4>
              <span className="text-2xl font-bold text-[#e8e8f0]">{fuel.percent}%</span>
            </div>
            <div className="h-3 bg-[#1a1a2e] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${fuelColor}`}
                style={{ width: `${fuel.percent}%` }}
              />
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-lg border border-[#1a1a2e] bg-[#0a0a0f] p-3">
              <Droplets className="w-4 h-4 flex-none text-[#4a9eff]" />
              <p className="text-xs text-[#8888aa]">
                Used today: <span className="font-semibold text-[#e8e8f0]">{fuel.usedToday} L</span>
              </p>
            </div>
          </Card>

          <Card>
            <h4 className="text-sm font-semibold text-[#e8e8f0] mb-4">Update Fuel</h4>
            <form onSubmit={updateFuel} className="space-y-3">
              <div>
                <label className={labelCls}>Fuel percentage</label>
                <input
                  className={inputCls}
                  type="number"
                  min="0"
                  max="100"
                  placeholder="e.g. 55"
                  value={fuelForm.percent}
                  onChange={(e) => setFuelForm((f) => ({ ...f, percent: e.target.value }))}
                />
              </div>
              <div>
                <label className={labelCls}>Fuel used (liters)</label>
                <input
                  className={inputCls}
                  type="number"
                  min="0"
                  placeholder="e.g. 12"
                  value={fuelForm.used}
                  onChange={(e) => setFuelForm((f) => ({ ...f, used: e.target.value }))}
                />
              </div>
              <button
                type="submit"
                disabled={!fuelForm.percent}
                className="w-full bg-[#4a9eff] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#4a9eff]/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Update Fuel
              </button>
            </form>
          </Card>

          <Card>
            <h4 className="flex items-center gap-1.5 text-sm font-semibold text-[#e8e8f0] mb-4">
              <History className="w-4 h-4 text-[#8888aa]" /> Fuel Log
            </h4>
            <div className="space-y-2">
              {fuelLog.map((l) => (
                <div key={l.id} className="p-2.5 bg-[#0a0a0f] rounded-lg border border-[#1a1a2e]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#e8e8f0]">{l.percent}%</span>
                    <span className="text-[10px] text-[#55557a]">{l.time}</span>
                  </div>
                  <p className="text-[10px] text-[#8888aa] mt-0.5">{l.note}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
