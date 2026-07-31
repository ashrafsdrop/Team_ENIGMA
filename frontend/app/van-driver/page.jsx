"use client"

import { useState } from "react"
import VanDriverDashboard from "@/components/dashboards/VanDriverDashboard"

export default function VanDriverPage() {
  const [activeTab, setActiveTab] = useState("overview")

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "pickups", label: "Pickups" },
    { id: "area", label: "My Area" },
    { id: "fuel", label: "Fuel Log" },
  ]

  return (
    <div className="flex h-screen w-full bg-background flex-col">
       <div className="border-b border-border bg-card/50 p-4 pt-20 px-8 flex gap-4">
         {tabs.map(t => (
           <button
             key={t.id}
             onClick={() => setActiveTab(t.id)}
             className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
               activeTab === t.id ? "bg-brand text-brand-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
             }`}
           >
             {t.label}
           </button>
         ))}
       </div>
       <div className="flex-1 overflow-y-auto">
         <div className="p-8">
           <VanDriverDashboard active={activeTab} />
         </div>
       </div>
    </div>
  )
}
