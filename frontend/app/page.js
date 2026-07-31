import Link from "next/link"
import {
  ArrowRight,
  BellRing,
  Building2,
  ClipboardCheck,
  ClipboardList,
  Home,
  Landmark,
  Leaf,
  MapPin,
  Recycle,
  Route,
  Trash2,
  Truck,
  Users,
  Warehouse,
  Zap,
} from "lucide-react"
import { APP_NAME, APP_TAGLINE, ROLES } from "@/utils/constants"

const flow = [
  {
    icon: Home,
    title: "House Owner",
    body: "Requests pickup through the app — waste never sits on the street.",
    tone: "text-brand bg-brand/15",
  },
  {
    icon: Truck,
    title: "Van Driver",
    body: "Collects door-to-door and delivers to the nearest STS.",
    tone: "text-mint bg-mint/15",
  },
  {
    icon: Warehouse,
    title: "STS Manager",
    body: "Compacts the load and coordinates truck dispatch to the landfill.",
    tone: "text-amber-400 bg-amber-500/15",
  },
  {
    icon: Route,
    title: "Truck Driver",
    body: "Transports compacted waste from STS to the landfill site.",
    tone: "text-brand bg-brand/15",
  },
  {
    icon: Landmark,
    title: "Landfill Manager",
    body: "Tracks disposal, cells, emissions and generates compliance reports.",
    tone: "text-mint bg-mint/15",
  },
]

const roles = [
  { key: "admin", icon: Landmark, blurb: "City-wide oversight, wards and fleet." },
  { key: "area_head", icon: Users, blurb: "Manage wards, contractors and collection." },
  { key: "house_owner", icon: Home, blurb: "Request pickups, pay bills, earn rewards." },
  { key: "sts_manager", icon: Warehouse, blurb: "Run the transfer station and dispatch." },
  { key: "landfill_manager", icon: Leaf, blurb: "Disposal, cells, emissions and reports." },
  { key: "truck_owner", icon: Route, blurb: "STS-to-landfill haulage and fuel logs." },
  { key: "driver", icon: ClipboardCheck, blurb: "Door-to-door collection in your area." },
]

const highlights = [
  {
    icon: MapPin,
    title: "Live fleet tracking",
    body: "Every van and truck tracked in real time, from the street to the landfill.",
  },
  {
    icon: BellRing,
    title: "Smart alerts",
    body: "Capacity warnings, off-route vehicles and SLA breaches flagged instantly.",
  },
  {
    icon: ClipboardList,
    title: "Full transparency",
    body: "Mayor to house owner — everyone sees the same trusted data.",
  },
  {
    icon: Zap,
    title: "Faster response",
    body: "Pickup requests routed to the nearest van in seconds, not days.",
  },
]

