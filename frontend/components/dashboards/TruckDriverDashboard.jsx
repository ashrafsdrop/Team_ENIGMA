"use client"

import {
  Route,
  ClipboardList,
  Fuel,
  MessageSquare,
  Truck,
  MapPin,
  Timer,
  Droplets,
  Navigation,
  Building2,
} from "lucide-react"
import Badge from "@/components/common/Badge"
import Card from "@/components/common/Card"
import StatCard from "@/components/common/StatCard"
import StatusDot from "@/components/common/StatusDot"
import { formatNumber, formatWeight, formatDate, formatTime, timeAgo } from "@/utils/helpers"

const stats = [
  { label: "Trips Today", value: "4", delta: 33.3, icon: Route, tone: "brand" },
  { label: "Waste Moved Today", value: "32.4 t", delta: 8.6, icon: Truck, tone: "mint" },
  { label: "Fuel Used", value: "86 L", delta: -3.1, icon: Fuel, tone: "amber", hint: "more efficient" },
  { label: "Next Trip ETA", value: "11:45", delta: 0, icon: Timer, tone: "destructive", hint: "to Amin Bazar" },
]

const nextTrip = {
  tripId: "T-4401-07",
  from: "STS Mirpur",
  to: "Amin Bazar Landfill",
  load: 7200,
  departure: "2026-07-31T10:30:00",
  eta: "11:45",
  distance: 22,
}

const recentTrips = [
  { id: "T-4401-04", from: "STS Mirpur", to: "Amin Bazar Landfill", load: 7800, start: "2026-07-31T06:10:00", end: "2026-07-31T07:05:00", status: "completed" },
  { id: "T-4401-05", from: "STS Mirpur", to: "Amin Bazar Landfill", load: 8200, start: "2026-07-31T07:30:00", end: "2026-07-31T08:25:00", status: "completed" },
  { id: "T-4401-06", from: "STS Mirpur", to: "Matuail Landfill", load: 6900, start: "2026-07-31T08:40:00", end: null, status: "in_progress" },
  { id: "T-4401-07", from: "STS Mirpur", to: "Amin Bazar Landfill", load: 7200, start: null, end: null, status: "scheduled" },
]

const trips = [
  { id: "T-4401-01", from: "STS Mirpur", to: "Amin Bazar Landfill", load: 7500, start: "2026-07-30T05:50:00", end: "2026-07-30T06:45:00", status: "completed" },
  { id: "T-4401-02", from: "STS Mirpur", to: "Amin Bazar Landfill", load: 7900, start: "2026-07-30T07:20:00", end: "2026-07-30T08:15:00", status: "completed" },
  { id: "T-4401-03", from: "STS Mirpur", to: "Matuail Landfill", load: 7100, start: "2026-07-30T09:05:00", end: "2026-07-30T10:25:00", status: "failed" },
  { id: "T-4401-04", from: "STS Mirpur", to: "Amin Bazar Landfill", load: 7800, start: "2026-07-31T06:10:00", end: "2026-07-31T07:05:00", status: "completed" },
  { id: "T-4401-05", from: "STS Mirpur", to: "Amin Bazar Landfill", load: 8200, start: "2026-07-31T07:30:00", end: "2026-07-31T08:25:00", status: "completed" },
  { id: "T-4401-06", from: "STS Mirpur", to: "Matuail Landfill", load: 6900, start: "2026-07-31T08:40:00", end: null, status: "in_progress" },
  { id: "T-4401-07", from: "STS Mirpur", to: "Amin Bazar Landfill", load: 7200, start: null, end: null, status: "scheduled" },
]

const routeStops = [
  { name: "STS Mirpur", detail: "Load pickup · bay 2", type: "origin", time: "10:30", status: "done" },
  { name: "Panthapath Flyover", detail: "Dhaka–Chittagong Highway", type: "checkpoint", time: "10:52", status: "done" },
  { name: "Motijheel", detail: "Ring road checkpoint", type: "checkpoint", time: "11:08", status: "current" },
  { name: "Demra Bridge", detail: "Toll checkpoint", type: "checkpoint", time: "11:31", status: "pending" },
  { name: "Amin Bazar Landfill", detail: "Dump zone 4 · weighbridge 2", type: "destination", time: "11:45", status: "pending" },
]

