import Image from "next/image"
import Link from "next/link"
import {
  Zap,
  BookOpen,
  Smartphone,
  MapPin,
  Calendar,
  Quote,
  ArrowRight,
  Sparkles,
  Star,
} from "lucide-react"

/* ---------------------------------- data --------------------------------- */

const navItems = [
  { label: "Meet the team", href: "#partners" },
  { label: "Challenges", href: "#events" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Blog", href: "#" },
]

const universities = ["HARVARD", "CAMBRIDGE", "BROWN", "DARTMOUTH", "Yale", "OXFORD", "MIT"]

const partners = ["Algorand", "Immutable", "polygon", "BNB CHAIN", "Polkadot", "SOLANA", "Tezos", "klaytn"]

const events = [
  {
    img: "/event-crowd-1.png",
    tag: "Immutable",
    prize: "$10,000 USD",
    location: "LONDON, UK",
    title: "ImmutableX x EasyA",
    date: "9 – 12 Apr 2023 · 36 hours",
    cta: "Register",
    status: "Closes in 1 day",
  },
  {
    img: "/event-crowd-2.png",
    tag: "HARVARD",
    prize: "$40,000 USD",
    location: "NORTHWEST LAB, HARVARD",
    title: "Harvard Blockchain x EasyA Hackathon",
    date: "8 – 9 May 2023 · 36 hours",
    cta: "Register",
    status: "Closes in 2 weeks",
  },
  {
    img: "/event-crowd-3.png",
    tag: "Tezos",
    prize: "$25,000 USD",
    location: "VIRTUAL",
    title: "Tezos x EasyA",
    date: "26 – 27 Nov 2023 · 36 hours",
    cta: "View Details",
    status: "165 attendees",
  },
]

const testimonials = [
  {
    img: "/testimonial-1.png",
    brand: "polygon",
    quote:
      "Lorem ipsum dolor sit amet consectetur. Viverra dictum mi lectus tristique. In faucibus fusce et volutpat adipiscing vitae quam.",
    name: "First Lastname",
    role: "CEO OF POLYGON",
  },
  {
    img: "/testimonial-2.png",
    brand: "SOLANA",
    quote:
      "Lorem ipsum dolor sit amet consectetur. Viverra dictum mi lectus tristique. In faucibus fusce et volutpat adipiscing vitae quam.",
    name: "First Lastname",
    role: "CEO OF SOLANA",
  },
]

const socials = [
  {
    label: "Twitter",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
  {
    label: "Instagram",
    path: "M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.43.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.43.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.43-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.43-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 3.68a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.41-10.41a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z",
  },
  {
    label: "LinkedIn",
    path: "M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z",
  },
  {
    label: "YouTube",
    path: "M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.2 3.6z",
  },
]

const footerLinks = ["Terms of Service", "Privacy Policy", "hello@easya.io"]

/* -------------------------------- primitives ------------------------------ */

function Logo({ className = "" }) {
  return (
    <span className={`font-extrabold tracking-tight text-foreground ${className}`}>
      EASY<span className="text-mint">·</span>
      <span className="text-brand">A</span>
    </span>
  )
}

function StoreButtons({ className = "" }) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <a
        href="#download"
        className="flex items-center gap-3 rounded-2xl border border-border bg-secondary/60 px-4 py-2.5 transition-colors hover:bg-secondary"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6 fill-foreground" aria-hidden="true">
          <path d="M16.365 1.43c0 1.14-.417 2.19-1.11 2.99-.83.96-2.19 1.7-3.35 1.61-.14-1.11.42-2.28 1.06-3.02.72-.83 2.03-1.47 3.15-1.53.06.32.25.62.25.95zM20.5 17.02c-.55 1.27-.82 1.84-1.53 2.96-.99 1.57-2.39 3.52-4.12 3.53-1.54.02-1.93-.99-4.01-.98-2.08.01-2.51.99-4.05.97-1.73-.02-3.06-1.78-4.05-3.35C-.9 16.65-1.13 11.7 1.06 9.06 2.11 7.78 3.72 6.98 5.42 6.95c1.63-.03 3.16 1.05 4.01 1.05.85 0 2.72-1.3 4.58-1.11.78.03 2.96.31 4.36 2.36-3.79 2.07-3.18 7.48 1.13 7.77z" />
        </svg>
        <span className="text-left leading-none">
          <span className="block text-[10px] text-muted-foreground">Download on the</span>
          <span className="block text-sm font-semibold">App Store</span>
        </span>
      </a>
      <a
        href="#download"
        className="flex items-center gap-3 rounded-2xl border border-border bg-secondary/60 px-4 py-2.5 transition-colors hover:bg-secondary"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
          <path fill="#00d0ff" d="M3.6 1.8c-.3.3-.5.8-.5 1.4v17.6c0 .6.2 1.1.5 1.4l.1.1L14 12.1v-.2L3.7 1.7z" />
          <path fill="#00e676" d="M17.5 15.6L14 12.1v-.2l3.5-3.5.1.1 4.1 2.3c1.2.7 1.2 1.8 0 2.5z" />
          <path fill="#ff3d47" d="M17.6 15.5L14 12 3.6 22.2c.4.4 1.1.5 1.8.1z" />
          <path fill="#ffea00" d="M17.6 8.5L5.4 1.7c-.7-.4-1.4-.3-1.8.1L14 12z" />
        </svg>
        <span className="text-left leading-none">
          <span className="block text-[10px] text-muted-foreground">GET IT ON</span>
          <span className="block text-sm font-semibold">Google Play</span>
        </span>
      </a>
    </div>
  )
}

