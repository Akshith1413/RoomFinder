"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

export default function SearchSection() {
  const router = useRouter()
  const [location, setLocation] = useState("")
  const [priceMin, setPriceMin] = useState("")
  const [priceMax, setPriceMax] = useState("")
  const [propertyType, setPropertyType] = useState("")
  const [tenantPref, setTenantPref] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (location) params.append("location", location)
    if (priceMin) params.append("priceMin", priceMin)
    if (priceMax) params.append("priceMax", priceMax)
    if (propertyType) params.append("propertyType", propertyType)
    if (tenantPref) params.append("tenantPref", tenantPref)

    router.push(`/rooms?${params.toString()}`)
  }

  return (
    <section className="py-12 px-4 md:px-6 border-t border-border/30">
      <div className="max-w-5xl mx-auto animate-slide-up" style={{ animationDelay: "0.3s" }}>
        <form onSubmit={handleSearch} className="bg-card border-2 border-border/50 rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-foreground mb-6">Find Your Room</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">Location</label>
              <Input
                type="text"
                placeholder="Enter location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-input border-border/50 text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Min Price</label>
              <Input
                type="number"
                placeholder="Min"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="bg-input border-border/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Max Price</label>
              <Input
                type="number"
                placeholder="Max"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="bg-input border-border/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Type</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full bg-input border border-border/50 rounded-lg px-3 py-2 text-foreground"
              >
                <option value="">All Types</option>
                <option value="1 BHK">1 BHK</option>
                <option value="2 BHK">2 BHK</option>
                <option value="1 Bed">1 Bed</option>
                <option value="2 Bed">2 Bed</option>
                <option value="3 Bed">3 Bed</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-3">For</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {["Bachelor", "Family", "Girls", "Working"].map((pref) => (
                <button
                  key={pref}
                  type="button"
                  onClick={() => setTenantPref(tenantPref === pref ? "" : pref)}
                  className={`py-2 px-3 rounded-lg font-medium transition-all ${
                    tenantPref === pref
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-muted text-muted-foreground border border-border hover:border-primary"
                  }`}
                >
                  {pref}
                </button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition-all duration-300 hover:shadow-lg"
          >
            Search Rooms
          </Button>
        </form>
      </div>
    </section>
  )
}
