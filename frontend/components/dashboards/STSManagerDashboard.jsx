"use client"

import { useState } from "react"
import {
  Truck,
  Gauge,
  Send,
  BellRing,
  Trash2,
  Weight,
  Timer,
  AlertTriangle,
  Boxes,
  ArrowUpRight,
} from "lucide-react"
import Badge from "@/components/common/Badge"
import Card from "@/components/common/Card"
import StatCard from "@/components/common/StatCard"
import StatusDot from "@/components/common/StatusDot"
import { WASTE_TYPES } from "@/utils/constants"
import { formatNumber, formatWeight, formatTime, timeAgo } from "@/utils/helpers"

const stats = [
  { label: "Incoming Vans Today", value: "42", delta: 6.2, icon: Truck, tone: "brand" },
  { label: "Waste Received Today", value: "118 t", delta: 4.8, icon: Trash2, tone: "mint" },
  { label: "STS Utilization", value: "86%", delta: 5.1, icon: Gauge, tone: "amber", hint: "capacity in use" },
  { label: "Dispatched to Landfill", value: "96 t", delta: 3.4, icon: Send, tone: "destructive", hint: "from last week" },
]

const receivedTrend = [
  { day: "Mon", value: 86 },
  { day: "Tue", value: 94 },
  { day: "Wed", value: 88 },
  { day: "Thu", value: 102 },
  { day: "Fri", value: 97 },
  { day: "Sat", value: 111 },
  { day: "Sun", value: 118 },
]

const pendingVans = [
  { id: "V-1102", origin: "Gulshan", time: "2026-07-31T08:40:00", waste: "organic", weight: 820 },
  { id: "V-1107", origin: "Banani", time: "2026-07-31T08:50:00", waste: "plastic", weight: 540 },
  { id: "V-1113", origin: "Mirpur", time: "2026-07-31T09:05:00", waste: "organic", weight: 910 },
  { id: "V-1120", origin: "Mohammadpur", time: "2026-07-31T09:20:00", waste: "e_waste", weight: 260 },
  { id: "V-1124", origin: "Khilgaon", time: "2026-07-31T09:35:00", waste: "paper", weight: 380 },
]

const incomingVans = [
  { id: "V-1098", origin: "Dhanmondi", arrival: "2026-07-31T07:05:00", waste: "organic", weight: 760, status: "done" },
  { id: "V-1101", origin: "Uttara", arrival: "2026-07-31T07:40:00", waste: "paper", weight: 430, status: "done" },
  { id: "V-1102", origin: "Gulshan", arrival: "2026-07-31T08:40:00", waste: "organic", weight: 820, status: "unloading" },
  { id: "V-1107", origin: "Banani", arrival: "2026-07-31T08:50:00", waste: "plastic", weight: 540, status: "in_progress" },
  { id: "V-1113", origin: "Mirpur", arrival: "2026-07-31T09:05:00", waste: "organic", weight: 910, status: "waiting" },
  { id: "V-1119", origin: "Khilgaon", arrival: "2026-07-31T09:12:00", waste: "hazardous", weight: 180, status: "waiting" },
]

const bins = [
  { id: "Bin A1", type: "Organic hopper", fill: 88, ratio: 0.74 },
  { id: "Bin B2", type: "Recyclable hopper", fill: 62, ratio: 0.68 },
  { id: "Bin C3", type: "General waste hopper", fill: 95, ratio: 0.81 },
  { id: "Bin D4", type: "Hazardous bay", fill: 41, ratio: 0.55 },
]

const compactors = [
  { id: "CU-01", line: "Line A", ratio: 0.74, runs: 18 },
  { id: "CU-02", line: "Line B", ratio: 0.66, runs: 14 },
]

const dispatchTrucks = [
  { id: "T-4401", load: 8200, departure: "2026-07-31T06:30:00", eta: "08:15", destination: "Amin Bazar Landfill", status: "dispatched" },
  { id: "T-4403", load: 7600, departure: "2026-07-31T07:20:00", eta: "09:05", destination: "Amin Bazar Landfill", status: "dispatched" },
  { id: "T-4405", load: 5400, departure: "2026-07-31T07:45:00", eta: "09:30", destination: "Matuail Landfill", status: "en_route" },
  { id: "T-4408", load: 6900, departure: "2026-07-31T08:10:00", eta: "09:55", destination: "Amin Bazar Landfill", status: "loading" },
  { id: "T-4410", load: 7200, departure: null, eta: "—", destination: "Amin Bazar Landfill", status: "queued" },
]

