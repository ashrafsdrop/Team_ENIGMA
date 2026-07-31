"use client"

import { MapContainer, TileLayer, Marker, Polyline, Tooltip } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

const SVG_PATHS = {
  van: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  sts: '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>',
  landfill: '<path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/><path d="M6 18h12"/><path d="M6 14h12"/><path d="M6 10h12"/>',
  point: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
}

const MARKER_COLORS = {
  van: "#6c5ce7",
  truck: "#4a9eff",
  home: "#00d4aa",
  sts: "#fdcb6e",
  landfill: "#ff6b6b",
  point: "#a5a5d0",
}

function markerHtml(type, pulse) {
  const color = MARKER_COLORS[type] || MARKER_COLORS.point
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${SVG_PATHS[type] || SVG_PATHS.point}</svg>`
  const ring = pulse
    ? `<span class="absolute -inset-1.5 animate-ping rounded-full" style="background:${color}33"></span>`
    : ""
  return `<div class="relative flex h-9 w-9 items-center justify-center rounded-full border-2 backdrop-blur" style="border-color:${color};background:${color}1f;color:${color}">${ring}${svg}</div>`
}

const iconCache = {}
function getIcon(type, pulse) {
  const key = `${type}:${pulse ? 1 : 0}`
  if (!iconCache[key]) {
    iconCache[key] = L.divIcon({
      className: "",
      html: markerHtml(type, pulse),
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18],
    })
  }
  return iconCache[key]
}

export function LeafletMap({ markers = [], route = [], className = "" }) {
  const points = [
    ...route.map((p) => [p.lat, p.lng]),
    ...markers.map((m) => [m.lat, m.lng]),
  ]
  const bounds = L.latLngBounds(points.length ? points : [[23.8103, 90.4125]])

  return (
    <MapContainer
      className={`z-0 rounded-xl border border-[#1a1a2e] ${className}`}
      bounds={bounds}
      scrollWheelZoom={false}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
      />
      {route.length > 1 && (
        <Polyline
          positions={route.map((p) => [p.lat, p.lng])}
          pathOptions={{ color: "#00d4aa", weight: 3, dashArray: "6 6" }}
        />
      )}
      {markers.map((m, i) => (
        <Marker key={i} position={[m.lat, m.lng]} icon={getIcon(m.type, m.pulse)}>
          {(m.label || m.sub) && (
            <Tooltip direction="top" offset={[0, -16]}>
              {m.label && <div className="text-[10px] font-semibold text-[#e8e8f0]">{m.label}</div>}
              {m.sub && <div className="text-[9px] text-[#8888aa]">{m.sub}</div>}
            </Tooltip>
          )}
        </Marker>
      ))}
    </MapContainer>
  )
}

export default LeafletMap
