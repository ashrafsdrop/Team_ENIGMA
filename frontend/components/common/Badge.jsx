import { cn } from "@/utils/helpers"

const variants = {
  success: "bg-mint/15 text-mint",
  warning: "bg-amber-500/15 text-amber-400",
  danger: "bg-destructive/15 text-destructive",
  info: "bg-brand/15 text-brand",
  neutral: "bg-secondary text-muted-foreground",
  default: "bg-secondary text-muted-foreground",
}

export function Badge({ variant = "neutral", children, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        variants[variant] || variants.neutral,
        className,
      )}
    >
      {children}
    </span>
  )
}

export default Badge
