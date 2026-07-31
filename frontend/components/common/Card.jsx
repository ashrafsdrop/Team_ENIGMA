import { cn } from "@/utils/helpers"

export function Card({ title, subtitle, action, children, className, bodyClassName }) {
  return (
    <div className={cn("ring-gradient rounded-2xl border border-border bg-card", className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-4 border-b border-border/60 px-6 py-4">
          <div>
            {title && <h3 className="text-base font-semibold">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={cn("p-6", bodyClassName)}>{children}</div>
    </div>
  )
}

export default Card
