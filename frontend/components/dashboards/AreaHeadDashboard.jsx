"use client"

import {
  MapPin,
  Users,
  Trash2,
  ClipboardList,
  Truck,
  Star,
  AlertTriangle,
  Building2,
  Container,
} from "lucide-react"
import Badge from "@/components/common/Badge"
import Card from "@/components/common/Card"
import StatCard from "@/components/common/StatCard"
import StatusDot from "@/components/common/StatusDot"
import { formatDate, formatNumber, formatWeight } from "@/utils/helpers"

const stats = [
  { label: "Assigned Wards", value: "5", delta: 0, icon: MapPin, tone: "brand", hint: "unchanged" },
  { label: "Households Covered", value: "102,730", delta: 3.1, icon: Users, tone: "mint" },
  { label: "Waste Collected (Month)", value: "1,460 t", delta: 6.4, icon: Trash2, tone: "amber" },
  { label: "Open Complaints", value: "23", delta: -12.5, icon: ClipboardList, tone: "destructive", hint: "from last month" },
]

const wards = [
  { ward: "Ward 05", area: "Gulshan", households: 21450, coverage: 94, complaintRate: 2.1, status: "good" },
  { ward: "Ward 09", area: "Dhanmondi", households: 16540, coverage: 91, complaintRate: 3.0, status: "good" },
  { ward: "Ward 03", area: "Motijheel", households: 21880, coverage: 88, complaintRate: 4.2, status: "warning" },
  { ward: "Ward 07", area: "Mirpur", households: 24110, coverage: 83, complaintRate: 5.6, status: "warning" },
  { ward: "Ward 11", area: "Uttara", households: 20330, coverage: 78, complaintRate: 7.4, status: "critical" },
]

const contractors = [
  { name: "Bashundhara Waste Mgmt", areas: "Gulshan, Banani", vehicles: 42, lastCollection: "2026-07-31T07:40:00", rating: 4.6, collected: 1280, target: 1350, status: "good" },
  { name: "Meghna Clean Services", areas: "Mirpur, Mohammadpur", vehicles: 35, lastCollection: "2026-07-31T09:02:00", rating: 4.8, collected: 1110, target: 1080, status: "good" },
  { name: "Rahimafrooz Logistics", areas: "Motijheel, Khilgaon", vehicles: 28, lastCollection: "2026-07-31T08:15:00", rating: 4.2, collected: 890, target: 900, status: "warning" },
  { name: "City Greening Co.", areas: "Dhanmondi", vehicles: 16, lastCollection: "2026-07-30T16:45:00", rating: 3.7, collected: 340, target: 420, status: "critical" },
]

const collectionPoints = [
  { name: "STS Mirpur-12", area: "Mirpur", fill: 91, capacity: "10 t", lastEmptied: "2026-07-30T19:20:00", status: "critical" },
  { name: "STS Gulshan-2", area: "Gulshan", fill: 88, capacity: "12 t", lastEmptied: "2026-07-31T05:30:00", status: "critical" },
  { name: "Container Bay Banani 11", area: "Banani", fill: 64, capacity: "6 t", lastEmptied: "2026-07-31T06:10:00", status: "warning" },
  { name: "STS Dhanmondi 27", area: "Dhanmondi", fill: 42, capacity: "8 t", lastEmptied: "2026-07-31T08:00:00", status: "good" },
  { name: "Container Bay Motijheel", area: "Motijheel", fill: 27, capacity: "4 t", lastEmptied: "2026-07-31T09:15:00", status: "good" },
]

const alerts = [
  { title: "Container Bay Banani 11 near capacity", detail: "Container utilization at 82%. Schedule a pickup within 2 hours.", level: "warning", time: "2026-07-31T09:40:00" },
  { title: "City Greening Co. behind schedule", detail: "Last collection in Dhanmondi was over 16 hours ago. Compliance score declining.", level: "danger", time: "2026-07-31T07:35:00" },
  { title: "Ward 07 coverage below target", detail: "Scheduled households served dropped to 83% in Mirpur this week.", level: "warning", time: "2026-07-31T08:52:00" },
  { title: "STS Gulshan-2 emptied on time", detail: "Morning transfer completed at 05:30 and full load dispatched to landfill.", level: "success", time: "2026-07-31T06:02:00" },
]

const statusDot = { good: "green", warning: "amber", critical: "red" }

const statusBadge = (status) => (status === "good" ? "success" : status === "warning" ? "warning" : "danger")

