"use client"

import {
  Layers,
  Truck,
  Leaf,
  FileBarChart,
  Trash2,
  Droplets,
  Zap,
  BarChart3,
  Gauge,
  CircleCheck,
  Download,
} from "lucide-react"
import Badge from "@/components/common/Badge"
import Card from "@/components/common/Card"
import StatCard from "@/components/common/StatCard"
import StatusDot from "@/components/common/StatusDot"
import { formatDate, formatNumber, formatTime, formatWeight, timeAgo } from "@/utils/helpers"
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
  { label: "Total Disposed (Month)", value: "14,320 t", delta: 6.4, icon: Trash2, tone: "brand", hint: "vs June" },
  { label: "Trucks Today", value: "42", delta: 12.5, icon: Truck, tone: "mint" },
  { label: "Avg Compaction Ratio", value: "0.85 t/m³", delta: 1.8, icon: Gauge, tone: "amber", hint: "vs target 0.80" },
  { label: "Cell Capacity Left", value: "38%", delta: -4.2, icon: Layers, tone: "destructive", hint: "across all cells" },
]

const weeklyDisposal = [
  { day: "Mon", value: 1820 },
  { day: "Tue", value: 1950 },
  { day: "Wed", value: 1740 },
  { day: "Thu", value: 2100 },
  { day: "Fri", value: 1880 },
  { day: "Sat", value: 2260 },
  { day: "Sun", value: 2040 },
]

const truckEntries = [
  { id: "D-4401", from: "STS Motijheel", arrival: "2026-07-31T07:42:00", load: 8.6, type: "organic", status: "weighed" },
  { id: "D-4407", from: "STS Mirpur", arrival: "2026-07-31T08:05:00", load: 7.9, type: "plastic", status: "weighed" },
  { id: "D-4420", from: "STS Gulshan", arrival: "2026-07-31T08:31:00", load: 9.2, type: "organic", status: "weighed" },
  { id: "D-4398", from: "STS Uttara", arrival: "2026-07-31T08:58:00", load: 6.4, type: "paper", status: "in_progress" },
  { id: "D-4432", from: "STS Banani", arrival: "2026-07-31T09:12:00", load: 8.1, type: "metal", status: "in_progress" },
  { id: "D-4415", from: "STS Dhanmondi", arrival: "2026-07-31T09:26:00", load: 7.3, type: "organic", status: "queued" },
  { id: "D-4409", from: "STS Mohammadpur", arrival: "2026-07-31T09:34:00", load: 8.8, type: "e_waste", status: "queued" },
  { id: "D-4441", from: "STS Khilgaon", arrival: "2026-07-31T09:41:00", load: 6.9, type: "hazardous", status: "queued" },
]

const cells = [
  { name: "A", capacity: 520000, used: 91, remainingYears: 1.2, leachate: "high", gas: "active" },
  { name: "B", capacity: 480000, used: 64, remainingYears: 4.5, leachate: "normal", gas: "active" },
  { name: "C", capacity: 610000, used: 22, remainingYears: 9.8, leachate: "low", gas: "planned" },
]

const emissionStats = [
  { label: "CH4 Captured (Month)", value: "2.4M m³", delta: 5.2, icon: Droplets, tone: "mint" },
  { label: "Gas Flared (Month)", value: "860k m³", delta: -8.1, icon: Leaf, tone: "amber" },
  { label: "Energy Recovered (Month)", value: "1,240 MWh", delta: 11.3, icon: Zap, tone: "brand" },
  { label: "Homes Powered", value: "4,800", delta: 9.4, icon: CircleCheck, tone: "destructive" },
]

const emissionParams = [
  { parameter: "Methane (CH4) concentration", value: "52%", limit: "60% max", lastChecked: "2026-07-31T07:30:00", status: "ok" },
  { parameter: "Leachate COD", value: "1,240 mg/L", limit: "1,000 mg/L", lastChecked: "2026-07-31T06:45:00", status: "exceeded" },
  { parameter: "Hydrogen Sulphide (H2S)", value: "8 ppm", limit: "10 ppm", lastChecked: "2026-07-31T07:30:00", status: "ok" },
  { parameter: "Leachate pH", value: "7.4", limit: "6.5 – 8.5", lastChecked: "2026-07-31T06:45:00", status: "ok" },
  { parameter: "Odour Index", value: "45", limit: "30 max", lastChecked: "2026-07-31T07:30:00", status: "exceeded" },
]

