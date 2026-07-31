"use client"

import { useState } from "react"
import {
  PlusCircle,
  ClipboardList,
  Receipt,
  Recycle,
  Trash2,
  Sparkles,
  MapPin,
  CheckCircle2,
  Wallet,
  Calendar,
} from "lucide-react"
import Badge from "@/components/common/Badge"
import Card from "@/components/common/Card"
import StatCard from "@/components/common/StatCard"
import StatusDot from "@/components/common/StatusDot"
import { formatDate, formatNumber, formatWeight } from "@/utils/helpers"
import { STATUS, WASTE_TYPES } from "@/utils/constants"

const stats = [
  { label: "Pending Pickups", value: "2", delta: -33.3, icon: Trash2, tone: "amber" },
  { label: "Waste Recycled (Month)", value: "48 kg", delta: 12.4, icon: Recycle, tone: "mint" },
  { label: "Monthly Bill", value: "৳1,250", delta: 5.9, icon: Wallet, tone: "brand" },
  { label: "Reward Points", value: formatNumber(12450, { maximumFractionDigits: 0 }), delta: 8.2, icon: Sparkles, tone: "neutral" },
]

const schedule = [
  { time: "09:00", wasteType: "organic", address: "House 12, Road 5, Dhanmondi R/A", status: "completed" },
  { time: "11:30", wasteType: "plastic", address: "House 45, Road 9, Gulshan-1", status: "pending" },
  { time: "14:00", wasteType: "paper", address: "Flat 3B, House 22, Banani", status: "scheduled" },
]

const requests = [
  { id: "REQ-1041", wasteType: "organic", weight: 18, date: "2026-07-29T08:00:00", status: "completed" },
  { id: "REQ-1042", wasteType: "plastic", weight: 6, date: "2026-07-30T09:30:00", status: "in_progress" },
  { id: "REQ-1043", wasteType: "paper", weight: 9, date: "2026-07-31T10:15:00", status: "scheduled" },
  { id: "REQ-1044", wasteType: "e_waste", weight: 4, date: "2026-07-31T15:45:00", status: "pending" },
  { id: "REQ-1045", wasteType: "organic", weight: 12, date: "2026-08-02T08:30:00", status: "pending" },
  { id: "REQ-1046", wasteType: "metal", weight: 7, date: "2026-08-03T11:00:00", status: "scheduled" },
]

const bills = [
  { month: "July 2026", amount: "৳1,250", dueDate: "2026-08-05T12:00:00", status: "unpaid" },
  { month: "June 2026", amount: "৳1,180", dueDate: "2026-07-05T12:00:00", status: "paid" },
  { month: "May 2026", amount: "৳1,220", dueDate: "2026-06-05T12:00:00", status: "paid" },
  { month: "April 2026", amount: "৳1,090", dueDate: "2026-05-05T12:00:00", status: "paid" },
]

const totalPoints = 12450

const rewardHistory = [
  { date: "2026-07-28T10:00:00", description: "Plastic bottles drop-off", weight: 3.5, points: 140 },
  { date: "2026-07-22T16:30:00", description: "Newspaper recycling", weight: 6, points: 180 },
  { date: "2026-07-15T11:45:00", description: "Aluminium cans", weight: 2, points: 220 },
  { date: "2026-07-08T09:20:00", description: "Cardboard boxes", weight: 8, points: 160 },
]

const centers = [
  { name: "EcoHub Dhanmondi", address: "Road 27, Dhanmondi R/A", accepts: ["Plastic", "Paper", "E-Waste"], open: true },
  { name: "Green Point Gulshan", address: "House 74, Gulshan Avenue-2", accepts: ["Organic", "Plastic", "Metal"], open: true },
  { name: "Recycle Hub Banani", address: "Block C, Banani", accepts: ["Paper", "Metal", "E-Waste"], open: false },
  { name: "CleanUp Mohammadpur", address: "Main Road, Mohammadpur", accepts: ["Organic", "Paper"], open: true },
]