function Logo({ className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2 text-lg font-extrabold tracking-tight ${className}`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-mint shadow-lg shadow-brand/20">
        <Recycle className="h-4 w-4 text-white" />
      </span>
      {APP_NAME}
    </span>
  )
}

function SectionTag({ children }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-brand">
      {children}
    </span>
  )
}

function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <div className="bg-background/60 backdrop-blur-lg mx-auto flex max-w-6xl items-center justify-between rounded-full border border-border px-5 py-3">
        <Logo />
        <nav className="hidden items-center gap-7 md:flex" aria-label="Main">
          <a href="#how" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            How it works
          </a>
          <a href="#roles" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Dashboards
          </a>
          <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Features
          </a>
        </nav>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="glow-brand rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground transition-transform hover:scale-105"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden px-5 pt-36 sm:px-8 sm:pt-44">
      <div className="pointer-events-none absolute -left-24 top-24 h-80 w-80 rounded-full bg-brand/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-40 h-80 w-80 rounded-full bg-mint/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent" />

      <div className="relative mx-auto max-w-6xl text-center">
        <div className="mb-6 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <span className="flex h-2 w-2 rounded-full bg-mint" />
            {APP_TAGLINE} · Dhaka, Bangladesh
          </span>
        </div>
        <h1 className="mx-auto max-w-4xl text-balance text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-7xl">
          A cleaner city, <span className="text-gradient">tracked end to end</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
          EcoNexus connects house owners, van and truck drivers, STS and landfill
          managers with the mayor — so every kilogram of waste is collected, moved
          and accounted for.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/register"
            className="glow-brand inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3 text-sm font-semibold text-brand-foreground transition-transform hover:scale-105"
          >
            Get started <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="#roles"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-7 py-3 text-sm font-semibold transition-colors hover:bg-secondary"
          >
            <Building2 className="h-4 w-4" /> Open a dashboard
          </Link>
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl gap-4 sm:grid-cols-3">
          {[
            { value: "248k+", label: "Households served" },
            { value: "6.8k t", label: "Collected monthly" },
            { value: "186", label: "Vehicles tracked" },
          ].map((s) => (
            <div key={s.label} className="ring-gradient rounded-2xl border border-border bg-card px-6 py-5">
              <p className="text-3xl font-extrabold text-brand">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
      <div className="mb-12 text-center">
        <SectionTag>The waste journey</SectionTag>
        <h2 className="mt-4 text-balance text-4xl font-extrabold tracking-tight sm:text-5xl">
          From your doorstep to the <span className="text-gradient">landfill</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Every role in the city&apos;s waste network works on one shared platform, so nothing
          gets lost on the way.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-5">
        {flow.map((step, i) => (
          <div
            key={step.title}
            className="ring-gradient relative rounded-3xl border border-border bg-card p-6 transition-transform hover:-translate-y-1"
          >
            <span className="absolute right-5 top-5 text-xs font-bold text-muted-foreground/40">
              0{i + 1}
            </span>
            <div className={`mb-5 flex h-11 w-11 items-center justify-center rounded-2xl ${step.tone}`}>
              <step.icon className="h-5 w-5" />
            </div>
            <h3 className="font-bold">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function Roles() {
  return (
    <section id="roles" className="mx-auto max-w-6xl px-5 pb-20 sm:px-8 sm:pb-28">
      <div className="mb-10 text-center">
        <SectionTag>One platform, seven roles</SectionTag>
        <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">Who uses EcoNexus?</h2>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {roles.map((r) => {
          const label = ROLES[r.key].label
          return (
            <Link
              key={r.key}
              href={ROLES[r.key].route}
              className="ring-gradient group rounded-3xl border border-border bg-card p-6 transition-transform hover:-translate-y-1"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/15 text-brand transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                  <r.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-bold">{label}</h3>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Dashboard</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{r.blurb}</p>
            </Link>
          )
        })}

        <div className="ring-gradient flex flex-col justify-center rounded-3xl border border-dashed border-border bg-card/50 p-6 text-center">
          <Trash2 className="mx-auto mb-3 h-8 w-8 text-mint" />
          <p className="text-sm font-semibold">Every role connects here.</p>
          <Link
            href="/register"
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground transition-transform hover:scale-105"
          >
            Join now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-5 pb-20 sm:px-8 sm:pb-28">
      <div className="dotted-grid ring-gradient rounded-[2rem] border border-border bg-card p-8 sm:p-14">
        <div className="mb-10 text-center">
          <SectionTag>Why EcoNexus</SectionTag>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Built for real cities, not demos
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {highlights.map((h) => (
            <div key={h.title} className="flex gap-4">
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-mint/15 text-mint">
                <h.icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-bold">{h.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{h.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <Logo className="text-2xl" />
          <p className="mt-2 text-xs text-muted-foreground">
            © {new Date().getFullYear()} {APP_NAME}. {APP_TAGLINE}.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <a href="#how" className="hover:text-foreground">How it works</a>
          <a href="#roles" className="hover:text-foreground">Dashboards</a>
          <a href="#features" className="hover:text-foreground">Features</a>
          <Link href="/login" className="hover:text-foreground">Log In</Link>
          <Link href="/register" className="hover:text-foreground">Sign Up</Link>
        </div>
      </div>
    </footer>
  )
}

export default function Page() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background">
      <Header />
      <Hero />
      <HowItWorks />
      <Roles />
      <Features />
      <Footer />
    </main>
  )
}