const reports = [
  { title: "Monthly Disposal Summary", period: "July 2026", generated: "2026-07-31", format: "PDF" },
  { title: "Gas Recovery & Flaring Report", period: "H1 2026", generated: "2026-07-05", format: "PDF" },
  { title: "Cell Capacity & Lifespan Forecast", period: "FY 2026–27", generated: "2026-06-28", format: "XLSX" },
  { title: "Environmental Compliance Report", period: "Q2 2026", generated: "2026-06-15", format: "PDF" },
  { title: "Leachate Quality Analysis", period: "June 2026", generated: "2026-07-02", format: "CSV" },
]

const entryBadge = (status) => {
  if (status === "weighed") return { variant: "success", label: "Weighed" }
  if (status === "in_progress") return { variant: "info", label: "In Progress" }
  return { variant: "warning", label: "Queued" }
}

function DisposalChart({ data }) {
  const max = Math.max(...data.map((d) => d.value))
  return (
    <div className="flex h-44 items-end gap-3">
      {data.map((d) => (
        <div key={d.day} className="group flex flex-1 flex-col items-center gap-2">
          <span className="text-[11px] font-semibold text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
            {formatNumber(d.value)} t
          </span>
          <div
            className="w-full rounded-t-lg bg-gradient-to-t from-mint/60 to-mint transition-opacity group-hover:opacity-80"
            style={{ height: `${Math.max((d.value / max) * 100, 6)}%` }}
          />
          <span className="text-xs text-muted-foreground">{d.day}</span>
        </div>
      ))}
    </div>
  )
}

