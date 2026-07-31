"use client"

import { useState, useEffect, useRef } from "react"
import { apiRequest, timeAgo } from "@/utils/helpers"
import { Upload, Loader2, CheckCircle2, Clock, Calendar, MapPin, ClipboardList, Sparkles, Image as ImageIcon } from "lucide-react"
import Badge from "@/components/common/Badge"

export default function HouseOwnerDashboard({ active }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [nearestVan, setNearestVan] = useState(null)
  const [userLocation, setUserLocation] = useState({ lat: 23.8103, lng: 90.4125 })
  
  // File upload state
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [note, setNote] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef(null)

  const fetchRequests = async () => {
    try {
      const data = await apiRequest("/waste-requests/")
      // Sort newest first
      setRequests(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
    } catch (err) {
      console.error("Failed to fetch requests", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371
      const dLat = (lat2 - lat1) * Math.PI / 180
      const dLon = (lon2 - lon1) * Math.PI / 180
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2)
      return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)))
    }

    const fetchVans = async (uLat, uLng) => {
       try {
         const data = await apiRequest("/vans/")
         if (data && data.length > 0) {
            let closest = null
            let minDistance = Infinity
            data.forEach(van => {
              if (van.sts_details && van.sts_details.latitude) {
                 const dist = calculateDistance(uLat, uLng, van.sts_details.latitude, van.sts_details.longitude)
                 if (dist < minDistance) {
                    minDistance = dist
                    closest = van
                 }
              }
            })
            if (closest) {
               setNearestVan({
                 id: closest.registration_number,
                 driver: closest.driver_name || "Unassigned",
                 distance: minDistance.toFixed(1),
                 eta: Math.max(1, Math.round((minDistance / 20) * 60)), // 20km/h avg speed
                 load: Math.round((closest.current_load_kg / closest.capacity_kg) * 100) || 0,
               })
            }
         }
       } catch (e) {
         console.error("Failed to fetch vans", e)
       }
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
         (pos) => {
            setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
            fetchVans(pos.coords.latitude, pos.coords.longitude)
         },
         () => fetchVans(23.8103, 90.4125),
         { timeout: 5000 }
      )
    } else {
      fetchVans(23.8103, 90.4125)
    }
  }, [])

  const total = requests.length
  const completed = requests.filter(r => r.status === 'collected').length
  const pending = requests.filter(r => r.status === 'pending').length

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (selected) {
      setFile(selected)
      setPreview(URL.createObjectURL(selected))
    }
  }

  const handleSubmitReport = async (e) => {
    e.preventDefault()

    setSubmitting(true)
    
    const lat = userLocation.lat.toString()
    const lng = userLocation.lng.toString()

    const formData = new FormData()
    if (file) {
      formData.append("image", file)
    }
    formData.append("latitude", lat)
    formData.append("longitude", lng)
    
    try {
      await apiRequest("/waste-requests/", {
        method: "POST",
        body: formData,
      })
      
      setFile(null)
      setPreview(null)
      setNote("")
      fetchRequests()
    } catch (err) {
      console.error(err)
      alert("Failed to submit report. Ensure backend is running and API key is valid.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto pb-10">
      {/* Header Banner */}
      <div className="mb-6 rounded-2xl bg-card border border-border p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1 font-semibold">HOUSE</p>
          <h2 className="text-xl font-bold text-foreground">House #42, Block A</h2>
          <p className="text-sm text-muted-foreground">Mirpur-10, Dhaka</p>
        </div>
        <div className="sm:text-right flex sm:flex-col items-center sm:items-end gap-3">
          <Badge variant="info">scheduled</Badge>
          <p className="text-xs text-muted-foreground">Next: Today, 10:45 AM</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground mb-4">Total Requests</p>
          <p className="text-3xl font-bold">{total}</p>
        </div>
        
        <div className="rounded-2xl border border-indigo-500/20 bg-card p-5 flex flex-col justify-between relative overflow-hidden shadow-[0_0_15px_-3px_rgba(99,102,241,0.1)]">
          <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
            <CheckCircle2 className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="text-xs text-muted-foreground mb-4">Completed</p>
          <p className="text-3xl font-bold">{completed}</p>
        </div>
        
        <div className="rounded-2xl border border-amber-500/20 bg-card p-5 flex flex-col justify-between relative overflow-hidden shadow-[0_0_15px_-3px_rgba(245,158,11,0.1)]">
          <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center">
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-xs text-muted-foreground mb-4">Pending</p>
          <p className="text-3xl font-bold">{pending}</p>
        </div>
        
        <div className="rounded-2xl border border-purple-500/20 bg-card p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center">
            <Calendar className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-xs text-muted-foreground mb-4">Next Pickup</p>
          <p className="text-xl font-bold tracking-tight">Today</p>
        </div>
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left: Report Waste (Col Span 2) */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <ImageIcon className="h-4 w-4 text-emerald-500" />
            <h3 className="font-semibold text-sm">Report Waste with Photo</h3>
          </div>
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer border-2 border-dashed border-border hover:border-emerald-500/40 rounded-2xl p-8 mb-4 flex flex-col items-center justify-center bg-[#131313]/50 transition-colors relative overflow-hidden"
          >
            {preview ? (
              <div className="relative z-10 w-full flex justify-center">
                 <img src={preview} alt="Preview" className="h-40 object-cover rounded-xl shadow-md border border-white/10" />
                 <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] text-white">Change</div>
              </div>
            ) : (
              <div className="relative z-10 flex flex-col items-center">
                <div className="h-14 w-14 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                  <Upload className="h-6 w-6 text-emerald-500" />
                </div>
                <p className="text-sm font-medium mb-1">Tap to upload a photo of your waste</p>
                <p className="text-xs text-muted-foreground">JPG or PNG. The photo is analyzed by our ML model</p>
              </div>
            )}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>
          
          <input 
            type="text" 
            placeholder="Note (optional) — e.g. 2 bags of organic waste" 
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-[#131313] border border-border rounded-xl px-4 py-3 text-sm mb-4 outline-none focus:border-emerald-500/40 transition-colors"
          />
          
          <button 
            onClick={handleSubmitReport}
            disabled={submitting || !file}
            className="w-full bg-emerald-600/90 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl py-3.5 flex items-center justify-center transition-all shadow-[0_4px_14px_0_rgba(16,185,129,0.39)]"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
            {submitting ? "Analyzing & Submitting..." : "Submit Report"}
          </button>
          
          <div className="mt-5 bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-3.5 flex gap-3 items-center">
            <Sparkles className="h-4 w-4 text-indigo-400 flex-none" />
            <p className="text-[11px] text-indigo-200/80 leading-relaxed">
              <span className="font-semibold text-indigo-300">ML model active:</span> Submitted photos will be analyzed automatically to classify waste type and estimate weight!
            </p>
          </div>
        </div>

        {/* Right: Van & Actions */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-500" />
                  <h3 className="font-semibold text-sm">Nearest Van</h3>
              </div>
              <Badge variant="success">online</Badge>
            </div>
            
            {nearestVan ? (
              <>
                <div className="flex items-center gap-3 mb-5 border border-border/50 bg-[#131313] rounded-xl p-3">
                  <div className="h-10 w-10 bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center justify-center font-bold text-[10px] border border-indigo-500/20 overflow-hidden">{nearestVan.id}</div>
                  <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{nearestVan.driver}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Load {nearestVan.load}%</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-center mb-5">
                    <div className="bg-[#131313] border border-border/50 rounded-xl p-3">
                      <p className="text-emerald-500 font-bold">{nearestVan.distance} km</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">AWAY</p>
                    </div>
                    <div className="bg-[#131313] border border-border/50 rounded-xl p-3">
                      <p className="text-emerald-500 font-bold">{nearestVan.eta} min</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">ETA</p>
                    </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                 <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mb-2" />
                 <p className="text-xs text-muted-foreground">Locating nearest van...</p>
              </div>
            )}
            
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl py-2.5 flex items-center justify-center text-sm transition-all shadow-[0_4px_14px_0_rgba(79,70,229,0.39)]">
                <MapPin className="h-4 w-4 mr-2" /> View on map
            </button>
          </div>
          
          <div className="flex gap-4 h-full">
            <div className="rounded-2xl border border-border bg-card p-4 text-center cursor-pointer hover:border-emerald-500/30 transition-all flex flex-col items-center justify-center flex-1 min-h-[100px] group shadow-sm">
              <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <span className="text-emerald-500 font-bold text-lg leading-none">+</span>
              </div>
              <p className="text-xs font-medium text-muted-foreground group-hover:text-foreground">Request Pickup</p>
            </div>
            
            <div className="rounded-2xl border border-border bg-card p-4 text-center cursor-pointer hover:border-indigo-500/30 transition-all flex flex-col items-center justify-center flex-1 min-h-[100px] group shadow-sm">
              <div className="h-8 w-8 rounded-full bg-indigo-500/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Calendar className="h-4 w-4 text-indigo-500" />
              </div>
              <p className="text-xs font-medium text-muted-foreground group-hover:text-foreground">Schedule</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Pickup History */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold text-sm">Pickup History</h3>
          <button className="text-emerald-500 text-xs font-medium flex items-center gap-1 hover:text-emerald-400">
            + New Request
          </button>
        </div>
        
        <div className="space-y-0">
          {loading && <div className="text-center py-10"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></div>}
          {!loading && requests.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No requests found. Upload a photo to report waste!</p>
          )}
          {requests.map(req => (
            <div key={req.id} className="flex justify-between items-center border-b border-border/50 py-4 last:border-0 last:pb-0 first:pt-0">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <p className="text-sm font-semibold">{timeAgo(req.created_at)}</p>
                  <Badge variant={req.status === 'collected' ? 'info' : 'warning'}>{req.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <span className="font-medium text-foreground/70">{new Date(req.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  {req.weight ? (
                    <>
                      <span>•</span>
                      <span>{req.weight} kg</span>
                      <span>•</span>
                      <span className="capitalize">{req.waste_type_details?.name || "Processing"}</span>
                    </>
                  ) : (
                    <>
                       <span>•</span>
                       <span className="text-amber-500/80 flex items-center gap-1">
                         <Loader2 className="h-3 w-3 animate-spin" /> AI processing...
                       </span>
                    </>
                  )}
                  {req.description && (
                    <>
                      <span>•</span>
                      <span className="max-w-[200px] truncate" title={req.description}>{req.description}</span>
                    </>
                  )}
                </p>
              </div>
              <div className="pl-4">
                {req.status === 'collected' ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-emerald-500 font-medium">Upcoming</span>
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
