"use client"

import { useState } from "react"
import {
  ClipboardCheck,
  MapPin,
  Fuel,
  BellRing,
  Trash2,
  CheckCircle2,
  Calendar,
  Navigation,
  Home,
  Droplets,
} from "lucide-react"
import Badge from "@/components/common/Badge"
import Card from "@/components/common/Card"
import StatCard from "@/components/common/StatCard"
import StatusDot from "@/components/common/StatusDot"
import { formatDate, formatNumber, formatTime, formatWeight } from "@/utils/helpers"
import { WASTE_TYPES } from "@/utils/constants"

const wasteLabel = (key) => {
  const w = WASTE_TYPES.find((t) => t.key === key)
  return w ? w.label : key
}

const wasteColor = (key) => {
  const w = WASTE_TYPES.find((t) => t.key === key)
  return w ? w.color : "bg-secondary text-muted-foreground"
}

const stats = [
  { label: "Pickups Today", value: "24", delta: 9.1, icon: ClipboardCheck, tone: "brand" },
  { label: "Waste Collected Today", value: "186 kg", delta: 4.8, icon: Trash2, tone: "mint" },
  { label: "Pending Requests", value: "7", delta: 16.7, icon: BellRing, tone: "amber" },
  { label: "Fuel Used Today", value: "6.5 L", delta: 3.2, icon: Fuel, tone: "destructive" },
]

const weeklyPickups = [
  { day: "Mon", value: 21 },
  { day: "Tue", value: 19 },
  { day: "Wed", value: 24 },
  { day: "Thu", value: 22 },
  { day: "Fri", value: 18 },
  { day: "Sat", value: 26 },
  { day: "Sun", value: 15 },
]

const wasteMix = [
  { type: "organic", count: 9, pct: 42 },
  { type: "plastic", count: 5, pct: 23 },
  { type: "paper", count: 4, pct: 18 },
  { type: "metal", count: 2, pct: 9 },
  { type: "e_waste", count: 2, pct: 8 },
]

const nextPickups = [
  { address: "House 12, Road 5, Dhanmondi", type: "organic", weight: 12, distance: 0.4 },
  { address: "Flat 3B, Lake View, Gulshan", type: "plastic", weight: 8, distance: 0.9 },
  { address: "House 8, Road 11, Banani", type: "organic", weight: 15, distance: 1.3 },
  { address: "Apt 2A, Mirpur DOHS", type: "paper", weight: 6, distance: 1.8 },
  { address: "House 21, Road 2, Mohammadpur", type: "organic", weight: 10, distance: 2.2 },
]

const pickups = [
  { id: 1, address: "House 12, Road 5, Dhanmondi", type: "organic", weight: 12, status: "completed" },
  { id: 2, address: "Flat 3B, Lake View, Gulshan", type: "plastic", weight: 8, status: "completed" },
  { id: 3, address: "House 8, Road 11, Banani", type: "organic", weight: 15, status: "completed" },
  { id: 4, address: "Apt 2A, Mirpur DOHS", type: "paper", weight: 6, status: "pending" },
  { id: 5, address: "House 21, Road 2, Mohammadpur", type: "organic", weight: 10, status: "pending" },
  { id: 6, address: "Flat 5C, Uttara Sector 7", type: "metal", weight: 7, status: "pending" },
  { id: 7, address: "House 4, Road 6, Khilgaon", type: "paper", weight: 5, status: "skipped" },
]

const areaStats = [
  { label: "Buildings Covered", value: "125", delta: 3.3, icon: Home, tone: "brand" },
  { label: "Streets Served", value: "4", delta: 0, icon: MapPin, tone: "mint", hint: "unchanged" },
  { label: "Avg Pickup Time", value: "11 min", delta: -6.5, icon: Navigation, tone: "amber", hint: "vs last week" },
  { label: "On-time Rate", value: "94%", delta: 2.1, icon: ClipboardCheck, tone: "destructive" },
]

