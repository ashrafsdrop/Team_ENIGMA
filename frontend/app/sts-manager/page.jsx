"use client"

import { useState } from "react"
import {
  Building2,
  Truck,
  ClipboardList,
  CheckCircle,
  Trash2,
  Gauge,
  AlertTriangle,
  Scale,
  Flag,
} from "lucide-react"
import { Card } from "@/components/common/Card"
import { Badge } from "@/components/common/Badge"
import { StatCard } from "@/components/common/StatCard"

const inputCls =
  "w-24 rounded-lg border border-[#1a1a2e] bg-[#0a0a0f] px-2 py-1.5 text-xs text-[#e8e8f0] placeholder-[#55557a] focus:border-[#00d4aa]/60 focus:outline-none"

export default function STSManagerDashboard() {
  const [stats] = useState({
    totalCapacity: "80.0",
    currentFill: "62.0",
    fillPercent: 78,
    vansInArea: 12,
    activeVans: 8,
    idleVans: 4,
    pendingRequests: 18,
    todayPickups: 42,
    wasteStored: "49.6",
    maxTrips: 24,
    tripsUsed: 18,
  })

  const [requests, setRequests] = useState([
    { id: 1, house: "House #42, Block A", status: "pending", time: "5 min ago", priority: "high" },
    { id: 2, house: "House #87, Block B", status: "pending", time: "12 min ago", priority: "medium" },
    { id: 3, house: "House #23, Block C", status: "assigned", time: "8 min ago", priority: "high", van: "V-012" },
    { id: 4, house: "House #56, Block A", status: "pending", time: "18 min ago", priority: "low" },
    { id: 5, house: "House #34, Block B", status: "in-progress", time: "3 min ago", priority: "high", van: "V-045" },
  ])

  const [vans, setVans] = useState([
    { id: "V-012", driver: "Ali Hasan", status: "collecting", load: "65%", houses: 12, trips: 2 },
    { id: "V-045", driver: "Sana Khan", status: "returning", load: "100%", houses: 15, trips: 1 },
    { id: "V-078", driver: "Rana Mia", status: "idle", load: "0%", houses: 0, trips: 0 },
    { id: "V-034", driver: "Nadia Begum", status: "collecting", load: "40%", houses: 8, trips: 1 },
  ])

  const [arrivals, setArrivals] = useState([
    { id: 1, van: "V-012", driver: "Ali Hasan", reported: 220, measured: "", status: "pending", note: "" },
    { id: 2, van: "V-045", driver: "Sana Khan", reported: 310, measured: "", status: "pending", note: "" },
    { id: 3, van: "V-034", driver: "Nadia Begum", reported: 185, measured: "", status: "pending", note: "" },
  ])

  const [notice, setNotice] = useState("")

  const assignRequest = (id) => {
    const idleVan = vans.find((v) => v.status === "idle")
    if (!idleVan) {
      setNotice("No idle van available to assign")
      return
    }
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "assigned", van: idleVan.id } : r)))
    setVans((prev) =>
      prev.map((v) =>
        v.id === idleVan.id
          ? { ...v, status: "collecting", load: "25%", houses: v.houses + 1, trips: v.trips + 1 }
          : v
      )
    )
    setNotice(`${idleVan.id} assigned to ${requests.find((r) => r.id === id)?.house}`)
  }

  const setMeasured = (id, value) =>
    setArrivals((prev) => prev.map((a) => (a.id === id ? { ...a, measured: value } : a)))

  const approveArrival = (id) => {
    setArrivals((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a
        const m = a.measured !== "" ? Number(a.measured) : NaN
        if (!Number.isFinite(m)) {
          return { ...a, status: "flagged", note: "Measured weight required" }
        }
        const diff = Math.abs(m - a.reported) / a.reported
        return diff <= 0.1
          ? { ...a, status: "verified", note: `Weight verified — ${m} kg` }
          : { ...a, status: "flagged", note: `Δ ${(diff * 100).toFixed(1)}% off reported ${a.reported} kg` }
      })
    )
    setNotice(`Van arrival reviewed`)
  }

  const flagArrival = (id) => {
    setArrivals((prev) => prev.map((a) => (a.id === id ? { ...a, status: "flagged", note: "Weight flagged for manual review" } : a)))
    setNotice(`Van ${arrivals.find((a) => a.id === id)?.van} flagged`)
  }

  const getStatusVariant = (status) => {
    const map = {
      pending: "warning",
      assigned: "info",
      "in-progress": "success",
      collecting: "success",
      returning: "warning",
      idle: "default",
      verified: "success",
      flagged: "danger",
    }
    return map[status] || "default"
  }

  const getPriorityVariant = (priority) => {
    const map = { high: "danger", medium: "warning", low: "default" }
    return map[priority] || "default"
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={Building2} label="STS Capacity" value={`${stats.currentFill}/${stats.totalCapacity}t`} color="primary" />
        <StatCard icon={Gauge} label="Fill Level" value={`${stats.fillPercent}%`} color="secondary" />
        <StatCard icon={Truck} label="Active Vans" value={`${stats.activeVans}/${stats.vansInArea}`} color="primary" />
        <StatCard icon={ClipboardList} label="Pending Requests" value={stats.pendingRequests} color="warning" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={CheckCircle} label="Today's Pickups" value={stats.todayPickups} color="primary" />
        <StatCard icon={Trash2} label="Waste Stored (tons)" value={stats.wasteStored} color="secondary" />
        <StatCard icon={Truck} label="Trips Used Today" value={`${stats.tripsUsed}/${stats.maxTrips}`} color="warning" />
      </div>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[#e8e8f0]">STS Fill Level</h3>
          <span className="text-sm font-medium text-[#e8e8f0]">{stats.fillPercent}%</span>
        </div>
        <div className="h-3 bg-[#1a1a2e] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${stats.fillPercent > 85 ? "bg-[#ff6b6b]" : stats.fillPercent > 70 ? "bg-[#fdcb6e]" : "bg-[#00d4aa]"}`}
            style={{ width: `${stats.fillPercent}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-[#8888aa]">
          <span>0%</span>
          <span className="text-[#fdcb6e]">70% Warning</span>
          <span className="text-[#ff6b6b]">85% Critical</span>
          <span>100%</span>
        </div>
        {stats.fillPercent > 70 && (
          <div className="mt-4 p-3 bg-[#fdcb6e]/10 border border-[#fdcb6e]/20 rounded-lg flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 text-[#fdcb6e] flex-shrink-0" />
            <p className="text-xs text-[#e8e8f0]">
              {stats.fillPercent > 85
                ? "⚠️ CRITICAL: STS near full capacity. Request truck dispatch immediately!"
                : "⚠️ WARNING: STS filling up. Consider requesting a truck."}
            </p>
            {stats.fillPercent > 70 && (
              <button
                onClick={() => setNotice("Truck dispatch request sent to Landfill Manager")}
                className="ml-auto bg-[#00d4aa] text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-[#00d4aa]/80 transition-colors"
              >
                Request Truck
              </button>
            )}
          </div>
        )}
      </Card>

      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#00d4aa]" />
            <h3 className="text-sm font-semibold text-[#e8e8f0]">Van Arrivals · Weight Check</h3>
          </div>
          {notice && (
            <span className="flex items-center gap-1.5 text-xs text-[#00d4aa]">
              <CheckCircle className="w-3.5 h-3.5" /> {notice}
            </span>
          )}
        </div>
        <Card>
          <div className="space-y-3">
            {arrivals.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center gap-4 p-3 bg-[#0a0a0f] rounded-lg border border-[#1a1a2e]">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#e8e8f0]">{a.van}</span>
                    <Badge variant={getStatusVariant(a.status)}>{a.status}</Badge>
                  </div>
                  <p className="text-xs text-[#8888aa] mt-1">{a.driver}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-[#55557a] uppercase tracking-wide">Reported</p>
                  <p className="text-sm font-semibold text-[#e8e8f0]">{a.reported} kg</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#55557a] uppercase tracking-wide mb-1">Measured</p>
                  <div className="flex items-center gap-1.5">
                    <input
                      className={inputCls}
                      type="number"
                      placeholder="kg"
                      value={a.measured}
                      disabled={a.status !== "pending"}
                      onChange={(e) => setMeasured(a.id, e.target.value)}
                    />
                    <span className="text-xs text-[#8888aa]">kg</span>
                  </div>
                </div>
                {a.status === "pending" ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => approveArrival(a.id)}
                      className="flex items-center gap-1 bg-[#00d4aa] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#00d4aa]/80 transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => flagArrival(a.id)}
                      className="flex items-center gap-1 bg-[#1a1a2e] text-[#ff6b6b] px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#ff6b6b]/15 transition-colors"
                    >
                      <Flag className="w-3.5 h-3.5" /> Flag
                    </button>
                  </div>
                ) : (
                  a.note && <p className="text-xs text-[#8888aa]">{a.note}</p>
                )}
              </div>
            ))}
          </div>
          <p className="mt-3 text-[10px] text-[#55557a]">
            Approving checks the measured weight against the driver-reported weight (±10%). Discrepancies are flagged automatically.
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#e8e8f0]">Pickup Requests</h3>
            <button className="text-xs text-[#00d4aa] hover:text-[#00d4aa]/80 transition-colors">View All →</button>
          </div>
          <div className="space-y-2.5">
            {requests.map((req) => (
              <div key={req.id} className="flex items-center gap-4 p-3 bg-[#0a0a0f] rounded-lg border border-[#1a1a2e]">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#e8e8f0]">{req.house}</span>
                    <Badge variant={getPriorityVariant(req.priority)}>{req.priority}</Badge>
                    <Badge variant={getStatusVariant(req.status)}>{req.status}</Badge>
                  </div>
                  <p className="text-xs text-[#8888aa] mt-1">{req.time}</p>
                </div>
                {req.status === "pending" && (
                  <button
                    onClick={() => assignRequest(req.id)}
                    className="bg-[#00d4aa] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#00d4aa]/80 transition-colors"
                  >
                    Assign
                  </button>
                )}
                {req.van && <span className="text-xs text-[#8888aa]">Van {req.van}</span>}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-[#e8e8f0] mb-4">Vans</h3>
          <div className="space-y-2.5">
            {vans.map((van) => (
              <div key={van.id} className="p-3 bg-[#0a0a0f] rounded-lg border border-[#1a1a2e]">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#e8e8f0]">{van.id}</span>
                  <Badge variant={getStatusVariant(van.status)}>{van.status}</Badge>
                </div>
                <p className="text-xs text-[#8888aa] mt-1">{van.driver}</p>
                <div className="flex items-center justify-between mt-1.5 text-xs text-[#8888aa]">
                  <span>Load: {van.load}</span>
                  <span>{van.houses} houses</span>
                  <span>{van.trips}/2 trips</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
