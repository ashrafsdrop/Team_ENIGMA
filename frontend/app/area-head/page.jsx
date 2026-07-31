"use client"

import { useState } from "react"
import {
  Building2,
  Truck,
  Home,
  ClipboardList,
  CheckCircle,
  Trash2,
  Clock,
  Gauge,
  UserCog,
  Route,
  UserPlus,
  ArrowRight,
} from "lucide-react"
import { Card } from "@/components/common/Card"
import { Badge } from "@/components/common/Badge"
import { StatCard } from "@/components/common/StatCard"
import { Modal } from "@/components/common/Modal"
import { initials } from "@/utils/helpers"

const inputCls =
  "w-full rounded-lg border border-[#1a1a2e] bg-[#0a0a0f] px-3 py-2 text-sm text-[#e8e8f0] placeholder-[#55557a] focus:border-[#00d4aa]/60 focus:outline-none"
const labelCls = "mb-1 block text-xs font-medium text-[#8888aa]"

export default function AreaHeadDashboard() {
  const [stats] = useState({
    stsCount: 6,
    vanCount: 45,
    houseCount: 3240,
    pendingRequests: 18,
    completedPickups: 156,
    wasteCollected: "426",
    avgResponse: "3.8",
    fillRate: "72",
  })

  const [stsData] = useState([
    { id: 1, name: "STS Mirpur", vans: 12, fill: 78, requests: 6, status: "active" },
    { id: 2, name: "STS Gulshan", vans: 8, fill: 92, requests: 9, status: "critical" },
    { id: 3, name: "STS Dhanmondi", vans: 10, fill: 45, requests: 3, status: "active" },
    { id: 4, name: "STS Uttara", vans: 6, fill: 63, requests: 4, status: "active" },
    { id: 5, name: "STS Motijheel", vans: 9, fill: 89, requests: 7, status: "warning" },
  ])

  const [vans] = useState([
    { id: "V-012", driver: "Ali Hasan", status: "collecting", load: "65%", houses: 12, sts: "STS Mirpur" },
    { id: "V-045", driver: "Sana Khan", status: "returning", load: "100%", houses: 15, sts: "STS Gulshan" },
    { id: "V-078", driver: "Rana Mia", status: "idle", load: "0%", houses: 0, sts: "STS Dhanmondi" },
    { id: "V-034", driver: "Nadia Begum", status: "collecting", load: "40%", houses: 8, sts: "STS Mirpur" },
  ])

  const managerPool = ["Jahid Hasan", "Sumaiya Islam", "Imran Kabir", "Farhana Yasmin", "Mashrafi Chowdhury"]

  const [stsManagers, setStsManagers] = useState([
    { id: 1, sts: "STS Mirpur", manager: "Jahid Hasan" },
    { id: 2, sts: "STS Gulshan", manager: "Sumaiya Islam" },
    { id: 3, sts: "STS Dhanmondi", manager: "Imran Kabir" },
    { id: 4, sts: "STS Uttara", manager: "" },
    { id: 5, sts: "STS Motijheel", manager: "" },
  ])

  const [vanAssign, setVanAssign] = useState([
    { id: "V-012", driver: "Ali Hasan", sts: "STS Mirpur" },
    { id: "V-045", driver: "Sana Khan", sts: "STS Gulshan" },
    { id: "V-078", driver: "Rana Mia", sts: "STS Dhanmondi" },
    { id: "V-034", driver: "Nadia Begum", sts: "STS Mirpur" },
  ])

  const [draftManager, setDraftManager] = useState({})
  const [draftVanSts, setDraftVanSts] = useState({})
  const [showManagerModal, setShowManagerModal] = useState(false)
  const [newManagerName, setNewManagerName] = useState("")
  const [notice, setNotice] = useState("")

  const stsNames = stsManagers.map((s) => s.sts)

  const assignManager = (stsId) => {
    const selected = draftManager[stsId]
    if (!selected) return
    setStsManagers((prev) => prev.map((s) => (s.id === stsId ? { ...s, manager: selected } : s)))
    setNotice(`${selected} assigned to ${stsManagers.find((s) => s.id === stsId)?.sts}`)
    setDraftManager((d) => ({ ...d, [stsId]: "" }))
  }

  const assignVanSts = (vanId) => {
    const selected = draftVanSts[vanId]
    if (!selected) return
    setVanAssign((prev) => prev.map((v) => (v.id === vanId ? { ...v, sts: selected } : v)))
    setNotice(`${vanId} assigned to ${selected}`)
    setDraftVanSts((d) => ({ ...d, [vanId]: "" }))
  }

  const addManager = (e) => {
    e.preventDefault()
    if (!newManagerName.trim()) return
    setStsManagers((prev) => [
      ...prev,
      { id: Date.now(), sts: `STS ${newManagerName.trim()} Area`, manager: "" },
    ])
    setNotice(`New station added for ${newManagerName.trim()}`)
    setShowManagerModal(false)
    setNewManagerName("")
  }

  const getStatusVariant = (status) => {
    const map = { critical: "danger", warning: "warning", active: "success", idle: "default" }
    return map[status] || "default"
  }

  const getVanStatusVariant = (status) => {
    const map = { collecting: "success", returning: "warning", idle: "default" }
    return map[status] || "default"
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={Building2} label="STS Stations" value={stats.stsCount} />
        <StatCard icon={Truck} label="Vans" value={stats.vanCount} />
        <StatCard icon={Home} label="Houses" value={stats.houseCount.toLocaleString()} color="secondary" />
        <StatCard icon={ClipboardList} label="Pending Requests" value={stats.pendingRequests} color="warning" />
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={CheckCircle} label="Completed Pickups" value={stats.completedPickups} color="primary" />
        <StatCard icon={Trash2} label="Waste Collected (tons)" value={stats.wasteCollected} color="secondary" />
        <StatCard icon={Clock} label="Avg Response (hrs)" value={stats.avgResponse} color="warning" />
        <StatCard icon={Gauge} label="Fill Rate %" value={stats.fillRate} color="primary" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2">
          <h3 className="text-sm font-semibold text-[#e8e8f0] mb-4">Station Status</h3>
          <div className="space-y-3">
            {stsData.map((sts) => (
              <div key={sts.id} className="flex items-center gap-4 p-3 bg-[#0a0a0f] rounded-lg border border-[#1a1a2e]">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#e8e8f0]">{sts.name}</span>
                    <Badge variant={getStatusVariant(sts.status)}>{sts.status}</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-[#8888aa]">
                    <span>{sts.vans} vans</span>
                    <span>{sts.requests} pending requests</span>
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
          <h3 className="text-sm font-semibold text-[#e8e8f0] mb-4">Van Status</h3>
          <div className="space-y-2.5">
            {vans.map((van) => (
              <div key={van.id} className="p-3 bg-[#0a0a0f] rounded-lg border border-[#1a1a2e]">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#e8e8f0]">{van.id}</span>
                  <Badge variant={getVanStatusVariant(van.status)}>{van.status}</Badge>
                </div>
                <p className="text-xs text-[#8888aa] mt-1">{van.driver}</p>
                <div className="flex items-center justify-between mt-1.5 text-xs text-[#8888aa]">
                  <span>Load: {van.load}</span>
                  <span>{van.houses} houses</span>
                  <span>{van.sts}</span>
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
            <h3 className="text-sm font-semibold text-[#e8e8f0]">Staff & Van Assignments</h3>
          </div>
          {notice && (
            <span className="flex items-center gap-1.5 text-xs text-[#00d4aa]">
              <CheckCircle className="w-3.5 h-3.5" /> {notice}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-[#e8e8f0]">STS Managers</h4>
              <button
                onClick={() => setShowManagerModal(true)}
                className="flex items-center gap-1.5 bg-[#6c5ce7] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#6c5ce7]/80 transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" /> Add Station
              </button>
            </div>
            <div className="space-y-2.5">
              {stsManagers.map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-3 bg-[#0a0a0f] rounded-lg border border-[#1a1a2e]">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#e8e8f0]">{s.sts}</p>
                    <p className="text-xs text-[#8888aa]">
                      {s.manager ? `Manager: ${s.manager}` : "No manager assigned"}
                    </p>
                  </div>
                  <select
                    className="rounded-lg border border-[#1a1a2e] bg-[#0a0a0f] px-2 py-1.5 text-xs text-[#e8e8f0] focus:border-[#00d4aa]/60 focus:outline-none"
                    value={draftManager[s.id] || ""}
                    onChange={(e) => setDraftManager((d) => ({ ...d, [s.id]: e.target.value }))}
                  >
                    <option value="">Pick manager</option>
                    {managerPool
                      .filter((m) => !stsManagers.some((x) => x.manager === m) || s.manager === m)
                      .map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                  </select>
                  <button
                    onClick={() => assignManager(s.id)}
                    disabled={!draftManager[s.id]}
                    className="flex items-center gap-1 bg-[#00d4aa] text-white px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-[#00d4aa]/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Assign
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h4 className="flex items-center gap-1.5 text-sm font-semibold text-[#e8e8f0]">
                <Route className="w-4 h-4 text-[#00d4aa]" /> Vans → STS
              </h4>
              <span className="text-xs text-[#8888aa]">{vanAssign.length} vans</span>
            </div>
            <div className="space-y-2.5">
              {vanAssign.map((v) => (
                <div key={v.id} className="flex items-center gap-3 p-3 bg-[#0a0a0f] rounded-lg border border-[#1a1a2e]">
                  <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#00d4aa]/15 text-[10px] font-bold text-[#00d4aa]">
                    {initials(v.driver)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#e8e8f0]">{v.id}</p>
                    <p className="text-xs text-[#8888aa]">{v.driver} · {v.sts}</p>
                  </div>
                  <select
                    className="rounded-lg border border-[#1a1a2e] bg-[#0a0a0f] px-2 py-1.5 text-xs text-[#e8e8f0] focus:border-[#00d4aa]/60 focus:outline-none"
                    value={draftVanSts[v.id] || ""}
                    onChange={(e) => setDraftVanSts((d) => ({ ...d, [v.id]: e.target.value }))}
                  >
                    <option value="">STS…</option>
                    {stsNames.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => assignVanSts(v.id)}
                    disabled={!draftVanSts[v.id]}
                    className="flex items-center gap-1 bg-[#6c5ce7] text-white px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-[#6c5ce7]/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ArrowRight className="w-3 h-3" /> Assign
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Modal open={showManagerModal} onClose={() => setShowManagerModal(false)} title="Add STS Station" subtitle="Register a new station in your area.">
        <form onSubmit={addManager} className="space-y-4">
          <div>
            <label className={labelCls}>STS station name</label>
            <input
              className={inputCls}
              placeholder="e.g. STS Wari"
              value={newManagerName}
              onChange={(e) => setNewManagerName(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full bg-[#6c5ce7] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#6c5ce7]/80 transition-colors">
            Add Station
          </button>
        </form>
      </Modal>
    </div>
  )
}
