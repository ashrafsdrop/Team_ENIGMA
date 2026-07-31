import { X } from "lucide-react"

export function Modal({ open, onClose, title, subtitle, children, wide = false }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative w-full rounded-2xl border border-[#1a1a2e] bg-[#0d0d16] p-6 shadow-2xl ${
          wide ? "max-w-2xl" : "max-w-md"
        }`}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-[#e8e8f0]">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-[#8888aa]">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1 text-[#8888aa] transition-colors hover:bg-[#1a1a2e] hover:text-[#e8e8f0]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default Modal
