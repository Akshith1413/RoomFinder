"use client"
import type { User } from "@supabase/supabase-js"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

interface Room {
  id: string
  title: string
  location: string
  rent_price: number
  property_type: string
  is_available: boolean
  created_at: string
  room_images?: Array<{ image_url: string }>
}
interface Profile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  user_type: "owner" | "finder"
}

export default function DashboardPage() {
  const router = useRouter()
 const [user, setUser] = useState<User | null>(null)
const [profile, setProfile] = useState<Profile | null>(null)

  const [rooms, setRooms] = useState<Room[]>([])
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

      // Fetch user profile
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", authUser.id).single()

      if (profileData) {
        setProfile(profileData)
      }

      // Only show rooms if user is an owner
      if (profileData?.user_type === "owner") {
        const { data: roomsData } = await supabase
          .from("rooms")
          .select(
            `
            *,
            room_images(image_url)
          `,
          )
          .eq("owner_id", authUser.id)

        if (roomsData) {
          setRooms(roomsData)
        }
      }

      setIsLoading(false)
    }

    fetchData()
  }, [supabase, router])

  const deleteRoom = async (roomId: string) => {
    if (confirm("Are you sure you want to delete this room? This action cannot be undone.")) {
      try {
        const response = await fetch(`/api/rooms/${roomId}`, { method: "DELETE" })
        if (response.ok) {
          setRooms(rooms.filter((r) => r.id !== roomId))
        }
      } catch (error) {
        console.error("[v0] Error deleting room:", error)
      }
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/5">
        <Navigation user={user} />
        <div className="flex items-center justify-center py-32">
          <div className="space-y-4 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </main>
    )
  }
const isOwner = 
  (user?.user_metadata?.user_type === "owner") || 
  profile?.user_type === "owner"


if (!user || !isOwner) {

    return (
      <main className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/5">
        <Navigation user={user} />
        <div className="flex flex-col items-center justify-center py-32 px-4">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-8 max-w-md text-center">
            You must be a room owner to access this page.
          </p>
          <Link href="/">
            <Button className="bg-primary hover:bg-primary/90">Go Home</Button>
          </Link>
        </div>
      </main>
    )
  }

  const totalIncome = rooms.reduce((sum, r) => sum + r.rent_price, 0)
  const activeRooms = rooms.filter((r) => r.is_available).length

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/5 relative overflow-hidden">
      <div className="absolute top-40 left-5 w-96 h-96 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float pointer-events-none"></div>
      <div
        className="absolute bottom-40 right-10 w-96 h-96 bg-accent/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-morph pointer-events-none"
        style={{ animationDelay: "1s" }}
      ></div>

      <Navigation user={user} />

      <section className="py-12 px-4 md:px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12 animate-slide-up">
            <div>
              <h1 className="text-5xl font-bold text-foreground mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Owner Dashboard
              </h1>
              <p className="text-lg text-muted-foreground">Welcome back, {profile?.first_name ?? "Owner"}! Manage your listings
</p>
            </div>
            <Link href="/dashboard/add-room">
              <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-bold px-8 py-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 whitespace-nowrap text-base">
                ✚ Add New Room
              </Button>
            </Link>
          </div>

          {/* Stats Cards with 3D Effects */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              {
                label: "Total Listings",
                value: rooms.length,
                icon: "🏠",
                color: "from-primary to-primary/50",
                delay: "0s",
              },
              {
                label: "Active Rooms",
                value: activeRooms,
                icon: "✓",
                color: "from-green-500 to-green-500/50",
                delay: "0.05s",
              },
              {
                label: "Monthly Income",
                value: `₹${totalIncome.toLocaleString()}`,
                icon: "💰",
                color: "from-accent to-accent/50",
                delay: "0.1s",
              },
            ].map((stat) => (
              <div key={stat.label} className="animate-slide-up" style={{ animationDelay: stat.delay }}>
                <Card className="border border-border/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-card/80 backdrop-blur-sm overflow-hidden group">
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                  ></div>
                  <CardContent className="pt-8 pb-6 relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-4xl group-hover:scale-125 transition-transform duration-300">
                        {stat.icon}
                      </div>
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider text-right">
                        {stat.label}
                      </p>
                    </div>
                    <p className={`text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                      {stat.value}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Rooms List */}
          <div className="animate-slide-up" style={{ animationDelay: "0.15s" }}>
            <div className="flex items-center gap-3 mb-8">
              <h2 className="text-3xl font-bold text-foreground">Your Listings</h2>
              <span className="bg-primary/20 text-primary px-4 py-1 rounded-full text-sm font-bold">
                {rooms.length} {rooms.length === 1 ? "room" : "rooms"}
              </span>
            </div>

            {rooms.length === 0 ? (
              <Card className="border-2 border-dashed border-border/50 shadow-lg hover:shadow-xl transition-all backdrop-blur-sm bg-card/50">
                <CardContent className="py-16 text-center">
                  <div className="text-6xl mb-4">🏠</div>
                  <p className="text-xl text-muted-foreground mb-2 font-semibold">No rooms listed yet</p>
                  <p className="text-muted-foreground mb-8">
                    Start by adding your first room to attract potential tenants
                  </p>
                  <Link href="/dashboard/add-room">
                    <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-bold">
                      ✚ Add Your First Room
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {rooms.map((room, idx) => (
                  <Card
                    key={room.id}
                    className="border border-border/50 hover:border-primary/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-102 bg-card/80 backdrop-blur-sm animate-slide-up overflow-hidden group"
                    style={{ animationDelay: `${0.05 * (idx + 1)}s` }}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Image */}
                        <div className="w-full md:w-56 h-44 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg overflow-hidden flex-shrink-0">
                          {room.room_images?.[0]?.image_url ? (
                            <img
                              src={room.room_images[0].image_url || "/placeholder.svg"}
                              alt={room.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 filter group-hover:brightness-110"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="text-5xl opacity-30">🏠</div>
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                              {room.title}
                            </h3>
                            <p className="text-muted-foreground mb-4 flex items-center gap-2">📍 {room.location}</p>

                            <div className="flex flex-wrap gap-2 mb-4">
                              <span className="text-xs bg-secondary/40 text-foreground px-3 py-1.5 rounded-full font-bold border border-secondary/50">
                                {room.property_type}
                              </span>
                              <span
                                className={`text-xs px-3 py-1.5 rounded-full font-bold border ${
                                  room.is_available
                                    ? "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30"
                                    : "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30"
                                }`}
                              >
                                {room.is_available ? "✓ Available" : "✗ Not Available"}
                              </span>
                            </div>

                            <p className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
                              ₹{room.rent_price.toLocaleString()}/month
                            </p>
                          </div>

                          <div className="flex gap-3 pt-4 border-t border-border/30">
                            <Link href={`/dashboard/edit-room/${room.id}`}>
                              <Button
                                variant="outline"
                                className="border-2 border-primary text-primary hover:bg-primary/10 bg-transparent font-bold transition-all hover:scale-105"
                              >
                                ✏️ Edit
                              </Button>
                            </Link>
                            <Link href={`/rooms/${room.id}`}>
                              <Button
                                variant="outline"
                                className="border-2 border-secondary text-secondary hover:bg-secondary/10 bg-transparent font-bold transition-all hover:scale-105"
                              >
                                👁️ View
                              </Button>
                            </Link>
                            <Button
                              onClick={() => deleteRoom(room.id)}
                              className="bg-destructive/20 hover:bg-destructive/30 text-destructive font-bold transition-all hover:scale-105"
                            >
                              🗑️ Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