const routeStats = [
  { label: "Distance", value: "22 km", icon: Navigation },
  { label: "Stops", value: "4", icon: MapPin },
  { label: "Est. Time", value: "75 min", icon: Timer },
]

const fuelLog = [
  { date: "2026-07-30", odometer: 48250, litres: 42, cost: 4700, station: "Padma Fuel, Gabtoli", status: "submitted" },
  { date: "2026-07-29", odometer: 47980, litres: 38, cost: 4256, station: "Energy Pump, Mirpur", status: "approved" },
  { date: "2026-07-28", odometer: 47700, litres: 45, cost: 5040, station: "Padma Fuel, Gabtoli", status: "approved" },
  { date: "2026-07-27", odometer: 47360, litres: 40, cost: 4480, station: "Super Petrol, Uttara", status: "rejected" },
]

const fuelSummary = { litres: 165, cost: 18476, distance: 890, avg: 18.5 }

const messages = [
  { sender: "STS Control Room", text: "Bay 2 has been cleared. Proceed to load after the weighbridge.", time: "2026-07-31T09:40:00", unread: true },
  { sender: "Landfill Office", text: "Dump zone 4 is open. Use weighbridge 2 on arrival.", time: "2026-07-31T09:05:00", unread: true },
  { sender: "Fleet Supervisor", text: "Fuel receipt for 30 Jul was approved. Check your statement.", time: "2026-07-31T08:12:00", unread: false },
  { sender: "STS Control Room", text: "Route deviation alert resolved. No action needed.", time: "2026-07-30T17:30:00", unread: false },
]

const tripStatus = {
  completed: { label: "Completed", badge: "success" },
  in_progress: { label: "In Progress", badge: "info" },
  scheduled: { label: "Scheduled", badge: "neutral" },
  failed: { label: "Failed", badge: "danger" },
}

const fuelStatus = {
  approved: { label: "Approved", variant: "success" },
  submitted: { label: "Submitted", variant: "warning" },
  rejected: { label: "Rejected", variant: "danger" },
}