function PhoneMockup({ children, className = "" }) {
  return (
    <div
      className={`relative w-full max-w-[240px] rounded-[2.2rem] border border-border bg-background p-2 shadow-2xl ring-gradient ${className}`}
    >
      <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-background" />
      <div className="relative aspect-[9/19] w-full overflow-hidden rounded-[1.7rem] bg-card">{children}</div>
    </div>
  )
}

function CodeSnippet() {
  return (
    <div className="flex h-full flex-col gap-2 p-3 pt-8 font-mono text-[9px] leading-relaxed">
      <div className="flex items-center gap-1.5 pb-1">
        <span className="h-2 w-2 rounded-full bg-destructive/80" />
        <span className="h-2 w-2 rounded-full bg-mint/80" />
        <span className="h-2 w-2 rounded-full bg-brand/80" />
      </div>
      <pre className="whitespace-pre-wrap text-muted-foreground">
        <span className="text-brand">use</span> anchor_lang::prelude;{"\n\n"}
        <span className="text-mint">#[program]</span>
        {"\n"}
        <span className="text-brand">pub mod</span> hello {"{"}
        {"\n  "}
        <span className="text-brand">pub fn</span> init(ctx: Context){"\n  "}
        {"{"}
        {"\n    "}msg!(<span className="text-mint">"gm web3"</span>);{"\n    "}Ok(())
      </pre>
      <div className="mt-auto rounded-lg bg-secondary p-2">
        <div className="mb-1 flex items-center justify-between text-[8px] text-muted-foreground">
          <span>EasyA</span>
          <span>90%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-background">
          <div className="h-full w-[90%] rounded-full bg-brand" />
        </div>
      </div>
    </div>
  )
}

function SectionTag({ children }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-brand">
      <Sparkles className="h-3 w-3" />
      {children}
    </span>
  )
}

/* -------------------------------- sections -------------------------------- */

