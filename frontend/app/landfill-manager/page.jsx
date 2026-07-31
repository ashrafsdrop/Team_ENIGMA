"use client"

import { useState, useEffect } from "react"
import {
  Building2,
  TruckIcon,
  Send,
  Trash2,
  Clock,
  Gauge,
  Inbox,
  CheckCircle,
  ArrowRight,
} from "lucide-react"
import { Card } from "@/components/common/Card"
import { Badge } from "@/components/common/Badge"
import { StatCard } from "@/components/common/StatCard"
import { apiRequest, timeAgo } from "@/utils/helpers"

export default function LandfillManagerDashboard() {
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState("")

  const [landfill, setLandfill] = useState(null)
  const [stats, setStats] = useState({
    totalSTS: 0,
    activeTrucks: 0,
    idleTrucks: 0,
    todayDispatches: 0,
    wasteReceived: "0",
    capacityUsed: "0",
  })

  const [stsList, setStsList] = useState([])
  const [trucks, setTrucks] = useState([])
  const [transfers, setTransfers] = useState([])
  const [selectedTruckForRequest, setSelectedTruckForRequest] = useState({})
  const [suggestionsMap, setSuggestionsMap] = useState({})
  const [suggestionsLoading, setSuggestionsLoading] = useState({})

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // 1. Get Landfill
      const lfData = await apiRequest("/landfills/", { auth: true })
      if (!lfData || lfData.length === 0) {
        setLoading(false)
        return
      }
      const myLf = lfData[0]
      setLandfill(myLf)

      // 2. Get Trucks
      const allTrucks = await apiRequest("/trucks/", { auth: true })
      const myTrucks = allTrucks.filter(t => t.landfill === myLf.id)
      setTrucks(myTrucks)

      // 3. Get STS List
      const allSts = await apiRequest("/sts/", { auth: true })
      setStsList(allSts)

      // 4. Get Waste Transfers
      const allTransfers = await apiRequest("/waste-transfers/", { auth: true })
      setTransfers(allTransfers.reverse())

      // Calc stats
      setStats({
        totalSTS: allSts.length,
        activeTrucks: myTrucks.filter(t => t.status !== "idle").length,
        idleTrucks: myTrucks.filter(t => t.status === "idle").length,
        todayDispatches: allTransfers.filter(t => t.status !== "requested").length,
        wasteReceived: "N/A", // Hard to calculate without full history, keep simple
        capacityUsed: "N/A",
      })

    } catch (e) {
      console.error("Failed to load dashboard data", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const assignTruck = async (transferId, truckId) => {
    if (!truckId) {
      setNotice("Please select a truck first")
      return
    }
    
    try {
      await apiRequest(`/waste-transfers/${transferId}/assign_truck/`, {
        method: "POST",
        body: { truck_id: parseInt(truckId) },
        auth: true,
      })
      setNotice(`Assigned Truck to transfer #${transferId}`)
      fetchData()
    } catch(e) {
      console.error(e)
      setNotice(e.data?.error || "Failed to assign truck")
    }
  }

  const fetchSuggestions = async (transferId) => {
    try {
      setSuggestionsLoading((s) => ({ ...s, [transferId]: true }))
      const res = await apiRequest(`/waste-transfers/${transferId}/suggest_trucks/`, { auth: true })
      setSuggestionsMap((s) => ({ ...s, [transferId]: res }))
    } catch (e) {
      console.error('Failed to fetch suggestions', e)
      setSuggestionsMap((s) => ({ ...s, [transferId]: [] }))
    } finally {
      setSuggestionsLoading((s) => ({ ...s, [transferId]: false }))
    }
  }
  
  const receiveTruck = async (transferId, expectedLoad) => {
    try {
      // In a real app, a weight bridge would measure this. Here we simulate.
      await apiRequest(`/waste-transfers/${transferId}/receive_truck/`, {
        method: "POST",
        body: { weight_arriving_landfill: expectedLoad },
        auth: true,
      })
      setNotice(`Truck arrived and weight verified for transfer #${transferId}`)
      fetchData()
    } catch(e) {
      console.error(e)
      setNotice(e.data?.error || "Failed to receive truck")
    }
  }

  const dispatchTruck = async (transferId, requestedTonnes) => {
    try {
      await apiRequest(`/waste-transfers/${transferId}/dispatch_truck/`, {
        method: "POST",
        body: { weight_leaving_sts: requestedTonnes },
        auth: true,
      })
      setNotice(`Truck dispatched back to Landfill for transfer #${transferId}`)
      fetchData()
    } catch(e) {
      console.error(e)
      setNotice(e.data?.error || "Failed to dispatch truck")
    }
  }

  const getStatusVariant = (status) => {
    const map = { moving: "success", loading: "warning", returning: "info", idle: "default" }
    return map[status] || "default"
  }

  const getReqVariant = (status) => {
    const map = { requested: "warning", truck_assigned: "info", in_transit: "success", received: "default" }
    return map[status] || "default"
  }

  if (loading) {
    return <div className="p-6 text-[#e8e8f0] animate-pulse">Loading Landfill data...</div>
  }

  if (!landfill) {
    return <div className="p-6 text-[#ff6b6b]">No Landfill found for this manager. Seed the database!</div>
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-[#e8e8f0]">{landfill.name}</h2>
          <p className="text-xs text-[#8888aa]">Landfill Logistics Dashboard</p>
        </div>
        {notice && (
          <span className="flex items-center gap-1.5 text-xs text-[#00d4aa] bg-[#00d4aa]/10 px-3 py-1.5 rounded-lg border border-[#00d4aa]/20">
            <CheckCircle className="w-4 h-4" /> {notice}
          </span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={Building2} label="STS Stations" value={stats.totalSTS} />
        <StatCard icon={TruckIcon} label="Active Trucks" value={stats.activeTrucks} color="primary" />
        <StatCard icon={Send} label="Today's Dispatches" value={stats.todayDispatches} />
        <StatCard icon={TruckIcon} label="Idle Trucks" value={stats.idleTrucks} color="warning" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#e8e8f0]">STS Station Status</h3>
          </div>
          <div className="space-y-3">
            {stsList.map((sts) => {
              const fillPercent = Math.round((sts.current_fill_tonnes / sts.capacity_tonnes) * 100)
              let statusLabel = "active"
              let statusVariant = "success"
              if (fillPercent > 85) { statusLabel = "critical"; statusVariant = "danger" }
              else if (fillPercent > 70) { statusLabel = "warning"; statusVariant = "warning" }
              
              return (
                <div key={sts.id} className="flex items-center gap-4 p-3 bg-[#0a0a0f] rounded-lg border border-[#1a1a2e]">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#e8e8f0]">{sts.name}</span>
                      <Badge variant={statusVariant}>{statusLabel}</Badge>
                    </div>
                  </div>
                  <div className="w-48">
                    <div className="flex justify-between text-xs text-[#8888aa] mb-1">
                      <span>Fill Level</span>
                      <span className="font-medium text-[#e8e8f0]">{sts.current_fill_tonnes}t / {sts.capacity_tonnes}t</span>
                    </div>
                    <div className="h-1.5 bg-[#1a1a2e] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${fillPercent > 85 ? "bg-[#ff6b6b]" : fillPercent > 70 ? "bg-[#fdcb6e]" : "bg-[#00d4aa]"}`}
                        style={{ width: `${Math.min(fillPercent, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#e8e8f0]">Fleet Status</h3>
            <span className="text-xs text-[#8888aa]">Live</span>
          </div>
          <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {trucks.map((truck) => (
              <div key={truck.id} className="p-3 bg-[#0a0a0f] rounded-lg border border-[#1a1a2e]">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-[#e8e8f0]">{truck.registration_number}</span>
                    <p className="text-[10px] text-[#8888aa]">Driver: {truck.driver_name || "Unassigned"}</p>
                  </div>
                  <Badge variant={getStatusVariant(truck.status)}>{truck.status}</Badge>
                </div>
                <div className="flex items-center justify-between mt-1.5 text-[10px] text-[#8888aa]">
                  <span>{truck.current_load_tonnes}/{truck.capacity_tonnes}t load</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{truck.hours_driven_today}h today</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div>
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h4 className="flex items-center gap-1.5 text-sm font-semibold text-[#e8e8f0]">
              <Inbox className="w-4 h-4 text-[#fdcb6e]" /> Truck Requests & Active Transfers
            </h4>
          </div>
          <div className="space-y-3">
            {transfers.length === 0 && (
              <p className="text-xs text-[#8888aa] py-4 text-center">No transfers right now.</p>
            )}
            {transfers.map((r) => (
              <div key={r.id} className="p-4 bg-[#0a0a0f] rounded-lg border border-[#1a1a2e] flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-[#e8e8f0]">{r.sts_name}</span>
                    <p className="text-xs text-[#8888aa] mt-0.5">Requested {r.requested_tonnes}t dispatch</p>
                  </div>
                  <Badge variant={getReqVariant(r.status)}>{r.status.replace("_", " ")}</Badge>
                </div>
                
                <div className="flex items-center justify-between bg-[#1a1a2e] p-2 rounded-lg mt-2">
                  <span className="text-[10px] text-[#8888aa]">{timeAgo(r.created_at)}</span>
                  
                  {r.status === "requested" && (
                    <div className="flex items-center gap-2">
                      <select 
                        className="bg-[#0a0a0f] text-[#e8e8f0] border border-[#2a2a40] rounded-lg text-xs px-2 py-1.5 focus:outline-none focus:border-[#00d4aa]/60"
                        value={selectedTruckForRequest[r.id] || ""}
                        onChange={(e) => setSelectedTruckForRequest(prev => ({...prev, [r.id]: e.target.value}))}
                      >
                        <option value="">Select Truck...</option>
                        {trucks.filter(t => t.status === "idle").map(t => (
                          <option key={t.id} value={t.id}>{t.registration_number} (Cap: {t.capacity_tonnes}t)</option>
                        ))}
                      </select>
                      <button
                        onClick={() => assignTruck(r.id, selectedTruckForRequest[r.id])}
                        disabled={!selectedTruckForRequest[r.id]}
                        className="flex items-center gap-1 bg-[#00d4aa] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#00d4aa]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle className="w-3 h-3" /> Assign Truck
                      </button>
                      <button
                        onClick={() => fetchSuggestions(r.id)}
                        className="flex items-center gap-1 bg-[#6c5ce7] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#6c5ce7]/80 transition-colors"
                      >
                        Suggest Trucks
                      </button>
                    </div>
                  )}

                  {r.status === "truck_assigned" && (
                     <button
                        onClick={() => dispatchTruck(r.id, r.requested_tonnes)}
                        className="flex items-center gap-1 bg-[#fdcb6e] text-[#1a1a2e] px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#fdcb6e]/80 transition-colors"
                      >
                        <TruckIcon className="w-3 h-3" /> Simulate STS Dispatch
                      </button>
                  )}

                  {r.status === "in_transit" && (
                     <button
                        onClick={() => receiveTruck(r.id, r.weight_leaving_sts)}
                        className="flex items-center gap-1 bg-[#4a9eff] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#4a9eff]/80 transition-colors"
                      >
                        <ArrowRight className="w-3 h-3" /> Mark Arrived & Verify
                      </button>
                  )}
                  {suggestionsMap[r.id] && suggestionsMap[r.id].length > 0 && (
                    <div className="mt-2 w-full bg-[#0b0b10] border border-[#222233] rounded-lg p-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-[#8888aa]">Suggested Trucks</span>
                        <span className="text-[10px] text-[#55557a]">Sorted by fuel</span>
                      </div>
                      {suggestionsMap[r.id].slice(0,3).map((sug) => (
                        <div key={sug.truck_id} className="flex items-center justify-between p-2 rounded-lg hover:bg-[#0a0a0f]">
                          <div className="text-xs">
                            <div className="font-medium text-[#e8e8f0]">{sug.registration_number} · {sug.capacity_tonnes}t</div>
                            <div className="text-[10px] text-[#8888aa]">Fuel est: {sug.estimated_fuel_liters}L · {sug.distance_km}km</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => assignTruck(r.id, sug.truck_id)} className="text-xs bg-[#00d4aa] text-black px-2 py-1 rounded-lg">Assign</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {suggestionsLoading[r.id] && (
                    <div className="text-xs text-[#8888aa] mt-2">Loading suggestions…</div>
                  )}
                  
                  {["truck_assigned", "received", "flagged"].includes(r.status) && (
                    <span className="text-xs text-[#e8e8f0] font-medium">
                      Truck: {(trucks.find(t => t.id === r.truck) || {}).registration_number || r.truck_reg || "N/A"}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