function OverviewSection() {
  const completedStops = routeStops.filter((s) => s.status === "done").length
  const pct = Math.round((completedStops / routeStops.length) * 100)
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card
          title="Next Scheduled Trip"
          subtitle="Upcoming dispatch from STS Mirpur"
          className="lg:col-span-2"
        >
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-brand/15 text-brand">
              <Navigation className="h-6 w-6" />
            </span>
            <div>
              <p className="text-lg font-bold">{nextTrip.tripId}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(nextTrip.departure)} · Departs {formatTime(nextTrip.departure)}
              </p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-4">
            <div>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> From
              </p>
              <p className="mt-1 text-sm font-semibold">{nextTrip.from}</p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" /> To
              </p>
              <p className="mt-1 text-sm font-semibold">{nextTrip.to}</p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Truck className="h-3.5 w-3.5" /> Load
              </p>
              <p className="mt-1 text-sm font-semibold">{formatWeight(nextTrip.load)}</p>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between rounded-xl bg-background/60 px-4 py-3">
            <div>
              <p className="text-xs text-muted-foreground">ETA at landfill</p>
              <p className="text-lg font-bold text-mint">{nextTrip.eta}</p>
            </div>
            <StatusDot status="blue" label="On schedule" />
          </div>
        </Card>

        <Card
          title="Recent Trips"
          subtitle="Latest dispatches completed by truck T-4401"
          className="lg:col-span-3"
          bodyClassName="p-0"
        >
          <div className="divide-y divide-border/40">
            {recentTrips.map((t) => (
              <div key={t.id} className="flex items-center gap-4 px-6 py-4">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-secondary">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{t.id}</p>
                    <Badge variant={tripStatus[t.status].badge}>{tripStatus[t.status].label}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t.from} → {t.to} · {formatWeight(t.load)} · {t.start ? formatTime(t.start) : "—"}–
                    {t.end ? formatTime(t.end) : "—"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Route Progress" subtitle={`${completedStops} of ${routeStops.length} stops completed`}>
          <div className="flex items-center gap-4">
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-mint/15 text-mint">
              <Route className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">STS Mirpur → Amin Bazar Landfill</span>
                <span className="font-semibold">{pct}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div className={`h-full rounded-full ${pct >= 60 ? "bg-mint" : "bg-brand"}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-4 w-4" /> Now at {routeStops.find((s) => s.status === "current").name}
            </div>
            <StatusDot status="blue" label="On time" />
          </div>
        </Card>

        <Card title="Fuel Summary" subtitle="Last 7 days for truck T-4401">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-background/60 p-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/15 text-brand">
                <Droplets className="h-4 w-4" />
              </span>
              <p className="mt-3 text-lg font-bold">{fuelSummary.litres} L</p>
              <p className="text-xs text-muted-foreground">Fuel used</p>
            </div>
            <div className="rounded-xl bg-background/60 p-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-mint/15 text-mint">
                <Timer className="h-4 w-4" />
              </span>
              <p className="mt-3 text-lg font-bold">{formatNumber(fuelSummary.distance)} km</p>
              <p className="text-xs text-muted-foreground">Distance driven</p>
            </div>
            <div className="rounded-xl bg-background/60 p-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
                <Fuel className="h-4 w-4" />
              </span>
              <p className="mt-3 text-lg font-bold">{formatNumber(fuelSummary.avg)} L/100km</p>
              <p className="text-xs text-muted-foreground">Fuel efficiency</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

function RouteSection() {
  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15 text-brand">
            <Route className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-lg font-semibold">Assigned Route</h3>
            <p className="text-xs text-muted-foreground">
              Trip {nextTrip.tripId} · STS Mirpur → Amin Bazar Landfill
            </p>
          </div>
        </div>
        <Badge variant="info">22 km</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Route Stops" subtitle="Live progress along the assigned route" className="lg:col-span-2" bodyClassName="p-0">
          <div className="px-6 py-6">
            {routeStops.map((s, i) => {
              const dotStatus = s.status === "done" ? "green" : s.status === "current" ? "blue" : "gray"
              const isLast = i === routeStops.length - 1
              return (
                <div key={s.name} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <StatusDot status={dotStatus} pulse={s.status === "current"} />
                    {!isLast && <div className="w-0.5 flex-1 bg-border" />}
                  </div>
                  <div className="flex flex-1 items-start justify-between gap-3 pb-6">
                    <div>
                      <p className="text-sm font-semibold">
                        {s.name}
                        {s.status === "current" && <span className="ml-2 text-xs font-medium text-brand">Current stop</span>}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{s.detail}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{s.time}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.type === "destination" ? "Destination" : s.type === "origin" ? "Origin" : "Checkpoint"}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <div className="grid gap-6">
          <Card title="Route Stats" subtitle="Trip summary for today's dispatch">
            <div className="grid gap-4">
              {routeStats.map((r) => {
                const Icon = r.icon
                return (
                  <div key={r.label} className="flex items-center gap-4">
                    <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-secondary">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{r.value}</p>
                      <p className="text-xs text-muted-foreground">{r.label}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card title="Current Vehicle" subtitle="Truck assigned to this route">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-brand/15 text-brand">
                <Truck className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">Truck T-4401</p>
                <p className="text-xs text-muted-foreground">Load {formatWeight(nextTrip.load)} · Compactor</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-xl bg-background/60 px-4 py-3">
              <p className="text-xs text-muted-foreground">Odometer</p>
              <p className="text-sm font-semibold">{formatNumber(48250)} km</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function TripsSection() {
  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15 text-brand">
            <ClipboardList className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-lg font-semibold">Trip History</h3>
            <p className="text-xs text-muted-foreground">All trips assigned to truck T-4401</p>
          </div>
        </div>
        <StatusDot status="green" label="4 trips today" />
      </div>
      <Card bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-6 py-3">Trip</th>
                <th className="px-6 py-3">From</th>
                <th className="px-6 py-3">To</th>
                <th className="px-6 py-3">Load</th>
                <th className="px-6 py-3">Start</th>
                <th className="px-6 py-3">End</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((t) => (
                <tr key={t.id} className="border-b border-border/40 last:border-0">
                  <td className="px-6 py-3 font-semibold">{t.id}</td>
                  <td className="px-6 py-3 text-muted-foreground">{t.from}</td>
                  <td className="px-6 py-3 text-muted-foreground">{t.to}</td>
                  <td className="px-6 py-3 text-muted-foreground">{formatWeight(t.load)}</td>
                  <td className="px-6 py-3 text-muted-foreground">{t.start ? formatTime(t.start) : "—"}</td>
                  <td className="px-6 py-3 text-muted-foreground">{t.end ? formatTime(t.end) : "—"}</td>
                  <td className="px-6 py-3">
                    <Badge variant={tripStatus[t.status].badge}>{tripStatus[t.status].label}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function FuelSection() {
  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
            <Fuel className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-lg font-semibold">Fuel Log</h3>
            <p className="text-xs text-muted-foreground">Refuelling records for truck T-4401</p>
          </div>
        </div>
        <Badge variant="neutral">{fuelLog.length} entries</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Fuel Efficiency" subtitle="Last 7 days summary">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
              <Droplets className="h-6 w-6" />
            </span>
            <div>
              <p className="text-lg font-bold">{fuelSummary.litres} L</p>
              <p className="text-xs text-muted-foreground">Fuel used (7 days)</p>
            </div>
          </div>
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Efficiency</span>
              <span className="font-semibold">{formatNumber(fuelSummary.avg)} L/100km</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Distance driven</span>
              <span className="font-semibold">{formatNumber(fuelSummary.distance)} km</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total cost</span>
              <span className="font-semibold">৳{formatNumber(fuelSummary.cost)}</span>
            </div>
          </div>
          <div className="mt-5 rounded-xl bg-background/60 px-4 py-3">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Cost per km</span>
              <span className="font-semibold">৳{formatNumber(fuelSummary.cost / fuelSummary.distance)}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-brand" style={{ width: "62%" }} />
            </div>
          </div>
        </Card>

        <Card title="Refuelling History" subtitle="All fuel purchases recorded" className="lg:col-span-2" bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Odometer</th>
                  <th className="px-6 py-3">Litres</th>
                  <th className="px-6 py-3">Cost</th>
                  <th className="px-6 py-3">Station</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {fuelLog.map((f) => (
                  <tr key={f.odometer} className="border-b border-border/40 last:border-0">
                    <td className="px-6 py-3 font-semibold">{formatDate(f.date)}</td>
                    <td className="px-6 py-3 text-muted-foreground">{formatNumber(f.odometer)} km</td>
                    <td className="px-6 py-3 text-muted-foreground">{f.litres} L</td>
                    <td className="px-6 py-3 text-muted-foreground">৳{formatNumber(f.cost)}</td>
                    <td className="px-6 py-3 text-muted-foreground">{f.station}</td>
                    <td className="px-6 py-3">
                      <Badge variant={fuelStatus[f.status].variant}>{fuelStatus[f.status].label}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}

function MessagesSection() {
  const unreadCount = messages.filter((m) => m.unread).length
  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15 text-brand">
            <MessageSquare className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-lg font-semibold">Messages</h3>
            <p className="text-xs text-muted-foreground">Updates from the control room and dispatch office</p>
          </div>
        </div>
        <Badge variant="warning">{unreadCount} unread</Badge>
      </div>
      <Card bodyClassName="p-0">
        <div className="divide-y divide-border/40">
          {messages.map((m, i) => (
            <div key={i} className="flex gap-4 px-6 py-5">
              <span
                className={`mt-1 flex h-9 w-9 flex-none items-center justify-center rounded-xl ${
                  m.unread ? "bg-brand/15 text-brand" : "bg-secondary text-muted-foreground"
                }`}
              >
                <MessageSquare className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{m.sender}</p>
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    {timeAgo(m.time)}
                    {m.unread && <StatusDot status="blue" />}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{m.text}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default function TruckDriverDashboard({ active }) {
  if (active === "route") return <RouteSection />
  if (active === "trips") return <TripsSection />
  if (active === "fuel") return <FuelSection />
  if (active === "messages") return <MessagesSection />
  return <OverviewSection />
}
