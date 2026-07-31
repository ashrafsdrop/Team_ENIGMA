"use client"

import { LogOut, Recycle } from "lucide-react"
import { APP_NAME } from "@/utils/constants"
import { cn, initials, roleLabel } from "@/utils/helpers"

export function Sidebar({ role, navItems, active, onNavigate, userName, onLogout }) {
  return (
    <aside className="flex w-72 flex-none flex-col border-r border-border bg-card/60 backdrop-blur-xl">
      <div className="border-b border-border/60 px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-mint shadow-lg shadow-brand/20">
            <Recycle className="h-5 w-5 text-white" />
          </span>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight">{APP_NAME}</h1>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
              {roleLabel(role)}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Dashboard">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "border border-brand/30 bg-brand/10 text-brand"
                  : "border border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <Icon className={cn("h-4.5 w-4.5", isActive ? "text-brand" : "")} />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="border-t border-border/60 p-4">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/50 p-3">
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-brand/20 text-sm font-bold text-brand">
            {initials(userName || roleLabel(role))}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{userName || roleLabel(role)}</p>
            <p className="truncate text-[11px] text-muted-foreground">{roleLabel(role)}</p>
          </div>
          <button
            onClick={onLogout}
            aria-label="Log out"
            className="flex h-8 w-8 flex-none items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
