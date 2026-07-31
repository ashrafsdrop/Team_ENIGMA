import { cn } from "@/utils/helpers"

const tones = {
  brand: "bg-brand/15 text-brand",
  mint: "bg-mint/15 text-mint",
  amber: "bg-amber-500/15 text-amber-400",
  destructive: "bg-destructive/15 text-destructive",
  neutral: "bg-secondary text-muted-foreground",
}

const colorMap = {
  primary: "brand",
  success: "mint",
  warning: "amber",
  danger: "destructive",
  secondary: "neutral",
  default: "neutral",
}

export function StatCard({ label, value, delta, change, changeType, icon: Icon, tone, color, hint }) {
  const resolvedTone = tone || (color && colorMap[color]) || "brand"
  const iconClass = tones[resolvedTone] || tones.neutral
  const isDown = changeType === "down" || (typeof delta === "number" && delta < 0)

  const showChange = delta !== undefined || change !== undefined
  const changeText =
    change !== undefined
      ? change
      : `${Math.abs(delta)}% ${hint || "from last month"}`

  return (
    <div className="ring-gradient rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{value}</p>
        </div>
        {Icon && (
          <span
            className={cn(
              "flex h-10 w-10 flex-none items-center justify-center rounded-xl",
              iconClass,
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
        )}
      </div>
      {showChange && (
        <p className={cn("mt-3 text-xs font-medium", isDown ? "text-destructive" : "text-mint")}>
          {isDown ? "▼" : "▲"} {changeText}
        </p>
      )}
    </div>
  )
}

export default StatCard