function EntriesTable({ rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-6 py-3">Truck</th>
            <th className="px-6 py-3">From STS</th>
            <th className="px-6 py-3">Arrival</th>
            <th className="px-6 py-3">Load</th>
            <th className="px-6 py-3">Waste Type</th>
            <th className="px-6 py-3">Weighing</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((e) => {
            const st = entryBadge(e.status)
            return (
              <tr key={e.id} className="border-b border-border/40 last:border-0">
                <td className="px-6 py-3 font-semibold">{e.id}</td>
                <td className="px-6 py-3 text-muted-foreground">{e.from}</td>
                <td className="px-6 py-3 text-muted-foreground">{formatTime(e.arrival)}</td>
                <td className="px-6 py-3 font-medium">{formatWeight(e.load * 1000, { unit: "tonne" })}</td>
                <td className="px-6 py-3">
                  <Badge className={wasteColor(e.type)}>{wasteLabel(e.type)}</Badge>
                </td>
                <td className="px-6 py-3">
                  <Badge variant={st.variant}>{st.label}</Badge>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
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
          title="Weekly Disposal"
          subtitle="Tonnes landfilled per day"
          className="lg:col-span-2"
        >
          <DisposalChart data={weeklyDisposal} />
          <div className="mt-4 flex items-center justify-between rounded-xl bg-background/60 px-4 py-3">
            <div>
              <p className="text-xs text-muted-foreground">Week total</p>
              <p className="text-lg font-bold text-mint">
                {formatNumber(weeklyDisposal.reduce((sum, d) => sum + d.value, 0))} t
              </p>
            </div>
            <StatusDot status="green" label="Within capacity" />
          </div>
        </Card>

        <Card
          title="Today's Truck Entries"
          subtitle="Recent arrivals at the weighbridge"
          className="lg:col-span-3"
          bodyClassName="p-0"
        >
          <EntriesTable rows={truckEntries.slice(0, 5)} />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Landfill Cells" subtitle="Live capacity utilisation" bodyClassName="p-0">
          <div className="divide-y divide-border/40">
            {cells.map((c) => {
              const barColor = c.used >= 85 ? "bg-destructive" : c.used >= 60 ? "bg-amber-400" : "bg-mint"
              const dot = c.used >= 85 ? "red" : c.used >= 60 ? "amber" : "green"
              return (
                <div key={c.name} className="flex items-center gap-4 px-6 py-4">
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-secondary">
                    <Layers className="h-4 w-4 text-muted-foreground" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">
                        Cell {c.name}{" "}
                        <span className="ml-1 text-xs font-normal text-muted-foreground">{c.used}% full</span>
                      </p>
                      <Badge variant={c.used >= 85 ? "danger" : c.used >= 60 ? "warning" : "success"}>
                        {c.remainingYears} yrs left
                      </Badge>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div className={`h-full rounded-full ${barColor}`} style={{ width: `${c.used}%` }} />
                    </div>
                  </div>
                  <StatusDot status={dot} />
                </div>
              )
            })}
          </div>
        </Card>

        <Card title="Emissions Snapshot" subtitle="Latest gas and leachate readings" bodyClassName="p-0">
          <div className="divide-y divide-border/40">
            {emissionParams.map((p) => (
              <div key={p.parameter} className="flex items-center gap-4 px-6 py-4">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-secondary">
                  {p.status === "ok" ? (
                    <CircleCheck className="h-4 w-4 text-mint" />
                  ) : (
                    <Zap className="h-4 w-4 text-destructive" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{p.parameter}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {p.value} · limit {p.limit} · checked {timeAgo(p.lastChecked)}
                  </p>
                </div>
                <Badge variant={p.status === "ok" ? "success" : "danger"}>
                  {p.status === "ok" ? "OK" : "Exceeded"}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

function EntriesSection() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Entries Today" value="42" delta={12.5} icon={Truck} tone="brand" hint="vs yesterday" />
        <StatCard label="Avg Load per Truck" value="7.9 t" delta={2.1} icon={BarChart3} tone="mint" />
        <StatCard label="Awaiting Weighing" value="6" delta={20.0} icon={Gauge} tone="amber" />
        <StatCard label="Total Disposed Today" value="332 t" delta={6.8} icon={Trash2} tone="destructive" hint="target 360 t" />
      </div>

      <Card title="Vehicle Entries" subtitle="Trucks arriving at the landfill gate today" bodyClassName="p-0">
        <EntriesTable rows={truckEntries} />
      </Card>
    </div>
  )
}

function CellsSection() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active Cells" value="3" delta={0} icon={Layers} tone="brand" hint="unchanged" />
        <StatCard label="Total Capacity" value="1.61M m³" delta={0} icon={BarChart3} tone="mint" hint="unchanged" />
        <StatCard label="Cell A Life Left" value="1.2 yrs" delta={-18.2} icon={Gauge} tone="destructive" hint="vs last quarter" />
        <StatCard label="Gas Recovery Wells" value="48" delta={4.3} icon={Leaf} tone="amber" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {cells.map((c) => {
          const dot = c.leachate === "high" ? "red" : c.leachate === "normal" ? "green" : "blue"
          const barColor = c.used >= 85 ? "bg-destructive" : c.used >= 60 ? "bg-amber-400" : "bg-mint"
          return (
            <Card key={c.name} title={`Cell ${c.name}`} subtitle={`Capacity ${formatNumber(c.capacity)} m³`}>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15 text-brand">
                  <Layers className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">Used capacity</p>
                  <p className="font-semibold">{c.used}%</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Filling progress</span>
                  <span className="font-semibold">{c.used}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`h-full rounded-full ${barColor}`}
                    style={{ width: `${c.used}%` }}
                  />
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Estimated life left</span>
                  <span className="font-semibold">{c.remainingYears} years</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Leachate level</span>
                  <StatusDot status={dot} label={c.leachate} />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <Badge variant={c.gas === "active" ? "success" : "neutral"}>
                  {c.gas === "active" ? "Gas recovery active" : "Recovery planned"}
                </Badge>
                <StatusDot
                  status={c.used >= 85 ? "red" : "green"}
                  label={c.used >= 85 ? "Near full" : "Operating"}
                  pulse={c.used >= 85}
                />
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function EmissionsSection() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {emissionStats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <Card
        title="Gas & Leachate Parameters"
        subtitle="Latest sampling results vs permitted limits"
        bodyClassName="p-0"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-6 py-3">Parameter</th>
                <th className="px-6 py-3">Current Value</th>
                <th className="px-6 py-3">Permitted Limit</th>
                <th className="px-6 py-3">Last Checked</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {emissionParams.map((p) => (
                <tr key={p.parameter} className="border-b border-border/40 last:border-0">
                  <td className="px-6 py-3 font-semibold">{p.parameter}</td>
                  <td className="px-6 py-3 font-medium">{p.value}</td>
                  <td className="px-6 py-3 text-muted-foreground">{p.limit}</td>
                  <td className="px-6 py-3 text-muted-foreground">{timeAgo(p.lastChecked)}</td>
                  <td className="px-6 py-3">
                    <Badge variant={p.status === "ok" ? "success" : "danger"}>
                      {p.status === "ok" ? "OK" : "Exceeded"}
                    </Badge>
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

function ReportsSection() {
  return (
    <Card title="Generated Reports" subtitle="Operational and compliance reports for the landfill" bodyClassName="p-0">
      <div className="divide-y divide-border/40">
        {reports.map((r) => (
          <div key={r.title} className="flex flex-wrap items-center gap-4 px-6 py-4">
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-brand/15 text-brand">
              <FileBarChart className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{r.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {r.period} · generated {formatDate(r.generated)} · {r.format}
              </p>
            </div>
            <Badge variant={r.format === "PDF" ? "info" : "neutral"}>{r.format}</Badge>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </button>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default function LandfillManagerDashboard({ active }) {
  if (active === "entries") return <EntriesSection />
  if (active === "cells") return <CellsSection />
  if (active === "emissions") return <EmissionsSection />
  if (active === "reports") return <ReportsSection />
  return <OverviewSection />
}
