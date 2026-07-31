"use client"

import { useState, useEffect } from "react"
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
import { initials, apiRequest } from "@/utils/helpers"

const inputCls =
  "w-full rounded-lg border border-[#1a1a2e] bg-[#0a0a0f] px-3 py-2 text-sm text-[#e8e8f0] placeholder-[#55557a] focus:border-[#00d4aa]/60 focus:outline-none"
const labelCls = "mb-1 block text-xs font-medium text-[#8888aa]"

export default function AreaHeadDashboard() {
  const [stats, setStats] = useState({
    stsCount: 0,
    vanCount: 0,
    houseCount: 0,
    pendingRequests: 0,
    completedPickups: 0,
    wasteCollected: "—",
    avgResponse: "—",
    fillRate: "—",
  })

  const [stsData, setStsData] = useState([])
  const [vans, setVans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const [stsList, vansList, requestsList, managersList] = await Promise.all([
          apiRequest("/sts/", { auth: true }),
          apiRequest("/vans/", { auth: true }),
          apiRequest("/waste-requests/", { auth: true }),
          apiRequest("/users/?role=sts_manager", { auth: true }).catch(() => []),
        ])

        if (!mounted) return

        const mappedSts = (stsList || []).map((s) => {
          const vansCount = (s.vans && s.vans.length) || 0
          const fill = s.capacity_tonnes ? Math.round((s.current_fill_tonnes / s.capacity_tonnes) * 100) : 0

          const areaId = s.area_details && s.area_details.id
          const requests = (requestsList || []).filter(
            (r) => r.area === areaId && r.status === "pending"
          ).length

          const status = fill > 90 ? "critical" : fill > 70 ? "warning" : "active"

          return {
            id: s.id,
            name: s.name,
            vans: vansCount,
            fill,
            requests,
            status,
            raw: s,
          }
        })

        setStsData(mappedSts)
        // populate manager pool from API
        setManagerPool((managersList || []).map((m) => ({ id: m.id, name: m.full_name || m.username })))
        // initialize managers list based on fetched STS and known managers
        setStsManagers(mappedSts.map((s) => {
          const mgr = (managersList || []).find((m) => String(m.id) === String(s.raw.manager))
          return { id: s.id, sts: s.name, manager: mgr ? (mgr.full_name || mgr.username) : (s.raw.manager_username || '') || '' }
        }))

        setVans((vansList || []).slice(0, 10).map((v) => ({
          id: v.id,
          reg: v.registration_number,
          driver: v.driver_name || "-",
          status: v.status,
          load: v.current_load_kg ? `${Math.round((v.current_load_kg / Math.max(v.capacity_kg || 1, 1)) * 100)}%` : "0%",
          houses: 0,
          sts: v.sts_details ? v.sts_details.name : "-",
        })))

        setStats((prev) => ({
          ...prev,
          stsCount: (stsList || []).length,
          vanCount: (vansList || []).length,
          pendingRequests: (requestsList || []).filter((r) => r.status === "pending").length,
        }))
      } catch (err) {
        // keep existing static UI if API fails
        console.error("Failed to load area-head data:", err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [])

  const [managerPool, setManagerPool] = useState([])

  const [stsManagers, setStsManagers] = useState([])

  // van list comes from API in `vans` state; no separate vanAssign state needed

  const [draftManager, setDraftManager] = useState({})
  const [draftVanSts, setDraftVanSts] = useState({})
  const [showManagerModal, setShowManagerModal] = useState(false)
  const [newManagerName, setNewManagerName] = useState("")
  const [notice, setNotice] = useState("")

  const stsNames = stsManagers.map((s) => s.sts)

  const assignManager = async (stsId) => {
    const selectedId = draftManager[stsId]
    if (!selectedId) return
    try {
      const res = await apiRequest(`/sts/${stsId}/assign_manager/`, { method: 'POST', body: { manager_id: selectedId }, auth: true })
      const mgrObj = managerPool.find((m) => String(m.id) === String(selectedId))
      setStsManagers((prev) => prev.map((s) => (s.id === stsId ? { ...s, manager: mgrObj ? mgrObj.name : (res.manager_username || '') } : s)))
      setNotice(`${mgrObj ? mgrObj.name : selectedId} assigned to ${res.name || stsManagers.find((s) => s.id === stsId)?.sts}`)
      setDraftManager((d) => ({ ...d, [stsId]: "" }))
    } catch (err) {
      console.error('Failed to assign manager', err)
      setNotice('Failed to assign manager')
    }
  }

  const assignVanSts = async (vanPk) => {
    const selectedStsId = draftVanSts[vanPk]
    if (!selectedStsId) return
    try {
      const res = await apiRequest(`/vans/${vanPk}/assign_sts/`, { method: 'POST', body: { sts_id: selectedStsId }, auth: true })
      const stsObj = stsData.find((s) => String(s.id) === String(selectedStsId))
      setVans((prev) => prev.map((v) => (v.id === vanPk ? { ...v, sts: stsObj ? stsObj.name : v.sts } : v)))
      setNotice(`${res.registration_number || vanPk} assigned to ${stsObj ? stsObj.name : selectedStsId}`)
      setDraftVanSts((d) => ({ ...d, [vanPk]: "" }))
    } catch (err) {
      console.error('Failed to assign van to STS', err)
      setNotice('Failed to assign van')
    }
  }

  const addManager = async (e) => {
    e.preventDefault()
    if (!newManagerName.trim()) return
    try {
      // create STS with sensible defaults
      const name = `STS ${newManagerName.trim()} Area`
      const res = await apiRequest('/sts/', { method: 'POST', body: { name, capacity_tonnes: 100.0, latitude: 0.0, longitude: 0.0 }, auth: true })
      // update local lists
      setStsManagers((prev) => [...prev, { id: res.id, sts: res.name, manager: '' }])
      setStsData((prev) => [...prev, { id: res.id, name: res.name, vans: 0, fill: 0, requests: 0, status: 'active', raw: res }])
      setNotice(`New station added: ${res.name}`)
      setShowManagerModal(false)
      setNewManagerName("")
    } catch (err) {
      console.error('Failed to add station', err)
      setNotice('Failed to add station')
    }
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
                      .filter((m) => !stsManagers.some((x) => x.manager === m.name) || s.manager === m.name)
                      .map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
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
              <span className="text-xs text-[#8888aa]">{vans.length} vans</span>
            </div>
            <div className="space-y-2.5">
              {vans.map((v) => (
                <div key={v.id} className="flex items-center gap-3 p-3 bg-[#0a0a0f] rounded-lg border border-[#1a1a2e]">
                  <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#00d4aa]/15 text-[10px] font-bold text-[#00d4aa]">
                    {initials(v.driver)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#e8e8f0]">{v.reg}</p>
                    <p className="text-xs text-[#8888aa]">{v.driver} · {v.sts}</p>
                  </div>
                  <select
                    className="rounded-lg border border-[#1a1a2e] bg-[#0a0a0f] px-2 py-1.5 text-xs text-[#e8e8f0] focus:border-[#00d4aa]/60 focus:outline-none"
                    value={draftVanSts[v.id] || ""}
                    onChange={(e) => setDraftVanSts((d) => ({ ...d, [v.id]: e.target.value }))}
                  >
                    <option value="">STS…</option>
                    {stsData.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
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
