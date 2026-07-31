"use client"

import { useState } from "react"
import {
  ClipboardList,
  CheckCircle,
  Clock,
  Calendar,
  Plus,
  Camera,
  ImagePlus,
  Upload,
  Map,
  Navigation,
  Sparkles,
} from "lucide-react"
import { Card } from "@/components/common/Card"
import { Badge } from "@/components/common/Badge"
import { StatCard } from "@/components/common/StatCard"
import { Modal } from "@/components/common/Modal"
import { Map as MapView } from "@/components/common/Map"

const inputCls =
  "w-full rounded-lg border border-[#1a1a2e] bg-[#0a0a0f] px-3 py-2 text-sm text-[#e8e8f0] placeholder-[#55557a] focus:border-[#00d4aa]/60 focus:outline-none"

export default function HouseOwnerDashboard() {
  const [stats] = useState({
    house: "House #42, Block A",
    location: "Mirpur-10, Dhaka",
    totalRequests: 12,
    completedPickups: 11,
    pendingPickups: 1,
    nextPickup: "Today, 10:45 AM",
    status: "scheduled",
  })

  const [nearestVan] = useState({
    id: "V-012",
    driver: "Ali Hasan",
    distance: "0.4 km",
    eta: "5 min",
    load: "65%",
  })

  const [requests] = useState([
    { id: 1, date: "Today", time: "10:45 AM", status: "scheduled", waste: "5.2 kg", driver: "Ali Hasan", van: "V-012" },
    { id: 2, date: "Yesterday", time: "2:30 PM", status: "completed", waste: "4.8 kg", driver: "Sana Khan", van: "V-045" },
    { id: 3, date: "2 days ago", time: "11:15 AM", status: "completed", waste: "6.1 kg", driver: "Ali Hasan", van: "V-012" },
    { id: 4, date: "3 days ago", time: "9:00 AM", status: "completed", waste: "3.9 kg", driver: "Rana Mia", van: "V-078" },
    { id: 5, date: "4 days ago", time: "4:20 PM", status: "completed", waste: "5.5 kg", driver: "Nadia Begum", van: "V-034" },
  ])

  const [photo, setPhoto] = useState(null)
  const [reportNote, setReportNote] = useState("")
  const [reports, setReports] = useState([])
  const [notice, setNotice] = useState("")
  const [mapOpen, setMapOpen] = useState(false)

  const onPhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhoto(reader.result)
    reader.readAsDataURL(file)
  }

  const submitReport = (e) => {
    e.preventDefault()
    if (!photo) return
    setReports((prev) => [
      {
        id: Date.now(),
        photo,
        note: reportNote,
        status: "queued",
        time: new Date().toLocaleString(),
      },
      ...prev,
    ])
    setNotice("Photo submitted — ML analysis will run soon")
    setPhoto(null)
    setReportNote("")
  }

  const getStatusVariant = (status) => {
    const map = { scheduled: "info", completed: "success", pending: "warning", queued: "info" }
    return map[status] || "default"
  }

  return (
    <div className="p-6 space-y-6">
      <Card className="bg-gradient-to-r from-[#00d4aa]/10 to-[#6c5ce7]/10 border-[#00d4aa]/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#8888aa] uppercase tracking-wider">House</p>
            <p className="text-xl font-bold text-[#e8e8f0]">{stats.house}</p>
            <p className="text-sm text-[#8888aa]">{stats.location}</p>
          </div>
          <div className="text-right">
            <Badge variant={stats.status === "scheduled" ? "success" : "default"} className="text-sm px-3 py-1">
              {stats.status}
            </Badge>
            <p className="text-xs text-[#8888aa] mt-1">Next: {stats.nextPickup}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={ClipboardList} label="Total Requests" value={stats.totalRequests} color="secondary" />
        <StatCard icon={CheckCircle} label="Completed" value={stats.completedPickups} color="primary" />
        <StatCard icon={Clock} label="Pending" value={stats.pendingPickups} color="warning" />
        <StatCard icon={Calendar} label="Next Pickup" value="Today" color="primary" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-[#e8e8f0]">
              <Camera className="w-4 h-4 text-[#00d4aa]" /> Report Waste with Photo
            </h3>
            {notice && (
              <span className="flex items-center gap-1.5 text-xs text-[#00d4aa]">
                <CheckCircle className="w-3.5 h-3.5" /> {notice}
              </span>
            )}
          </div>
          <form onSubmit={submitReport} className="space-y-4">
            <label className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#2a2a45] bg-[#0a0a0f] p-8 cursor-pointer hover:border-[#00d4aa]/50 transition-colors">
              {photo ? (
                <img
                  src={photo}
                  alt="Uploaded waste preview"
                  className="max-h-48 rounded-lg border border-[#1a1a2e] object-cover"
                />
              ) : (
                <>
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#00d4aa]/10 text-[#00d4aa]">
                    <ImagePlus className="h-6 w-6" />
                  </span>
                  <span className="text-sm font-medium text-[#e8e8f0]">Tap to upload a photo of your waste</span>
                  <span className="text-xs text-[#8888aa]">JPG or PNG · The photo is analyzed by our ML model</span>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={onPhotoChange} />
            </label>
            {photo && (
              <button
                type="button"
                onClick={() => setPhoto(null)}
                className="text-xs text-[#ff6b6b] hover:text-[#ff6b6b]/80 transition-colors"
              >
                Remove photo
              </button>
            )}
            <input
              className={inputCls}
              placeholder="Note (optional) — e.g. 2 bags of organic waste"
              value={reportNote}
              onChange={(e) => setReportNote(e.target.value)}
            />
            <button
              type="submit"
              disabled={!photo}
              className="flex w-full items-center justify-center gap-2 bg-[#00d4aa] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#00d4aa]/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Upload className="w-4 h-4" /> Submit Report
            </button>
          </form>

          <div className="mt-5 flex items-center gap-2 rounded-lg border border-[#6c5ce7]/20 bg-[#6c5ce7]/10 p-3">
            <Sparkles className="w-4 h-4 flex-none text-[#6c5ce7]" />
            <p className="text-xs text-[#8888aa]">
              <span className="font-medium text-[#e8e8f0]">ML model coming soon:</span> submitted photos will be
              analyzed automatically to classify waste type and estimate weight.
            </p>
          </div>

          {reports.length > 0 && (
            <div className="mt-5 space-y-2.5">
              {reports.map((r) => (
                <div key={r.id} className="flex items-center gap-3 p-3 bg-[#0a0a0f] rounded-lg border border-[#1a1a2e]">
                  <img src={r.photo} alt="Report" className="h-12 w-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#e8e8f0]">{r.note || "Waste photo report"}</p>
                    <p className="text-xs text-[#8888aa]">{r.time}</p>
                  </div>
                  <Badge variant={getStatusVariant(r.status)}>queued for ML</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold text-[#e8e8f0]">
                <Navigation className="w-4 h-4 text-[#00d4aa]" /> Nearest Van
              </h3>
              <Badge variant="success">online</Badge>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-[#0a0a0f] rounded-lg border border-[#1a1a2e]">
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[#6c5ce7]/15 text-xs font-bold text-[#6c5ce7]">
                  {nearestVan.id}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#e8e8f0]">{nearestVan.driver}</p>
                  <p className="text-xs text-[#8888aa]">Load {nearestVan.load}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="rounded-lg border border-[#1a1a2e] bg-[#0a0a0f] p-3">
                  <p className="text-lg font-bold text-[#00d4aa]">{nearestVan.distance}</p>
                  <p className="text-[10px] text-[#8888aa] uppercase tracking-wide">Away</p>
                </div>
                <div className="rounded-lg border border-[#1a1a2e] bg-[#0a0a0f] p-3">
                  <p className="text-lg font-bold text-[#00d4aa]">{nearestVan.eta}</p>
                  <p className="text-[10px] text-[#8888aa] uppercase tracking-wide">ETA</p>
                </div>
              </div>
              <button
                onClick={() => setMapOpen(true)}
                className="flex w-full items-center justify-center gap-2 bg-[#6c5ce7] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#6c5ce7]/80 transition-colors"
              >
                <Map className="w-4 h-4" /> View on map
              </button>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-4">
            <button className="p-4 bg-[#111118] border border-[#1a1a2e] rounded-xl hover:border-[#00d4aa]/50 transition-all text-center group">
              <div className="w-10 h-10 rounded-full bg-[#00d4aa]/10 mx-auto flex items-center justify-center group-hover:bg-[#00d4aa]/20 transition-colors">
                <Plus className="w-5 h-5 text-[#00d4aa]" />
              </div>
              <p className="text-xs font-medium text-[#e8e8f0] mt-2">Request Pickup</p>
            </button>
            <button className="p-4 bg-[#111118] border border-[#1a1a2e] rounded-xl hover:border-[#6c5ce7]/50 transition-all text-center group">
              <div className="w-10 h-10 rounded-full bg-[#6c5ce7]/10 mx-auto flex items-center justify-center group-hover:bg-[#6c5ce7]/20 transition-colors">
                <Calendar className="w-5 h-5 text-[#6c5ce7]" />
              </div>
              <p className="text-xs font-medium text-[#e8e8f0] mt-2">Schedule</p>
            </button>
          </div>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[#e8e8f0]">Pickup History</h3>
          <button className="flex items-center gap-1.5 text-xs text-[#00d4aa] hover:text-[#00d4aa]/80 transition-colors">
            <Plus className="w-3.5 h-3.5" /> New Request
          </button>
        </div>
        <div className="space-y-3">
          {requests.map((req) => (
            <div key={req.id} className="flex items-center gap-4 p-3 bg-[#0a0a0f] rounded-lg border border-[#1a1a2e]">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#e8e8f0]">{req.date}</span>
                  <Badge variant={getStatusVariant(req.status)}>{req.status}</Badge>
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-[#8888aa]">
                  <span>{req.time}</span>
                  <span>{req.waste}</span>
                  <span>{req.driver}</span>
                  <span>{req.van}</span>
                </div>
              </div>
              {req.status === "scheduled" && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#00d4aa]">Upcoming</span>
                  <span className="w-2 h-2 rounded-full bg-[#00d4aa] animate-pulse" />
                </div>
              )}
              {req.status === "completed" && <CheckCircle className="w-4 h-4 text-[#00d4aa]" />}
            </div>
          ))}
        </div>
      </Card>

      <Modal open={mapOpen} onClose={() => setMapOpen(false)} title="Nearest van" subtitle="Your house and the closest collection van." wide>
        <MapView
          className="h-80"
          route={[
            { lat: 23.806, lng: 90.37 },
            { lat: 23.808, lng: 90.368 },
          ]}
          markers={[
            { lat: 23.806, lng: 90.37, type: "van", label: `${nearestVan.id} · ${nearestVan.driver}`, sub: `${nearestVan.distance} away`, pulse: true },
            { lat: 23.808, lng: 90.368, type: "home", label: "Your house", sub: stats.location },
          ]}
        />
        <div className="mt-4 flex items-center justify-between rounded-lg border border-[#1a1a2e] bg-[#0a0a0f] p-3">
          <div>
            <p className="text-sm font-medium text-[#e8e8f0]">Estimated arrival</p>
            <p className="text-xs text-[#8888aa]">{nearestVan.eta} · {nearestVan.distance} away</p>
          </div>
          <button className="bg-[#00d4aa] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#00d4aa]/80 transition-colors">
            Track van
          </button>
        </div>
      </Modal>
    </div>
  )
}
