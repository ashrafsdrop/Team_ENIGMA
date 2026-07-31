"use client"

import { useState, useEffect } from "react"
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
  Loader2,
} from "lucide-react"
import { Card } from "@/components/common/Card"
import { Badge } from "@/components/common/Badge"
import { StatCard } from "@/components/common/StatCard"
import { apiRequest, timeAgo } from "@/utils/helpers"

const inputCls =
  "w-24 rounded-lg border border-[#1a1a2e] bg-[#0a0a0f] px-2 py-1.5 text-xs text-[#e8e8f0] placeholder-[#55557a] focus:border-[#00d4aa]/60 focus:outline-none"

export default function STSManagerDashboard() {
  const [loading, setLoading] = useState(true)
  
  const [stats, setStats] = useState({
    totalCapacity: 80.0,
    currentFill: 0.0,
    fillPercent: 0,
    vansInArea: 0,
    activeVans: 0,
    idleVans: 0,
    pendingRequests: 0,
    todayPickups: 0,
    wasteStored: 0.0,
    maxTrips: 0,
    tripsUsed: 0,
  })

  const [stsId, setStsId] = useState(null)
  const [requests, setRequests] = useState([])
  const [vans, setVans] = useState([])
  const [arrivals, setArrivals] = useState([])
  const [notice, setNotice] = useState("")
  const [measuredWeights, setMeasuredWeights] = useState({})
  const [selectedVanForRequest, setSelectedVanForRequest] = useState({})

  const fetchData = async () => {
    try {
      setLoading(true)
      // 1. Get STS Data (assuming the first STS belongs to manager for hackathon)
      const stsData = await apiRequest("/sts/")
      if (stsData && stsData.length > 0) {
         const mySts = stsData[0]
         setStsId(mySts.id)
         const capacity = mySts.capacity_tonnes || 80
         const fill = mySts.current_fill_tonnes || 0
         
         // 2. Get Vans
         const allVans = await apiRequest("/vans/")
         const myVans = allVans.filter(v => v.sts === mySts.id)
         setVans(myVans)
         
         const active = myVans.filter(v => v.status !== 'idle').length
         const idle = myVans.filter(v => v.status === 'idle').length
         const maxT = myVans.reduce((sum, v) => sum + (v.max_trips_per_day || 2), 0)
         const usedT = myVans.reduce((sum, v) => sum + (v.trips_today || 0), 0)

         // 3. Get Requests
         const allReqs = await apiRequest("/waste-requests/")
         // For demo, filter requests belonging to this STS's area
         const myReqs = allReqs.filter(r => r.area === mySts.area)
         setRequests(myReqs)
         
         const pending = myReqs.filter(r => r.status === 'pending').length
         const collected = myReqs.filter(r => r.status === 'collected').length

         // 4. Get Dump Requests (Arrivals)
         const allDumps = await apiRequest("/dump-requests/")
         const myDumps = allDumps.filter(d => d.sts === mySts.id && d.status === 'pending')
         setArrivals(myDumps)

         setStats({
           totalCapacity: capacity,
           currentFill: fill,
           fillPercent: Math.round((fill / capacity) * 100) || 0,
           vansInArea: myVans.length,
           activeVans: active,
           idleVans: idle,
           pendingRequests: pending,
           todayPickups: collected,
           wasteStored: fill,
           maxTrips: maxT,
           tripsUsed: usedT,
         })
      }
    } catch(e) {
      console.error("Dashboard fetch error:", e)
      setNotice("Failed to load dashboard data.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const assignRequest = async (reqId, vanId) => {
    if (!vanId) {
      setNotice("Please select a van first")
      return
    }
    
    try {
      await apiRequest(`/waste-requests/${reqId}/assign_van/`, {
         method: "POST",
         body: { van_id: parseInt(vanId) }
      })
      setNotice(`Assigned Van to request #${reqId}`)
      fetchData() // Refresh everything
    } catch(e) {
      console.error(e)
      setNotice(e.data?.error || "Failed to assign van")
    }
  }

  const setMeasured = (id, value) => {
    setMeasuredWeights(prev => ({...prev, [id]: value}))
  }

  const approveArrival = async (dumpId) => {
    const val = measuredWeights[dumpId]
    if (!val || isNaN(val)) {
      setNotice("Please enter a valid measured weight.")
      return
    }
    try {
      const res = await apiRequest(`/dump-requests/${dumpId}/verify/`, {
        method: "POST",
        body: { actual_weight_kg: parseFloat(val) }
      })
      setNotice(res.message || "Arrival approved and verified!")
      fetchData()
    } catch(e) {
      console.error(e)
      setNotice(e.data?.error || "Failed to verify arrival.")
    }
  }

  const requestTruck = async () => {
    if (!stsId) return
    try {
       await apiRequest("/waste-transfers/", {
         method: "POST",
         body: {
           sts: stsId,
           requested_tonnes: stats.currentFill,
         }
       })
       setNotice("Truck dispatch request sent to Landfill Manager!")
       fetchData()
    } catch(e) {
       console.error(e)
       setNotice(e.data?.error || "Failed to request truck.")
    }
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

  if (loading) {
     return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#00d4aa]" /></div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={Building2} label="STS Capacity" value={`${stats.currentFill.toFixed(1)}/${stats.totalCapacity.toFixed(1)}t`} color="primary" />
        <StatCard icon={Gauge} label="Fill Level" value={`${stats.fillPercent}%`} color="secondary" />
        <StatCard icon={Truck} label="Active Vans" value={`${stats.activeVans}/${stats.vansInArea}`} color="primary" />
        <StatCard icon={ClipboardList} label="Pending Requests" value={stats.pendingRequests} color="warning" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={CheckCircle} label="Today's Pickups" value={stats.todayPickups} color="primary" />
        <StatCard icon={Trash2} label="Waste Stored (tons)" value={stats.wasteStored.toFixed(1)} color="secondary" />
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
                onClick={requestTruck}
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
            {arrivals.length === 0 ? (
               <p className="text-xs text-[#8888aa] text-center p-4">No pending van arrivals.</p>
            ) : arrivals.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center gap-4 p-3 bg-[#0a0a0f] rounded-lg border border-[#1a1a2e]">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#e8e8f0]">Dump #{a.id}</span>
                    <Badge variant={getStatusVariant(a.status)}>{a.status}</Badge>
                  </div>
                  <p className="text-xs text-[#8888aa] mt-1">Van ID: {a.van}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-[#55557a] uppercase tracking-wide">Reported</p>
                  <p className="text-sm font-semibold text-[#e8e8f0]">{a.declared_weight_kg} kg</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#55557a] uppercase tracking-wide mb-1">Measured</p>
                  <div className="flex items-center gap-1.5">
                    <input
                      className={inputCls}
                      type="number"
                      placeholder="kg"
                      value={measuredWeights[a.id] || ""}
                      onChange={(e) => setMeasured(a.id, e.target.value)}
                    />
                    <span className="text-xs text-[#8888aa]">kg</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => approveArrival(a.id)}
                    className="flex items-center gap-1 bg-[#00d4aa] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#00d4aa]/80 transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[10px] text-[#55557a]">
            Approving checks the measured weight against the driver-reported weight (±5kg tolerance). Discrepancies are flagged automatically.
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#e8e8f0]">Pickup Requests</h3>
          </div>
          <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-2">
            {requests.length === 0 ? (
               <p className="text-xs text-[#8888aa] text-center p-4">No active pickup requests.</p>
            ) : requests.map((req) => (
              <div key={req.id} className="flex items-center gap-4 p-3 bg-[#0a0a0f] rounded-lg border border-[#1a1a2e]">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#e8e8f0]">{req.user} <span className="text-xs text-[#8888aa] ml-1">#{req.id}</span></span>
                    <Badge variant={getStatusVariant(req.status)}>{req.status}</Badge>
                  </div>
                  <p className="text-xs text-[#8888aa] mt-1">{timeAgo(req.created_at)}</p>
                </div>
                <div className="text-right flex items-center gap-4">
                   <p className="text-xs font-medium text-[#e8e8f0]">{req.weight} kg</p>
                   {req.status === "pending" && (
                     <div className="flex items-center gap-2">
                       <select 
                         className="bg-[#1a1a2e] text-[#e8e8f0] border border-[#2a2a40] rounded-lg text-xs px-2 py-1.5 focus:outline-none focus:border-[#00d4aa]/60"
                         value={selectedVanForRequest[req.id] || ""}
                         onChange={(e) => setSelectedVanForRequest(prev => ({...prev, [req.id]: e.target.value}))}
                       >
                         <option value="">Select Van...</option>
                         {vans.filter(v => v.status === "idle").map(v => (
                           <option key={v.id} value={v.id}>{v.registration_number}</option>
                         ))}
                       </select>
                       <button
                         onClick={() => assignRequest(req.id, selectedVanForRequest[req.id])}
                         className="bg-[#00d4aa] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#00d4aa]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                         disabled={!selectedVanForRequest[req.id]}
                       >
                         Assign
                       </button>
                     </div>
                   )}
                   {req.driver && <span className="text-[10px] text-[#8888aa] bg-[#1a1a2e] px-2 py-1 rounded">Driver #{req.driver}</span>}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-[#e8e8f0] mb-4">Fleet Status</h3>
          <div className="space-y-2.5">
            {vans.length === 0 ? (
               <p className="text-xs text-[#8888aa] text-center p-4">No vans assigned to this STS.</p>
            ) : vans.map((van) => (
              <div key={van.id} className="p-3 bg-[#0a0a0f] rounded-lg border border-[#1a1a2e]">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#e8e8f0]">{van.registration_number}</span>
                  <Badge variant={getStatusVariant(van.status)}>{van.status}</Badge>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-[#8888aa]">
                  <span>Load: {van.current_load_kg}/{van.capacity_kg}kg</span>
                  <span>{van.trips_today}/{van.max_trips_per_day} trips</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