const fillColor = (fill) => (fill >= 85 ? "bg-destructive" : fill >= 60 ? "bg-amber-400" : "bg-mint")

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
          title="Contractor Performance"
          subtitle="Collected vs target (tonnes / month)"
          className="lg:col-span-3"
          bodyClassName="p-0"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-6 py-3">Contractor</th>
                  <th className="px-6 py-3">Areas</th>
                  <th className="px-6 py-3">Vehicles</th>
                  <th className="px-6 py-3">Collected</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {contractors.map((c) => {
                  const pct = Math.round((c.collected / c.target) * 100)
                  const barColor = pct >= 95 ? "bg-mint" : pct >= 85 ? "bg-brand" : "bg-amber-400"
                  return (
                    <tr key={c.name} className="border-b border-border/40 last:border-0">
                      <td className="px-6 py-3 font-semibold">{c.name}</td>
                      <td className="px-6 py-3 text-muted-foreground">{c.areas}</td>
                      <td className="px-6 py-3 text-muted-foreground">{c.vehicles}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-secondary">
                            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="font-medium">{formatWeight(c.collected * 1000, { unit: "tonne" })}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <Badge variant={statusBadge(c.status)}>{c.status}</Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card
          title="Collection Points Status"
          subtitle="Fill level across container sites"
          className="lg:col-span-2"
          bodyClassName="p-0"
        >
          <div className="divide-y divide-border/40">
            {collectionPoints.map((c) => (
              <div key={c.name} className="flex items-center gap-4 px-6 py-4">
                <span
                  className={`flex h-9 w-9 flex-none items-center justify-center rounded-lg ${
                    c.fill >= 85
                      ? "bg-destructive/15 text-destructive"
                      : c.fill >= 60
                        ? "bg-amber-500/15 text-amber-400"
                        : "bg-mint/15 text-mint"
                  }`}
                >
                  <Container className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate font-semibold">
                      {c.name} <span className="ml-1 text-xs font-normal text-muted-foreground">{c.area}</span>
                    </p>
                    <StatusDot status={statusDot[c.status]} label={`${c.fill}%`} />
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div className={`h-full rounded-full ${fillColor(c.fill)}`} style={{ width: `${c.fill}%` }} />
                  </div>
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <Truck className="h-3 w-3" />
                    Capacity {c.capacity} · Last emptied {formatDate(c.lastEmptied)}
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

function WardsSection() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {wards.map((w) => (
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
              <span className="text-muted-foreground">Coverage rate</span>
              <span className="font-semibold">{w.coverage}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className={`h-full rounded-full ${w.coverage >= 90 ? "bg-mint" : w.coverage >= 85 ? "bg-brand" : "bg-amber-400"}`}
                style={{ width: `${w.coverage}%` }}
              />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <Badge variant={w.coverage >= 90 ? "success" : w.coverage >= 85 ? "info" : "warning"}>
              {w.coverage >= 90 ? "On target" : w.coverage >= 85 ? "Close to target" : "Below target"}
            </Badge>
            <StatusDot status={statusDot[w.status]} label={w.status} />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {w.complaintRate} complaints per 1,000 households
          </p>
        </Card>
      ))}
    </div>
  )
}

function ContractorsSection() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active Contractors" value="4" delta={0} icon={Users} tone="brand" hint="unchanged" />
        <StatCard label="Covered Areas" value="8" delta={14.3} icon={MapPin} tone="mint" />
        <StatCard label="Fleet Vehicles" value="121" delta={3.4} icon={Truck} tone="amber" />
        <StatCard label="Avg. Rating" value="4.3" delta={0.8} icon={Star} tone="destructive" />
      </div>
      <Card title="Contractor Registry" subtitle="Waste collection contractors in your area" bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-6 py-3">Contractor</th>
                <th className="px-6 py-3">Areas</th>
                <th className="px-6 py-3">Vehicles</th>
                <th className="px-6 py-3">Last Collection</th>
                <th className="px-6 py-3">Rating</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {contractors.map((c) => (
                <tr key={c.name} className="border-b border-border/40 last:border-0">
                  <td className="px-6 py-3 font-semibold">{c.name}</td>
                  <td className="px-6 py-3 text-muted-foreground">{c.areas}</td>
                  <td className="px-6 py-3 text-muted-foreground">{c.vehicles}</td>
                  <td className="px-6 py-3 text-muted-foreground">{formatDate(c.lastCollection)}</td>
                  <td className="px-6 py-3">
                    <span className="flex items-center gap-1 font-medium">
                      <Star className="h-3.5 w-3.5 text-amber-400" />
                      {c.rating.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <Badge variant={statusBadge(c.status)}>{c.status}</Badge>
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

function CollectionSection() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {collectionPoints.map((c) => (
        <Card
          key={c.name}
          title={c.name}
          subtitle={c.area}
          action={<StatusDot status={statusDot[c.status]} label={c.status} pulse={c.status === "critical"} />}
        >
          <div className="flex items-center gap-3">
            <span
              className={`flex h-10 w-10 flex-none items-center justify-center rounded-xl ${
                c.fill >= 85
                  ? "bg-destructive/15 text-destructive"
                  : c.fill >= 60
                    ? "bg-amber-500/15 text-amber-400"
                    : "bg-mint/15 text-mint"
              }`}
            >
              <Container className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Fill level</span>
                <span className="font-semibold">{c.fill}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div className={`h-full rounded-full ${fillColor(c.fill)}`} style={{ width: `${c.fill}%` }} />
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Trash2 className="h-3.5 w-3.5" />
              Capacity {c.capacity}
            </span>
            <span className="flex items-center gap-1">
              <Truck className="h-3.5 w-3.5" />
              Emptied {formatDate(c.lastEmptied)}
            </span>
          </div>
        </Card>
      ))}
    </div>
  )
}

function AlertsSection() {
  return (
    <Card title="Alert Center" subtitle="Prioritized alerts for your assigned wards" bodyClassName="p-0">
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
              <AlertTriangle className="h-5 w-5" />
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

export default function AreaHeadDashboard({ active }) {
  if (active === "wards") return <WardsSection />
  if (active === "contractors") return <ContractorsSection />
  if (active === "collection") return <CollectionSection />
  if (active === "alerts") return <AlertsSection />
  return <OverviewSection />
}
