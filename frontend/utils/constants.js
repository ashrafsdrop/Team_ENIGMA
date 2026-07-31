import {
  LayoutDashboard,
  MapPin,
  Truck,
  BellRing,
  Users,
  Trash2,
  PlusCircle,
  ClipboardList,
  Receipt,
  Recycle,
  Layers,
  Leaf,
  FileBarChart,
  Gauge,
  Send,
  Route,
  Fuel,
  MessageSquare,
  ClipboardCheck,
} from "lucide-react"

export const APP_NAME = "EcoNexus"
export const APP_TAGLINE = "Smart City Waste Management"

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api"

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER_ROLE: "user_role",
  USER_NAME: "user_name",
}

export const ROLES = {
  admin: { label: "Mayor / Admin", route: "/admin" },
  area_head: { label: "Area Head", route: "/area-head" },
  house_owner: { label: "House Owner", route: "/house-owner" },
  landfill_manager: { label: "Landfill Manager", route: "/landfill-manager" },
  sts_manager: { label: "STS Manager", route: "/sts-manager" },
  truck_driver: { label: "Truck Driver", route: "/truck-driver" },
  van_driver: { label: "Van Driver", route: "/van-driver" },
}

export const WASTE_TYPES = [
  { key: "organic", label: "Organic", color: "bg-mint/15 text-mint" },
  { key: "plastic", label: "Plastic", color: "bg-brand/15 text-brand" },
  { key: "paper", label: "Paper", color: "bg-amber-500/15 text-amber-400" },
  { key: "metal", label: "Metal", color: "bg-neutral-500/20 text-neutral-300" },
  { key: "e_waste", label: "E-Waste", color: "bg-destructive/15 text-destructive" },
  { key: "hazardous", label: "Hazardous", color: "bg-orange-500/15 text-orange-400" },
]

export const STATUS = {
  completed: { label: "Completed", variant: "success" },
  in_progress: { label: "In Progress", variant: "info" },
  scheduled: { label: "Scheduled", variant: "neutral" },
  pending: { label: "Pending", variant: "warning" },
  failed: { label: "Failed", variant: "danger" },
  critical: { label: "Critical", variant: "danger" },
  optimal: { label: "Optimal", variant: "success" },
  warning: { label: "Warning", variant: "warning" },
  good: { label: "Good", variant: "success" },
  low: { label: "Low", variant: "neutral" },
  high: { label: "High", variant: "danger" },
}

export const NAV_ITEMS = {
  admin: [
    { id: "overview", label: "City Overview", icon: LayoutDashboard },
    { id: "wards", label: "Wards", icon: MapPin },
    { id: "fleet", label: "Fleet & Vehicles", icon: Truck },
    { id: "alerts", label: "Alerts", icon: BellRing },
  ],
  area_head: [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "wards", label: "My Wards", icon: MapPin },
    { id: "contractors", label: "Contractors", icon: Users },
    { id: "collection", label: "Collection Points", icon: Trash2 },
    { id: "alerts", label: "Alerts", icon: BellRing },
  ],
  house_owner: [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "request", label: "Request Pickup", icon: PlusCircle },
    { id: "requests", label: "My Requests", icon: ClipboardList },
    { id: "bills", label: "Bills", icon: Receipt },
    { id: "recycle", label: "Recycling", icon: Recycle },
  ],
  landfill_manager: [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "entries", label: "Vehicle Entries", icon: Truck },
    { id: "cells", label: "Landfill Cells", icon: Layers },
    { id: "emissions", label: "Fleet & Emissions", icon: Leaf },
    { id: "reports", label: "Reports", icon: FileBarChart },
  ],
  sts_manager: [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "vans", label: "Incoming Vans", icon: Truck },
    { id: "capacity", label: "STS Capacity", icon: Gauge },
    { id: "dispatch", label: "Dispatch to Landfill", icon: Send },
    { id: "alerts", label: "Alerts", icon: BellRing },
  ],
  truck_driver: [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "route", label: "My Route", icon: Route },
    { id: "trips", label: "Trips", icon: ClipboardList },
    { id: "fuel", label: "Fuel Log", icon: Fuel },
    { id: "messages", label: "Messages", icon: MessageSquare },
  ],
  van_driver: [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "pickups", label: "Pickups", icon: ClipboardCheck },
    { id: "area", label: "My Area", icon: MapPin },
    { id: "fuel", label: "Fuel Log", icon: Fuel },
    { id: "requests", label: "Requests", icon: BellRing },
  ],
}

export const UNITS = {
  weight: "kg",
  volume: "m³",
  fuel: "L",
  distance: "km",
}
