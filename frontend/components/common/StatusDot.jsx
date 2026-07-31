import { cn } from "@/utils/helpers"

const colors = {
  green: "bg-mint",
  amber: "bg-amber-400",
  red: "bg-destructive",
  blue: "bg-brand",
  gray: "bg-neutral-500",
}

export function StatusDot({ status = "gray", label, pulse = false, className }) {
  const dotColor = colors[status] || colors.gray
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-xs font-medium text-muted-foreground",
        className,
      )}
    >
      <span className={cn("relative flex h-2 w-2")}>
        {pulse && (
          <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-60", dotColor)} />
        )}
        <span className={cn("relative inline-flex h-2 w-2 rounded-full", dotColor)} />
      </span>
      {label}
    </span>
  )
}

export default StatusDot