function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <div className="bg-background/60 backdrop-blur-lg mx-auto flex max-w-6xl items-center justify-between rounded-full border border-border px-5 py-3">
        <Logo className="text-xl" />
        <nav className="hidden items-center gap-7 md:flex" aria-label="Main">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
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
            34,000+ builders learning right now
          </span>
        </div>
        <h1 className="mx-auto max-w-4xl text-balance text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-7xl">
          Discover your <span className="text-gradient">path to web3</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
          Learn and launch your Web3 project fast, right from your phone — with the world&apos;s most
          loved blockchain learning app.
        </p>

        <StoreButtons className="mt-9 justify-center" />

        <div className="relative mt-14">
          <div className="animate-floaty">
            <Image
              src="/hero-web3.png"
              alt="Floating 3D crypto blocks above a laptop with two small figures and a flag"
              width={1100}
              height={620}
              priority
              className="mx-auto w-full max-w-4xl rounded-3xl border border-border object-cover"
            />
          </div>
          <div className="pointer-events-none absolute inset-x-0 -bottom-2 h-32 bg-gradient-to-t from-background to-transparent" />
        </div>
      </div>
    </section>
  )
}

function Features() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
      <div className="mb-12 text-center">
        <SectionTag>Why EasyA</SectionTag>
        <h2 className="mt-4 text-balance text-4xl font-extrabold tracking-tight sm:text-5xl">
          Learning web3, <span className="text-gradient">made effortless</span>
        </h2>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Fast */}
        <div className="ring-gradient rounded-3xl border border-border bg-card p-7 transition-transform hover:-translate-y-1">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-mint/15 text-mint">
            <Zap className="h-5 w-5" />
          </div>
          <h3 className="text-2xl font-bold">Fast</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            No fear! No worries! EasyA teaches you top blockchains and app deployment faster than you can
            say &ldquo;WAGMI&rdquo;.
          </p>
          <div className="mt-6 rounded-2xl border border-border bg-background p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="rounded-full bg-mint/15 px-2 py-0.5 text-[10px] font-semibold text-mint">
                CHALLENGE
              </span>
              <span className="text-[10px] text-muted-foreground">Solana</span>
            </div>
            <div className="space-y-2">
              <div className="h-2 w-3/4 rounded-full bg-secondary" />
              <div className="h-2 w-1/2 rounded-full bg-secondary" />
            </div>
            <div className="glow-mint mt-4 rounded-xl bg-mint py-2 text-center text-xs font-semibold text-mint-foreground">
              Start challenge
            </div>
          </div>
        </div>

        {/* In-depth */}
        <div className="ring-gradient rounded-3xl border border-border bg-card p-7 transition-transform hover:-translate-y-1">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/15 text-brand">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="mb-6 rounded-2xl border border-border bg-background p-4">
            <p className="mb-2 text-[10px] font-semibold text-brand">INTRO TO SOLANA</p>
            <div className="space-y-2">
              <div className="h-2 w-full rounded-full bg-secondary" />
              <div className="h-2 w-4/5 rounded-full bg-secondary" />
              <div className="h-2 w-2/3 rounded-full bg-secondary" />
            </div>
          </div>
          <h3 className="text-2xl font-bold">In-depth</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Learning can be tough, but EasyA makes it easy peasy! With our help, you&apos;ll go from zero
            to hero without breaking a sweat.
          </p>
        </div>

        {/* Mobile */}
        <div className="ring-gradient flex flex-col rounded-3xl border border-border bg-card p-7 transition-transform hover:-translate-y-1">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-mint/15 text-mint">
            <Smartphone className="h-5 w-5" />
          </div>
          <div className="mb-6 flex justify-center">
            <PhoneMockup className="max-w-[150px]">
              <CodeSnippet />
            </PhoneMockup>
          </div>
          <h3 className="text-2xl font-bold">Mobile</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Addicted to your phone? So are we. Learn a skill that works for you — on the bus, at the gym,
            or between classes. No more trying to find time.
          </p>
        </div>
      </div>
    </section>
  )
}

