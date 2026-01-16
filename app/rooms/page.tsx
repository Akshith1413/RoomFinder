"use client"
import type { User } from "@supabase/supabase-js"
import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Navigation from "@/components/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

interface Room {
  id: string
  title: string
  location: string
  rent_price: number
  property_type: string
  tenant_preference: string
  room_images?: Array<{ image_url: string }>
  owner_id: string
  owner_contact_number: string
}

export default function RoomsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [savedRooms, setSavedRooms] = useState<string[]>([])

  const [location, setLocation] = useState(searchParams.get("location") || "")
  const [priceMin, setPriceMin] = useState(searchParams.get("priceMin") || "")
  const [priceMax, setPriceMax] = useState(searchParams.get("priceMax") || "")
  const [propertyType, setPropertyType] = useState(searchParams.get("propertyType") || "")
  const [tenantPref, setTenantPref] = useState(searchParams.get("tenantPref") || "")

  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()
        setUser(authUser)

        const response = await fetch("/api/rooms")
        const data = await response.json()

        if (data.rooms) {
          setRooms(data.rooms)
        }

        // Fetch saved rooms if user is logged in
        if (authUser) {
          const { data: saved } = await supabase.from("saved_rooms").select("room_id").eq("user_id", authUser.id)

          if (saved) {
            setSavedRooms(saved.map((s) => s.room_id))
          }
        }
      } catch (error) {
        console.error("[v0] Error fetching rooms:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  // Filter rooms
  useEffect(() => {
    let filtered = rooms

    if (location) {
      filtered = filtered.filter((r) => r.location.toLowerCase().includes(location.toLowerCase()))
    }

    if (priceMin) {
      filtered = filtered.filter((r) => r.rent_price >= Number.parseInt(priceMin))
    }

    if (priceMax) {
      filtered = filtered.filter((r) => r.rent_price <= Number.parseInt(priceMax))
    }

    if (propertyType) {
      filtered = filtered.filter((r) => r.property_type === propertyType)
    }

    if (tenantPref) {
      filtered = filtered.filter((r) => r.tenant_preference === tenantPref)
    }

    setFilteredRooms(filtered)
  }, [rooms, location, priceMin, priceMax, propertyType, tenantPref])

  const toggleSave = async (roomId: string) => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    if (savedRooms.includes(roomId)) {
      await supabase.from("saved_rooms").delete().eq("room_id", roomId).eq("user_id", user.id)
      setSavedRooms(savedRooms.filter((id) => id !== roomId))
    } else {
      await supabase.from("saved_rooms").insert({ room_id: roomId, user_id: user.id })
      setSavedRooms([...savedRooms, roomId])
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/5 relative overflow-hidden">
      <div className="absolute top-32 left-5 w-96 h-96 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float pointer-events-none"></div>
      <div
        className="absolute bottom-40 right-10 w-96 h-96 bg-accent/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-morph pointer-events-none"
        style={{ animationDelay: "1s" }}
      ></div>

      <Navigation user={user} />

      <section className="py-12 px-4 md:px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 animate-slide-up">
            <h1 className="text-5xl font-bold text-foreground mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Browse Rooms
            </h1>
            <p className="text-muted-foreground">Discover {filteredRooms.length} amazing rooms available</p>
          </div>

          <div
            className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 mb-8 animate-slide-up shadow-lg"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              <Input
                placeholder="📍 Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-input/50 border-border/50 backdrop-blur focus:border-primary transition-all"
              />
              <Input
                type="number"
                placeholder="₹ Min Price"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="bg-input/50 border-border/50 backdrop-blur focus:border-primary transition-all"
              />
              <Input
                type="number"
                placeholder="₹ Max Price"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="bg-input/50 border-border/50 backdrop-blur focus:border-primary transition-all"
              />
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="bg-input/50 border border-border/50 backdrop-blur rounded-lg px-3 py-2 focus:border-primary transition-all"
              >
                <option value="">🏠 All Property Types</option>
                <option value="1 BHK">1 BHK</option>
                <option value="2 BHK">2 BHK</option>
                <option value="1 Bed">1 Bed</option>
                <option value="2 Bed">2 Bed</option>
                <option value="3 Bed">3 Bed</option>
              </select>
              <select
                value={tenantPref}
                onChange={(e) => setTenantPref(e.target.value)}
                className="bg-input/50 border border-border/50 backdrop-blur rounded-lg px-3 py-2 focus:border-primary transition-all"
              >
                <option value="">👥 All Tenant Types</option>
                <option value="Bachelor">Bachelor</option>
                <option value="Family">Family</option>
                <option value="Girls">Girls</option>
                <option value="Working">Working Professionals</option>
              </select>
            </div>
            <Button
              onClick={() => {
                setLocation("")
                setPriceMin("")
                setPriceMax("")
                setPropertyType("")
                setTenantPref("")
              }}
              variant="outline"
              className="w-full md:w-auto hover:bg-primary/10 transition-all"
            >
              ✕ Reset Filters
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-card/50 backdrop-blur rounded-2xl h-80 animate-pulse border border-border/30"
                  style={{ animationDelay: `${i * 0.1}s` }}
                ></div>
              ))}
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="text-center py-24 animate-slide-up">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-2xl font-bold text-foreground mb-2">No rooms found</p>
              <p className="text-muted-foreground mb-6">Try adjusting your filters to see more listings</p>
              <Button
                onClick={() => {
                  setLocation("")
                  setPriceMin("")
                  setPriceMax("")
                  setPropertyType("")
                  setTenantPref("")
                }}
                className="bg-primary hover:bg-primary/90"
              >
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRooms.map((room, idx) => (
                <div key={room.id} className="animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <Link href={`/rooms/${room.id}`}>
                    <Card className="group overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-500 cursor-pointer h-full hover:shadow-2xl hover:scale-105 bg-card/80 backdrop-blur-sm">
                      <CardContent className="p-0">
                        <div className="relative h-48 bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden">
                          {room.room_images?.[0]?.image_url ? (
                            <img
                              src={room.room_images[0].image_url || "/placeholder.svg"}
                              alt={room.title}
                              className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700 filter group-hover:brightness-110"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                              <div className="text-5xl opacity-20">🏠</div>
                            </div>
                          )}
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              toggleSave(room.id)
                            }}
                            className={`absolute top-3 right-3 p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 ${
                              savedRooms.includes(room.id)
                                ? "bg-accent text-white scale-110"
                                : "bg-white/90 text-accent hover:bg-white hover:scale-105"
                            }`}
                          >
                            ♥
                          </button>
                          <div className="absolute top-3 left-3 bg-green-500/90 text-white px-3 py-1 rounded-full text-xs font-bold">
                            Available
                          </div>
                        </div>

                        <div className="p-5 space-y-3">
                          <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2">
                            {room.title}
                          </h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">📍 {room.location}</p>

                          <div className="flex items-baseline gap-2 pt-2 border-t border-border/30">
                            <span className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                              ₹{room.rent_price.toLocaleString()}
                            </span>
                            <span className="text-muted-foreground text-sm">/month</span>
                          </div>

                          <div className="flex gap-2 flex-wrap pt-2">
                            <span className="text-xs bg-secondary/40 text-foreground px-3 py-1.5 rounded-full font-semibold border border-secondary/50">
                              {room.property_type}
                            </span>
                            <span className="text-xs bg-accent/20 text-accent px-3 py-1.5 rounded-full font-semibold border border-accent/30">
                              {room.tenant_preference}
                            </span>
                          </div>

                          <div className="text-sm text-muted-foreground border-t border-border/30 pt-3 flex items-center gap-1">
                            📞 {room.owner_contact_number}
                          </div>

                          <Button
                            className="w-full mt-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold transition-all duration-300 group-hover:shadow-lg"
                            onClick={(e) => e.preventDefault()}
                          >
                            View Details →
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
