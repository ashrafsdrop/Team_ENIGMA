"use client"

import { useState } from "react"
import {
  Truck,
  Gauge,
  ClipboardList,
  Home,
  CheckCircle,
  Navigation,
  Map,
  Send,
  Weight,
} from "lucide-react"
import { Card } from "@/components/common/Card"
import { Badge } from "@/components/common/Badge"
import { StatCard } from "@/components/common/StatCard"
import { Modal } from "@/components/common/Modal"
import { Map as MapView } from "@/components/common/Map"

const inputCls =
  "w-full rounded-lg border border-[#1a1a2e] bg-[#0a0a0f] px-3 py-2 text-sm text-[#e8e8f0] placeholder-[#55557a] focus:border-[#00d4aa]/60 focus:outline-none"
const labelCls = "mb-1 block text-xs font-medium text-[#8888aa]"

export default function VanDriverDashboard() {
  const [stats] = useState({
    vanId: "V-012",
    driver: "Ali Hasan",
    capacity: "1.5",
    currentLoad: "0.65",
    loadPercent: 43,
    todayTrips: 2,
    maxTrips: 2,
    housesCollected: 15,
    sts: "STS Mirpur",
    status: "collecting",
  })

  const [assignedRequests, setAssignedRequests] = useState([
    { id: 1, house: "House #42, Block A", address: "42/A, Mirpur-10", distance: "0.8 km", status: "pending", priority: "high" },
    { id: 2, house: "House #87, Block B", address: "87/B, Mirpur-10", distance: "1.2 km", status: "pending", priority: "medium" },
    { id: 3, house: "House #56, Block A", address: "56/A, Mirpur-10", distance: "0.5 km", status: "in-progress", priority: "high" },
    { id: 4, house: "House #23, Block C", address: "23/C, Mirpur-10", distance: "1.5 km", status: "pending", priority: "low" },
    { id: 5, house: "House #34, Block B", address: "34/B, Mirpur-10", distance: "0.9 km", status: "completed", priority: "medium" },
  ])

  const [route] = useState([
    { stop: 1, house: "House #56", status: "completed", time: "10:30 AM" },
    { stop: 2, house: "House #42", status: "current", time: "10:45 AM" },
    { stop: 3, house: "House #87", status: "upcoming", time: "11:00 AM" },
    { stop: 4, house: "House #34", status: "upcoming", time: "11:15 AM" },
    { stop: 5, house: "House #23", status: "upcoming", time: "11:30 AM" },
  ])

  const [submissions, setSubmissions] = useState([])
  const [weightModal, setWeightModal] = useState(null)
  const [weightInput, setWeightInput] = useState("")
  const [notice, setNotice] = useState("")

  const nextPickup = assignedRequests.find((r) => r.status === "pending")

  const startRequest = (id) => {
    setAssignedRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "in-progress" } : r)))
    setNotice(`${assignedRequests.find((r) => r.id === id)?.house} started`)
  }

  const openWeightModal = (req) => {
    setWeightModal(req)
    setWeightInput("")
  }

  const submitWeight = (e) => {
    e.preventDefault()
    if (!weightInput || !weightModal) return
    const w = Number(weightInput)
    if (!Number.isFinite(w) || w <= 0) return
    setSubmissions((prev) => [
      { id: Date.now(), house: weightModal.house, weight: w, time: new Date().toLocaleTimeString(), status: "submitted" },
      ...prev,
    ])
    setAssignedRequests((prev) => prev.map((r) => (r.id === weightModal.id ? { ...r, status: "completed" } : r)))
    setNotice(`${w} kg submitted to ${stats.sts}`)
    setWeightModal(null)
    setWeightInput("")
  }

  const getStatusVariant = (status) => {
    const map = {
      pending: "warning",
      "in-progress": "success",
      completed: "default",
      collecting: "success",
      returning: "warning",
      submitted: "success",
    }
    return map[status] || "default"
  }

  const getPriorityVariant = (priority) => {
    const map = { high: "danger", medium: "warning", low: "default" }
    return map[priority] || "default"
  }

  return (
    <div className="p-6 space-y-6">
      <Card className="bg-gradient-to-r from-[#00d4aa]/10 to-[#6c5ce7]/10 border-[#00d4aa]/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#8888aa] uppercase tracking-wider">Van ID</p>
            <p className="text-2xl font-bold text-[#e8e8f0]">{stats.vanId}</p>
            <p className="text-sm text-[#8888aa]">{stats.driver}</p>
          </div>
          <div className="text-right">
            <Badge variant={stats.status === "collecting" ? "success" : "default"} className="text-sm px-3 py-1">
              {stats.status}
            </Badge>
            <p className="text-xs text-[#8888aa] mt-1">{stats.sts}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={Truck} label="Capacity" value={`${stats.currentLoad}/${stats.capacity}t`} color="primary" />
        <StatCard icon={Gauge} label="Load" value={`${stats.loadPercent}%`} color="secondary" />
        <StatCard icon={ClipboardList} label="Today's Trips" value={`${stats.todayTrips}/${stats.maxTrips}`} color="warning" />
        <StatCard icon={Home} label="Houses Collected" value={stats.housesCollected} color="primary" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-[#e8e8f0]">
              <Map className="w-4 h-4 text-[#00d4aa]" /> Live Route · Next Pickup
            </h3>
            {nextPickup ? (
              <Badge variant="warning">{nextPickup.house}</Badge>
            ) : (
              <span className="text-xs text-[#8888aa]">All pickups done</span>
            )}
          </div>
          <MapView
            className="h-72"
            route={[
              { lat: 23.8075, lng: 90.3655 },
              { lat: 23.809, lng: 90.37 },
              { lat: 23.8105, lng: 90.371 },
            ]}
            markers={[
              { lat: 23.8075, lng: 90.3655, type: "van", label: `${stats.vanId} (you)`, sub: "Current position", pulse: true },
              ...(nextPickup
                ? [{ lat: 23.809, lng: 90.37, type: "home", label: nextPickup.house, sub: `Next pickup · ${nextPickup.distance}` }]
                : []),
              { lat: 23.8105, lng: 90.371, type: "sts", label: stats.sts, sub: "Drop-off point" },
            ]}
          />
          {nextPickup && (
            <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg border border-[#1a1a2e] bg-[#0a0a0f] p-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00d4aa]/15 text-[#00d4aa]">
                <Navigation className="h-4 w-4" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#e8e8f0]">{nextPickup.house}</p>
                <p className="text-xs text-[#8888aa]">{nextPickup.address} · {nextPickup.distance} away</p>
              </div>
              <button
                onClick={() => startRequest(nextPickup.id)}
                className="bg-[#00d4aa] text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-[#00d4aa]/80 transition-colors"
              >
                Navigate
              </button>
            </div>
          )}
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-[#e8e8f0] mb-4">Route</h3>
          <div className="space-y-3">
            {route.map((stop) => (
              <div key={stop.stop} className="flex items-center gap-3 p-2.5 bg-[#0a0a0f] rounded-lg border border-[#1a1a2e]">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  stop.status === "completed" ? "bg-[#00d4aa] text-white" :
                  stop.status === "current" ? "bg-[#6c5ce7] text-white animate-pulse" :
                  "bg-[#1a1a2e] text-[#8888aa]"
                }`}>
                  {stop.stop}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${
                    stop.status === "current" ? "text-[#e8e8f0]" : "text-[#8888aa]"
                  }`}>
                    {stop.house}
                  </p>
                  <p className="text-[10px] text-[#8888aa]">{stop.time}</p>
                </div>
                {stop.status === "current" && <Navigation className="w-4 h-4 text-[#00d4aa]" />}
                {stop.status === "completed" && <CheckCircle className="w-4 h-4 text-[#00d4aa]" />}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#e8e8f0]">Assigned Pickups</h3>
            <span className="text-xs text-[#8888aa]">{assignedRequests.filter(r => r.status === "pending").length} pending</span>
          </div>
          <div className="space-y-2.5">
            {assignedRequests.map((req) => (
              <div key={req.id} className="flex items-center gap-4 p-3 bg-[#0a0a0f] rounded-lg border border-[#1a1a2e]">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#e8e8f0]">{req.house}</span>
                    <Badge variant={getPriorityVariant(req.priority)}>{req.priority}</Badge>
                    <Badge variant={getStatusVariant(req.status)}>{req.status}</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-[#8888aa]">
                    <span>{req.address}</span>
                    <span>📍 {req.distance}</span>
                  </div>
                </div>
                {req.status === "pending" && (
                  <button
                    onClick={() => startRequest(req.id)}
                    className="bg-[#00d4aa] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#00d4aa]/80 transition-colors"
                  >
                    Start
                  </button>
                )}
                {req.status === "in-progress" && (
                  <button
                    onClick={() => openWeightModal(req)}
                    className="bg-[#6c5ce7] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#6c5ce7]/80 transition-colors"
                  >
                    Complete & Weigh
                  </button>
                )}
                {req.status === "completed" && <CheckCircle className="w-4 h-4 text-[#00d4aa]" />}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-[#e8e8f0]">
              <Send className="w-4 h-4 text-[#00d4aa]" /> Weight Submissions
            </h3>
            {notice && <span className="text-[10px] text-[#00d4aa]">{notice}</span>}
          </div>
          {submissions.length === 0 && (
            <p className="text-xs text-[#8888aa] py-4 text-center">
              Weights you submit appear here and are sent to {stats.sts}.
            </p>
          )}
          <div className="space-y-2.5">
            {submissions.map((s) => (
              <div key={s.id} className="p-3 bg-[#0a0a0f] rounded-lg border border-[#1a1a2e]">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-sm font-medium text-[#e8e8f0]">
                    <Weight className="w-3.5 h-3.5 text-[#6c5ce7]" /> {s.weight} kg
                  </span>
                  <Badge variant={getStatusVariant(s.status)}>{s.status}</Badge>
                </div>
                <p className="text-[10px] text-[#8888aa] mt-1">{s.house} · {s.time}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal
        open={!!weightModal}
        onClose={() => setWeightModal(null)}
        title={`Submit waste weight · ${weightModal?.house || ""}`}
        subtitle={`This weight is sent to ${stats.sts} for verification.`}
      >
        <form onSubmit={submitWeight} className="space-y-4">
          <div>
            <label className={labelCls}>Collected waste weight (kg)</label>
            <input
              className={inputCls}
              type="number"
              min="0"
              placeholder="e.g. 5.2"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={!weightInput}
            className="w-full bg-[#6c5ce7] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#6c5ce7]/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Submit to STS
          </button>
        </form>
      </Modal>
    </div>
  )
}