const rules = [
  { title: "Segregate at source", detail: "Keep organic and recyclable waste in separate bags before handover." },
  { title: "Maximum weight per request", detail: "Up to 25 kg per pickup. For larger loads contact the area office." },
  { title: "Leave waste at the gate", detail: "Place bags at the main gate by 08:00 on the scheduled day." },
  { title: "Track your request", detail: "Follow pickup status from the My Requests section." },
]

const wasteVariant = {
  organic: "success",
  plastic: "info",
  paper: "warning",
  metal: "neutral",
  e_waste: "danger",
  hazardous: "danger",
}

const wasteLabel = (key) => WASTE_TYPES.find((t) => t.key === key)?.label || key

function OverviewSection() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card title="Today's Schedule" subtitle="Pickups assigned to your household" className="lg:col-span-2" bodyClassName="p-0">
          <div className="divide-y divide-border/40">
            {schedule.map((s) => (
              <div key={s.time} className="flex items-center gap-4 px-6 py-4">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-secondary">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{s.time}</p>
                    <Badge variant={wasteVariant[s.wasteType]}>{wasteLabel(s.wasteType)}</Badge>
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {s.address}
                  </p>
                </div>
                <StatusDot
                  status={s.status === "completed" ? "green" : s.status === "pending" ? "amber" : "blue"}
                  label={STATUS[s.status].label}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card title="Recent Requests" subtitle="Latest pickup requests" className="lg:col-span-3" bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-6 py-3">Request ID</th>
                  <th className="px-6 py-3">Waste Type</th>
                  <th className="px-6 py-3">Weight</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.slice(0, 4).map((r) => (
                  <tr key={r.id} className="border-b border-border/40 last:border-0">
                    <td className="px-6 py-3 font-semibold">{r.id}</td>
                    <td className="px-6 py-3">
                      <Badge variant={wasteVariant[r.wasteType]}>{wasteLabel(r.wasteType)}</Badge>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">{formatWeight(r.weight)}</td>
                    <td className="px-6 py-3 text-muted-foreground">{formatDate(r.date)}</td>
                    <td className="px-6 py-3">
                      <Badge variant={STATUS[r.status].variant}>{STATUS[r.status].label}</Badge>
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

function RequestSection() {
  const [wasteType, setWasteType] = useState(WASTE_TYPES[0].key)
  const [weight, setWeight] = useState("")
  const [address, setAddress] = useState("")
  const [date, setDate] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [nextId, setNextId] = useState(1047)
  const [createdRequests, setCreatedRequests] = useState([])

  const lastCreated = createdRequests.length > 0 ? createdRequests[createdRequests.length - 1] : null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!weight || !address || !date) return
    setCreatedRequests((prev) => [...prev, { id: `REQ-${nextId}`, wasteType, weight: Number(weight), address, date }])
    setNextId((n) => n + 1)
    setSubmitted(true)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card title="Request a Pickup" subtitle="Schedule door-to-door waste collection">
        {submitted && lastCreated && (
          <div className="mb-5 flex items-start gap-3 rounded-xl bg-mint/15 p-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-mint" />
            <div>
              <p className="text-sm font-semibold text-mint">Pickup request submitted</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                Request {lastCreated.id} · {wasteLabel(lastCreated.wasteType)} · {formatWeight(lastCreated.weight)} from{" "}
                {lastCreated.address} on {formatDate(lastCreated.date)}.
              </p>
              {createdRequests.length > 1 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {createdRequests.length} requests submitted this session
                </p>
              )}
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Waste Type</label>
            <select
              value={wasteType}
              onChange={(e) => setWasteType(e.target.value)}
              className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground focus:border-brand focus:outline-none"
            >
              {WASTE_TYPES.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Weight (kg)</label>
            <input
              type="number"
              min="1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g. 15"
              className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Pickup Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House, Road, Area"
              className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Preferred Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90"
          >
            <PlusCircle className="h-4 w-4" />
            Request Pickup
          </button>
        </form>
      </Card>

      <Card title="Collection Rules" subtitle="What to know before requesting" bodyClassName="p-0">
        <div className="divide-y divide-border/40">
          {rules.map((r) => (
            <div key={r.title} className="flex gap-4 px-6 py-4">
              <span className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-brand/15 text-brand">
                <CheckCircle2 className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold">{r.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{r.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function RequestsSection() {
  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-3 rounded-xl bg-secondary px-4 py-3">
        <ClipboardList className="h-5 w-5 text-brand" />
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{requests.length} total requests</span> ·{" "}
          {requests.filter((r) => r.status === "pending").length} pending pickup
        </p>
      </div>
      <Card title="My Requests" subtitle="All pickup requests" bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-6 py-3">Request ID</th>
                <th className="px-6 py-3">Waste Type</th>
                <th className="px-6 py-3">Weight</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="border-b border-border/40 last:border-0">
                  <td className="px-6 py-3 font-semibold">{r.id}</td>
                  <td className="px-6 py-3">
                    <Badge variant={wasteVariant[r.wasteType]}>{wasteLabel(r.wasteType)}</Badge>
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">{formatWeight(r.weight)}</td>
                  <td className="px-6 py-3 text-muted-foreground">{formatDate(r.date)}</td>
                  <td className="px-6 py-3">
                    <Badge variant={STATUS[r.status].variant}>{STATUS[r.status].label}</Badge>
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

function BillsSection() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Next Due Bill" value="৳1,250" delta={0} icon={Receipt} tone="amber" hint="due 5 Aug" />
        <StatCard label="Paid (Year)" value="৳14,320" delta={6.8} icon={Wallet} tone="mint" />
        <StatCard label="Outstanding" value="৳1,250" delta={0} icon={Trash2} tone="destructive" hint="1 unpaid" />
        <StatCard label="On-time Rate" value="100%" delta={0} icon={CheckCircle2} tone="brand" hint="last 12 months" />
      </div>
      <Card title="Monthly Bills" subtitle="Waste collection charges for your household" bodyClassName="p-0">
        <div className="divide-y divide-border/40">
          {bills.map((b) => (
            <div key={b.month} className="flex items-center gap-4 px-6 py-4">
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-secondary">
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{b.month}</p>
                  <p className="font-semibold text-mint">{b.amount}</p>
                </div>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Due {formatDate(b.dueDate)}
                </p>
              </div>
              <Badge variant={b.status === "paid" ? "success" : "warning"}>
                {b.status === "paid" ? "Paid" : "Unpaid"}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function RecycleSection() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card title="Reward Points" subtitle="Earned from recycling drop-offs" bodyClassName="p-0">
        <div className="border-b border-border/40 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint/15 text-mint">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">Total balance</p>
              <p className="text-2xl font-bold tracking-tight">{formatNumber(totalPoints, { maximumFractionDigits: 0 })}</p>
            </div>
          </div>
          <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full w-2/3 rounded-full bg-mint" />
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">4,150 points to the next reward tier</p>
        </div>
        <div className="divide-y divide-border/40">
          {rewardHistory.map((r) => (
            <div key={r.description} className="flex items-center justify-between gap-3 px-6 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{r.description}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(r.date)} · {formatWeight(r.weight)}
                </p>
              </div>
              <Badge variant="success">+{r.points}</Badge>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Recycling Centers" subtitle="Nearby drop-off points in Dhaka" className="lg:col-span-2" bodyClassName="p-0">
        <div className="divide-y divide-border/40">
          {centers.map((c) => (
            <div key={c.name} className="flex items-start gap-4 px-6 py-4">
              <span
                className={`flex h-9 w-9 flex-none items-center justify-center rounded-lg ${
                  c.open ? "bg-mint/15 text-mint" : "bg-secondary text-muted-foreground"
                }`}
              >
                <Recycle className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{c.name}</p>
                  <StatusDot status={c.open ? "green" : "gray"} label={c.open ? "Open now" : "Closed"} />
                </div>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {c.address}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {c.accepts.map((a) => (
                    <span key={a} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default function HouseOwnerDashboard({ active }) {
  if (active === "request") return <RequestSection />
  if (active === "requests") return <RequestsSection />
  if (active === "bills") return <BillsSection />
  if (active === "recycle") return <RecycleSection />
  return <OverviewSection />
}