const alerts = [
  { title: "Bin C3 nearing full", detail: "General waste hopper at 95% capacity. Schedule immediate dispatch.", level: "danger", time: "2026-07-31T09:10:00" },
  { title: "Van V-1107 delayed", detail: "Van V-1107 from Banani is 25 minutes behind schedule.", level: "warning", time: "2026-07-31T08:55:00" },
  { title: "Compactor CU-02 below target", detail: "Compaction ratio dropped to 0.66 t/m³, below the 0.70 target.", level: "warning", time: "2026-07-31T07:30:00" },
  { title: "Truck T-4405 en route", detail: "Truck T-4405 left for Matuail Landfill carrying a 5.4 t load.", level: "success", time: "2026-07-31T07:50:00" },
]

const vanStatus = {
  done: { label: "Done", badge: "success" },
  unloading: { label: "Unloading", badge: "info" },
  in_progress: { label: "In Progress", badge: "info" },
  waiting: { label: "Waiting", badge: "warning" },
}

const truckStatus = {
  dispatched: { label: "Dispatched", variant: "success" },
  en_route: { label: "En Route", variant: "info" },
  loading: { label: "Loading", variant: "warning" },
  queued: { label: "Queued", variant: "neutral" },
}

function wasteMeta(key) {
  const w = WASTE_TYPES.find((x) => x.key === key)
  return w || { label: key, color: "bg-secondary text-muted-foreground" }
}

