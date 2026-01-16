"use client"
import type { User } from "@supabase/supabase-js"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Navigation from "@/components/navigation"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

interface Room {
  id: string
  title: string
  location: string
  rent_price: number
  property_type: string
  tenant_preference: string
  room_images: { image_url: string }[]
}

interface SavedRoomResponse {
  id: string
  room_id: string
  rooms: Room[] | null
}

interface SavedRoom {
  id: string
  room_id: string
  room: Room | null
}

export default function SavedRoomsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [savedRooms, setSavedRooms] = useState<SavedRoom[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        router.push("/auth/login")
        return
      }

      setUser(authUser)

      const { data, error } = await supabase
        .from("saved_rooms")
        .select(`
          id,
          room_id,
          rooms(
            id,
            title,
            location,
            rent_price,
            property_type,
            tenant_preference,
            room_images(image_url)
          )
        `)
        .eq("user_id", authUser.id)
        .order("created_at", { ascending: false })

      if (!error && data) {
        // Transform the data: Supabase returns rooms as an array, we need single room
        const transformedData: SavedRoom[] = data.map((item: SavedRoomResponse) => ({
          id: item.id,
          room_id: item.room_id,
          room: item.rooms && item.rooms.length > 0 ? item.rooms[0] : null
        }))
        setSavedRooms(transformedData)
      } else {
        console.error("[Saved Rooms] Error:", error)
      }

      setIsLoading(false)
    }

    fetchData()
  }, [supabase, router])

  const removeSaved = async (savedId: string) => {
    await supabase.from("saved_rooms").delete().eq("id", savedId)
    setSavedRooms(savedRooms.filter((r) => r.id !== savedId))
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/5">
      <Navigation user={user} />

      <section className="py-12 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 animate-slide-up">
            <h1 className="text-4xl font-bold text-foreground mb-2">Saved Rooms</h1>
            <p className="text-muted-foreground">Your favorite room listings</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-muted rounded-xl h-64 animate-pulse"></div>
              ))}
            </div>
          ) : savedRooms.length === 0 ? (
            <Card className="border-2 border-dashed border-border/50 text-center py-16">
              <div className="space-y-4">
                <div className="text-5xl">💝</div>
                <h2 className="text-2xl font-bold text-foreground">No Saved Rooms Yet</h2>
                <p className="text-muted-foreground">Start bookmarking rooms you like!</p>
                <Link href="/rooms" className="inline-block">
                  <button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2 rounded-lg transition-all">
                    Browse Rooms
                  </button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedRooms.map((saved, idx) => {
                const room = saved.room
                if (!room) return null

                return (
                  <div key={saved.id} className="animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                    <Card className="group overflow-hidden border-border/50 hover:border-primary transition-all duration-300 h-full hover:shadow-2xl hover:-translate-y-2">
                      <CardContent className="p-0">
                        <div className="relative h-48 bg-muted overflow-hidden">
                          {room.room_images?.[0]?.image_url ? (
                            <img
                              src={room.room_images[0].image_url || "/placeholder.svg"}
                              alt={room.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20"></div>
                          )}
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              removeSaved(saved.id)
                            }}
                            className="absolute top-3 right-3 p-2 bg-accent text-white rounded-full shadow-lg hover:bg-accent/90 transition-all"
                          >
                            ♥
                          </button>
                        </div>
                        <div className="p-5 space-y-3">
                          <Link href={`/rooms/${room.id}`}>
                            <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors cursor-pointer line-clamp-2">
                              {room.title}
                            </h3>
                          </Link>
                          <p className="text-sm text-muted-foreground">📍 {room.location}</p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-primary">₹{room.rent_price.toLocaleString()}</span>
                            <span className="text-muted-foreground text-sm">/month</span>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            <span className="text-xs bg-secondary/30 text-secondary-foreground px-3 py-1 rounded-full font-medium">
                              {room.property_type}
                            </span>
                            <span className="text-xs bg-accent/20 text-accent-foreground px-3 py-1 rounded-full font-medium">
                              {room.tenant_preference}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}