"use client"

import dynamic from "next/dynamic"

const LeafletMap = dynamic(() => import("@/components/common/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-xl border border-[#1a1a2e] bg-[#0a0a0f]">
      <span className="text-xs text-[#8888aa]">Loading map…</span>
    </div>
  ),
})

export function Map({ markers = [], route = [], className = "" }) {
  return <LeafletMap markers={markers} route={route} className={className} />
}

export default Map