function ImageFeature({ id, image, alt, tag, title, body, cta, ctaHref }) {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8 sm:pb-28">
      <div className="relative overflow-hidden rounded-[2rem] border border-border">
        <Image src={image} alt={alt} width={1200} height={720} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-lg p-7 sm:p-14">
            {tag ? <SectionTag>{tag}</SectionTag> : null}
            <h2 className="mt-4 text-balance text-3xl font-extrabold leading-tight sm:text-4xl">{title}</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{body}</p>
            {cta ? (
              <a
                href={ctaHref}
                className="glow-brand mt-7 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-brand-foreground transition-transform hover:scale-105"
              >
                {cta} <ArrowRight className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        </div>
      </div>
      {id === "skys" ? (
        <div className="mt-10 overflow-hidden">
          <p className="mb-5 text-center text-xs uppercase tracking-widest text-muted-foreground">
            Trusted by learners at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-70">
            {universities.map((uni) => (
              <span
                key={uni}
                className="text-lg font-bold tracking-wide text-muted-foreground"
                style={{ fontFamily: uni === "Yale" ? "Georgia, serif" : undefined }}
              >
                {uni}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  )
}

function DocsSection() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8 sm:pb-28">
      <div className="dotted-grid ring-gradient grid items-center gap-8 rounded-[2rem] border border-border bg-card p-8 sm:p-14 lg:grid-cols-2">
        <div className="flex justify-center lg:justify-start">
          <div className="animate-floaty">
            <PhoneMockup>
              <CodeSnippet />
            </PhoneMockup>
          </div>
        </div>
        <div>
          <SectionTag>Learn by doing</SectionTag>
          <h2 className="mt-4 text-balance text-3xl font-extrabold leading-tight sm:text-4xl">
            Don&apos;t waste your time reading the docs
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Now, update the code to print something (anything!) in this Solana program. Past community
            members have been funded by a16z, YC and many more world-leading VCs. They all had one thing
            in common — they fired up EasyA.
          </p>
          <p className="mt-4 text-sm font-semibold">Devs on EasyA learn up to 100x faster</p>
          <StoreButtons className="mt-6" />
        </div>
      </div>
    </section>
  )
}

function FeaturedEvents() {
  return (
    <section id="events" className="mx-auto max-w-6xl px-5 pb-20 sm:px-8 sm:pb-28">
      <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <SectionTag>What&apos;s on</SectionTag>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">Featured Events</h2>
        </div>
        <div className="flex rounded-full border border-border bg-card p-1 text-sm">
          <span className="rounded-full bg-brand px-5 py-1.5 font-semibold text-brand-foreground">Events</span>
          <span className="px-5 py-1.5 text-muted-foreground">Challenges</span>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {events.map((e) => (
          <article
            key={e.title}
            className="ring-gradient group overflow-hidden rounded-3xl border border-border bg-card transition-transform hover:-translate-y-1.5"
          >
            <div className="relative h-44 overflow-hidden">
              <Image
                src={e.img}
                alt={e.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="glass absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold">
                {e.tag}
              </span>
            </div>
            <div className="p-6">
              <p className="text-sm font-semibold text-mint">
                {e.prize} <span className="text-muted-foreground">in total prizes</span>
              </p>
              <p className="mt-1 flex items-center gap-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                <MapPin className="h-3 w-3" /> {e.location}
              </p>
              <h3 className="mt-3 text-lg font-bold leading-snug">{e.title}</h3>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" /> {e.date}
              </p>
              <button className="mt-5 w-full rounded-xl bg-mint py-2.5 text-sm font-semibold text-mint-foreground transition-transform hover:scale-[1.02]">
                {e.cta}
              </button>
              <p className="mt-2 text-center text-[11px] text-muted-foreground">{e.status}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function Partners() {
  const row = [...partners, ...partners]
  return (
    <section id="partners" className="mx-auto max-w-6xl px-5 pb-20 sm:px-8 sm:pb-28">
      <div className="mb-8 text-center">
        <SectionTag>Backed by the best</SectionTag>
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Our partners</h2>
      </div>
      <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_10%,#000_90%,transparent)]">
        <div className="flex w-max animate-marquee gap-4">
          {row.map((p, i) => (
            <div
              key={`${p}-${i}`}
              className="flex min-w-[180px] items-center justify-center rounded-2xl border border-border bg-card px-8 py-6 text-base font-bold text-muted-foreground"
            >
              {p}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Testimonials() {
  return (
    <section id="testimonials" className="mx-auto max-w-6xl px-5 pb-20 sm:px-8 sm:pb-28">
      <div className="mb-10 text-center">
        <SectionTag>Loved by leaders</SectionTag>
        <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">Testimonials</h2>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {testimonials.map((t) => (
          <article
            key={t.role}
            className="ring-gradient flex gap-5 rounded-3xl border border-border bg-card p-6 transition-transform hover:-translate-y-1"
          >
            <Image
              src={t.img}
              alt={t.name}
              width={120}
              height={150}
              className="h-36 w-28 flex-none rounded-2xl object-cover"
            />
            <div className="flex flex-col">
              <div className="mb-2 flex items-center justify-between">
                <Quote className="h-6 w-6 text-brand" />
                <span className="text-sm font-bold text-muted-foreground">{t.brand}</span>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{t.quote}</p>
              <div className="mt-auto pt-3">
                <div className="mb-1 flex gap-0.5 text-mint">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{t.role}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function DownloadApp() {
  return (
    <section id="download" className="mx-auto max-w-6xl px-5 pb-20 sm:px-8 sm:pb-28">
      <div className="ring-gradient relative overflow-hidden rounded-[2rem] border border-border bg-card p-8 text-center sm:p-16">
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-brand/25 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-10 h-56 w-56 rounded-full bg-mint/15 blur-3xl" />
        <div className="relative">
          <SectionTag>Get started</SectionTag>
          <h2 className="mt-4 text-balance text-4xl font-extrabold tracking-tight sm:text-5xl">
            Download the App
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            Learn and launch your Web3 project fast, right from your phone.
          </p>
          <StoreButtons className="mt-7 justify-center" />
          <div className="animate-floaty mt-12">
            <Image
              src="/download-scene.png"
              alt="A floating phone surrounded by glowing crypto blocks"
              width={900}
              height={420}
              className="mx-auto w-full max-w-2xl rounded-3xl border border-border object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <Logo className="text-2xl" />
          <p className="mt-2 text-xs text-muted-foreground">© 2023 EasyA. All Rights Reserved.</p>
        </div>
        <div className="flex flex-col gap-4 sm:items-end">
          <div className="flex gap-3">
            {socials.map((s) => (
              <a
                key={s.label}
                href="#"
                aria-label={s.label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                  <path d={s.path} />
                </svg>
              </a>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
            {footerLinks.map((l) => (
              <a key={l} href="#" className="hover:text-foreground">
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ---------------------------------- page ---------------------------------- */

export default function Page() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background">
      <Header />
      <Hero />
      <Features />
      <ImageFeature
        id="skys"
        image="/student-phone.png"
        alt="Student looking at their phone at night lit by colorful screen glow"
        tag="Real outcomes"
        title="Sky's the limit, and we mean it."
        body="Our learners have been funded by a16z, YC and many more world-leading investors. Whether you're just casually getting into blockchain or building the future of Web3, there's no better place to start. We've grown to more than 500k+ across our university partners."
      />
      <DocsSection />
      <FeaturedEvents />
      <ImageFeature
        id="frens"
        image="/learn-frens.png"
        alt="Three happy students learning together on a laptop"
        tag="Community"
        title="There's no better way to learn with frens!"
        body="That's why we routinely host the world's best hackathons in world-leading cities from SF to London to Boston. Whether you're looking to level up, build your team, or simply make new (Web3) frens."
        cta="Partner with us"
        ctaHref="#events"
      />
      <Partners />
      <Testimonials />
      <DownloadApp />
      <Footer />
    </main>
  )
}
