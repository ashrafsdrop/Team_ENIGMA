"use client"

import {
  Building2,
  Trash2,
  Truck,
  Users,
  MapPin,
  AlertTriangle,
  Activity,
} from "lucide-react"
import Badge from "@/components/common/Badge"
import Card from "@/components/common/Card"
import StatCard from "@/components/common/StatCard"
import StatusDot from "@/components/common/StatusDot"
import { formatNumber, formatWeight } from "@/utils/helpers"

const stats = [
  { label: "Total Wards", value: "12", delta: 0, icon: MapPin, tone: "brand", hint: "unchanged" },
  { label: "Households Covered", value: "248,390", delta: 4.2, icon: Users, tone: "mint" },
  { label: "Waste Collected (Month)", value: "6,840 t", delta: 8.1, icon: Trash2, tone: "amber" },
  { label: "Active Vehicles", value: "186", delta: -2.3, icon: Truck, tone: "destructive", hint: "from last month" },
]

const collectionTrend = [
  { month: "Feb", value: 42 },
  { month: "Mar", value: 55 },
  { month: "Apr", value: 48 },
  { month: "May", value: 62 },
  { month: "Jun", value: 70 },
  { month: "Jul", value: 84 },
]

const wardPerformance = [
  { ward: "Ward 03", area: "Motijheel", households: "21,450", collected: 842, target: 860, status: "optimal" },
  { ward: "Ward 05", area: "Gulshan", households: "18,920", collected: 610, target: 640, status: "good" },
  { ward: "Ward 07", area: "Mirpur", households: "24,110", collected: 705, target: 700, status: "warning" },
  { ward: "Ward 09", area: "Dhanmondi", households: "16,540", collected: 445, target: 480, status: "warning" },
  { ward: "Ward 11", area: "Uttara", households: "20,330", collected: 530, target: 580, status: "critical" },
]

const alerts = [
  { title: "STS Mirpur near capacity", detail: "STS utilization crossed 85%. Dispatch trucks urgently.", level: "danger", time: "2026-07-31T09:24:00" },
  { title: "Van DN-2211 off route", detail: "Van DN-2211 deviated from assigned route in Ward 07.", level: "warning", time: "2026-07-31T08:05:00" },
  { title: "Landfill compaction below target", detail: "Average compaction ratio fell to 0.62 t/m³.", level: "warning", time: "2026-07-31T06:40:00" },
  { title: "Route 12 completed", detail: "Truck D-4401 completed morning route with 96% coverage.", level: "success", time: "2026-07-31T06:10:00" },
]

const fleets = [
  { id: "D-4401", type: "Compactor Truck", assigned: "Ward 03–04", utilization: 92, status: "good" },
  { id: "D-4407", type: "Open Truck", assigned: "Ward 07", utilization: 61, status: "warning" },
  { id: "V-2203", type: "Collection Van", assigned: "Ward 11", utilization: 34, status: "critical" },
  { id: "V-2209", type: "Collection Van", assigned: "Ward 05", utilization: 78, status: "good" },
]

const statusDot = { optimal: "green", good: "green", warning: "amber", critical: "red" }