const areaStops = [
  { street: "Road 5, Dhanmondi", buildings: 34, schedule: "Mon · Wed · Sat", last: "2026-07-29", next: "2026-07-31", due: "today" },
  { street: "Road 11, Banani", buildings: 28, schedule: "Tue · Thu · Sat", last: "2026-07-30", next: "2026-08-01", due: "tomorrow" },
  { street: "Sector 7, Uttara", buildings: 41, schedule: "Mon · Thu · Sat", last: "2026-07-27", next: "2026-07-31", due: "today" },
  { street: "DOHS, Mirpur", buildings: 22, schedule: "Wed · Sat", last: "2026-07-25", next: "2026-08-02", due: "upcoming" },
]

const fuelStats = [
  { label: "Fuel Used (Month)", value: "48.0 L", delta: 6.2, icon: Fuel, tone: "brand" },
  { label: "Fuel Cost (Month)", value: "৳5,088", delta: 5.8, icon: Droplets, tone: "mint" },
  { label: "Avg Efficiency", value: "11.4 km/L", delta: 3.1, icon: Navigation, tone: "amber" },
  { label: "Odometer", value: "4,820 km", delta: 2.4, icon: MapPin, tone: "destructive" },
]

const fuelLog = [
  { date: "2026-07-29", odometer: 4820, litres: 12.5, cost: 1325, status: "submitted" },
  { date: "2026-07-26", odometer: 4705, litres: 11.8, cost: 1251, status: "submitted" },
  { date: "2026-07-22", odometer: 4592, litres: 12.2, cost: 1293, status: "submitted" },
  { date: "2026-07-18", odometer: 4478, litres: 11.5, cost: 1219, status: "submitted" },
]

const requestStats = [
  { label: "New Requests", value: "3", delta: 50.0, icon: BellRing, tone: "destructive", hint: "since yesterday" },
  { label: "Pending Approval", value: "2", delta: 0, icon: Calendar, tone: "amber", hint: "unchanged" },
  { label: "Accepted (Month)", value: "28", delta: 12.0, icon: ClipboardCheck, tone: "mint" },
  { label: "Avg Response", value: "12 min", delta: -18.0, icon: CheckCircle2, tone: "brand", hint: "vs last month" },
]

const requests = [
  { id: 1, address: "House 9, Road 4, Dhanmondi", type: "e_waste", date: "2026-08-01T10:00:00", status: "new" },
  { id: 2, address: "Flat 6A, Green Road, Dhanmondi", type: "hazardous", date: "2026-08-01T14:30:00", status: "new" },
  { id: 3, address: "House 15, Road 7, Gulshan", type: "organic", date: "2026-08-02T09:00:00", status: "new" },
  { id: 4, address: "Apt 4B, Mirpur 10", type: "paper", date: "2026-08-02T11:30:00", status: "accepted" },
  { id: 5, address: "House 21, Road 3, Banani", type: "metal", date: "2026-08-02T15:00:00", status: "accepted" },
]

function PickupChart({ data }) {
  const max = Math.max(...data.map((d) => d.value))
  return (
    <div className="flex h-44 items-end gap-3">
      {data.map((d) => (
        <div key={d.day} className="group flex flex-1 flex-col items-center gap-2">
          <span className="text-[11px] font-semibold text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
            {d.value}
          </span>
          <div
            className="w-full rounded-t-lg bg-gradient-to-t from-brand/60 to-brand transition-opacity group-hover:opacity-80"
            style={{ height: `${Math.max((d.value / max) * 100, 6)}%` }}
          />
          <span className="text-xs text-muted-foreground">{d.day}</span>
        </div>
      ))}
    </div>
  )
}

