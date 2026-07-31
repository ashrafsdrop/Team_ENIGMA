"use client"

import { useState } from "react"
import {
  Building2,
  Truck,
  TruckIcon,
  Warehouse,
  Home,
  Trash2,
  Clock,
  Gauge,
  MapPin,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  UserPlus,
  Landmark,
  ShieldCheck,
} from "lucide-react"
import { Card } from "@/components/common/Card"
import { Badge } from "@/components/common/Badge"
import { StatCard } from "@/components/common/StatCard"
import { Modal } from "@/components/common/Modal"
import { initials } from "@/utils/helpers"

const inputCls =
  "w-full rounded-lg border border-[#1a1a2e] bg-[#0a0a0f] px-3 py-2 text-sm text-[#e8e8f0] placeholder-[#55557a] focus:border-[#00d4aa]/60 focus:outline-none"
const labelCls = "mb-1 block text-xs font-medium text-[#8888aa]"

export default function AdminDashboard() {
  const [stats] = useState({
    totalSTS: 24,
    totalVans: 156,
    totalTrucks: 42,
    totalLandfills: 8,
    totalHouses: 12480,
    wasteCollected: "2,847",
    wasteCollectedChange: "+12.5%",
    avgWaitTime: "4.2",
    avgWaitTimeChange: "-8.3%",
    truckUtilization: "76",
    truckUtilizationChange: "+5.1%",
  })

  const [stsData] = useState([
    { id: 1, name: "STS Mirpur", location: "Mirpur-10", fill: 78, status: "active", lastPickup: "10 min ago", vans: 12 },
    { id: 2, name: "STS Gulshan", location: "Gulshan-2", fill: 92, status: "critical", lastPickup: "5 min ago", vans: 8 },
    { id: 3, name: "STS Dhanmondi", location: "Dhanmondi-27", fill: 45, status: "active", lastPickup: "25 min ago", vans: 10 },
    { id: 4, name: "STS Uttara", location: "Uttara-12", fill: 63, status: "active", lastPickup: "18 min ago", vans: 6 },
    { id: 5, name: "STS Motijheel", location: "Motijheel C/A", fill: 89, status: "warning", lastPickup: "12 min ago", vans: 9 },
    { id: 6, name: "STS Banani", location: "Banani-11", fill: 34, status: "idle", lastPickup: "45 min ago", vans: 4 },
  ])

  const [alerts] = useState([
    { id: 1, type: "critical", message: "STS Gulshan at 92% capacity - immediate dispatch needed", time: "2 min ago" },
    { id: 2, type: "warning", message: "STS Motijheel at 89% capacity - dispatch recommended", time: "5 min ago" },
    { id: 3, type: "info", message: "Van V-042 reported discrepancy at STS Mirpur", time: "12 min ago" },
    { id: 4, type: "success", message: "Truck T-018 completed landfill delivery", time: "18 min ago" },
  ])

  const zones = ["Mirpur", "Gulshan", "Dhanmondi", "Uttara", "Motijheel", "Banani"]
  const landfills = ["Landfill-1 (Matuail)", "Landfill-2 (Aminbazar)", "Landfill-3 (Gabtoli)"]

  const [areaHeads, setAreaHeads] = useState([
    { id: 1, name: "Fahim Rahman", zone: "Mirpur", status: "active" },
    { id: 2, name: "Tahmina Akter", zone: "Gulshan", status: "active" },
    { id: 3, name: "Sabbir Hossain", zone: "Uttara", status: "active" },
  ])
  const [landfillManagers, setLandfillManagers] = useState([
    { id: 1, name: "Rezaul Karim", landfill: "Landfill-1 (Matuail)", status: "active" },
    { id: 2, name: "Nasrin Sultana", landfill: "Landfill-2 (Aminbazar)", status: "active" },
  ])

  const [showAreaHeadModal, setShowAreaHeadModal] = useState(false)
  const [showLandfillModal, setShowLandfillModal] = useState(false)
  const [areaHeadForm, setAreaHeadForm] = useState({ name: "", zone: zones[0] })
  const [landfillForm, setLandfillForm] = useState({ name: "", landfill: landfills[0] })
  const [notice, setNotice] = useState("")

  const assignAreaHead = (e) => {
    e.preventDefault()
    if (!areaHeadForm.name.trim()) return
    setAreaHeads((prev) => [
      ...prev,
      { id: Date.now(), name: areaHeadForm.name.trim(), zone: areaHeadForm.zone, status: "active" },
    ])
    setNotice(`Area head ${areaHeadForm.name.trim()} assigned to ${areaHeadForm.zone}`)
    setShowAreaHeadModal(false)
    setAreaHeadForm({ name: "", zone: zones[0] })
  }

  const assignLandfillManager = (e) => {
    e.preventDefault()
    if (!landfillForm.name.trim()) return
    setLandfillManagers((prev) => [
      ...prev,
      { id: Date.now(), name: landfillForm.name.trim(), landfill: landfillForm.landfill, status: "active" },
    ])
    setNotice(`Landfill manager ${landfillForm.name.trim()} assigned to ${landfillForm.landfill}`)
    setShowLandfillModal(false)
    setLandfillForm({ name: "", landfill: landfills[0] })
  }

  const getStatusVariant = (fill) => {
    if (fill > 85) return "danger"
    if (fill > 70) return "warning"
    return "success"
  }

  const getFillColor = (fill) => {
    if (fill > 85) return "bg-[#ff6b6b]"
    if (fill > 70) return "bg-[#fdcb6e]"
    return "bg-[#00d4aa]"
  }

  const AlertIcon = ({ type }) => {
    switch (type) {
      case "critical": return <AlertCircle className="w-4 h-4 text-[#ff6b6b] mt-0.5 flex-shrink-0" />
      case "warning": return <AlertTriangle className="w-4 h-4 text-[#fdcb6e] mt-0.5 flex-shrink-0" />
      case "info": return <Info className="w-4 h-4 text-[#6c5ce7] mt-0.5 flex-shrink-0" />
      case "success": return <CheckCircle className="w-4 h-4 text-[#00d4aa] mt-0.5 flex-shrink-0" />
      default: return null
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={Building2} label="Total STS" value={stats.totalSTS} />
        <StatCard icon={Truck} label="Total Vans" value={stats.totalVans} />
        <StatCard icon={TruckIcon} label="Total Trucks" value={stats.totalTrucks} />
        <StatCard icon={Warehouse} label="Landfills" value={stats.totalLandfills} />
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={Home} label="Houses" value={stats.totalHouses.toLocaleString()} color="secondary" />
        <StatCard
          icon={Trash2}
          label="Waste Collected (tons)"
          value={stats.wasteCollected}
          change={stats.wasteCollectedChange}
          changeType="up"
          color="primary"
        />
        <StatCard
          icon={Clock}
          label="Avg Wait Time (hrs)"
          value={stats.avgWaitTime}
          change={stats.avgWaitTimeChange}
          changeType="down"
          color="warning"
        />
        <StatCard
          icon={Gauge}
          label="Truck Utilization %"
          value={stats.truckUtilization}
          change={stats.truckUtilizationChange}
          changeType="up"
          color="secondary"
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#e8e8f0]">STS Station Status</h3>
            <button className="text-xs text-[#00d4aa] hover:text-[#00d4aa]/80 transition-colors">View All →</button>
          </div>
          <div className="space-y-3">
            {stsData.map((sts) => (
              <div key={sts.id} className="flex items-center gap-4 p-3 bg-[#0a0a0f] rounded-lg border border-[#1a1a2e]">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#e8e8f0]">{sts.name}</span>
                    <Badge variant={getStatusVariant(sts.fill)}>{sts.status}</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-[#8888aa]">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{sts.location}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{sts.lastPickup}</span>
                    <span className="flex items-center gap-1"><Truck className="w-3 h-3" />{sts.vans} vans</span>
                  </div>
                </div>
                <div className="w-32">
                  <div className="flex justify-between text-xs text-[#8888aa] mb-1">
                    <span>Fill</span>
                    <span className="font-medium text-[#e8e8f0]">{sts.fill}%</span>
                  </div>
                  <div className="h-1.5 bg-[#1a1a2e] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${getFillColor(sts.fill)}`} style={{ width: `${sts.fill}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#e8e8f0]">Recent Alerts</h3>
            <span className="text-xs text-[#8888aa]">Live</span>
          </div>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-3 bg-[#0a0a0f] rounded-lg border border-[#1a1a2e]">
                <div className="flex items-start gap-2.5">
                  <AlertIcon type={alert.type} />
                  <div>
                    <p className="text-xs text-[#e8e8f0] leading-relaxed">{alert.message}</p>
                    <p className="text-[10px] text-[#8888aa] mt-1">{alert.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#00d4aa]" />
            <h3 className="text-sm font-semibold text-[#e8e8f0]">Personnel Assignments</h3>
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
              <h4 className="text-sm font-semibold text-[#e8e8f0]">Area Heads</h4>
              <button
                onClick={() => setShowAreaHeadModal(true)}
                className="flex items-center gap-1.5 bg-[#00d4aa] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#00d4aa]/80 transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" /> Assign Area Head
              </button>
            </div>
            <div className="space-y-2.5">
              {areaHeads.length === 0 && (
                <p className="text-xs text-[#8888aa] py-4 text-center">No area heads assigned yet.</p>
              )}
              {areaHeads.map((ah) => (
                <div key={ah.id} className="flex items-center gap-3 p-3 bg-[#0a0a0f] rounded-lg border border-[#1a1a2e]">
                  <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#6c5ce7]/15 text-[10px] font-bold text-[#6c5ce7]">
                    {initials(ah.name)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#e8e8f0]">{ah.name}</p>
                    <p className="flex items-center gap-1 text-xs text-[#8888aa]">
                      <MapPin className="w-3 h-3" /> {ah.zone}
                    </p>
                  </div>
                  <Badge variant="success">{ah.status}</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-[#e8e8f0]">Landfill Managers</h4>
              <button
                onClick={() => setShowLandfillModal(true)}
                className="flex items-center gap-1.5 bg-[#6c5ce7] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#6c5ce7]/80 transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" /> Assign Manager
              </button>
            </div>
            <div className="space-y-2.5">
              {landfillManagers.length === 0 && (
                <p className="text-xs text-[#8888aa] py-4 text-center">No landfill managers assigned yet.</p>
              )}
              {landfillManagers.map((lm) => (
                <div key={lm.id} className="flex items-center gap-3 p-3 bg-[#0a0a0f] rounded-lg border border-[#1a1a2e]">
                  <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#ff6b6b]/15 text-[10px] font-bold text-[#ff6b6b]">
                    {initials(lm.name)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#e8e8f0]">{lm.name}</p>
                    <p className="flex items-center gap-1 text-xs text-[#8888aa]">
                      <Landmark className="w-3 h-3" /> {lm.landfill}
                    </p>
                  </div>
                  <Badge variant="success">{lm.status}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Modal open={showAreaHeadModal} onClose={() => setShowAreaHeadModal(false)} title="Assign Area Head" subtitle="Assign an area head to manage a city zone.">
        <form onSubmit={assignAreaHead} className="space-y-4">
          <div>
            <label className={labelCls}>Full name</label>
            <input
              className={inputCls}
              placeholder="e.g. Fahim Rahman"
              value={areaHeadForm.name}
              onChange={(e) => setAreaHeadForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelCls}>Zone</label>
            <select
              className={inputCls}
              value={areaHeadForm.zone}
              onChange={(e) => setAreaHeadForm((f) => ({ ...f, zone: e.target.value }))}
            >
              {zones.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="w-full bg-[#00d4aa] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#00d4aa]/80 transition-colors">
            Assign Area Head
          </button>
        </form>
      </Modal>

      <Modal open={showLandfillModal} onClose={() => setShowLandfillModal(false)} title="Assign Landfill Manager" subtitle="Assign a manager to oversee a landfill site.">
        <form onSubmit={assignLandfillManager} className="space-y-4">
          <div>
            <label className={labelCls}>Full name</label>
            <input
              className={inputCls}
              placeholder="e.g. Rezaul Karim"
              value={landfillForm.name}
              onChange={(e) => setLandfillForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelCls}>Landfill site</label>
            <select
              className={inputCls}
              value={landfillForm.landfill}
              onChange={(e) => setLandfillForm((f) => ({ ...f, landfill: e.target.value }))}
            >
              {landfills.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="w-full bg-[#6c5ce7] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#6c5ce7]/80 transition-colors">
            Assign Manager
          </button>
        </form>
      </Modal>
    </div>
  )
}