function TrendChart({ data }) {
  const max = Math.max(...data.map((d) => d.value))
  return (
    <div className="flex h-44 items-end gap-3">
      {data.map((d) => (
        <div key={d.month} className="group flex flex-1 flex-col items-center gap-2">
          <span className="text-[11px] font-semibold text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
            {d.value}%
          </span>
          <div
            className="w-full rounded-t-lg bg-gradient-to-t from-brand/60 to-brand transition-opacity group-hover:opacity-80"
            style={{ height: `${Math.max((d.value / max) * 100, 6)}%` }}
          />
          <span className="text-xs text-muted-foreground">{d.month}</span>
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
          title="Monthly Collection Rate"
          subtitle="Percentage of scheduled households served"
          className="lg:col-span-2"
        >
          <TrendChart data={collectionTrend} />
          <div className="mt-4 flex items-center justify-between rounded-xl bg-background/60 px-4 py-3">
            <div>
              <p className="text-xs text-muted-foreground">July average</p>
              <p className="text-lg font-bold text-mint">84%</p>
            </div>
            <StatusDot status="green" label="On track" />
          </div>
        </Card>

        <Card
          title="Ward Performance"
          subtitle="Collected vs target (tonnes / month)"
          className="lg:col-span-3"
          bodyClassName="p-0"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-6 py-3">Ward</th>
                  <th className="px-6 py-3">Area</th>
                  <th className="px-6 py-3">Households</th>
                  <th className="px-6 py-3">Collected</th>
                  <th className="px-6 py-3">Target</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {wardPerformance.map((w) => {
                  const pct = Math.round((w.collected / w.target) * 100)
                  const barColor =
                    pct >= 95 ? "bg-mint" : pct >= 85 ? "bg-brand" : "bg-amber-400"
                  return (
                    <tr key={w.ward} className="border-b border-border/40 last:border-0">
                      <td className="px-6 py-3 font-semibold">{w.ward}</td>
                      <td className="px-6 py-3 text-muted-foreground">{w.area}</td>
                      <td className="px-6 py-3 text-muted-foreground">{formatNumber(w.households, { maximumFractionDigits: 0 })}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-secondary">
                            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="font-medium">{formatWeight(w.collected * 1000, { unit: "tonne" })}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">{formatWeight(w.target * 1000, { unit: "tonne" })}</td>
                      <td className="px-6 py-3">
                        <Badge variant={w.status === "optimal" || w.status === "good" ? "success" : w.status === "warning" ? "warning" : "danger"}>
                          {w.status}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Fleet Utilization" subtitle="Live utilization by vehicle" bodyClassName="p-0">
          <div className="divide-y divide-border/40">
            {fleets.map((f) => {
              const color =
                f.utilization >= 80 ? "bg-mint" : f.utilization >= 50 ? "bg-brand" : "bg-amber-400"
              return (
                <div key={f.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-secondary">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">
                        {f.id} <span className="ml-1 text-xs font-normal text-muted-foreground">{f.type}</span>
                      </p>
                      <Badge variant={f.utilization >= 80 ? "success" : f.utilization >= 50 ? "info" : "warning"}>
                        {f.utilization}%
                      </Badge>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div className={`h-full rounded-full ${color}`} style={{ width: `${f.utilization}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{f.assigned}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card title="Live Alerts" subtitle="System events requiring attention" bodyClassName="p-0">
          <div className="divide-y divide-border/40">
            {alerts.map((a, i) => (
              <div key={i} className="flex gap-4 px-6 py-4">
                <span
                  className={`mt-1 flex h-8 w-8 flex-none items-center justify-center rounded-lg ${
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
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{a.title}</p>
                    <StatusDot
                      status={a.level === "danger" ? "red" : a.level === "warning" ? "amber" : "green"}
                      label={a.time.split("T")[1].slice(0, 5)}
                    />
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{a.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

function WardsSection() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {wardPerformance.map((w) => {
        const pct = Math.round((w.collected / w.target) * 100)
        return (
          <Card key={w.ward} title={w.ward} subtitle={w.area}>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15 text-brand">
                <Building2 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs text-muted-foreground">Households</p>
                <p className="font-semibold">{formatNumber(w.households, { maximumFractionDigits: 0 })}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Collection rate</span>
                <span className="font-semibold">{pct}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={`h-full rounded-full ${pct >= 95 ? "bg-mint" : pct >= 85 ? "bg-brand" : "bg-amber-400"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <Badge variant={pct >= 90 ? "success" : pct >= 85 ? "info" : "warning"}>
                {pct >= 90 ? "On target" : pct >= 85 ? "Close to target" : "Below target"}
              </Badge>
              <StatusDot status={statusDot[w.status]} label={w.status} />
            </div>
          </Card>
        )
      })}
    </div>
  )
}

function FleetSection() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Fleet" value="186" delta={2.1} icon={Truck} tone="brand" />
        <StatCard label="Operational" value="171" delta={1.4} icon={Activity} tone="mint" />
        <StatCard label="Under Maintenance" value="11" delta={-8.3} icon={Truck} tone="amber" />
        <StatCard label="Off Route" value="4" delta={33.3} icon={AlertTriangle} tone="destructive" />
      </div>
      <Card title="Fleet Overview" subtitle="All vehicles assigned to collection duties" bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-6 py-3">Vehicle</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Assigned Area</th>
                <th className="px-6 py-3">Utilization</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {fleets.map((f) => (
                <tr key={f.id} className="border-b border-border/40 last:border-0">
                  <td className="px-6 py-3 font-semibold">{f.id}</td>
                  <td className="px-6 py-3 text-muted-foreground">{f.type}</td>
                  <td className="px-6 py-3 text-muted-foreground">{f.assigned}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-secondary">
                        <div
                          className={`h-full rounded-full ${f.utilization >= 80 ? "bg-mint" : f.utilization >= 50 ? "bg-brand" : "bg-amber-400"}`}
                          style={{ width: `${f.utilization}%` }}
                        />
                      </div>
                      <span className="font-medium">{f.utilization}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <Badge variant={f.utilization >= 80 ? "success" : f.utilization >= 50 ? "info" : "warning"}>
                      {f.utilization >= 80 ? "Operational" : f.utilization >= 50 ? "Active" : "Underused"}
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

function AlertsSection() {
  return (
    <Card title="Alert Center" subtitle="Prioritized system alerts for the mayor" bodyClassName="p-0">
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
              <AlertTriangle className="h-4.5 w-4.5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold">{a.title}</p>
                <Badge variant={a.level === "danger" ? "danger" : a.level === "warning" ? "warning" : "success"}>
                  {a.level}
                </Badge>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{a.detail}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {a.time.split("T")[0]} at {a.time.split("T")[1].slice(0, 5)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default function AdminDashboard({ active }) {
  if (active === "wards") return <WardsSection />
  if (active === "fleet") return <FleetSection />
  if (active === "alerts") return <AlertsSection />
  return <OverviewSection />
}