function OverviewSection() {
  const routeProgress = 78
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card
          title="Today's Route"
          subtitle="Door-to-door collection across Ward 05"
          className="lg:col-span-2"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15 text-brand">
              <Navigation className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">Progress</p>
              <p className="text-lg font-bold">15 of 24 pickups</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Completed</span>
              <span className="font-semibold text-mint">{routeProgress}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand to-mint"
                style={{ width: `${routeProgress}%` }}
              />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-background/60 px-4 py-3">
            <div>
              <p className="text-xs text-muted-foreground">Distance covered</p>
              <p className="text-lg font-bold">9.4 km of 12.6 km</p>
            </div>
            <StatusDot status="green" label="On track" />
          </div>
        </Card>

        <Card
          title="Next Pickups"
          subtitle="Upcoming stops on the current route"
          className="lg:col-span-3"
          bodyClassName="p-0"
        >
          <div className="divide-y divide-border/40">
            {nextPickups.map((p) => (
              <div key={p.address} className="flex items-center gap-4 px-6 py-4">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-secondary">
                  <Home className="h-4 w-4 text-muted-foreground" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{p.address}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {wasteLabel(p.type)} · {formatWeight(p.weight)} · {p.distance} km away
                  </p>
                </div>
                <MapPin className="h-4 w-4 flex-none text-muted-foreground" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card
          title="Weekly Pickups"
          subtitle="Stops completed per day this week"
          className="lg:col-span-2"
        >
          <PickupChart data={weeklyPickups} />
          <div className="mt-4 flex items-center justify-between rounded-xl bg-background/60 px-4 py-3">
            <div>
              <p className="text-xs text-muted-foreground">Week total</p>
              <p className="text-lg font-bold text-mint">
                {formatNumber(weeklyPickups.reduce((sum, d) => sum + d.value, 0))} pickups
              </p>
            </div>
            <StatusDot status="green" label="Above target" />
          </div>
        </Card>

        <Card
          title="Waste Collected Mix"
          subtitle="Composition by waste type this week"
          className="lg:col-span-3"
          bodyClassName="p-0"
        >
          <div className="divide-y divide-border/40">
            {wasteMix.map((m) => (
              <div key={m.type} className="flex items-center gap-4 px-6 py-4">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-secondary">
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{wasteLabel(m.type)}</p>
                    <Badge className={wasteColor(m.type)}>{m.count} pickups</Badge>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand to-mint"
                      style={{ width: `${m.pct}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-semibold">{m.pct}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

function PickupsSection() {
  const [stops, setStops] = useState(pickups)

  const markCollected = (id) =>
    setStops((prev) => prev.map((p) => (p.id === id ? { ...p, status: "completed" } : p)))

  const completed = stops.filter((p) => p.status === "completed").length

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Stops Completed" value={completed} delta={11.1} icon={ClipboardCheck} tone="mint" hint="of today's plan" />
        <StatCard label="Pending Stops" value={stops.length - completed} delta={-4.2} icon={MapPin} tone="amber" />
        <StatCard label="Skipped Stops" value={stops.filter((p) => p.status === "skipped").length} delta={0} icon={Calendar} tone="destructive" hint="need follow-up" />
        <StatCard label="Collected Today" value="186 kg" delta={4.8} icon={Trash2} tone="brand" />
      </div>

      <Card title="Pickup Stops" subtitle="Tap 'Mark Collected' when waste is loaded onto the van" bodyClassName="p-0">
        <div className="divide-y divide-border/40">
          {stops.map((p) => {
            const done = p.status === "completed"
            return (
              <div key={p.id} className="flex flex-wrap items-center gap-4 px-6 py-4">
                <span
                  className={`flex h-9 w-9 flex-none items-center justify-center rounded-lg ${
                    done ? "bg-mint/15 text-mint" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {done ? <CheckCircle2 className="h-4 w-4" /> : <Home className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{p.address}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {wasteLabel(p.type)} · {formatWeight(p.weight)}
                  </p>
                </div>
                <Badge variant={done ? "success" : p.status === "skipped" ? "danger" : "warning"}>
                  {done ? "Completed" : p.status === "skipped" ? "Skipped" : "Pending"}
                </Badge>
                {done ? (
                  <StatusDot status="green" label="Collected" />
                ) : (
                  <button
                    type="button"
                    onClick={() => markCollected(p.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Mark Collected
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

function AreaSection() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {areaStats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {areaStops.map((a) => {
          const dot = a.due === "today" ? "red" : a.due === "tomorrow" ? "amber" : "blue"
          return (
            <Card key={a.street} title={a.street} subtitle={`${a.buildings} buildings`}>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15 text-brand">
                  <MapPin className="h-5 w-5" />
                </span>
                <div className="flex-1 space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Collection schedule</span>
                    <span className="inline-flex items-center gap-1.5 font-semibold">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      {a.schedule}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Last collected</span>
                    <span className="font-medium">{formatDate(a.last)}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-xl bg-background/60 px-4 py-3">
                <div>
                  <p className="text-xs text-muted-foreground">Next due</p>
                  <p className="text-lg font-bold">{formatDate(a.next)}</p>
                </div>
                <StatusDot
                  status={dot}
                  label={a.due === "today" ? "Due today" : a.due === "tomorrow" ? "Due tomorrow" : "Upcoming"}
                  pulse={a.due === "today"}
                />
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function FuelSection() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {fuelStats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="This Month Summary" subtitle="Refuelling totals for July 2026">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint/15 text-mint">
              <Droplets className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">Total cost</p>
              <p className="text-xl font-bold">৳{formatNumber(5088, { maximumFractionDigits: 0 })}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-background/60 px-2 py-3">
              <p className="text-lg font-bold">48.0 L</p>
              <p className="text-[11px] text-muted-foreground">Used</p>
            </div>
            <div className="rounded-xl bg-background/60 px-2 py-3">
              <p className="text-lg font-bold">11.4</p>
              <p className="text-[11px] text-muted-foreground">km/L</p>
            </div>
            <div className="rounded-xl bg-background/60 px-2 py-3">
              <p className="text-lg font-bold">4</p>
              <p className="text-[11px] text-muted-foreground">Fill-ups</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <Badge variant="success">Budget on track</Badge>
            <StatusDot status="green" label="Monthly limit: ৳6,000" />
          </div>
        </Card>

        <Card
          title="Fuel Log"
          subtitle="Refuelling history for Van DN-2203"
          className="lg:col-span-2"
          bodyClassName="p-0"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Odometer</th>
                  <th className="px-6 py-3">Litres</th>
                  <th className="px-6 py-3">Cost</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {fuelLog.map((f) => (
                  <tr key={f.date} className="border-b border-border/40 last:border-0">
                    <td className="px-6 py-3 font-semibold">{formatDate(f.date)}</td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {formatNumber(f.odometer, { maximumFractionDigits: 0 })} km
                    </td>
                    <td className="px-6 py-3 font-medium">{formatNumber(f.litres)} L</td>
                    <td className="px-6 py-3 font-medium">৳{formatNumber(f.cost, { maximumFractionDigits: 0 })}</td>
                    <td className="px-6 py-3">
                      <Badge variant={f.status === "submitted" ? "success" : "warning"}>
                        {f.status === "submitted" ? "Submitted" : "Pending"}
                      </Badge>
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

function RequestsSection() {
  const [items, setItems] = useState(requests)

  const accept = (id) =>
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, status: "accepted" } : r)))

  const newCount = items.filter((r) => r.status === "new").length

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {requestStats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <Card
        title="New Pickup Requests"
        subtitle="House owners requesting door-to-door collection"
        bodyClassName="p-0"
      >
        <div className="divide-y divide-border/40">
          {items.map((r) => {
            const accepted = r.status === "accepted"
            return (
              <div key={r.id} className="flex flex-wrap items-center gap-4 px-6 py-4">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-secondary">
                  <BellRing className="h-4 w-4 text-muted-foreground" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{r.address}</p>
                    <Badge className={wasteColor(r.type)}>{wasteLabel(r.type)}</Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Requested {formatDate(r.date)} at {formatTime(r.date)}
                  </p>
                </div>
                {accepted ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="success">Accepted</Badge>
                    <StatusDot status="green" label="In plan" />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => accept(r.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Accept
                  </button>
                )}
              </div>
            )
          })}
        </div>
        {newCount > 0 && (
          <div className="flex items-center justify-between border-t border-border/60 bg-background/40 px-6 py-3">
            <p className="text-xs text-muted-foreground">{newCount} request(s) awaiting your response</p>
            <StatusDot status="amber" label="Action needed" pulse />
          </div>
        )}
      </Card>
    </div>
  )
}

export default function VanDriverDashboard({ active }) {
  if (active === "pickups") return <PickupsSection />
  if (active === "area") return <AreaSection />
  if (active === "fuel") return <FuelSection />
  if (active === "requests") return <RequestsSection />
  return <OverviewSection />
}