function TrendChart({ data }) {
  const max = Math.max(...data.map((d) => d.value))
  return (
    <div className="flex h-44 items-end gap-3">
      {data.map((d) => (
        <div key={d.day} className="group flex flex-1 flex-col items-center gap-2">
          <span className="text-[11px] font-semibold text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
            {d.value} t
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
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card
          title="Waste Received This Week"
          subtitle="Tonnes compacted per day at STS Mirpur"
          className="lg:col-span-2"
        >
          <TrendChart data={receivedTrend} />
          <div className="mt-4 flex items-center justify-between rounded-xl bg-background/60 px-4 py-3">
            <div>
              <p className="text-xs text-muted-foreground">Today</p>
              <p className="text-lg font-bold text-mint">118 t</p>
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold text-mint">
              <ArrowUpRight className="h-4 w-4" />
              4.8% vs yesterday
            </span>
          </div>
        </Card>

        <Card
          title="Pending Incoming Vans"
          subtitle="Next arrivals at the transfer station"
          className="lg:col-span-3"
          bodyClassName="p-0"
        >
          <div className="divide-y divide-border/40">
            {pendingVans.map((v) => {
              const meta = wasteMeta(v.waste)
              return (
                <div key={v.id} className="flex items-center gap-4 px-6 py-4">
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-secondary">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">
                        {v.id} <span className="ml-1 text-xs font-normal text-muted-foreground">{v.origin}</span>
                      </p>
                      <StatusDot status="blue" label={formatTime(v.time)} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {meta.label} · {formatWeight(v.weight)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="STS Utilization" subtitle="Live fill level of storage bins" bodyClassName="p-0">
          <div className="divide-y divide-border/40">
            {bins.map((b) => {
              const color = b.fill >= 90 ? "bg-destructive" : b.fill >= 75 ? "bg-amber-400" : "bg-brand"
              return (
                <div key={b.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">
                        {b.id} <span className="ml-1 text-xs font-normal text-muted-foreground">{b.type}</span>
                      </p>
                      <span className="text-xs font-semibold text-muted-foreground">{b.fill}%</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div className={`h-full rounded-full ${color}`} style={{ width: `${b.fill}%` }} />
                    </div>
                  </div>
                  <Gauge className="h-5 w-5 flex-none text-muted-foreground" />
                </div>
              )
            })}
          </div>
        </Card>

        <Card title="Recent Dispatches" subtitle="Latest trucks bound for the landfill" bodyClassName="p-0">
          <div className="divide-y divide-border/40">
            {dispatchTrucks.slice(0, 4).map((t) => (
              <div key={t.id} className="flex items-center gap-4 px-6 py-4">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-secondary">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">
                      {t.id} <span className="ml-1 text-xs font-normal text-muted-foreground">{t.destination}</span>
                    </p>
                    <Badge variant={t.status === "queued" ? "neutral" : "success"}>
                      {t.status === "queued" ? "Queued" : "Dispatched"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatWeight(t.load)} · {t.departure ? formatTime(t.departure) : "awaiting departure"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

function VansSection() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Vans Received Today" value={formatNumber(incomingVans.length)} delta={6.2} icon={Truck} tone="brand" />
        <StatCard label="Waiting to Unload" value="3" delta={25} icon={Timer} tone="amber" />
        <StatCard label="Avg Unload Time" value="18 min" delta={-4.5} icon={Timer} tone="mint" />
        <StatCard label="Rejected Loads" value="2" delta={-33.3} icon={AlertTriangle} tone="destructive" />
      </div>
      <Card title="Incoming Vans" subtitle="All van arrivals at STS Mirpur today" bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-6 py-3">Van</th>
                <th className="px-6 py-3">Origin Area</th>
                <th className="px-6 py-3">Arrival</th>
                <th className="px-6 py-3">Waste Type</th>
                <th className="px-6 py-3">Weight</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {incomingVans.map((v) => {
                const meta = wasteMeta(v.waste)
                const st = vanStatus[v.status]
                return (
                  <tr key={v.id} className="border-b border-border/40 last:border-0">
                    <td className="px-6 py-3 font-semibold">{v.id}</td>
                    <td className="px-6 py-3 text-muted-foreground">{v.origin}</td>
                    <td className="px-6 py-3 text-muted-foreground">{formatTime(v.arrival)}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.color}`}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">{formatWeight(v.weight)}</td>
                    <td className="px-6 py-3">
                      <Badge variant={st.badge}>{st.label}</Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function CapacitySection() {
  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15 text-brand">
          <Gauge className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-lg font-semibold">STS Capacity & Compaction</h3>
          <p className="text-xs text-muted-foreground">Storage bins and compactor units at STS Mirpur</p>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Storage Bins" subtitle="Fill level by bin" bodyClassName="p-0">
          <div className="divide-y divide-border/40">
            {bins.map((b) => {
              const color = b.fill >= 90 ? "bg-destructive" : b.fill >= 75 ? "bg-amber-400" : "bg-mint"
              const dot = b.fill >= 90 ? "red" : b.fill >= 75 ? "amber" : "green"
              return (
                <div key={b.id} className="flex items-center gap-4 px-6 py-4">
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-secondary">
                    <Boxes className="h-4 w-4 text-muted-foreground" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">
                        {b.id} <span className="ml-1 text-xs font-normal text-muted-foreground">{b.type}</span>
                      </p>
                      <Badge variant={b.fill >= 90 ? "danger" : b.fill >= 75 ? "warning" : "success"}>
                        {b.fill}% full
                      </Badge>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div className={`h-full rounded-full ${color}`} style={{ width: `${b.fill}%` }} />
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">Compaction ratio {b.ratio} t/m³</p>
                      <StatusDot status={dot} label={b.fill >= 90 ? "Near full" : b.fill >= 75 ? "Filling up" : "Healthy"} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <div className="grid gap-6">
          <Card title="Compaction Units" subtitle="Performance of STS compactors" bodyClassName="p-0">
            <div className="divide-y divide-border/40">
              {compactors.map((c) => (
                <div key={c.id} className="flex items-center gap-4 px-6 py-4">
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-secondary">
                    <Gauge className="h-4 w-4 text-muted-foreground" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">
                        {c.id} <span className="ml-1 text-xs font-normal text-muted-foreground">{c.line}</span>
                      </p>
                      <Badge variant={c.ratio >= 0.7 ? "success" : "warning"}>{c.ratio} t/m³</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{c.runs} compaction runs today</p>
                  </div>
                  <StatusDot status={c.ratio >= 0.7 ? "green" : "amber"} label={c.ratio >= 0.7 ? "Optimal" : "Below target"} />
                </div>
              ))}
            </div>
          </Card>

          <Card title="Residual Capacity" subtitle="Room left before forced dispatch">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/15 text-destructive">
                <Trash2 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs text-muted-foreground">General waste hopper</p>
                <p className="text-lg font-bold">~5 t remaining</p>
              </div>
            </div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-destructive" style={{ width: "95%" }} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Dispatch recommended within the next 90 minutes.</p>
          </Card>
        </div>
      </div>
    </div>
  )
}

function DispatchSection() {
  const [dispatchedIds, setDispatchedIds] = useState([])
  const handleDispatch = (id) => {
    setDispatchedIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }
  const queued = dispatchTrucks.find((t) => t.status === "queued")
  const statusFor = (t) => {
    if (dispatchedIds.includes(t.id)) return truckStatus.dispatched
    return truckStatus[t.status]
  }
  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15 text-brand">
            <Send className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-lg font-semibold">Dispatch to Landfill</h3>
            <p className="text-xs text-muted-foreground">Trucks leaving STS Mirpur for landfill sites</p>
          </div>
        </div>
        <Badge variant="info">
          {formatNumber(dispatchTrucks.filter((t) => t.status === "dispatched").length)} dispatched today
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Dispatched Today" value={formatNumber(dispatchTrucks.filter((t) => t.status === "dispatched").length)} delta={12.5} icon={Send} tone="brand" />
        <StatCard label="Currently En Route" value={formatNumber(dispatchTrucks.filter((t) => t.status === "en_route").length)} delta={0} icon={Truck} tone="mint" />
        <StatCard label="Avg Load per Truck" value="6.9 t" delta={3.2} icon={Weight} tone="amber" />
        <StatCard label="Avg Travel Time" value="95 min" delta={-4.1} icon={Timer} tone="destructive" hint="from last week" />
      </div>

      {queued && (
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-brand/15 text-brand">
              <Truck className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold">
                {queued.id} <span className="ml-1 text-xs font-normal text-muted-foreground">next in queue · bay 2</span>
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {queued.destination} · load {formatWeight(queued.load)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleDispatch(queued.id)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={dispatchedIds.includes(queued.id)}
          >
            {dispatchedIds.includes(queued.id) ? "Dispatched" : "Dispatch Truck"}
            <Send className="h-4 w-4" />
          </button>
        </div>
      )}

      <Card title="Dispatch Log" subtitle="Trucks sent from STS Mirpur to landfill sites today" bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-6 py-3">Truck</th>
                <th className="px-6 py-3">Destination</th>
                <th className="px-6 py-3">Load</th>
                <th className="px-6 py-3">Departure</th>
                <th className="px-6 py-3">ETA</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {dispatchTrucks.map((t) => {
                const st = statusFor(t)
                const isDispatched = dispatchedIds.includes(t.id)
                return (
                  <tr key={t.id} className="border-b border-border/40 last:border-0">
                    <td className="px-6 py-3 font-semibold">{t.id}</td>
                    <td className="px-6 py-3 text-muted-foreground">{t.destination}</td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <Weight className="h-3.5 w-3.5" />
                        {formatWeight(t.load)}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">{t.departure ? formatTime(t.departure) : "—"}</td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <Timer className="h-3.5 w-3.5" />
                        {t.eta}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <Badge variant={st.variant}>{st.label}</Badge>
                    </td>
                    <td className="px-6 py-3 text-right">
                      {t.status === "queued" ? (
                        isDispatched ? (
                          <span className="text-xs font-semibold text-mint">En route</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleDispatch(t.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-brand/15 px-3 py-1.5 text-xs font-semibold text-brand transition-colors hover:bg-brand/25"
                          >
                            Dispatch <Send className="h-3.5 w-3.5" />
                          </button>
                        )
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function AlertsSection() {
  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/15 text-destructive">
            <BellRing className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-lg font-semibold">Alert Center</h3>
            <p className="text-xs text-muted-foreground">Live events at STS Mirpur requiring attention</p>
          </div>
        </div>
        <Badge variant="danger">{alerts.filter((a) => a.level === "danger").length} critical</Badge>
      </div>
      <Card bodyClassName="p-0">
        <div className="divide-y divide-border/40">
          {alerts.map((a, i) => (
            <div key={i} className="flex gap-4 px-6 py-5">
              <span
                className={`mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-xl ${
                  a.level === "danger"
                    ? "bg-destructive/15 text-destructive"
                    : a.level === "warning"
                      ? "bg-amber-500/15 text-amber-400"
                      : "bg-mint/15 text-mint"
                }`}
              >
                <AlertTriangle className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{a.title}</p>
                  <Badge variant={a.level === "danger" ? "danger" : a.level === "warning" ? "warning" : "success"}>
                    {a.level}
                  </Badge>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{a.detail}</p>
                <p className="mt-2 text-xs text-muted-foreground">{timeAgo(a.time)}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default function STSManagerDashboard({ active }) {
  if (active === "vans") return <VansSection />
  if (active === "capacity") return <CapacitySection />
  if (active === "dispatch") return <DispatchSection />
  if (active === "alerts") return <AlertsSection />
  return <OverviewSection />
}
