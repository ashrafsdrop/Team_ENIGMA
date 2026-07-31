"use client"

import { useState } from "react"
import {
  Building2,
  TruckIcon,
  Send,
  Trash2,
  Clock,
  Gauge,
  UserCog,
  Inbox,
  CheckCircle,
  XCircle,
  ArrowRight,
} from "lucide-react"
import { Card } from "@/components/common/Card"
import { Badge } from "@/components/common/Badge"
import { StatCard } from "@/components/common/StatCard"
import { initials } from "@/utils/helpers"

const inputCls =
  "rounded-lg border border-[#1a1a2e] bg-[#0a0a0f] px-2 py-1.5 text-xs text-[#e8e8f0] focus:border-[#00d4aa]/60 focus:outline-none"

export default function LandfillManagerDashboard() {
  const [stats] = useState({
    totalSTS: 24,
    activeTrucks: 18,
    idleTrucks: 6,
    todayDispatches: 34,
    wasteReceived: "1,284",
    capacityUsed: "68",
    avgTurnaround: "2.4",
  })

  const [stsList] = useState([
    { id: 1, name: "STS Mirpur", fill: 78, status: "active", trucks: 3, dispatches: 12, lastDispatch: "5 min ago" },
    { id: 2, name: "STS Gulshan", fill: 92, status: "critical", trucks: 5, dispatches: 18, lastDispatch: "2 min ago" },
    { id: 3, name: "STS Dhanmondi", fill: 45, status: "active", trucks: 2, dispatches: 8, lastDispatch: "15 min ago" },
    { id: 4, name: "STS Motijheel", fill: 89, status: "warning", trucks: 4, dispatches: 15, lastDispatch: "8 min ago" },
  ])

  const [trucks] = useState([
    { id: "T-018", driver: "Rahim Khan", status: "moving", load: "8.2", capacity: "12.0", eta: "22 min", hoursDriven: 6 },
    { id: "T-042", driver: "Karim Ali", status: "loading", load: "6.5", capacity: "10.0", eta: "10 min", hoursDriven: 4 },
    { id: "T-023", driver: "Sufian Ahmed", status: "idle", load: "0", capacity: "14.0", eta: "-", hoursDriven: 2 },
    { id: "T-056", driver: "Mizanur Rahman", status: "moving", load: "11.2", capacity: "12.0", eta: "35 min", hoursDriven: 7 },
    { id: "T-009", driver: "Shakib Hossain", status: "returning", load: "0", capacity: "10.0", eta: "18 min", hoursDriven: 5 },
  ])

  const driverPool = ["Rahim Khan", "Karim Ali", "Sufian Ahmed", "Mizanur Rahman", "Shakib Hossain", "Imran Hossain", "Akash Talukder"]

  const [truckAssign, setTruckAssign] = useState([
    { id: "T-018", driver: "Rahim Khan" },
    { id: "T-042", driver: "Karim Ali" },
    { id: "T-023", driver: "Sufian Ahmed" },
    { id: "T-056", driver: "Mizanur Rahman" },
    { id: "T-009", driver: "" },
  ])

  const [truckRequests, setTruckRequests] = useState([
    { id: 1, from: "STS Gulshan", note: "STS at 92% fill - truck needed ASAP", time: "2 min ago", status: "pending" },
    { id: 2, from: "STS Motijheel", note: "89% fill - dispatch recommended", time: "8 min ago", status: "pending" },
    { id: 3, from: "STS Mirpur", note: "78% fill - routine dispatch", time: "15 min ago", status: "pending" },
  ])

  const [draftDriver, setDraftDriver] = useState({})
  const [notice, setNotice] = useState("")

  const assignDriver = (truckId) => {
    const selected = draftDriver[truckId]
    if (!selected) return
    setTruckAssign((prev) => prev.map((t) => (t.id === truckId ? { ...t, driver: selected } : t)))
    setNotice(`Driver ${selected} assigned to ${truckId}`)
    setDraftDriver((d) => ({ ...d, [truckId]: "" }))
  }

  const approveRequest = (id) => {
    setTruckRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "approved" } : r)))
    const req = truckRequests.find((r) => r.id === id)
    setNotice(`Truck dispatched to ${req?.from || "STS"} for ${req?.from || "this STS"}`)
  }

  const rejectRequest = (id) => {
    setTruckRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "rejected" } : r)))
  }

  const getStatusVariant = (status) => {
    const map = { moving: "success", loading: "warning", returning: "info", idle: "default" }
    return map[status] || "default"
  }

  const getBadgeVariant = (status) => {
    const map = { critical: "danger", warning: "warning", active: "success" }
    return map[status] || "default"
  }

  const getReqVariant = (status) => {
    const map = { pending: "warning", approved: "success", rejected: "danger" }
    return map[status] || "default"
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={Building2} label="STS Stations" value={stats.totalSTS} />
        <StatCard icon={TruckIcon} label="Active Trucks" value={stats.activeTrucks} change="+3 today" changeType="up" color="primary" />
        <StatCard icon={Send} label="Today's Dispatches" value={stats.todayDispatches} />
        <StatCard icon={Trash2} label="Waste Received (tons)" value={stats.wasteReceived} color="secondary" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={Clock} label="Avg Turnaround (hrs)" value={stats.avgTurnaround} color="warning" />
        <StatCard icon={Gauge} label="Landfill Capacity %" value={stats.capacityUsed} color="secondary" />
        <StatCard icon={TruckIcon} label="Idle Trucks" value={stats.idleTrucks} color="danger" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#e8e8f0]">STS Station Status</h3>
            <button className="text-xs bg-[#00d4aa] text-white px-3 py-1.5 rounded-lg hover:bg-[#00d4aa]/80 transition-colors">
              Dispatch Truck
            </button>
          </div>
          <div className="space-y-3">
            {stsList.map((sts) => (
              <div key={sts.id} className="flex items-center gap-4 p-3 bg-[#0a0a0f] rounded-lg border border-[#1a1a2e]">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#e8e8f0]">{sts.name}</span>
                    <Badge variant={getBadgeVariant(sts.status)}>{sts.status}</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-[#8888aa]">
                    <span>{sts.trucks} trucks</span>
                    <span>{sts.dispatches} dispatches today</span>
                    <span>Last: {sts.lastDispatch}</span>
                  </div>
                </div>
                <div className="w-32">
                  <div className="flex justify-between text-xs text-[#8888aa] mb-1">
                    <span>Fill</span>
                    <span className="font-medium text-[#e8e8f0]">{sts.fill}%</span>
                  </div>
                  <div className="h-1.5 bg-[#1a1a2e] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${sts.fill > 85 ? "bg-[#ff6b6b]" : sts.fill > 70 ? "bg-[#fdcb6e]" : "bg-[#00d4aa]"}`}
                      style={{ width: `${sts.fill}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#e8e8f0]">Truck Status</h3>
            <span className="text-xs text-[#8888aa]">Live</span>
          </div>
          <div className="space-y-2.5">
            {trucks.map((truck) => (
              <div key={truck.id} className="p-3 bg-[#0a0a0f] rounded-lg border border-[#1a1a2e]">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-[#e8e8f0]">{truck.id}</span>
                    <p className="text-xs text-[#8888aa]">{truck.driver}</p>
                  </div>
                  <Badge variant={getStatusVariant(truck.status)}>{truck.status}</Badge>
                </div>
                <div className="flex items-center justify-between mt-1.5 text-xs text-[#8888aa]">
                  <span>{truck.load}/{truck.capacity}t</span>
                  <span>{truck.eta}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{truck.hoursDriven}h</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <UserCog className="w-4 h-4 text-[#00d4aa]" />
            <h3 className="text-sm font-semibold text-[#e8e8f0]">Truck Fleet Management</h3>
          </div>
          {notice && (
            <span className="flex items-center gap-1.5 text-xs text-[#00d4aa]">
              <CheckCircle className="w-3.5 h-3.5" /> {notice}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Card>
            <h4 className="text-sm font-semibold text-[#e8e8f0] mb-4">Assign Truck Drivers</h4>
            <div className="space-y-2.5">
              {truckAssign.map((t) => (
                <div key={t.id} className="flex items-center gap-3 p-3 bg-[#0a0a0f] rounded-lg border border-[#1a1a2e]">
                  <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#4a9eff]/15 text-[10px] font-bold text-[#4a9eff]">
                    {t.driver ? initials(t.driver) : "—"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#e8e8f0]">{t.id}</p>
                    <p className="text-xs text-[#8888aa]">{t.driver || "No driver assigned"}</p>
                  </div>
                  <select
                    className={inputCls}
                    value={draftDriver[t.id] || ""}
                    onChange={(e) => setDraftDriver((d) => ({ ...d, [t.id]: e.target.value }))}
                  >
                    <option value="">Pick driver</option>
                    {driverPool
                      .filter((m) => !truckAssign.some((x) => x.driver === m) || t.driver === m)
                      .map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                  </select>
                  <button
                    onClick={() => assignDriver(t.id)}
                    disabled={!draftDriver[t.id]}
                    className="flex items-center gap-1 bg-[#00d4aa] text-white px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-[#00d4aa]/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ArrowRight className="w-3 h-3" /> Assign
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h4 className="flex items-center gap-1.5 text-sm font-semibold text-[#e8e8f0]">
                <Inbox className="w-4 h-4 text-[#fdcb6e]" /> Truck Requests (from STS)
              </h4>
              <Badge variant="warning">{truckRequests.filter((r) => r.status === "pending").length} pending</Badge>
            </div>
            <div className="space-y-2.5">
              {truckRequests.length === 0 && (
                <p className="text-xs text-[#8888aa] py-4 text-center">No requests right now.</p>
              )}
              {truckRequests.map((r) => (
                <div key={r.id} className="p-3 bg-[#0a0a0f] rounded-lg border border-[#1a1a2e]">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#e8e8f0]">{r.from}</span>
                    <Badge variant={getReqVariant(r.status)}>{r.status}</Badge>
                  </div>
                  <p className="text-xs text-[#8888aa] mt-1">{r.note}</p>
                  <div className="flex items-center justify-between mt-2.5">
                    <span className="text-[10px] text-[#55557a]">{r.time}</span>
                    {r.status === "pending" && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => approveRequest(r.id)}
                          className="flex items-center gap-1 bg-[#00d4aa] text-white px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-[#00d4aa]/80 transition-colors"
                        >
                          <CheckCircle className="w-3 h-3" /> Approve
                        </button>
                        <button
                          onClick={() => rejectRequest(r.id)}
                          className="flex items-center gap-1 bg-[#1a1a2e] text-[#ff6b6b] px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-[#ff6b6b]/15 transition-colors"
                        >
                          <XCircle className="w-3 h-3" /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
